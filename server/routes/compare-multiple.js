const express = require('express');

const multer = require('multer');

var router = express.Router();
var Git = require("nodegit");
var path = require('path');

var fs = require('fs');
const {promisify} = require('util');
const pipeline = promisify(require("stream").pipeline);

var rr = require("recursive-readdir");
var crypto = require('crypto');

const git = require('simple-git');

/*
*   upload file to server
*/

const upload = multer({ dest: "uploads/" });
router.post('/upload', upload.single("file"), async function(req, res, next) {
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
*   get data from all commits
*/

router.post('/details', (req, res) => {

    console.log("Start get details...");
    const repos = req.body.repos;

    let number_of_commits_per_repo = [];

    let details_per_repo = [];

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
        console.lo("Error get changes...");
        console.log(e);
        res.json("Error");
    });
});

module.exports = router;