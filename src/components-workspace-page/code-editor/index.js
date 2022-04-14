import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"

import "./index.css"

import 'highlight.js/styles/dracula.css';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import MyEditor from "../my-editor/index"

import Sidebar from "../../common-components/sidebar";

import loading from "../../images/refresh.png";

import logo from "../../images/favicon.ico";
import style from "styled-components";

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

import Button from '@mui/material/Button';

import Chart from 'react-apexcharts'

import Select from 'react-select'

import Checkbox from '@mui/material/Checkbox';

import programming_languages from "../my-editor/Programming_Languages_Extensions.json";

const crypto = require('crypto');

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CodeEditor() {
    const localRepo = localStorage.getItem('repositoryName');

    const value = useRef(false);

    const playing = useRef(false);

    const [selectStatus, setSelectStatus] = useState(false);

    /*
    *   parameters for repository 
    */

    const [commitsCode, setCommitsCode] = useState([]);

    const [commits, setCommits] = useState([]);

    const [files, setFiles] = useState([]);

    const [currentFile, setCurrentFile] = useState('');

    const [currentBranch, setCurrentBranch] = useState('');

    const [branches, setBranches] = useState([]);

    const [language, setLanguage] = useState("");

    const [fileExt, setFileExt] = useState("");

    /*
    *   chart variables 
    */

    const [numberOfCommits, setNumberOfCommits] = useState([]);

    const [date, setDate] = useState([]);

    const [sizeLanguage, setSizeLanguage] = useState([]);

    const [languageChart, setLanguageChart] = useState([]);

    const [totalSize, setTotalSize] = useState([]);

    const [checked, setChecked] = useState(false);

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

    useEffect(() => {
        const name = crypto.randomBytes(20).toString('hex');
        localStorage.setItem('repositoryName', name);

        const userName = localStorage.getItem('username');
        const token = localStorage.getItem('token');

        axios.post("http://localhost:8080/workspace/commits", {
            link: localStorage.getItem('githublink'),
            storage: name,
            userName: userName !== null ? userName : "",
            token: token !== null ? token : ""
        })
            .then((response) => {
                if (response.data === "Error") {
                    alertProperties(true, "error", "Error", "Some error occured while trying to get all commits!");
                } else {
                    setCommits(response.data);
                    alertProperties(true, "success", "Success", "Successfully operation for cloning the repository!");
                    axios.all([
                        axios.post("http://localhost:8080/workspace/files", {
                            storage: name
                        }),
                        axios.post("http://localhost:8080/workspace/branches", {
                            storage: name
                        }),
                        axios.post("http://localhost:8080/workspace/commitsbyday", {
                            storage: name
                        })
                        ,
                        axios.post("http://localhost:8080/workspace/languages", {
                            storage: name
                        })
                    ])
                        .then(axios.spread((response1, response2, response3, response4) => {
                            if (response1.data === "Error") {
                                alertProperties(true, "error", "Error", "Some error occured while trying to get all files!");
                            } else {
                                alertProperties(true, "success", "Success", "Successfully operation for getting all files!");
                                setFiles(response1.data);
                            }
                            if (response2.data === "Error") {
                                alertProperties(true, "error", "Error", "Some error occured while trying to get all branches!");
                            } else {
                                alertProperties(true, "success", "Success", "Successfully operation for getting all branches!");
                                setBranches(response2.data);
                            }
                            if (response3.data === "Error") {
                                alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                            } else {
                                setDate(response3.data.data);
                                setNumberOfCommits(response3.data.total_per_day);
                            }
                            if (response4.data === "Error") {
                                alertProperties(true, "error", "Error", "Some error occured while trying to get chart language informations!");
                            } else {
                                setSizeLanguage(response4.data.size);
                                setLanguageChart(response4.data.language);
                                setTotalSize(response4.data.total);
                            }
                        }));
                }
            });
    }, []);

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

    const handleChange = (e) => {
        if (playing.current === false) {
            value.current = true;
            setCurrentFile(e.value);

            let file = e.value;
            let extension;

            var fileExt = file.split('.').pop();
            extension = fileExt;

            programming_languages.map(elem => {
                if (elem.extension === extension) {
                    console.log(elem.name);
                    setLanguage(elem.name);
                    setFileExt(elem.extension);
                };
            });

            axios
                .post("http://localhost:8080/workspace/filecode", {
                    file: e.value,
                    storage: localRepo,
                    list: commits.globalCommits
                })
                .then((response) => {
                    if (response.data === "Error") {
                        alertProperties(true, "error", "Error", "Some error occured while trying to get file code!");
                    } else {
                        setCommitsCode(response.data);
                    }
                })
        } else {
            alertProperties(true, "error", "Error", "You can change file while play button is pressed!");
        }
    }

    const handleChangeBranch = (e) => {
        setCurrentBranch(e.value);
    }

    const renderFileList = () => {
        if (files.length != 0) {
            return (
                <div style={{ width: '200px' }}>
                    <Select maxMenuHeight={400} placeholder="Select a file" options={files.map((file) => (
                        { value: file, label: file }
                    ))} onChange={handleChange} styles={customStyles}>
                    </Select>
                </div>
            )
        }
    }

    const renderBranchList = () => {
        if (branches.length != 0) {
            return (
                <div style={{ width: '200px' }}>
                    <Select placeholder="Select branch" options={branches.branches.map(branch => (
                        { value: branch, label: branch }
                    ))} onChange={handleChangeBranch} styles={customStyles}>
                    </Select>
                </div>
            )
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const handleClone = (e) => {
        let new_link = document.getElementById("github-link").value;
        let new_username = document.getElementById("github-username") !== null ? document.getElementById("github-username").value : '';
        let new_token = document.getElementById("github-token") !== null ? document.getElementById("github-token").value : '';

        localStorage.setItem('username', '');
        localStorage.setItem('token', '');

        if (new_link === '') {
            alertProperties(true, "info", "Info", "You need to write a link before using clone button!");
        } else {
            let regex = new RegExp("((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?");
            if (regex.test(new_link)) {
                localStorage.setItem('githublink', new_link);
                localStorage.setItem('username', new_username);
                localStorage.setItem('token', new_token);
                window.location.reload(false);
            } else {
                alertProperties(true, "error", "Error", "This is not a valid github link!");
            }
        }

    };

    function onSelect(status) {
        value.current = status;
    }

    function checkPlaying(status) {
        playing.current = status;
        setSelectStatus(!selectStatus);
    }

    /*
    *   input text
    */

    const CloneButton = styled(Button)(({ theme }) => ({
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
        height: '35px',
        marginLeft: '40px',
        marginTop: '9px',
        lineHeight: 1.5,
        backgroundColor: 'green',
        color: "white",
        '&:hover': {
            backgroundColor: '#2ea043',
        },
    }));

    /*
    *   button
    */

    const LinkInput = styled(InputBase)(({ theme }) => ({
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

    /*
    *   chart commits
    */

    const series = [{
        name: "Commits",
        data: numberOfCommits
    }];
    const options = {
        chart: {
            height: 350,
            type: 'line',
            zoom: {
                enabled: true
            },
            foreColor: '#8b949e'
        },
        dataLabels: {
            enabled: true
        },
        stroke: {
            curve: 'straight'
        },
        title: {
            text: 'Contributions by day',
            align: 'left'
        },
        grid: {
            row: {
                colors: ['#0d1117'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        xaxis: {
            categories: date,
        }
    };

    const handleRepoType = (e) => {
        setChecked(e.target.checked);
    }

    return (
        <>
            <Sidebar style={{ position: 'absolute' }}></Sidebar>
            <div className='content-body'>
                <div className="content-w">
                    <div className="top-bar">
                        <div className='logo-container'>
                            <div className='logo-tob-bar'>
                                <img style={{ width: "40px" }} src={logo} alt="logo" />
                            </div>
                            <div className='logo-name'>
                                <h3 style={{ color: "#f9eec0" }}>GitVisual</h3>
                            </div>
                        </div>
                    </div>
                    <div className='repository-manipulation-container'>
                        <div className='content-manipulation'>
                            <div className='informations'>
                                <p style={{ color: "#8b949e" }}>
                                    Write a github link you wanna watch:
                                </p>
                            </div>
                            <div className='input-github-link'>
                                <div className="source-parentbox"><div style={{ color: "white" }} className="source-childbox">Target</div></div>
                                <LinkInput id="github-link" />
                                <CloneButton onClick={handleClone}>Clone</CloneButton>
                            </div>
                            <div className='repo-type-container'>
                                <Checkbox
                                    style={{
                                        color: 'orange',
                                    }}
                                    checked={checked}
                                    onChange={handleRepoType}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                                <p style={{ color: "#8b949e", marginTop: '14px' }}>
                                    Private repository
                                </p>
                                {checked === true ?
                                    <>
                                        <div style={{ marginTop: '14px', marginLeft: '20px' }} className="source-parentbox"><div style={{ color: "white" }} className="source-childbox">Username</div></div>
                                        <LinkInput id="github-username" />
                                        <div style={{ marginTop: '14px', marginLeft: '20px' }} className="source-parentbox"><div style={{ color: "white" }} className="source-childbox">Token</div></div>
                                        <LinkInput id="github-token" />
                                    </>
                                    :
                                    <>
                                    </>
                                }
                            </div>
                            {files.length > 0 ?
                                <div className="lists">
                                    {branches ? <p style={{ color: "#8b949e", marginLeft: '10px', marginTop: '10px' }}>
                                        Choose a branch:
                                    </p> : <></>}
                                    <div className='select-branch'>
                                        {branches ? renderBranchList() : <></>}
                                    </div>
                                    {files ? <p style={{ color: "#8b949e", marginLeft: '10px' }}>
                                        Choose a file you wanna watch:
                                    </p> : <></>}
                                    <div className='select-file'>
                                        {files ? renderFileList() : <></>}
                                    </div>
                                </div>
                                :
                                <div className='loading-container'>
                                    <img className='image' style={{ width: "48px" }} src={loading} alt="loading" />
                                </div>
                            }
                        </div>
                        <div className='repository-information-container'>
                            {series[0].data.length > 0 ?
                                <Chart options={options} series={series} type="line" height={300} />
                                :
                                <div className='loading-container'>
                                    <img className='image' style={{ width: "48px" }} src={loading} alt="loading" />
                                </div>
                            }
                        </div>
                    </div>
                    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                        <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                            <AlertTitle>{errorTitle}</AlertTitle>
                            {toastMessage}
                        </Alert>
                    </Snackbar>
                    {commitsCode.length ?
                        <MyEditor totalSize={totalSize} sizeLanguage={sizeLanguage} languagesChart={languageChart} playButtonPressed={checkPlaying} currentBranch={currentBranch} currentFile={currentFile} commitsCode={commitsCode} language={language} extension={fileExt} defaultSliderValue={value} onSelectItem={onSelect}></MyEditor>
                        :
                        <div className='content-loading'>
                            <img className='image' style={{ width: "64px" }} src={loading} alt="loading" />
                        </div>}
                </div>
            </div>
        </>
    )
}
