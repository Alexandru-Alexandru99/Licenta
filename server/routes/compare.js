const express = require('express');
var router = express.Router();
var Git = require("nodegit");
var path = require('path');
var fs = require('fs');

var rr = require("recursive-readdir");
var crypto = require('crypto');

const git = require('simple-git');

/*
*   get data from all commits
*/

router.post('/repodata', (req, res) => {
    console.log("Start get all data of repository...");
    const link = req.body.link;
    const storage = req.body.storage;
    const userName = req.body.userName;
    const token = req.body.token;

    let my_directory = "./repos/"
    my_directory += storage;

    let globalCommits = [];

    let cloneOpts;

    if (token !== "" && userName !== "") {
        cloneOpts = {
            fetchOpts: {
                callbacks: {
                    credentials: () => Git.Cred.userpassPlaintextNew(userName, token),
                    transferProgress: (info) => console.log(info)
                }
            }
        }
    } else {
        cloneOpts = {
            fetchOpts: {
                callbacks: {
                    credentials: () => Git.Cred.defaultNew(),
                    transferProgress: (info) => console.log(info)
                }
            }
        }
    }

    try {
        Git.Clone(link, my_directory, cloneOpts)
            .then((repository) => {
                let walker = Git.Revwalk.create(repository);
                walker.pushGlob('refs/heads/*');
                walker.getCommits(1000)
                    .then(commits => {
                        let index = 0;
                        commits.forEach(commit => {
                            ++index;
                            globalCommits.push({
                                order: index,
                                time: commit.date().getDate().toString() + "." + (commit.date().getMonth() + 1).toString() + "." + commit.date().getFullYear().toString(),
                                message: commit.message(),
                                sha: commit.sha(),
                                name: commit.committer().name(),
                                summary: commit.summary()
                            });
                        });
                        console.log("End get all data of repository...");
                        res.json({
                            globalCommits
                        })
                    });
            }).catch(err => {
                console.log(err);
                res.json("Error");
            });
    } catch (e) {
        console.log("Error on get all data of repository...");
        res.json("Error");
    }
});

/*
*   get all files for one commit
*/

router.post('/filesforonecommit', (req, res) => {
    console.log("Get files for one commit...");
    const sha = req.body.sha;
    const storage = req.body.storage;

    let my_directory = "./repos/"
    my_directory += storage;

    try {
        Git.Repository.open(my_directory)
            .then((repository) => {
                let walker = Git.Revwalk.create(repository);
                walker.pushGlob('refs/heads/*');
                walker.getCommits(1000)
                    .then(commits => {
                        commits.forEach(commit => {
                            if (commit.sha() === sha) {
                                commit.getTree()
                                    .then(function (tree) {
                                        /* Set up the event emitter and a promise to resolve when it finishes up. */
                                        var walker = tree.walk(),
                                            p = new Promise(function (resolve, reject) {
                                                walker.on("end", resolve);
                                                walker.on("error", reject);
                                            });
                                        walker.start();
                                        return p;
                                    })
                                    .then(function (commits) {
                                        console.log("End get all data of repository...");
                                        const files_list = [];
                                        for (var i = 0; i < commits.length; i++) {
                                            files_list.push(commits[i].path());
                                        }
                                        console.log(files_list);
                                        res.json({
                                            files_list
                                        })
                                    });
                            }
                        })
                    })
            });
    } catch (e) {
        console.log("Error on get all data of repository...");
        res.json("Error");
    }
});

/*
*   get all code for a specific file
*/

router.post('/filecode', (req, res) => {
    console.log("Start get filecode...");
    const sha = req.body.sha;
    const my_file = req.body.file;
    const storage = req.body.storage;

    let my_directory = "./repos/"
    my_directory += storage;

    let promise = new Promise(function (resolve, reject) {
        Git.Repository.open(my_directory)
            .then(function (repo) {
                repo.getCommit(sha).then(async function (commitHash) {
                    try {
                        const entry = await commitHash.getEntry(my_file);
                        const blob = await entry.getBlob();
                        const blob_code = blob.toString();
                        resolve([my_file, blob_code]);
                    }
                    catch (e) {
                        console.log(e);
                    }
                })
            })
    }).catch(function (e) {
        console.log("Error get file code...");
        res.json("Error");
    });

    promise.then(result => {
        let code = result[1];
        res.json(code);

    }).catch(function (e) {
        console.log("*Error get file code*");
        res.json("Error");
    });
});

/*
*   get all commits by day
*/

router.post('/commitsbyday', (req, res) => {
    console.log("Start get all commits by day...");
    const storage = req.body.storage;
    const number_of_commits = 100;

    let my_directory = "./repos/"
    my_directory += storage;

    let data = [];

    let total_per_day = [];

    try {
        Git.Repository.open(my_directory)
            .then((repository) => {
                let walker = Git.Revwalk.create(repository);
                walker.pushGlob('refs/heads/*');
                walker.getCommits(number_of_commits)
                    .then(commits => {
                        commits.forEach(commit => {
                            const time = commit.date().getDate().toString() + "." + (commit.date().getMonth() + 1).toString() + "." + commit.date().getFullYear().toString()
                            const found = data.find(element => element === time);
                            const index = data.findIndex(element => element === time);
                            if (found) {
                                total_per_day[index]++;
                            } else {
                                data.push(time);
                                total_per_day.push(1);
                            }
                        });
                        res.json({
                            data,
                            total_per_day
                        });
                        console.log("Done get all commits by day...");
                    });
            });
    } catch (e) {
        console.log("Error get all commits by day...");
        res.json("Error");
    }
});

/*
*   get languages used
*/

router.post('/languages', (req, res) => {
    console.log("Start get languages...");
    const storage = req.body.storage;
    const file_size = [];
    const language = [];

    let my_directory = "./repos/"
    my_directory += storage;

    let aux = "repos/";
    aux += storage;
    aux += "/.git/**"

    let promise = new Promise(function (resolve, reject) {
        rr(my_directory, [aux], function (err, files) {
            for (var i = 0; i < files.length; i++) {
                const buffer = files[i].split('\\');
                let path = '';
                for (var j = 2; j < buffer.length; j++) {
                    if (j === buffer.length - 1)
                        path += buffer[j]
                    else
                        path += buffer[j] + "/";
                }

                let lang;
                let file = path;
                let extension = file.split('.').pop();

                let rawdata = fs.readFileSync('Programming_Languages_Extensions.json');
                let data = JSON.parse(rawdata);

                data.map(elem => {
                    if (elem.extension === extension) {
                        lang = elem.name;
                    };
                });

                const found = language.find(element => element === lang);
                const index = language.findIndex(element => element === lang);

                if (found) {
                    var stats = fs.statSync(my_directory + "/" + path);
                    file_size[index] = file_size[index] + stats["size"];
                } else {
                    if (lang) {
                        var stats = fs.statSync(my_directory + "/" + path);
                        file_size.push(stats["size"]);
                        language.push(lang);
                    }
                }
            }
            resolve([file_size, language]);
        })
    }).catch(function (e) {
        console.log("Error get languages...");
        res.json("Error");
    });

    promise.then(result => {
        console.log("Done get languages...");
        let size = result[0];
        let total = 0;
        for (var i = 0; i < size.length; i++) {
            total = total + size[i];
        }
        res.json({
            size: result[0],
            language: result[1],
            total: total
        });

    }).catch(function (e) {
        console.log("Error get languages...");
        res.json("Error");
    });
});

/*
*   get authors
*/

router.post('/authors', (req, res) => {
    console.log("Start get all authors...");
    const storage = req.body.storage;
    const number_of_commits = 100;

    let my_directory = "./repos/"
    my_directory += storage;

    let globalCommits = [];

    try {
        Git.Repository.open(my_directory)
            .then((repository) => {
                let walker = Git.Revwalk.create(repository);
                walker.pushGlob('refs/heads/*');
                walker.getCommits(number_of_commits)
                    .then(commits => {
                        let index = 0;
                        commits.forEach(commit => {
                            ++index;
                            globalCommits.push(commit.committer().name());
                        });
                        const occurrences = globalCommits.reduce(function (acc, curr) {
                            return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
                        }, {});

                        var authors = [];
                        var result = [];

                        for (var i in occurrences) {
                            authors.push(i);
                            result.push(occurrences[i]);
                        }
                        res.json({
                            authors: authors,
                            numbers: result
                        });
                        console.log("Done get all authors...");
                    });
            });
    } catch (e) {
        console.log("Error get all authors...");
        res.json("Error");
    }
});

/*
*   get all commits
*/

router.post('/commits', (req, res) => {
    console.log("Start get all commits...");
    const storage = req.body.storage;
    const number_of_commits = 100;

    let my_directory = "./repos/"
    my_directory += storage;

    let globalCommits = [];

    try {
        Git.Repository.open(my_directory)
            .then((repository) => {
                let walker = Git.Revwalk.create(repository);
                walker.pushGlob('refs/heads/*');
                walker.getCommits(number_of_commits)
                    .then(commits => {
                        let index = 0;
                        commits.forEach(commit => {
                            ++index;
                            globalCommits.push({
                                order: index,
                                hash: commit.sha()
                            });
                        });
                        res.json({
                            globalCommits
                        });
                        console.log("Done get all commits...");
                    });
            });
    } catch (e) {
        console.log("Error get all commits...");
        res.json("Error");
    }
});

/*
*   get all files 
*/

router.post('/files', (req, res) => {
    console.log("Start get all files...");
    const storage = req.body.storage;
    const Items = [];

    let my_directory = "./repos/"
    my_directory += storage;

    let aux = "repos/";
    aux += storage;
    aux += "/.git/**"

    let promise = new Promise(function (resolve, reject) {
        rr(my_directory, [aux], function (err, files) {
            for (var i = 0; i < files.length; i++) {
                const buffer = files[i].split('\\');
                let path = '';
                for (var j = 2; j < buffer.length; j++) {
                    if (j === buffer.length - 1)
                        path += buffer[j]
                    else
                        path += buffer[j] + "/";
                }
                Items.push(path);
            }
            resolve([Items]);
        })
    }).catch(function (e) {
        console.log("Error get all files...");
        res.json("Error");
    });

    promise.then(result => {
        files = result[0];

        console.log("Done get all files...");
        res.json(files);

    }).catch(function (e) {
        console.log("Error get all files...");
        res.json("Error");
    });
});

/*
*   get lines by every commit
*/

router.post('/lines', (req, res) => {
    console.log("Start get lines...");
    const sha_list = req.body.list;
    const my_file = req.body.file;
    const storage = req.body.storage;

    let my_directory = "./repos/"
    my_directory += storage;

    const files_code = [];
    let number_of_changes = 0;
    let number_of_errors = 0;

    sha_list.sort((a, b) => {
        return b.order - a.order;
    });

    let promise = new Promise(function (resolve, reject) {
        Git.Repository.open(my_directory)
            .then(function (repo) {
                sha_list.map(({ order, hash }, index) => {
                    repo.getCommit(hash).then(async function (commitHash) {
                        try {
                            const entry = await commitHash.getEntry(my_file);
                            const blob = await entry.getBlob();
                            const blob_code = blob.toString();
                            number_of_changes = number_of_changes + 1;
                            files_code.push({
                                order: order,
                                code: blob_code,
                                date: commitHash.date().getDate().toString() + "." + (commitHash.date().getMonth() + 1).toString() + "." + commitHash.date().getFullYear().toString()
                            });
                            if (number_of_errors + number_of_changes === sha_list.length) {
                                resolve([my_file, number_of_changes, files_code]);
                            }
                        }
                        catch (e) {
                            number_of_errors = number_of_errors + 1;
                            if (number_of_errors + number_of_changes === sha_list.length) {
                                resolve([my_file, number_of_changes, files_code]);
                            }
                        }
                    })
                })
            })
    }).catch(function (e) {
        console.log("Error get lines...");
        res.json("Error");
    });

    promise.then(result => {
        code = result[2];

        code.sort((a, b) => {
            return b.order - a.order;
        });

        let all = [];
        let dates = [];
        var counter = (code[0].code.match(/\n/g) || []).length;

        all.push(counter);
        dates.push(code[0].date);

        for (var i = 1; i < code.length; i++) {
            if (i > 0) {
                var original = code[i - 1].code;
                var modified = code[i].code;
                var counter = (code[i].code.match(/\n/g) || []).length;
                var original_hash = crypto.createHash('md5').update(original).digest('hex');
                var modified_hash = crypto.createHash('md5').update(modified).digest('hex');
                if (original_hash !== modified_hash) {
                    dates.push(code[i].date);
                    all.push(counter);
                }
            }
        }

        console.log("Done get lines...");
        res.json({
            changes:all,
            date: dates
        });

    }).catch(function (e) {
        console.log("Error get lines...");
        res.json("Error");
    });
});

module.exports = router;