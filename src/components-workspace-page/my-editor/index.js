import Editor from "@monaco-editor/react";
import { Form } from "react-bootstrap"
import "./index.css"
import 'rc-slider/assets/index.css';

import { DiffEditor as MonacoDiffEditor } from '@monaco-editor/react';

import PlayPause from "../play-stop-button/index";
import Popup from "../popup-window/index";

import axios from "axios"

import React, { useState, useEffect, useRef } from 'react';

import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import Chart from 'react-apexcharts'

import loading from "../../images/refresh.png";
import FunctionViewEditor from "../function-view-editor";

var gitDiff = require('git-diff')

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest function.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export default function MyEditor({ totalSize, sizeLanguage, languagesChart, playButtonPressed, currentBranch, currentFile, commitsCode, language, extension, defaultSliderValue, onSelectItem }) {
    const localRepo = localStorage.getItem('repositoryName');

    const [currentDivEditor, setCurrentDivEditor] = useState(0);

    const [commitsHadBeenMade, setCommitsHadBeenMade] = useState(false);

    const [sliderValue, setSliderValue] = useState(0);

    const [codeStatus, setCodeStatus] = useState(false);

    const [outputRun, setOutputRun] = useState("Output...");

    const [outputCheckSecurity, setOutputCheckSecurity] = useState("Output...");

    const [isOpen, setIsOpen] = useState(false);

    let number = commitsCode[0].codes.length;

    /*
    *   alert parameters
    */

    const [open, setOpen] = useState(false);

    const [alertType, setAlertType] = useState('');

    const [toastMessage, setToastMessage] = useState("");

    const [errorTitle, setErrorTitle] = useState("");

    /*
    *    play parameters
    */

    const [delay, setDelay] = useState(1000);

    const [isRunning, setIsRunning] = useState(false);

    const [showPlayButton, setShowPlayButton] = useState(true);

    /*
    *   auto commit variables 
    */

    const [checked, setChecked] = useState(false);

    let idBuffer = "index";

    const editorRef = useRef(null);

    const div_code_value = [];

    /*
    *   functions for handling events
    */

    const togglePopupChange = () => {
        setIsOpen(!isOpen);
    }

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

    useEffect(() => {
        if (defaultSliderValue.current === true) {
            document.getElementById("index" + currentDivEditor).style.display = "none";
            document.getElementById("index" + 0).style.display = "block";
            setCurrentDivEditor(0);
        }
    }, [defaultSliderValue.current]);

    function handleSliderChange(e, newValue) {
        onSelectItem(false);

        for (var i = 0; i <= number; i++) {
            document.getElementById("index" + i).style.display = "none";
        }
        document.getElementById("index" + newValue).style.display = "block";
        setCurrentDivEditor(newValue);
        setSliderValue(newValue);

        if (commitsCode[0].stats[newValue] === 0) {
            setCodeStatus(false);
        } else {
            setCodeStatus(true);
        }
    }

    // TODO sa verific asta

    function handleEditorDidMount(editor, monaco) {
        // var oldStr = '#!/usr/bin/env python3\ndef main():\n\ta=2\n\tb=3\n\tc=a+b\n\tprint(c)\nmain()\n'
        // editorRef.current = editor;
        // var newStr = editor;
        // const r = new monaco.Range(2, 1, 10, 5);

        // console.log(oldStr);
        // console.log(newStr);

        // editor.deltaDecorations(
        //     [],
        //     [
        //         {
        //             range: r,
        //             options: {
        //                 inlineClassName: "myInlineDecoration",
        //             },
        //         },
        //     ]
        // );
    }

    function handleEditorChange(value, event) {
        editorRef.current = value;
        div_code_value[currentDivEditor] = value;
    }

    function handleEditorChangeDiffEditor(value, event) {
        // editorRef.current = value;
        // div_code_value[currentDivEditor] = value;
        console.log(value);
    }

    function handleCommit() {
        if (isRunning !== true) {
            if (currentFile !== '') {
                let file_code = editorRef.current;
                let message = document.getElementById("commit-message").value;
                let user_email = document.getElementById("github-email") !== null ? document.getElementById("github-email").value : '';
                let user_name = document.getElementById("github-name") !== null ? document.getElementById("github-name").value : '';

                if (user_email !== '' && user_name !== '') {
                    if (message !== "") {
                        setCommitsHadBeenMade(true);
                        axios
                            .post("http://localhost:8080/workspace/commit", {
                                message: message,
                                branch: currentBranch,
                                directory: localRepo,
                                file_name: commitsCode[0].file,
                                new_code: file_code,
                                user_email: user_email,
                                user_name: user_name
                            })
                            .then((response) => {
                                if (response.data === "Error") {
                                    alertProperties(true, "error", "Error", "Commit can't be made!");
                                } else {
                                    alertProperties(true, "success", "Success", "Successfully commited!");
                                }
                            });
                    } else {
                        alertProperties(true, "error", "Error", "Write a message for your commit!");
                    }
                } else {
                    alertProperties(true, "error", "Error", "Write your email and name!");
                }
            } else {
                alertProperties(true, "error", "Error", "Select a file before commit!");
            }
        } else {
            alertProperties(true, "warning", "Warning", "Play button is pressed!");
        }
    }

    function handlePush() {
        if (isRunning !== true) {
            if (currentBranch !== '') {
                let user_email = document.getElementById("github-email") !== null ? document.getElementById("github-email").value : '';
                let user_name = document.getElementById("github-name") !== null ? document.getElementById("github-name").value : '';

                if (user_email !== '' && user_name !== '') {
                    if (commitsHadBeenMade === true) {
                        axios
                            .post("http://localhost:8080/workspace/push", {
                                link: localStorage.getItem('githublink'),
                                branch: currentBranch,
                                directory: localRepo,
                                user_email: user_email,
                                user_name: user_name
                            })
                            .then((response) => {
                                if (response.data === "Error") {
                                    alertProperties(true, "error", "Error", "Push can't be made!");
                                } else {
                                    alertProperties(true, "success", "Success", "Successfully push!");
                                }
                            });
                    }
                    else {
                        alertProperties(true, "error", "Error", "Make at least one commit before push!");
                    }
                } else {
                    alertProperties(true, "error", "Error", "Write your email and name!");
                }
            } else {
                alertProperties(true, "error", "Error", "Select a branch before push!");
            }
        } else {
            alertProperties(true, "warning", "Warning", "Play button is pressed!");
        }
    }

    /*
    *   auto commit function 
    */

    const handleChange = (event) => {
        if (isRunning !== true) {
            if (currentFile !== '') {
                setChecked(event.target.checked);

                let message = document.getElementById("auto-commit-message").value;

                if (message !== "") {
                    setCommitsHadBeenMade(true);
                    try {
                        let func = setInterval(async () => {
                            if (event.target.checked == true) {
                                let file_code = editorRef.current;
                                axios
                                    .post("http://localhost:8080/workspace/commit", {
                                        message: message,
                                        branch: currentBranch,
                                        directory: localRepo,
                                        file_name: commitsCode[0].file,
                                        new_code: file_code
                                    })
                                    .then((response) => {
                                        if (response.data === "Error") {
                                            alertProperties(true, "error", "Error", "Commit can't be made!");
                                        }
                                    });
                            }
                            else {
                                clearInterval(func);
                            }
                        }, 4000);
                    } catch (e) {
                        alertProperties(true, "error", "Error", "Some error occured while trying to commit changes!");
                    }
                } else {
                    setChecked(false);
                    alertProperties(true, "error", "Error", "Write a message for your commit!");
                }
            } else {
                if (checked === true) {
                    setChecked(false);
                    alertProperties(true, "success", "Success", "All commits had been made!");

                } else {
                    setChecked(false);
                    alertProperties(true, "error", "Error", "Select a file before auto-commit!");
                }
            }
        } else {
            alertProperties(true, "warning", "Warning", "Play button is pressed!");
        }
    }

    function handleNext() {
        if (currentFile !== '') {
            if (currentDivEditor !== number) {
                onSelectItem(false);
                if (currentDivEditor === 0) {
                    if (commitsCode[0].stats[0] === 0) {
                        setCodeStatus(false);
                    } else {
                        setCodeStatus(true);
                    }
                    document.getElementById("index" + currentDivEditor).style.display = "none";
                    document.getElementById("index1").style.display = "block";
                    setCurrentDivEditor(1);
                    setSliderValue(1);
                }
                else {
                    let newValue = currentDivEditor + 1;
                    if (commitsCode[0].stats[currentDivEditor] === 0) {
                        setCodeStatus(false);
                    } else {
                        setCodeStatus(true);
                    }
                    for (var i = 0; i <= number; i++) {
                        document.getElementById("index" + i).style.display = "none";
                    }
                    document.getElementById("index" + newValue).style.display = "block";
                    setCurrentDivEditor(newValue);
                    setSliderValue(newValue);
                }
            }
        } else {
            alertProperties(true, "error", "Error", "Select a file!");
        }
    }

    function handlePrevious() {
        if (currentFile !== '') {
            if (currentDivEditor !== 0) {
                onSelectItem(false);
                let newValue = currentDivEditor - 1;
                if (commitsCode[0].stats[newValue] === 0) {
                    setCodeStatus(false);
                } else {
                    setCodeStatus(true);
                }
                for (var i = 0; i <= number; i++) {
                    document.getElementById("index" + i).style.display = "none";
                }
                document.getElementById("index" + newValue).style.display = "block";
                setCurrentDivEditor(newValue);
                setSliderValue(newValue);
            }
        } else {
            alertProperties(true, "error", "Error", "Select a file!");
        }
    }

    const handleChangeSpeed = (event) => {
        if (currentFile !== '') {
            let speed = event.target.value;
            if (speed === "1x") {
                setDelay(2000);
            } else if (speed === "2x") {
                setDelay(1000);
            }
            else {
                setDelay(500);
            }
        } else {
            alertProperties(true, "error", "Error", "Select a file!");
        }
    }

    useInterval(() => {
        let newValue = currentDivEditor + 1;
        if ((newValue <= number)) {
            if (commitsCode[0].stats[newValue] === 0) {
                setCodeStatus(false);
            } else {
                setCodeStatus(true);
            }
            for (var i = 0; i <= number; i++) {
                document.getElementById("index" + i).style.display = "none";
            }
            document.getElementById("index" + newValue).style.display = "block";
            setCurrentDivEditor(newValue);
            setSliderValue(newValue);
        }
        else {
            playButtonPressed(false);
            setIsRunning(false);
            setShowPlayButton(!showPlayButton);
        }
    }, isRunning ? delay : null);

    const handlePlay = () => {
        if (currentFile !== '') {
            console.log(currentDivEditor);
            playButtonPressed(!isRunning);
            onSelectItem(false);
            setIsRunning(!isRunning);
            setShowPlayButton(!showPlayButton);
        } else {
            alertProperties(true, "error", "Error", "Select a file!");
        }
    }

    const handleRun = (event) => {
        if (currentFile !== '') {
            if (typeof editorRef.current === "string") {
                setOutputRun("Running...");
                axios.post("http://localhost:8080/code/run", {
                    code: editorRef.current,
                    language: language,
                    extension: extension
                })
                    .then((response) => {
                        if (response.data === "Error") {
                            alertProperties(true, "error", "Error", "Error on code running!");
                            setOutputRun("Error...");
                        } else {
                            // let output = "== 1 == error: " + response.data.error + "\n" + " == 2 == stderr: " +
                            //     response.data.stderr + "\n" + " == 3 == stdout: " + response.data.stdout + "\n";
                            setOutputRun(response.data);
                        }
                    });
            } else {
                if (currentDivEditor >= 1) {
                    setOutputRun("Running...");
                    axios.post("http://localhost:8080/code/run", {
                        code: commitsCode[0].codes[currentDivEditor - 1].code,
                        language: language,
                        extension: extension
                    })
                        .then((response) => {
                            if (response.data === "Error") {
                                alertProperties(true, "error", "Error", "Error on code running!");
                                setOutputRun("Error...");
                            } else {
                                // let output = "== 1 == error: " + response.data.error + "\n" + " == 2 == stderr: " +
                                //     response.data.stderr + "\n" + " == 3 == stdout: " + response.data.stdout + "\n";
                                setOutputRun(response.data);
                            }
                        });
                } else {
                    alertProperties(true, "error", "Error", "Select code you want to run!");
                }
            }

        } else {
            alertProperties(true, "error", "Error", "Select a file!");
        }
    }

    const handleCheckSecurity = (event) => {
        if (currentFile !== '') {
            if (extension === 'c' || extension === 'cpp') {
                if (typeof editorRef.current === "string") {
                    setOutputCheckSecurity("Checking...");
                    axios.post("http://20.113.166.97:3000/security", {
                        code: editorRef.current,
                        language: language,
                        extension: '.' + extension
                    })
                        .then((response) => {
                            if (response.data === "Error") {
                                alertProperties(true, "error", "Error", "Error on code running!");
                                setOutputCheckSecurity("Error...");
                            } else {
                                setOutputCheckSecurity(response.data);
                            }
                        });
                } else {
                    if (currentDivEditor >= 1) {
                        setOutputCheckSecurity("Checking...");
                        axios.post("http://20.113.166.97:3000/security", {
                            code: commitsCode[0].codes[currentDivEditor - 1].code,
                            language: language,
                            extension: '.' + extension
                        })
                            .then((response) => {
                                if (response.data === "Error") {
                                    alertProperties(true, "error", "Error", "Error on memory leaks check!");
                                    setOutputCheckSecurity("Error...");
                                } else {
                                    setOutputCheckSecurity(response.data);
                                }
                            });
                    } else {
                        alertProperties(true, "error", "Error", "Select code you want to run!");
                    }
                }
            } else {
                alertProperties(true, "warning", "Warning", "Check memory leaks option only available for c and cpp programs!");
            }

        } else {
            alertProperties(true, "error", "Error", "Select a file!");
        }
    }

    /*
    *   buttons and inputs
    */

    const CommitButton = styled(Button)(({ theme }) => ({
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
        lineHeight: 1.5,
        backgroundColor: '#21262d',
        border: '0.5px solid #30363d',
        '&:hover': {
            border: '0.5px solid white',
            backgroundColor: '#21262d',
        },
    }));

    const PushButton = styled(Button)(({ theme }) => ({
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

    const RunButton = styled(Button)(({ theme }) => ({
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
        height: '26px',
        marginLeft: '20px',
        lineHeight: 1.5,
        backgroundColor: 'green',
        color: "white",
        '&:hover': {
            backgroundColor: '#2ea043',
        },
    }));

    const SecurityButton = styled(Button)(({ theme }) => ({
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
        height: '26px',
        marginLeft: '20px',
        lineHeight: 1.5,
        backgroundColor: 'green',
        color: "white",
        '&:hover': {
            backgroundColor: '#2ea043',
        },
    }));

    const ChangeButton = styled(Button)(({ theme }) => ({
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
        width: '100px',
        height: '34px',
        marginLeft: '20px',
        marginTop: '10px',
        lineHeight: 1.5,
        backgroundColor: 'green',
        color: "white",
        '&:hover': {
            backgroundColor: '#2ea043',
        },
    }));

    const BootstrapInput = styled(InputBase)(({ theme }) => ({
        'label + &': {
            marginTop: theme.spacing(3),
        },
        input: {
            color: "white",
            marginLeft: "4px"
        },
        '& .MuiInputBase-input': {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.mode === 'light' ? '#0d1117' : 'white',
            border: '1px solid #30363d',
            fontSize: 14,
            width: '100%',
            height: '10px',
            padding: '12px 12px 12px 12px',
            transition: theme.transitions.create([
                'border-color',
                'background-color',
                'box-shadow',
            ]),
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
            '&:focus': {
                boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
                borderColor: theme.palette.primary.main,
            },
        },
    }));

    const EmailNameInput = styled(InputBase)(({ theme }) => ({
        'label + &': {
            marginTop: theme.spacing(3),
        },
        input: {
            color: "white"
        },
        '& .MuiInputBase-input': {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.mode === 'light' ? '#0d1117' : 'white',
            border: '1px solid #30363d',
            fontSize: 14,
            width: 'auto',
            height: '10px',
            marginTop: '9px',
            padding: '12px 12px 12px 12px',
            transition: theme.transitions.create([
                'border-color',
                'background-color',
                'box-shadow',
            ]),
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
            '&:focus': {
                boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
                borderColor: theme.palette.primary.main,
            },
        },
    }));

    const CommitMessageInput = styled(InputBase)(({ theme }) => ({
        'label + &': {
            marginTop: theme.spacing(3),
        },
        input: {
            color: "white",
            marginLeft: "4px"
        },
        '& .MuiInputBase-input': {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.mode === 'light' ? '#0d1117' : 'white',
            border: '1px solid #30363d',
            fontSize: 14,
            width: '100%',
            height: '10px',
            padding: '12px 12px 12px 12px',
            transition: theme.transitions.create([
                'border-color',
                'background-color',
                'box-shadow',
            ]),
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
            '&:focus': {
                boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
                borderColor: theme.palette.primary.main,
            },
        },
    }));

    /*
    *   chart languages
    */

    const series_languages = sizeLanguage;
    const options_languages = {
        chart: {
            type: 'donut',
            foreColor: '#8b949e'
        },
        labels: languagesChart,
        responsive: [{
            breakpoint: totalSize[0],
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    return <>
        <div className="workspace-content-container">
            <div className="user-container">
                <div className='user-info-container'>
                    <div className="source-parentbox"><div style={{ color: "white" }} className="source-childbox">Email</div></div>
                    <EmailNameInput value={localStorage.getItem('email_credentials') !== null ? localStorage.getItem('email_credentials') : ''} style={{ marginBottom: '10px' }} id="github-email" />
                    <div style={{ marginLeft: '20px' }} className="source-parentbox"><div style={{ color: "white" }} className="source-childbox">Name</div></div>
                    <EmailNameInput value={localStorage.getItem('name_credentials') !== null ? localStorage.getItem('name_credentials') : ''} style={{ marginBottom: '10px' }} id="github-name" />
                    <ChangeButton onClick={togglePopupChange}>Change</ChangeButton>
                </div>
            </div>
            <div className="workspace-content">
                <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                        <AlertTitle>{errorTitle}</AlertTitle>
                        {toastMessage}
                    </Alert>
                </Snackbar>
                <div className="video-content">
                    <div className="view-content">
                        <Stack spacing={0}>
                            <div className="start-item-content" key="start" id={idBuffer + 0}>
                                <div className="loading-container">
                                    <img className='image' style={{ width: "64px" }} src={loading} alt="loading" />
                                </div>
                            </div>
                            {commitsCode ? commitsCode[0].codes.map(({ order, code, status }, index) => (
                                <div className="item-content" key={commitsCode[0].file + index} id={idBuffer + (index + 1)}>
                                    <Editor
                                        className={commitsCode[0].file + (index + 1)}
                                        height="60vh"
                                        theme="vs-dark"
                                        defaultLanguage={language}
                                        defaultValue={code}
                                        onMount={handleEditorDidMount}
                                        onChange={handleEditorChange}
                                    />
                                </div>
                            )) : <></>}
                        </Stack>
                        {isOpen && <Popup
                            title="{title}"
                            handleClose={togglePopupChange}
                        />}
                    </div>
                    <div className="slider-container">
                        <div className="play-button">
                            <button
                                onClick={handlePlay}
                                style={{
                                    border: "0.5px solid #30363d",
                                    backgroundColor: "#181c24",
                                    boxShadow: "0 0 4px 2px rgba(0,0,0,.2)",
                                    cursor: "pointer",
                                    height: 40,
                                    outline: "none",
                                    borderRadius: "100%",
                                    width: 40
                                }}
                            >
                                <PlayPause buttonToShow={showPlayButton ? "play" : "pause"} />
                            </button>
                        </div>
                        <Form.Group controlId="custom-select">
                            <Form.Control onChange={handleChangeSpeed} style={{ height: "40px", width: "45px", color: "white", border: "0.5px solid #30363d", backgroundColor: "#181c24" }} as="select" className="rounded-0 shadow">
                                <option style={{ backgroundColor: "#181c24" }} className="d-none" value="">
                                    1x
                                </option>
                                {["1x", "2x", "4x"].map(option => (
                                    <option style={{ color: "white", border: "0.5px solid #30363d", backgroundColor: "#181c24" }} key={option}>{option}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        {codeStatus === false ?
                            <div className="status">
                                <span className="icon-verified"></span>
                            </div> :
                            <div className="status">
                                <span className="icon-warning"></span>
                            </div>
                        }
                        <div className="slider">
                            {number ?
                                <Slider
                                    id={"slider" + language}
                                    key={"slider" + language}
                                    ref={editorRef}
                                    defaultValue={0}
                                    value={defaultSliderValue.current ? 0 : sliderValue}
                                    valueLabelDisplay="auto"
                                    onChange={handleSliderChange}
                                    step={1}
                                    min={0}
                                    max={(number - 1) == 0 ? 1 : number}
                                />
                                : <Slider
                                    key={"slider" + language}
                                    value={0}
                                    valueLabelDisplay="auto"
                                    step={1}
                                    min={0}
                                    max={1}
                                />}
                        </div>
                        <div className="previous-button">
                            <button
                                onClick={handlePrevious}
                                style={{
                                    border: "0.5px solid #30363d",
                                    backgroundColor: "#181c24",
                                    boxShadow: "0 0 4px 2px rgba(0,0,0,.2)",
                                    cursor: "pointer",
                                    height: 40,
                                    outline: "none",
                                    borderRadius: "100%",
                                    width: 40
                                }}
                            >
                                <i class="fa fa-arrow-left" style={{ color: "white" }}></i>
                            </button>
                        </div>
                        <div className="next-button">
                            <button
                                onClick={handleNext}
                                style={{
                                    border: "0.5px solid #30363d",
                                    backgroundColor: "#181c24",
                                    boxShadow: "0 0 4px 2px rgba(0,0,0,.2)",
                                    cursor: "pointer",
                                    height: 40,
                                    outline: "none",
                                    borderRadius: "100%",
                                    marginLeft: "5px",
                                    width: 40
                                }}
                            >
                                <i class="fa fa-arrow-right" style={{ color: "white" }}></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="buttons-action">
                    <div className="auto-commit-action-container">
                        <div className='informations'>
                            <p style={{ color: "#8b949e" }}>
                                Auto commit:
                            </p>
                        </div>
                        <div className="auto-commit-action">
                            <Checkbox
                                style={{
                                    color: 'orange',
                                }}
                                checked={checked}
                                onChange={handleChange}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                            <BootstrapInput id="auto-commit-message" />
                        </div>
                    </div>
                    <div className="line"></div>
                    <div className="informations">
                        <p style={{ color: "#8b949e" }}>
                            Basic actions:
                        </p>
                    </div>
                    <div className="commit-buttons-action">
                        <CommitButton className="commit-button" variant="contained" onClick={handleCommit}>Commit</CommitButton>
                        <PushButton className="push-button" variant="contained" onClick={handlePush}>Push</PushButton>
                    </div>
                    <div className="informations">
                        <p style={{ color: "#8b949e" }}>
                            Write a message for your commit:
                        </p>
                    </div>
                    <div className="push-buttons-action">
                        <CommitMessageInput id="commit-message" />
                    </div>
                    <div className="line"></div>
                    <div className="languages-container">
                        <Chart options={options_languages} series={series_languages} type="donut" />
                    </div>
                </div>
            </div>
        </div>
        <div className="code-information-container">
            <div className="run-code-container">
                <div className="run-code-button-container">
                    <p style={{ color: "#8b949e", marginLeft: '10px' }}><b>Check code output:</b></p>
                    <RunButton onClick={handleRun}>Run</RunButton>
                </div>
                <div className="run-code-content-container">
                    <p style={{ color: 'white', marginLeft: '10px', marginRight: '10px', marginTop: '5px', marginBottom: '5px' }}>{outputRun}</p>
                </div>
            </div>
            <div className="security-code-container">
                <div className="security-code-button-container">
                    <p style={{ color: "#8b949e", marginLeft: '10px' }}><b>Check code security:</b></p>
                    <SecurityButton onClick={handleCheckSecurity}>Check</SecurityButton>
                </div>
                <div className="security-code-content-container">
                    <p style={{ color: 'white', marginLeft: '10px', marginRight: '10px', marginTop: '5px', marginBottom: '5px' }}>{outputCheckSecurity}</p>
                </div>
            </div>
        </div>
    </>
}