const express = require('express');
var router = express.Router();
const { spawn } = require('child_process');
const { PythonShell } = require('python-shell');
const fs = require('fs')

var Git = require("nodegit");
var path = require('path');

var crypto = require('crypto');
const { json } = require('express');

function number_of_lines(code) {
    let lines = code.split("\n");
    return lines.length;
}

/*
*   get hashes
*/

router.post('/hashes', (req, res) => {
    console.log("Start get all hashes...");
    const link = req.body.link;
    const storage = req.body.storage;
    const userName = req.body.userName;
    const token = req.body.token;

    let my_directory = "./repos/"
    my_directory += storage;

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

    let hash_list = [];

    try {
        Git.Clone(link, my_directory, cloneOpts)
            .then((repository) => {
                let walker = Git.Revwalk.create(repository);
                walker.pushGlob('refs/heads/*');
                walker.getCommits(100)
                    .then(commits => {
                        commits.forEach(commit => {
                            hash_list.push(commit.sha());
                        })
                    })
                    .then(() => {
                        res.json(hash_list);
                    })
            });
    } catch (e) {
        console.log("Error on get all hashes...");
        res.json("Error");
    }
});

/*
*   get files
*/

router.post('/files', (req, res) => {
    console.log("Start get all files...");
    const storage = req.body.storage;
    const hash = req.body.sha;

    let my_directory = "./repos/"
    my_directory += storage;
    
    try {
        Git.Repository.open(my_directory)
            .then((repository) => {
                repository.getCommit(hash).then(function (commit) {
                    console.log(commit.sha());
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
                            console.log("End get all files of repository...");
                            const files_list = [];
                            for (var i = 0; i < commits.length; i++) {
                                files_list.push(commits[i].path());
                            }
                            console.log(files_list);
                            res.json({
                                files_list
                            })
                        });
                })
            });
    } catch (e) {
        console.log("Error on get all files...");
        res.json("Error");
    }
});

/*
*   get similarity between two files
*/

router.post('/percentageofsimilarity', (req, res) => {
    console.log("Start get percentage of similarity...");
    const storage = req.body.storage;
    const file_selected = req.body.file_selected;
    const files = req.body.files;
    const hash = req.body.sha;

    let my_directory = "./repos/"
    my_directory += storage;
    code_from_files = [];
    files_name = [];

    let promise = new Promise(function (resolve, reject) {
        Git.Repository.open(my_directory)
            .then((repository) => {
                repository.getCommit(hash).then(async function (commitHash) {
                    let counter = 0;
                    files.map(async function (file) {
                        const entry = await commitHash.getEntry(file);
                        const blob = await entry.getBlob();
                        const blob_code = blob.toString();
                        code_from_files.push(blob_code);
                        files_name.push(file);
                        counter = counter + 1;
                        if (counter === files.length) {
                            resolve([code_from_files, files_name]);
                        }
                    })
                })
            })
    }).catch(function (e) {
        console.log("Error get percentage of similarity...");
        res.json("Error");
    });

    promise.then(result => {
        codes = result[0];
        aux_files = result[1];
        console.log("For similarity fileeeeees");
        console.log(aux_files);

        target_code = codes[aux_files.indexOf(file_selected)];

        arr = [];

        let counter = 0;

        let common_lines_vector = [];
        let added_lines_vector = [];
        let deleted_lines_vector = [];
        let similarity_vector = [];

        var gitDiff = require('git-diff')
        var options = {
            color: false,      // Add color to the git diff returned?
            flags: 'string',       // A space separated string of git diff flags from https://git-scm.com/docs/git-diff#_options
            forceFake: true,  // Do not try and get a real git diff, just get me a fake? Faster but may not be 100% accurate
            noHeaders: false,  // Remove the ugly @@ -1,3 +1,3 @@ header?
            save: true,       // Remember the options for next time?
            wordDiff: false    // Get a word diff instead of a line diff?
        }

        codes.map(function (code) {
            counter = counter + 1;

            var diff = gitDiff(target_code, code, options);

            if (typeof diff === "string") {
                var count_added_lines = (diff.toString().match(/^\+./mg) || []).length;
                var count_deleted_lines = (diff.toString().match(/^\-./mg) || []).length;
                var common_lines = number_of_lines(diff.toString()) - 1 - count_added_lines - count_deleted_lines;

                if (number_of_lines(target_code) > number_of_lines(code)) {
                    common_lines_vector.push(common_lines);
                    added_lines_vector.push(count_added_lines);
                    deleted_lines_vector.push(count_deleted_lines);
                    let similarity = (common_lines / number_of_lines(target_code)) * 100;
                    similarity_vector.push(parseFloat(similarity.toFixed(2)));
                } else {
                    common_lines_vector.push(common_lines);
                    added_lines_vector.push(count_added_lines);
                    deleted_lines_vector.push(count_deleted_lines);
                    let similarity = (common_lines / number_of_lines(code)) * 100;
                    similarity_vector.push(parseFloat(similarity.toFixed(2)));
                }
            } else {
                common_lines_vector.push(number_of_lines(target_code));
                added_lines_vector.push(0);
                deleted_lines_vector.push(0);
                similarity_vector.push(100);
            }
        });

        if (counter === codes.length) {
            console.log("Done get percentage of similarity...");
            res.json({ common_lines_vector, added_lines_vector, deleted_lines_vector, similarity_vector });
        }

    }).catch(function (e) {
        console.log("Error get percentage of similarity...");
        res.json("Error");
    });
});

/*
*   get lines between files at specific commit
*/

router.post('/percentageofsamenumberoflines', (req, res) => {
    console.log("Start get lines between files at specific commit...");
    const storage = req.body.storage;
    const file_selected = req.body.file_selected;
    const files = req.body.files;
    const hash = req.body.sha;

    console.log(files);

    let my_directory = "./repos/"
    my_directory += storage;
    code_from_files = [];
    files_name = [];

    let promise = new Promise(function (resolve, reject) {
        Git.Repository.open(my_directory)
            .then((repository) => {
                repository.getCommit(hash).then(async function (commitHash) {
                    let counter = 0;
                    files.map(async function (file) {
                        const entry = await commitHash.getEntry(file);
                        const blob = await entry.getBlob();
                        const blob_code = blob.toString();
                        code_from_files.push(blob_code);
                        files_name.push(file);
                        counter = counter + 1;
                    })
                    resolve([code_from_files, files_name]);
                })
            })
    }).catch(function (e) {
        console.log("Error get lines between files at specific commit...");
        res.json("Error");
    });

    promise.then(result => {
        codes = result[0];
        aux_files = result[1];

        console.log(aux_files);

        target_code = codes[aux_files.indexOf(file_selected)];

        let number_of_lines_vector = [];

        let percentage_of_lines_vector = [];

        let common_files = [];

        let number_of_lines_target_code = number_of_lines(target_code);
        
        let counter = 0;

        codes.map(function (code) {
            counter = counter + 1;
            let number_of_lines_code = number_of_lines(code);

            if(number_of_lines_target_code === number_of_lines_code){
                common_files.push(aux_files[counter-1]);
                number_of_lines_vector.push(number_of_lines_code);
                let percentage_of_lines = 100;
                percentage_of_lines_vector.push(parseFloat(percentage_of_lines.toFixed(2)));
            }
        });

        if (counter === codes.length) {
            console.log(number_of_lines_vector);
            console.log("Done get lines between files at specific commit...");
            res.json({common_files, number_of_lines_vector, percentage_of_lines_vector});
        }

    }).catch(function (e) {
        console.log("Error get lines between files at specific commit...");
        res.json("Error");
    });
});

/*
*   get file code
*/

router.post('/filecode', (req, res) => {
    console.log("Start get file code...");
    const storage = req.body.storage;
    const file_selected = req.body.file_selected;
    const files = req.body.files;
    const hash = req.body.sha;

    let my_directory = "./repos/"
    my_directory += storage;

    let promise = new Promise(function (resolve, reject) {
        Git.Repository.open(my_directory)
            .then((repository) => {
                repository.getCommit(hash).then(async function (commitHash) {
                    files.map(async function (file) {
                        if (file === file_selected) {
                            const entry = await commitHash.getEntry(file);
                            const blob = await entry.getBlob();
                            const blob_code = blob.toString();
                            resolve([blob_code]);
                        }
                    })
                })
            })
    }).catch(function (e) {
        console.log("Error get filecode...");
        res.json("Error");
    });

    promise.then(result => {
        res.json(result[0]);
    }).catch(function (e) {
        console.log("Error get filecode...");
        res.json("Error");
    });
});

/*
*   get lines by every commit
*/

router.post('/lines', (req, res) => {
    console.log("Start get lines added...");
    const sha_list = req.body.hashes;
    const my_file = req.body.file_selected;
    const storage = req.body.storage;

    let my_directory = "./repos/"
    my_directory += storage;

    const files_code = [];
    let number_of_changes = 0;
    let number_of_errors = 0;

    console.log(sha_list);

    let promise = new Promise(function (resolve, reject) {
        Git.Repository.open(my_directory)
            .then(function (repo) {
                console.log("Start get lines added...");
                for (let i = 0; i < sha_list.length; i++) {
                    repo.getCommit(sha_list[i]).then(async function (commitHash) {
                        try {
                            const entry = await commitHash.getEntry(my_file);
                            const blob = await entry.getBlob();
                            const blob_code = blob.toString();
                            number_of_changes = number_of_changes + 1;
                            files_code.push({
                                order: i,
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
                }
            })
    }).catch(function (e) {
        console.log(e);
        console.log("Error get lines added...");
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

        console.log("Done get lines added...");
        res.json({
            changes:all,
            date: dates
        });

    }).catch(function (e) {
        console.log(e);
        console.log("Error get lines added...");
        res.json("Error");
    });
});

module.exports = router;