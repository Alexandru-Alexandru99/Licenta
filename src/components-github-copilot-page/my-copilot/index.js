import React, { useState, useEffect, useRef } from 'react';
import "./index.css"
import axios from "axios"

import { alpha, styled } from '@mui/material/styles';

import logo from "../../images/favicon.ico";

import logo_complexity from "../../images/complexity.png";
import logo_explain from "../../images/teach.png";
import logo_natural_language from "../../images/coding-language.png";
import logo_one_line_function from "../../images/file.png";
import logo_bug_fixer from "../../images/bug.png";
import logo_jp from "../../images/setting.png";

import Editor from "@monaco-editor/react";
import Button from '@mui/material/Button';
import Select from 'react-select'

import Popup from '../popup-window/index';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function MyCopilot() {

    const editorRef = useRef(null);

    const [output, setOutput] = useState('Output...');

    function handleEditorChange(value, event) {
        editorRef.current = value;
    }

    const SubmitButton = styled(Button)(({ theme }) => ({
        textTransform: 'none',
        fontSize: 14,
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        width: '80px',
        height: '36px',
        marginLeft: '20px',
        lineHeight: 1.5,
        backgroundColor: 'green',
        color: "white",
        '&:hover': {
            backgroundColor: '#2ea043',
        },
    }));

    const [isOpen, setIsOpen] = useState(false);

    const [title, setTitle] = useState('');

    const [description, setDescription] = useState('');

    const [sampleText, setSampleText] = useState('');

    const [outputText, setOutputText] = useState('');

    const [passedLogo, setPassedLogo] = useState();

    const [passedColor, setPassedColor] = useState('');

    const [language, setLanguage] = useState('');

    const [optionSelected, setOptionSelected] = useState('');

    const [defaultCode, setDefaultCode] = useState('');

    const [previousCode, setPreviousCode] = useState('');

    const [myTokens, setMyTokens] = useState(128);

    const [myModels, setMyModels] = useState(['text-ada-001','text-babbage-001','text-curie-001','text-davinci-002']);

    /*
    *   alert parameters
    */

    const [open, setOpen] = useState(false);

    const [alertType, setAlertType] = useState('');

    const [toastMessage, setToastMessage] = useState("");

    const [errorTitle, setErrorTitle] = useState("");

    /*
    *   functions for handling events
    */

    function alertProperties(status, type, title, message) {
        setOpen(false);
        setOpen(status);
        setAlertType(type);
        setErrorTitle(title);
        setToastMessage(message)
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    }

    const togglePopupComplexity = () => {
        setIsOpen(!isOpen);
        setTitle("Calculate Time Complexity");
        setDescription("Find the time complexity of a function.");
        setSampleText("def matrixmult (A, B):\n    rows_A = len(A)\n    cols_A = len(A[0])\n    rows_B = len(B)\n    cols_B = len(B[0])\n    if cols_A != rows_B:\n      print \"Cannot multiply the two matrices. Incorrect dimensions.\"\n      return\n    # Create the result matrix\n    # Dimensions would be rows_A x cols_B\n    C = [[0 for row in range(cols_B)] for col in range(rows_A)]\n    print C\n    for i in range(rows_A):\n        for j in range(cols_B):\n            for k in range(cols_A):\n                C[i][j] += A[i][k] * B[k][j]\n    return C\n\"\"\"\nThe time complexity of this function is\n");
        setOutputText("O(n^3)");
        setPassedLogo(logo_complexity);
        setPassedColor("orange");
    }

    const togglePopupExplain = () => {
        setIsOpen(!isOpen);
        setTitle("Explain Code");
        setDescription("Explain a complicated piece of code.");
        setSampleText("class Log:\n    def __init__(self, path):\n        dirname = os.path.dirname(path)\n        os.makedirs(dirname, exist_ok=True)\n        f = open(path, \"a+\")\n\n        # Check that the file is newline-terminated\n        size = os.path.getsize(path)\n        if size > 0:\n            f.seek(size - 1)\n            end = f.read(1)\n            if end != \"\\n\":\n                f.write(\"\\n\")\n        self.f = f\n        self.path = path\n\n    def log(self, event):\n        event[\"_event_id\"] = str(uuid.uuid4())\n        json.dump(event, self.f)\n        self.f.write(\"\\n\")\n\n    def state(self):\n        state = {\"complete\": set(), \"last\": None}\n        for line in open(self.path):\n            event = json.loads(line)\n            if event[\"type\"] == \"submit\" and event[\"success\"]:\n                state[\"complete\"].add(event[\"id\"])\n                state[\"last\"] = event\n        return state\n\n\"\"\"\nHere's what the above class is doing:\n1.");
        setOutputText("1.  The constructor creates a directory for the log file if it doesn't exist. \n2.  The log() method writes a JSON-encoded event to the log file. \n3.  The state() method returns a dictionary with the set of complete tasks and the most recent event.");
        setPassedLogo(logo_explain);
        setPassedColor("#7047dd");
    }

    const togglePopupBug = () => {
        setIsOpen(!isOpen);
        setTitle("Bug fixer");
        setDescription("Find and fix bugs in source code.");
        setSampleText("##### Fix bugs in the below function\n \n### Buggy Python\nimport Random\na = random.randint(1,12)\nb = random.randint(1,12)\nfor i in range(10):\n    question = \"What is \"+a+\" x \"+b+\"? \"\n    answer = input(question)\n    if answer = a*b\n        print (Well done!)\n    else:\n        print(\"No.\")\n    \n### Fixed Python");
        setOutputText("import random\na = random.randint(1,12)\nb = random.randint(1,12)\nfor i in range(10):\t\nquestion = \"What is \"+str(a)+\" x \"+str(b)+\"? \"\nanswer = input(question)\t\nif answer == str(a*b):\nprint (\"Well done!\")\nelse:\nprint(\"No.\")");
        setPassedLogo(logo_bug_fixer);
        setPassedColor("#75306A");
    }

    const togglePopupConvert = () => {
        setIsOpen(!isOpen);
        setTitle("Code translate");
        setDescription("Convert code from one language to another.");
        setSampleText("#JavaScript to Python:\nJavaScript: \ndogs = [\"bill\", \"joe\", \"carl\"]\ncar = []\ndogs.forEach((dog) {\n    car.push(dog);\n});\n\nPython:");
        setOutputText("dogs = [\"bill\", \"joe\", \"carl\"]\ncar = []\nfor dog in dogs:\t\ncar.append(dog)");
        setPassedLogo(logo_jp);
        setPassedColor("#EF434E");
    }

    const togglePopupOneLine = () => {
        setIsOpen(!isOpen);
        setTitle("JavaScript one line function");
        setDescription("Turn a JavaScript function into a one liner.");
        setSampleText("Use list comprehension to convert this into one line of JavaScript:\n\ndogs.forEach((dog) => {\n    car.push(dog);\n});\n\nJavaScript one line version:");
        setOutputText("dogs.forEach(dog => car.push(dog))");
        setPassedLogo(logo_one_line_function);
        setPassedColor("#00d4a0");
    }

    const togglePopupNaturalLanguage = () => {
        setIsOpen(!isOpen);
        setTitle("Code to natural language");
        setDescription("Explain a piece of code in human understandable language.");
        setSampleText("# Python 3 \ndef remove_common_prefix(x, prefix, ws_prefix): \n    x[\"completion\"] = x[\"completion\"].str[len(prefix) :] \n    if ws_prefix: \n        # keep the single whitespace as prefix \n        x[\"completion\"] = \" \" + x[\"completion\"] \nreturn x \n\n# Explanation of what the code does\n\n#");
        setOutputText("The code above is a function that takes a dataframe and a prefix as input and returns a dataframe with the prefix removed from the completion column.");
        setPassedLogo(logo_natural_language);
        setPassedColor("green");
    }

    const options = [
        { value: 'complexity', label: 'Calculate time complexity' },
        { value: 'natural', label: 'Code to natural language' },
        { value: 'explain', label: 'Explain code' },
        { value: 'bugfix', label: 'Bug fixer' },
        { value: 'function', label: 'JavaScript one line function' },
        { value: 'jp', label: 'Code translate' }
    ];

    const options_languages = [
        { value: 'python', label: 'Python' },
        { value: 'c++', label: 'C++' },
        { value: 'c', label: 'C' },
        { value: 'javascript', label: 'JavaScript' }
    ];

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            background: "#0d1117",
            // match with the menu
            borderRadius: state.isFocused ? "3px 3px 3px 3px" : 3,
            // Overwrittes the different states of border
            borderColor: '#30363d',
            color: 'white'
        }),
        option: (styles, { isFocused, isSelected }) => ({
            ...styles,
            background: isFocused
                ? '#10151C'
                : isSelected
                    ? '#10151C'
                    : undefined,
            color: 'white',
            zIndex: 1
        }),
        menu: base => ({
            ...base,
            // override border radius to match the box
            borderRadius: 3,
            // kill the gap
            marginTop: 0,
            maxHeight: '30px',
            color: 'white'
        }),
        menuList: base => ({
            ...base,
            background: "#0d1117",
            color: 'white',
            // kill the white space on first and last option
            padding: 0
        }),
        input: base => ({
            ...base,
            color: "white"
        }),
        singleValue: provided => ({
            ...provided,
            color: 'white'
        })
    };

    const handleLanguageChange = (event) => {
        console.log(event);
        if (event.value === "c++") {
            setLanguage("c");
        } else {
            setLanguage(event.value);
        }
        if (event.value === "c" || event.value === "javascript" || event.value === "c++") {
            setDefaultCode("// Look how to use an option\n// Write your code here");
        } else {
            setDefaultCode("# Look how to use an option\n# Write your code here");
        }
    }

    const handleOptionSelection = (event) => {
        console.log(event);
        setOptionSelected(event.value);
    }

    const handleSubmit = (event) => {
        if (optionSelected !== '') {
            setOutput("Running...")
            if (optionSelected === 'complexity') {
                axios.post("http://localhost:8080/copilot/complexity", {
                    code: editorRef.current
                })
                    .then((response) => {
                        if (response.data !== "Error") {
                            if (response.data.choices[0].text === '') {
                                setOutput("Error on writing code...");
                            } else {
                                setOutput(response.data.choices[0].text);
                            }
                        } else {
                            setOutput("Error on server...");
                        }
                    });
            }
            if (optionSelected === 'explain') {
                if (editorRef.current === previousCode) {
                    setMyTokens(myTokens * 2);
                    if (myTokens < 2048) {
                        axios.post("http://localhost:8080/copilot/explain", {
                            code: editorRef.current,
                            tokens: myTokens
                        })
                            .then((response) => {
                                if (response.data !== "Error") {
                                    if (response.data.choices[0].text === '') {
                                        setOutput("Error on writing code...");
                                    } else {
                                        setPreviousCode(editorRef.current);
                                        setOutput(response.data.choices[0].text);
                                    }
                                } else {
                                    setOutput("Error on server...");
                                }
                            });
                    } else {
                        setOutput("You have reached the limit of tokens...");
                    }
                } else {
                    setMyTokens(64);
                    axios.post("http://localhost:8080/copilot/explain", {
                        code: editorRef.current,
                        tokens: 64
                    })
                        .then((response) => {
                            if (response.data !== "Error") {
                                if (response.data.choices[0].text === '') {
                                    setOutput("Error on writing code...");
                                } else {
                                    setPreviousCode(editorRef.current);
                                    setOutput(response.data.choices[0].text);
                                }
                            } else {
                                setOutput("Error on server...");
                            }
                        });
                }
            }
            if (optionSelected === 'natural') {
                axios.post("http://localhost:8080/copilot/naturallanguage", {
                    code: editorRef.current
                })
                    .then((response) => {
                        if (response.data !== "Error") {
                            if (response.data.choices[0].text === '') {
                                setOutput("Error on writing code...");
                            } else {
                                setOutput(response.data.choices[0].text);
                            }
                        } else {
                            setOutput("Error on server...");
                        }
                    });
            }
            if (optionSelected === 'bugfix') {
                axios.post("http://localhost:8080/copilot/bugfixer", {
                    code: editorRef.current
                })
                    .then((response) => {
                        if (response.data !== "Error") {
                            if (response.data.choices[0].text === '') {
                                setOutput("Error on writing code...");
                            } else {
                                setOutput(response.data.choices[0].text);
                                console.log(response.data.choices[0].text);
                            }
                        } else {
                            setOutput("Error on server...");
                        }
                    });
            }
            if (optionSelected === 'jp') {
                axios.post("http://localhost:8080/copilot/javascripttopython", {
                    code: editorRef.current
                })
                    .then((response) => {
                        if (response.data !== "Error") {
                            if (response.data.choices[0].text === '') {
                                setOutput("Error on writing code...");
                            } else {
                                setOutput(response.data.choices[0].text);
                            }
                        } else {
                            setOutput("Error on server...");
                        }
                    });
            }
            if (optionSelected === 'function') {
                axios.post("http://localhost:8080/copilot/oneline", {
                    code: editorRef.current
                })
                    .then((response) => {
                        if (response.data !== "Error") {
                            if (response.data.choices[0].text === '') {
                                if (response.data.choices[0].text === '') {
                                    setOutput("Error on writing code...");
                                } else {
                                    setOutput(response.data.choices[0].text);
                                }
                            } else {
                                setOutput(response.data.choices[0].text);
                            }
                        } else {
                            setOutput("Error on server...");
                        }
                    });
            }
        } else {
            alertProperties(true, "error", "Error", "Select an option before submit!");
        }
    }

    return <>
        <div className='my-copilot-container'>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                    <AlertTitle>{errorTitle}</AlertTitle>
                    {toastMessage}
                </Alert>
            </Snackbar>
            <div className='top-bar'>
                <div className='logo-container'>
                    <div className='logo-tob-bar'>
                        <img style={{ width: "40px" }} src={logo} alt="logo" />
                    </div>
                    <div className='logo-name'>
                        <h3 style={{ color: "#f9eec0" }}>GitVisual</h3>
                    </div>
                </div>
            </div>
            <div className='my-copilot-container-body'>
                <div className='options-container'>
                    <div role='button' className='option-content' onClick={togglePopupComplexity}>
                        <div className='icon-container' style={{ backgroundColor: 'orange' }}>
                            <div className='icon'>
                                <img style={{ width: "32px" }} src={logo_complexity} alt="logo" />
                            </div>
                        </div>
                        <div className='right-text'>
                            <div className='title'>
                                Calculate Time Complexity
                            </div>
                            <div className='description'>
                                Find the time complexity of a function.
                            </div>
                        </div>
                    </div>
                    <div role='button' className='option-content' onClick={togglePopupExplain}>
                        <div className='icon-container' style={{ backgroundColor: '#7047dd' }}>
                            <div className='icon'>
                                <img style={{ width: "32px" }} src={logo_explain} alt="logo" />
                            </div>
                        </div>
                        <div className='right-text'>
                            <div className='title'>
                                Explain Code
                            </div>
                            <div className='description'>
                                Explain a complicated piece of code.
                            </div>
                        </div>
                    </div>
                    <div role='button' className='option-content' onClick={togglePopupNaturalLanguage}>
                        <div className='icon-container' style={{ backgroundColor: 'green' }}>
                            <div className='icon'>
                                <img style={{ width: "32px" }} src={logo_natural_language} alt="logo" />
                            </div>
                        </div>
                        <div className='right-text'>
                            <div className='title'>
                                Code to natural language
                            </div>
                            <div className='description'>
                                Explain a piece of code in human understandable language.
                            </div>
                        </div>
                    </div>
                    <div role='button' className='option-content' onClick={togglePopupBug}>
                        <div className='icon-container' style={{ backgroundColor: '#75306A' }}>
                            <div className='icon'>
                                <img style={{ width: "32px" }} src={logo_bug_fixer} alt="logo" />
                            </div>
                        </div>
                        <div className='right-text'>
                            <div className='title'>
                                Bug fixer
                            </div>
                            <div className='description'>
                                Find and fix bugs in source code.
                            </div>
                        </div>
                    </div>
                    <div role='button' className='option-content' onClick={togglePopupConvert}>
                        <div className='icon-container' style={{ backgroundColor: '#EF434E' }}>
                            <div className='icon'>
                                <img style={{ width: "32px" }} src={logo_jp} alt="logo" />
                            </div>
                        </div>
                        <div className='right-text'>
                            <div className='title'>
                                Code translate
                            </div>
                            <div className='description'>
                                Convert code from one language to another.
                            </div>
                        </div>
                    </div>
                    <div role='button' className='option-content' onClick={togglePopupOneLine}>
                        <div className='icon-container' style={{ backgroundColor: '#00d4a0' }}>
                            <div className='icon'>
                                <img style={{ width: "32px" }} src={logo_one_line_function} alt="logo" />
                            </div>
                        </div>
                        <div className='right-text'>
                            <div className='title'>
                                JavaScript one line function
                            </div>
                            <div className='description'>
                                Turn a JavaScript function into a one liner.
                            </div>
                        </div>
                    </div>
                </div>
                <div className='editor-container'>
                    <div style={{ marginRight: '20px' }} className='language-list-container'>
                        <Select placeholder="Select a language" autosize={true} onChange={handleLanguageChange} options={options_languages} styles={customStyles} style={{ color: 'white' }}>
                        </Select>
                    </div>
                    <div className='code-editor-container'>
                        <Editor
                            height="40vh"
                            theme="vs-dark"
                            language={language}
                            value={defaultCode}
                            onChange={handleEditorChange}
                        />
                    </div>
                    <div className='selection-container'>
                        <div className='list-container'>
                            <Select placeholder="Select a code option" autosize={true} maxMenuHeight={100} onChange={handleOptionSelection} options={options} styles={customStyles} style={{ color: 'white' }}>
                            </Select>
                        </div>
                        <div style={{ marginRight: '20px' }} className='button-container'>
                            <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
                        </div>
                    </div>
                    <div className='line-container'>
                    </div>
                    <div className='output-container'>
                        <div style={{ marginLeft: '10px' }}>
                            <code style={{ color: 'white', whiteSpace: 'pre' }}>{output}</code>
                        </div>
                    </div>
                    {isOpen && <Popup
                        title={title}
                        description={description}
                        sampleText={sampleText}
                        outputText={outputText}
                        content={
                            <div className='icon-container'>
                                <div className='icon'>
                                    <img style={{ width: "32px" }} src={logo} alt="logo" />
                                </div>
                            </div>
                        }
                        logo={passedLogo}
                        color={passedColor}
                        handleClose={togglePopupComplexity}
                    />}
                </div>
            </div>
        </div>
    </>
}
