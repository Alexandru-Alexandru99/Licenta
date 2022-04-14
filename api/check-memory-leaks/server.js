const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs')
var exec = require('child_process').exec;

var crypto = require('crypto');

exec('mkdir code',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(express.json());

app.get("/api", (req, res) => {
    res.json("Test");
});

app.post("/security", (req, res) => {
    console.log("Start memory leaks check...");

    const code = req.body.code;
    const language = req.body.language;
    const extension = req.body.extension;
    const name = crypto.randomBytes(20).toString('hex');

    let path = "./code/" + name + extension;

    fs.writeFile(path, code, err => {
        if (err) {
            console.log("Error run...");
            console.error(err);
            res.json("Error");
        }
    })

    exec('touch ' + path,
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log("Error on memory leaks check...");
                console.log('exec error: ' + error);
                res.json("Error");
            } else {
                let cmd = 'gcc -o ' + './code/' + name + ' -std=c11 -Wall ' + path;
                exec(cmd,
                    function (error_gcc, stdout_gcc, stderr_gcc) {
                        if (error_gcc !== null) {
                            console.log("Error on memory leaks check...");
                            console.log('exec error: ' + error_gcc);
                            res.json("Error");
                        } else {
                            exec('valgrind --leak-check=full ' + './code/' + name,
                                function (error_valgrind, stdout_valgrind, stderr_valgrind) {
                                    console.log("End memory leaks check...");
                                    res.json(stderr_valgrind);
                                    if (error_valgrind !== null || error !== null || error_gcc !== null) {
                                        console.log("Error on memory leaks check...");
                                        console.log('exec error: ' + error_valgrind);
                                        res.json("Error");
                                    }
                                });
                        }
                    })
            }
        });
});

app.listen(port, () => console.log(`Listening on port ${port}`));