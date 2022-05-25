const express = require('express');
var router = express.Router();
const { spawn } = require('child_process');
const { PythonShell } = require('python-shell');
const fs = require('fs')
var Git = require("nodegit");

var crypto = require('crypto');
const { json } = require('express');

/*
*   get repository data 
*/


router.post('/repodata', (req, res) => {
    console.log(req.body);
    const link = req.body[0];

    console.log("Start get all data of repository...");

    const storage = crypto.randomBytes(20).toString('hex');

    let my_directory = "./repos/"
    my_directory += storage;

    let globalCommits = [];

    try {
        Git.Clone(link, my_directory)
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
                        res.json(
                            globalCommits);
                    });
            }).catch(err => {
                console.log(err);
                res.json(["Error"]);
            });
    } catch (e) {
        console.log("Error on get all data of repository...");
        res.json(["Error"]);
    }
});

/*
*   get all commits by day
*/

router.post('/commitsbyday', (req, res) => {
    console.log("Start get all commits by day...");
    const link = req.body[0];

    const storage = crypto.randomBytes(20).toString('hex');

    let my_directory = "./repos/"
    my_directory += storage;

    let data = [];

    let total_per_day = [];

    try {
        Git.Clone(link, my_directory)
            .then((repository) => {
                let walker = Git.Revwalk.create(repository);
                walker.pushGlob('refs/heads/*');
                walker.getCommits(100)
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
                        res.json([
                            data,
                            total_per_day
                        ]);
                        console.log("Done get all commits by day...");
                    });
            });
    } catch (e) {
        console.log("Error get all commits by day...");
        res.json("Error");
    }
});

/*
*   get all files for one commit
*/

router.post('/filesforonecommit', (req, res) => {
    console.log("Get files for one commit...");
    const sha = req.body[0];
    const link = req.body[1];

    const storage = crypto.randomBytes(20).toString('hex');

    let my_directory = "./repos/"
    my_directory += storage;

    try {
        Git.Clone(link, my_directory)
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
                                        res.json(files_list)
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
*   get all files for one commit
*/

router.post('/filecode', (req, res) => {
    console.log("Get file code for one commit...");
    const sha = req.body[0];
    const file = req.body[1];
    const link = req.body[2];

    const storage = crypto.randomBytes(20).toString('hex');

    let my_directory = "./repos/"
    my_directory += storage;

    try {
        Git.Clone(link, my_directory)
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
                                    .then(async function (commits) {
                                        console.log("Error on get file code for one commit...");
                                        for (var i = 0; i < commits.length; i++) {
                                            if (file === commits[i].path()) {
                                                const entry = await commit.getEntry(commits[i].path());
                                                const blob = await entry.getBlob();
                                                const blob_code = blob.toString();
                                                res.json([blob_code]);
                                            }
                                        }
                                    });
                            }
                        })
                    })
            });
    } catch (e) {
        console.log("Error on get file code for one commit...");
        res.json("Error");
    }
});

/*
*   get languages used
*/

router.post('/languages', (req, res) => {
    console.log("Start get languages...");

    const link = req.body[0];

    const storage = crypto.randomBytes(20).toString('hex');

    const file_size = [];
    const language = [];

    let my_directory = "./repos/"
    my_directory += storage;

    let aux = "repos/";
    aux += storage;
    aux += "/.git/**"

    var rr = require("recursive-readdir");

    let promise = new Promise(function (resolve, reject) {
        Git.Clone(link, my_directory)
            .then((repository) => {
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
            });
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
        res.json([
            result[0],
            result[1]
        ]);

    }).catch(function (e) {
        console.log("Error get languages...");
        res.json("Error");
    });
});

module.exports = router;