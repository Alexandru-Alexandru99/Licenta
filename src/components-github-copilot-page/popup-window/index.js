
import React from "react";
import Editor from "@monaco-editor/react";

import './index.css'

import logo_c from "../../images/c-.png";
import logo_js from "../../images/js.png";
import logo_python from "../../images/python.png";

const Popup = props => {

    const prompt = "class Log:\n    def __init__(self, path):\n        dirname = os.path.dirname(path)\n        os.makedirs(dirname, exist_ok=True)\n        f = open(path, \"a+\")\n\n        # Check that the file is newline-terminated\n        size = os.path.getsize(path)\n        if size > 0:\n            f.seek(size - 1)\n            end = f.read(1)\n            if end != \"\\n\":\n                f.write(\"\\n\")\n        self.f = f\n        self.path = path\n\n    def log(self, event):\n        event[\"_event_id\"] = str(uuid.uuid4())\n        json.dump(event, self.f)\n        self.f.write(\"\\n\")\n\n    def state(self):\n        state = {\"complete\": set(), \"last\": None}\n        for line in open(self.path):\n            event = json.loads(line)\n            if event[\"type\"] == \"submit\" and event[\"success\"]:\n                state[\"complete\"].add(event[\"id\"])\n                state[\"last\"] = event\n        return state\n\n\"\"\"\nHere's what the above class is doing:\n1.";
    return (
        <div className="popup-box">
            <div className="box">
                <span className="close-icon" onClick={props.handleClose}>x</span>
                <div className="option-container">
                    <div className='icon-container' style={{ backgroundColor: props.color }}>
                        <div className='icon'>
                            <img style={{ width: "32px" }} src={props.logo} alt="logo" />
                        </div>
                    </div>
                    <div className='right-text'>
                        <div className='title'>
                            {props.title}
                        </div>
                        <div className='description'>
                            <img style={{ width: "24px", height: '24px'}} src={logo_c} alt="language1" />
                            <img style={{ width: "24px", height: '24px', marginLeft: '2px' }} src={logo_js} alt="language2" />
                            <img style={{ width: "24px", height: '24px', marginLeft: '2px' }} src={logo_python} alt="language3" />
                            <p style={{ marginLeft: '5px', color: '#8b949e' }}> + more languages</p>
                        </div>
                    </div>
                </div>
                <div className='line'>
                </div>
                <div className='description-container-text'>
                    {props.description}
                </div>
                <div className='prompt-container-text'>
                    Prompt
                </div>
                <div className='prompt-container-code'>
                    <Editor
                        height="50vh"
                        theme="vs-dark"
                        defaultLanguage='python'
                        defaultValue={props.sampleText}
                    />
                </div>
                <div className='sample-container-text'>
                    Sample response
                </div>
                <div className='sample-container-output'>
                    <p style={{ marginLeft: '10px', marginTop: '5px' }}>{props.outputText}</p>
                </div>
            </div>
        </div>
    );
};

export default Popup;