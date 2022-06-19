const express = require('express');

const multer = require('multer');

var router = express.Router();
var Git = require("nodegit");
var path = require('path');

const { PythonShell } = require('python-shell');

var fs = require('fs');
const { promisify } = require('util');
const pipeline = promisify(require("stream").pipeline);

var rr = require("recursive-readdir");
var crypto = require('crypto');

const git = require('simple-git');

/*
*   upload file to server
*/

const upload = multer({ dest: "uploads/" });
router.post('/upload', upload.single("file"), async function (req, res, next) {
    const file = req.file;
    const name = req.body.name;

    const repos = [];

    try {
        let data = fs.readFileSync('uploads/' + file.filename, 'utf8');
        data = data.split('\n');
        for (let i = 0; i < data.length; i++) {
            repos.push(data[i].replace('\r', ''));
        }
    } catch (err) {
        console.error(err);
    }
    res.json(repos);
});

/*
*   get details
*/

router.post('/details', (req, res) => {

    console.log("Start get details...");
    const repos = req.body.repos;

    let number_of_commits_per_repo = [];

    let details_per_repo = [];

    console.log(repos);

    let promise = new Promise(async function (resolve, reject) {
        let count = 0;
        await Promise.all(
            repos.map(async (repo) => {
                let my_directory = "./repos/"
                const storage = crypto.randomBytes(20).toString('hex');
                my_directory += storage;
                try {
                    await Git.Clone(repo, my_directory)
                        .then(async (repository) => {
                            count = count + 1;
                            let walker = Git.Revwalk.create(repository);
                            walker.pushGlob('refs/heads/*');
                            await walker.getCommits(10000)
                                .then(commits => {
                                    var current_month = new Date(commits[0].date());
                                    var current_month_index = 0;
                                    var current_month_commits = [];
                                    var months_with_commits = [];
                                    let counter = 0;
                                    let commit_dates = [];

                                    if (commits.length > 1) {
                                        commits.forEach(async (commit) => {
                                            ++counter;
                                            commit_dates.push(commit.date());

                                            var commit_date = new Date(commit.date());
                                            if (commit_date.getMonth() + 1 !== current_month.getMonth() + 1) {

                                                const month = current_month.getMonth() + 1;
                                                current_month_commits.push(current_month_index);

                                                current_month = commit_date;

                                                current_month_index = 0;
                                            }
                                            if (commit_date.getMonth() + 1 === current_month.getMonth() + 1) {
                                                current_month_index = current_month_index + 1;
                                            }
                                            current_month = commit.date();
                                            if (counter === commits.length) {
                                                current_month_commits.push(current_month_index);
                                            }
                                        });
                                    } else {
                                        commit_dates.push(commits[0].date());
                                        current_month_commits.push(current_month_index + 1);
                                        counter = 1;
                                    }

                                    number_of_commits_per_repo.push(counter);
                                    months_with_commits.push(current_month_commits);

                                    details_per_repo.push({
                                        repo,
                                        counter,
                                        months_with_commits
                                    });

                                    console.log("Done get details...");
                                });
                        }).catch(function (e) {
                            console.log(e);
                            res.json("Error");
                        });
                } catch (e) {
                    console.log(e);
                    res.json("Error");
                }
            })
        );
        resolve([details_per_repo]);
    }).catch(function (e) {
        console.log(e);
        res.json("Error");
    });

    promise.then(result => {
        res.json(result[0]);

    }).catch(function (e) {
        console.log(e);
        res.json("Error");
    });
});


async function my_get_diff(commit) {
    let lines_added_per_commit = [];
    await commit.getDiff(10000)
        .then(async (diffs) => {
            await Promise.all(
                diffs.map(async (diff) => {
                    await diff.patches()
                        .then(async (patches) => {
                            await Promise.all(
                                patches.map(async (patch) => {
                                    await patch.hunks()
                                        .then(async (hunks) => {
                                            await Promise.all(
                                                hunks.map(async (hunk) => {
                                                    const lines = await hunk.lines();
                                                    const l = lines.length;
                                                    const date = commit.date();
                                                    lines_added_per_commit.push({
                                                        l,
                                                        date
                                                    });
                                                })
                                            );
                                        });
                                })
                            );
                        });

                })
            );
        }).catch(function (e) {
            console.log(e);
            res.json("Error");
        });
    return lines_added_per_commit;
}

/*
*   get changes
*/

router.post('/changes', (req, res) => {
    console.log("Start get changes...");
    const repos = req.body.repos;

    let lines_added_per_repo = [];

    let promise = new Promise(async function (resolve, reject) {
        await Promise.all(repos.map(async (repo) => {
            let my_directory = "./repos/"
            const storage = crypto.randomBytes(20).toString('hex');
            my_directory += storage;
            try {
                await Git.Clone(repo, my_directory)
                    .then(async (repository) => {
                        let walker = Git.Revwalk.create(repository);
                        walker.pushGlob('refs/heads/*');
                        await walker.getCommits(10000)
                            .then(async (commits) => {
                                let lines_all_commits = [];
                                await Promise.all(commits.map(async function (commit) {
                                    lines_all_commits.push(await my_get_diff(commit));
                                }));
                                lines_added_per_repo.push({
                                    repo,
                                    lines_all_commits
                                });
                            });
                    }).catch(function (e) {
                        console.log(e);
                        res.json("Error");
                    });
            } catch (e) {
                console.log(e);
                res.json("Error");
            }
        }));
        resolve([lines_added_per_repo]);
    }).catch(function (e) {
        console.lo("Error get changes...");
        console.log(e);
        res.json("Error");
    });

    promise.then(result => {
        console.log("End get changes...");
        res.json(result[0]);

    }).catch(function (e) {
        console.log("Error get changes...");
        console.log(e);
        res.json("Error");
    });
});

/*
*   get grades
*/

function get_grade(repo, model_data) {
    return new Promise((resolve, reject) => {
        try {
            let options = {
                mode: 'text',
                pythonOptions: ['-u'],
                args: [repo['commits'], repo['commits_per_month'], repo['changes'], repo['changes_per_commit'], repo['changes_per_month'], model_data]
            };

            PythonShell.run('model.py', options, function (err, result) {
                if (err) {
                    console.log("Error get grade...");
                    console.error(err);
                    res.json("Error");
                }
                resolve({
                    reponame: repo['reponame'],
                    grade: result[0]
                });
            });

        } catch (e) {
            console.log("Error get grade...");
            console.log(e);
            res.json("Error");
        }

    });
}

router.post('/grades', async (req, res) => {
    console.log("Start get grades...");
    const repos = req.body.repos;
    const model_data = req.body.model_data;
    let grades = [];

    await Promise.all(repos.map(async function (repo) {
        grades.push(await get_grade(repo, model_data));
    }));

    await Promise.all(repos.map(async function (repo) {
        grades.map(grade => {
            if (grade['reponame'] === repo['reponame']) {
                repo['grade'] = grade['grade'].toString().substring(1, grade['grade'].toString().length - 1);
            }
        });
    }));
    console.log("End get grades...");
    res.json(repos);
});

/*
*   retrain
*/

router.post('/retrain', async function (req, res) {
    console.log("Start get retrain...");

    const data = req.body.data;
    const model_data = req.body.model_data;

    data.forEach(object => {
        delete object['reponame'];
    });

    const ObjectsToCsv = require('objects-to-csv');
    const csv = new ObjectsToCsv(data);
    await csv.toDisk('data/' + model_data + ".csv", { append: true })
    res.json("Done");
});

/*
*   euclidean distance
*/

function get_euclidean_distance(target_repo, repos) {
    return new Promise((resolve, reject) => {
        try {

            const str = repos.map(a => `(${Object.values(a)})`).join(", ")
            let options = {
                mode: 'text',
                pythonOptions: ['-u'],
                args: [target_repo['commits'], target_repo['commits_per_month'], target_repo['changes'], target_repo['changes_per_commit'], target_repo['changes_per_month'], target_repo['reponame'], str]
            };


            PythonShell.run('distance_between_vectors.py', options, function (err, result) {
                if (err) {
                    console.log("Error get euclidean distance...");
                    console.log(err);
                    resolve("Error");
                }
                buffer = result[0].replace('[', '');
                buffer = buffer.replace(' ', '');
                buffer = buffer.replace(']', '');
                buffer = buffer.split(",");
                numberArray = [];
                for (var i = 0; i < buffer.length; i++)
                    numberArray.push(parseFloat(buffer[i]));
                resolve({
                    reponame: target_repo['reponame'],
                    distance: numberArray
                });
            });

        } catch (e) {
            console.log("Error get euclidean distance...");
            console.log(e);
            resolve("Error");
        }

    });
}

function apply_kmeans(matrix, lines, clusters) {
    return new Promise((resolve, reject) => {
        try {

            let options = {
                mode: 'text',
                pythonOptions: ['-u'],
                args: [matrix, lines, clusters]
            };


            PythonShell.run('find_clusters.py', options, function (err, result) {
                if (err) {
                    console.log("Error get euclidean distance...");
                    console.log(err);
                    resolve("Error");
                }
                buffer = result[0].replace('[', '');
                buffer = buffer.replace(']', '');
                buffer = buffer.split(' ');
                numberArray = [];
                for (var i = 0; i < buffer.length; i++)
                    numberArray.push(parseInt(buffer[i]));
                console.log(numberArray);
                resolve(numberArray);
            });

        } catch (e) {
            console.log("Error get euclidean distance...");
            console.log(e);
            resolve("Error");
        }

    });
}

router.post('/distances', async function (req, res) {
    console.log("Start get euclidean distances...");

    const data = req.body.data;

    const clusters = req.body.clusters;

    if (clusters <= data.length) {
        let distances = [];

        await Promise.all(data.map(async function (repo) {
            distances.push(await get_euclidean_distance(repo, data));
        }));

        console.log(distances);
        matrix = [];

        for (var i = 0; i < data.length; i++) {
            matrix.push(distances[i]['distance']);
        }

        console.log(matrix);

        const response = await apply_kmeans(matrix, data.length, clusters);

        console.log(response);

        let contor = 0;
        await Promise.all(data.map(function (repo) {
            distances.map(distance => {
                if (distance['reponame'] === repo['reponame']) {
                    repo['distance'] = distance['distance'];
                    repo['cluster'] = response[contor];
                    contor = contor + 1;
                }
            });
        }));
        console.log("End get euclidean distances...");
        res.json(data);
    } else {
        console.log("Error get euclidean distances...");
        res.json("Error");
    }
})

/*
*   generate data your data and model
*/

function generate_data(csv_name, number_of_data, commits_interval_min, commits_interval_max, number_of_months, changes_interval_min, changes_interval_max, max_grade_for_x_number_of_commits, max_grade_for_x_number_of_changes_per_commit) {
    return new Promise((resolve, reject) => {
        try {
            let options = {
                mode: 'text',
                pythonOptions: ['-u'],
                args: [csv_name, number_of_data, commits_interval_min, commits_interval_max, number_of_months, changes_interval_min, changes_interval_max, max_grade_for_x_number_of_commits, max_grade_for_x_number_of_changes_per_commit]
            };


            PythonShell.run('generate_data_with_parameters.py', options, function (err, result) {
                if (err) {
                    console.log("Error create your model...");
                    console.log(err);
                    resolve("Error");
                }
                resolve(result[0]);
            });

        } catch (e) {
            console.log("Error create your model...");
            console.log(e);
            resolve("Error");
        }
    });
}

router.post('/create', async function (req, res) {
    console.log("Start create your model..");

    const csv_name = req.body.csv_name;
    const number_of_data = req.body.number_of_data;
    const commits_interval_min = req.body.commits_interval_min;
    const commits_interval_max = req.body.commits_interval_max;
    const number_of_months = req.body.number_of_months;
    const changes_interval_min = req.body.changes_interval_min;
    const changes_interval_max = req.body.changes_interval_max;
    const max_grade_for_x_number_of_commits = req.body.max_grade_for_x_number_of_commits;
    const max_grade_for_x_number_of_changes_per_commit = req.body.max_grade_for_x_number_of_changes_per_commit;

    const response = await generate_data(csv_name, number_of_data, commits_interval_min, commits_interval_max, number_of_months, changes_interval_min, changes_interval_max, max_grade_for_x_number_of_commits, max_grade_for_x_number_of_changes_per_commit);


    console.log("End create your model...");
    res.json(response);
})

module.exports = router;