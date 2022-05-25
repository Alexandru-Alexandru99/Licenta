import { Form } from "react-bootstrap"
import "./index.css"
import 'rc-slider/assets/index.css';

import { DiffEditor as MonacoDiffEditor } from '@monaco-editor/react';

import PlayPause from "../play-stop-button/index";
import Popup from "../popup-window/index";

import Editor from "@monaco-editor/react";

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

// export default function FunctionViewEditor(playButtonPressed, currentBranch, currentFile, commitsCode, language, extension, defaultSliderValue, onSelectItem) {
export default function FunctionViewEditor(props) {

    console.log(props.props);
    let idBuffer = "index_editor_function";

    const [currentDivEditor, setCurrentDivEditor] = useState(0);

    const [sliderValue, setSliderValue] = useState(0);

    const [codeStatus, setCodeStatus] = useState(false);

    const [isOpen, setIsOpen] = useState(false);

    const [codeToCompare, setCodeToCompare] = useState("");

    let number = props.props[0].codes.length;

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

    const editorRef = useRef(null);

    const div_code_value = [];

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
        if (props.defaultSliderValue.current === true) {
            document.getElementById("index_editor_function" + currentDivEditor).style.display = "none";
            document.getElementById("index_editor_function" + 0).style.display = "block";
            setCurrentDivEditor(0);
        }
    }, [props.defaultSliderValue.current]);

    function handleSliderChange(e, newValue) {
        props.onSelectItem(false);

        for (var i = 0; i <= number; i++) {
            document.getElementById("index_editor_function" + i).style.display = "none";
        }
        document.getElementById("index_editor_function" + newValue).style.display = "block";
        setCurrentDivEditor(newValue);
        setSliderValue(newValue);

        if (props.props[0].stats[newValue] === 0) {
            setCodeStatus(false);
        } else {
            setCodeStatus(true);
        }
    }

    function handleNext() {
        if (props.currentFile !== '') {
            if (currentDivEditor !== number) {
                props.onSelectItem(false);
                if (currentDivEditor === 0) {
                    if (props.props[0].stats[0] === 0) {
                        setCodeStatus(false);
                    } else {
                        setCodeStatus(true);
                    }
                    document.getElementById("index_editor_function" + currentDivEditor).style.display = "none";
                    document.getElementById("index_editor_function1").style.display = "block";
                    setCurrentDivEditor(1);
                    setSliderValue(1);
                }
                else {
                    let newValue = currentDivEditor + 1;
                    if (props.props[0].stats[currentDivEditor] === 0) {
                        setCodeStatus(false);
                    } else {
                        setCodeStatus(true);
                    }
                    for (var i = 0; i <= number; i++) {
                        document.getElementById("index_editor_function" + i).style.display = "none";
                    }
                    document.getElementById("index_editor_function" + newValue).style.display = "block";
                    setCurrentDivEditor(newValue);
                    setSliderValue(newValue);
                }
            }
        } else {
            alertProperties(true, "error", "Error", "Select a file!");
        }
    }

    function handlePrevious() {
        if (props.currentFile !== '') {
            if (currentDivEditor !== 0) {
                props.onSelectItem(false);
                let newValue = currentDivEditor - 1;
                if (props.props[0].stats[newValue] === 0) {
                    setCodeStatus(false);
                } else {
                    setCodeStatus(true);
                }
                for (var i = 0; i <= number; i++) {
                    document.getElementById("index_editor_function" + i).style.display = "none";
                }
                document.getElementById("index_editor_function" + newValue).style.display = "block";
                setCurrentDivEditor(newValue);
                setSliderValue(newValue);
            }
        } else {
            alertProperties(true, "error", "Error", "Select a file!");
        }
    }

    const handleChangeSpeed = (event) => {
        if (props.currentFile !== '') {
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
            if (props.props[0].stats[newValue] === 0) {
                setCodeStatus(false);
            } else {
                setCodeStatus(true);
            }
            for (var i = 0; i <= number; i++) {
                document.getElementById("index_editor_function" + i).style.display = "none";
            }
            document.getElementById("index_editor_function" + newValue).style.display = "block";
            setCurrentDivEditor(newValue);
            setSliderValue(newValue);
        }
        else {
            props.playButtonPressed(false);
            setIsRunning(false);
            setShowPlayButton(!showPlayButton);
        }
    }, isRunning ? delay : null);

    const handlePlay = () => {
        if (props.currentFile !== '') {
            console.log(currentDivEditor);
            props.playButtonPressed(!isRunning);
            props.onSelectItem(false);
            setIsRunning(!isRunning);
            setShowPlayButton(!showPlayButton);
        } else {
            alertProperties(true, "error", "Error", "Select a file!");
        }
    }

    const SetButton = styled(Button)(({ theme }) => ({
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
        marginTop: '10px',
        marginLeft: '10px',
        lineHeight: 1.5,
        backgroundColor: 'green',
        color: "white",
        '&:hover': {
            backgroundColor: '#2ea043',
        },
    }));

    function handleEditorChange(value, event) {
        editorRef.current = value;
    }

    const handleSetCode = () => {
        setCodeToCompare(editorRef.current);
    }

    return (
        <div className="my-body-function-compare-editor-container">
            <div className="code-to-compare-container">
                <div className="set-code-button-container">
                    <p style={{ color: "#8b949e", marginLeft: "10px", marginTop:'10px' }}>
                        Write your small code here:
                    </p>
                    <SetButton onClick={handleSetCode}>Set code</SetButton>
                </div>
                <div className="set-code-editor-container">
                    <Editor
                        height="528px"
                        theme="vs-dark"
                        defaultLanguage={props.language}
                        defaultValue="Write your code here"
                        onChange={handleEditorChange}
                    />
                </div>
            </div>
            <div className="function-compare-editor-container">
                <div className="view-container">
                    <Stack spacing={0}>
                        <div className="start-item-content" key="start" id={idBuffer + 0}>
                            <div className="loading-container">
                                <img className='image' style={{ width: "56px" }} src={loading} alt="loading" />
                            </div>
                        </div>
                        {props.props ? props.props[0].codes.map(({ order, code, status }, index) => (
                            <div className="item-content-function" key={props.props[0].file + index} id={idBuffer + (index + 1)}>
                                <MonacoDiffEditor
                                    className={props.props[0].file + (index + 1)}
                                    height="60vh"
                                    width="auto"
                                    theme="vs-dark"
                                    modified={codeToCompare}
                                    original={code}
                                    language={props.language}
                                    onChange={handleEditorChange}
                                />
                            </div>
                        )) : <></>}
                    </Stack>
                </div>
                <div className="controls-container">
                    <div className="play-button-container">
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
                    <div className="slider-container">
                        {number ?
                            <Slider
                                id={"slider" + props.language}
                                key={"slider" + props.language}
                                ref={editorRef}
                                defaultValue={0}
                                value={props.defaultSliderValue.current ? 0 : sliderValue}
                                valueLabelDisplay="auto"
                                onChange={handleSliderChange}
                                step={1}
                                min={0}
                                max={(number - 1) == 0 ? 1 : number}
                            />
                            : <Slider
                                key={"slider" + props.language}
                                value={0}
                                valueLabelDisplay="auto"
                                step={1}
                                min={0}
                                max={1}
                            />}
                    </div>
                    <div className="previous-button-container">
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
                    <div className="next-button-container">
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
        </div>
    );
}
