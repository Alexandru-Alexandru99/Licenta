const express = require('express');
var router = express.Router();

require('dotenv').config();

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/*
*   test
*/

router.post('/test', (req, res) => {
    res.json("Test");
});

/*
*   explain code
*/

router.post('/explain', (req, res) => {
    console.log("Start get code explanation...");

    let promise = new Promise(async function (resolve, reject) {
        const response = await openai.createCompletion("text-davinci-002", {
            prompt: "class Log:\n    def __init__(self, path):\n        dirname = os.path.dirname(path)\n        os.makedirs(dirname, exist_ok=True)\n        f = open(path, \"a+\")\n\n        # Check that the file is newline-terminated\n        size = os.path.getsize(path)\n        if size > 0:\n            f.seek(size - 1)\n            end = f.read(1)\n            if end != \"\\n\":\n                f.write(\"\\n\")\n        self.f = f\n        self.path = path\n\n    def log(self, event):\n        event[\"_event_id\"] = str(uuid.uuid4())\n        json.dump(event, self.f)\n        self.f.write(\"\\n\")\n\n    def state(self):\n        state = {\"complete\": set(), \"last\": None}\n        for line in open(self.path):\n            event = json.loads(line)\n            if event[\"type\"] == \"submit\" and event[\"success\"]:\n                state[\"complete\"].add(event[\"id\"])\n                state[\"last\"] = event\n        return state\n\n\"\"\"\nHere's what the above class is doing:\n1.",
            temperature: 0,
            max_tokens: 64,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: ["\"\"\""],
        });
        resolve([response]);
    }).catch(function (e) {
        console.log("Error get code explanation...");
        res.json("Error");
    });

    promise.then(result => {
        let response = result[0];
        res.json(response);

        console.log("Done get code explanation...");
    }).catch(function (e) {
        console.log("Error get code explanation...");
        res.json("Error");
    });
});

/*
*   get code complexity
*/

router.post('/complexity', (req, res) => {
    console.log("Start get code complexity...");

    const code = req.body.code;

    let promise = new Promise(async function (resolve, reject) {
        const response = await openai.createCompletion("text-davinci-002", {
            prompt: code,
            temperature: 0,
            max_tokens: 64,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: ["\n"],
        });
        resolve([response.data])

    }).catch(function (e) {
        console.log("Error get code complexity...");
        res.json("Error");
    });

    promise.then(result => {
        let response = result[0];
        res.json(response);
        console.log("Done get code complexity...");
    }).catch(function (e) {
        console.log("Error get code complexity...");
        res.json("Error");
    });
});

/*
*   bug fixer
*/

router.post('/bugfixer', (req, res) => {
    console.log("Start bugfixer...");

    const code = req.body.code;

    let promise = new Promise(async function (resolve, reject) {
        const response = await openai.createCompletion("text-davinci-002", {
            prompt: code,
            temperature: 0,
            max_tokens: 128,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: ["###"],
        });

        resolve([response.data])

    }).catch(function (e) {
        console.log("Error bugfixer...");
        res.json("Error");
    });

    promise.then(result => {
        let response = result[0];
        res.json(response);
        console.log("Done bugfixer...");
    }).catch(function (e) {
        console.log("Error bugfixer...");
        res.json("Error");
    });
});

/*
*   javascript -> python
*/

router.post('/javascripttopython', (req, res) => {
    console.log("Start javascript to python...");

    const code = req.body.code;

    let promise = new Promise(async function (resolve, reject) {
        const response = await openai.createCompletion("text-davinci-002", {
            prompt: code,
            temperature: 0,
            max_tokens: 128,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });

        resolve([response.data])

    }).catch(function (e) {
        console.log("Error javascript to python...");
        res.json("Error");
    });

    promise.then(result => {
        let response = result[0];
        res.json(response);
        console.log("Done bugjavascript to pythonfixer...");
    }).catch(function (e) {
        console.log("Error javascript to python...");
        res.json("Error");
    });
});

/*
*   python to natural language
*/

router.post('/naturallanguage', (req, res) => {
    console.log("Start python to natural language...");

    const code = req.body.code;

    let promise = new Promise(async function (resolve, reject) {
        const response = await openai.createCompletion("text-davinci-002", {
            prompt: code,
            temperature: 0,
            max_tokens: 64,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: ["#"],
        });

        resolve([response.data])

    }).catch(function (e) {
        console.log("Error python to natural language...");
        res.json("Error");
    });

    promise.then(result => {
        let response = result[0];
        res.json(response);
        console.log("Done python to natural language...");
    }).catch(function (e) {
        console.log("Error python to natural language...");
        res.json("Error");
    });
});

/*
*   javascript to one line function
*/

router.post('/oneline', (req, res) => {
    console.log("Start oneline...");

    const code = req.body.code;

    let promise = new Promise(async function (resolve, reject) {
        const response = await openai.createCompletion("text-davinci-002", {
            prompt: code,
            temperature: 0,
            max_tokens: 60,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: [";"],
        });

        resolve([response.data])

    }).catch(function (e) {
        console.log("Error oneline...");
        res.json("Error");
    });

    promise.then(result => {
        let response = result[0];
        res.json(response);
        console.log("Done oneline...");
    }).catch(function (e) {
        console.log("Error oneline...");
        res.json("Error");
    });
});

module.exports = router;