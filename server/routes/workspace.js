const express = require('express');
var router = express.Router();
var Git = require("nodegit");
var path = require('path');
var fs = require('fs');

var rr = require("recursive-readdir");
var crypto = require('crypto');

const git = require('simple-git');

/*
*   get all commits
*/

router.post('/commits', (req, res) => {
    console.log("Start get all commits...");
    const link = req.body.link;
    const storage = req.body.storage;
    const number_of_commits = 100;
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
            }).catch(function (e) {
                console.log("Error get all commits...");
                console.log(e);
                res.json("Error");
            });
    } catch (e) {
        console.log(e);
        console.log("Error get all commits...");
        res.json("Error");
    }
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

        const final_result = [];

        for (var i = 0; i < files.length; i++) {
            final_result.push(files[i]);
        }

        console.log("Done get all files...");
        res.json(final_result);

    }).catch(function (e) {
        console.log("Error get all files...");
        res.json("Error");
    });
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
        console.log("Error get all files...");
        res.json("Error");
    });
});

/*
*   get all code for a specific file
*/

router.post('/filecode', (req, res) => {
    console.log("Start get filecode...");
    const sha_list = req.body.list;
    const my_file = req.body.file;
    const storage = req.body.storage;

    let my_directory = "./repos/"
    my_directory += storage;

    const files_code = [];
    let number_of_changes = 0;
    let number_of_errors = 0;
    let total_lines = 0;
    let number_commits = 0;

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
                            const number_of_lines = blob_code.split('\n').length;
                            total_lines = total_lines + number_of_lines;
                            number_of_changes = number_of_changes + 1;
                            number_commits = number_commits + 1;
                            files_code.push({
                                order: order,
                                code: blob_code
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
        console.log("Error get file code...");
        res.json("Error");
    });

    promise.then(result => {
        code = result[2];

        code.sort((a, b) => {
            return b.order - a.order;
        });

        let all = [];
        let stats = [];
        let count = 1;
        let status = 0;
        all.push(code[0]);
        stats.push(status);

        for (var i = 1; i < code.length; i++) {
            if (i > 0) {
                var original = code[i - 1].code;
                var modified = code[i].code;
                var original_hash = crypto.createHash('md5').update(original).digest('hex');
                var modified_hash = crypto.createHash('md5').update(modified).digest('hex');
                if (original_hash !== modified_hash) {
                    if (modified.length - original.length >= number_of_lines/number_commits || original.length - modified.length >= number_of_lines/number_commits) {
                        status = 1;
                    } else {
                        status = 0;
                    }
                    all.push(code[i]);
                    stats.push(status);
                    count = count + 1;
                }
            }
        }

        const final_result = [];
        final_result.push({
            file: result[0],
            changes: count,
            codes: all,
            stats: stats
        });
        console.log("Done get file code...");
        res.json(final_result);

    }).catch(function (e) {
        console.log("Error get file code...");
        res.json("Error");
    });
});

/*
*   commit changes
*/

router.post('/commit', (req, res) => {
    console.log("Start commit...");
    const message = req.body.message;
    const branch = req.body.branch;
    const directory = req.body.directory;
    const file = req.body.file_name;
    const new_code = req.body.new_code;
    const userEmail = req.body.user_email;
    const userName = req.body.user_name;

    console.log(userEmail);
    console.log(userName);

    const simpleGit = require('simple-git');

    let buffer = './repos/';
    buffer = buffer + directory;

    var repo, index;

    Git.Repository.open(buffer)
        .then(function (repoResult) {
            repo = repoResult;
            return repoResult.index();
        })
        .then(function (indexResult) {
            index = indexResult;
            buffer = buffer + "/" + file;
            console.log(buffer);
            fs.writeFile(buffer, new_code, function (err) {
                if (err) {
                    console.log("Error on write file commit...");
                    res.json("Error");
                }
            });

            console.log("Done write file commit...");

            try {
                index.addByPath(file);

                index.write();
            }
            catch(e) {
                console.log("Error on write index commit...");
                console.log(e);
            }

            return index.writeTree();
        })
        .then(async function (oidResult) {
            try {
                let workingDir = './repos/';
                workingDir = workingDir + directory;
                statusSummary = await simpleGit(workingDir).status();
                console.log(statusSummary);
                await simpleGit(workingDir).add('./*')
                    .addConfig('user.email', userEmail)
                    .addConfig('user.name', userName)
                    .commit(message)
                    .then(res.json("Done"));
            }
            catch (e) {
                console.log("Error commit...");
                res.json("Error");
            }
        });
});

/*
*   push function
*/

router.post('/push', (req, res) => {
    console.log("Start push...");
    const link = req.body.link;
    const branch = req.body.branch;
    const directory = req.body.directory;
    const userEmail = req.body.user_email;
    const userName = req.body.user_name;

    console.log(userEmail);
    console.log(userName);

    let buffer = './repos/';
    buffer = buffer + directory;

    const simpleGit = require('simple-git');

    try {
        statusSummary = simpleGit(buffer).status();
        simpleGit(buffer).add('./*')
            .addConfig('user.email', userEmail)
            .addConfig('user.name', userName)
            .push(link, branch)
            .then(res.json("Done"));

    }
    catch (e) {
        console.log("Error push...");
        console.log(e);
        res.json("Error");
    }
});

/*
*   get branches
*/

router.post('/branches', (req, res) => {
    console.log("Start get all branches...");
    const repo = req.body.storage;
    let my_directory = "./repos/"
    my_directory += repo;
    try {
        Git.Repository.open(my_directory)
            .then((repository) => {
                return repository.getReferenceNames(3);
            }).then(names => {
                const branches = [];
                names.forEach(item => {
                    if (item.indexOf('origin') >= 0) {
                        if (branches.indexOf(item.replace('refs/remotes/origin/', '')) === -1) {
                            branches.push(item.replace('refs/remotes/origin/', ''))
                        }
                    }
                })
                res.json({
                    branches
                })
            })
    }
    catch (e) {
        console.log("Error get all branches...");
        res.json("Error");
    }
});

module.exports = router;