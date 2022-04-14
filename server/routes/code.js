const express = require('express');
var router = express.Router();
const { spawn } = require('child_process');
const { PythonShell } = require('python-shell');
const fs = require('fs')

var crypto = require('crypto');
const { json } = require('express');

/*
*   run code
*/

router.post('/run', (req, res) => {
    console.log("Start run...");

    const code = req.body.code;
    const language = req.body.language;
    const extension = req.body.extension;
    const name = crypto.randomBytes(20).toString('hex');

    console.log(code);
    let file_content = "./code/" + name + '.' + extension;

    fs.writeFile(file_content, code, err => {
        if (err) {
            console.log("Error run...");
            console.error(err);
            res.json("Error");
        }
    })

    try {
        let options = {
            mode: 'text',
            pythonOptions: ['-u'],
            args: [language, extension, file_content] 
        };

        PythonShell.run('script.py', options, function (err, result) {
            if (err) {
                console.log("Error run...");
                console.error(err);
                res.json("Error");
            }
            let parsed = result.toString().substring(2, result.toString().length - 1);
            res.send(JSON.parse(parsed));
        });

    } catch (e) {
        console.log("Error run...");
        console.log(e);
        res.json("Error");
    }
});

module.exports = router;