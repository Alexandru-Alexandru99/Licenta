import React, { useState } from 'react';
import { DiffEditor as MonacoDiffEditor } from '@monaco-editor/react';

import logo from "../../images/favicon.ico";

import Button from '@mui/material/Button';
import { purple } from '@mui/material/colors';
import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

import Box from '@mui/material/Box';

import axios from "axios"

import { Form } from "react-bootstrap"

import "./index.css"

import programming_languages from "../../components-workspace-page/my-editor/Programming_Languages_Extensions.json";

import Checkbox from '@mui/material/Checkbox';

import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

import loading from "../../images/refresh.png";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import Select from 'react-select'

import Chart from 'react-apexcharts'

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
                style={{ color: "white" }}
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
                style={{ color: "white" }}
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
                style={{ color: "white" }}
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
                style={{ color: "white" }}
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

const crypto = require('crypto');
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function MyDiffEditor() {
    const ColorButton = styled(Button)(({ theme }) => ({
        color: theme.palette.getContrastText(purple[500]),
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
        padding: '6px 12px',
        margin: '12px 12px 12px 12px',
        width: '80px',
        height: '30px',
        lineHeight: 1.5,
        backgroundColor: '#21262d',
        border: '0.5px solid #30363d',
        '&:hover': {
            border: '0.5px solid white',
            backgroundColor: '#21262d',
        },
    }));

    const CompareRepoButton = styled(Button)(({ theme }) => ({
        color: theme.palette.getContrastText(purple[500]),
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
        padding: '6px 12px',
        margin: '12px 12px 12px 36px',
        width: '80px',
        height: '30px',
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
            padding: '12px 12px 12px 12px',
            transition: theme.transitions.create([
                'border-color',
                'background-color',
                'box-shadow',
            ]),
            // Use the system font instead of the default Roboto font.
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

    const [firstList, setFirstList] = useState([]);

    const [secondList, setSecondList] = useState([]);

    const [firstRepoData, setFirstRepoData] = useState([]);

    const [secondRepoData, setSecondRepoData] = useState([]);

    const [firstSelectedRepo, setFirstSelectedRepo] = useState("");

    const [secondSelectedRepo, setSecondSelectedRepo] = useState("");

    const [firstStatus, setFirstStatus] = useState(false);

    const [secondStatus, setSecondStatus] = useState(false);

    const [firstSelectedSha, setFirstSelectedSha] = useState('');

    const [secondSelectedSha, setSecondSelectedSha] = useState('');

    const [code, setCode] = useState("");

    const [language, setLanguage] = useState('');

    const [secondCode, setSecondCode] = useState("");

    /*
    *   chart variables 
    */

    const [firstDates, setFirstDates] = useState([]);

    const [secondDates, setSecondDates] = useState([]);

    const [firstNumberOfCommits, setFirstNumberOfCommits] = useState([]);

    const [secondNumberOfCommits, setSecondNumberOfCommits] = useState([]);

    const [firstSizeLanguage, setFirstSizeLanguage] = useState([]);

    const [firstLanguageChart, setFirstLanguageChart] = useState([]);

    const [firstTotalSize, setFirstTotalSize] = useState([]);

    const [secondSizeLanguage, setSecondSizeLanguage] = useState([]);

    const [secondLanguageChart, setSecondLanguageChart] = useState([]);

    const [secondTotalSize, setSecondTotalSize] = useState([]);

    const [firstAuthors, setFirstAuthors] = useState([]);

    const [firstAuthorsNumbers, setFirstAuthorsNumbers] = useState([]);

    const [secondAuthors, setSecondAuthors] = useState([]);

    const [secondAuthorsNumbers, setSecondAuthorsNumbers] = useState([]);

    const [firstRepoCommits, setFirstRepoCommits] = useState([]);

    const [secondRepoCommits, setSecondRepoCommits] = useState([]);

    const [firstRepoFiles, setFirstRepoFiles] = useState([]);

    const [secondRepoFiles, setSecondRepoFiles] = useState([]);

    const [linesFirstRepo, setLinesFirstRepo] = useState([]);

    const [datesFirstRepo, setDatesFirstRepo] = useState([]);

    const [linesSecondRepo, setLinesSecondRepo] = useState([]);

    const [datesSecondRepo, setDatesSecondRepo] = useState([]);

    /*
    *   alert parameters
    */

    const [open, setOpen] = useState(false);

    const [alertType, setAlertType] = useState('');

    const [toastMessage, setToastMessage] = useState("");

    const [errorTitle, setErrorTitle] = useState("");

    /*
    *   styles
    */

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

    /*
    *   functions for compare between 2 repos 
    */

    const handleCompareRepos = (e) => {
        let first_link = document.getElementById("repository-input-one").value;
        let second_link = document.getElementById("repository-input-two").value;

        if (first_link === "" || second_link === "") {
            alertProperties(true, "error", "Error", "Write 2 github before going further!");
        }
        else {
            let regex = new RegExp("((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?");
            if (regex.test(first_link) && regex.test(second_link)) {
                setFirstSelectedRepo("");
                setSecondSelectedRepo("");

                const first_name = crypto.randomBytes(20).toString('hex');
                const second_name = crypto.randomBytes(20).toString('hex');

                localStorage.setItem('compare1', first_name);
                localStorage.setItem('compare2', second_name);

                const userName = document.getElementById("github-username") !== null ? document.getElementById("github-username").value : "";
                const token = document.getElementById("github-token") !== null ? document.getElementById("github-token").value : "";

                axios.all([
                    axios.post("http://localhost:8080/compare/repodata", {
                        link: first_link,
                        storage: first_name,
                        userName: userName,
                        token: token
                    }),
                    axios.post("http://localhost:8080/compare/repodata", {
                        link: second_link,
                        storage: second_name,
                        userName: userName !== null ? userName : "",
                        token: token !== null ? token : ""
                    })
                ])
                    .then(axios.spread((data1, data2) => {
                        if (data1.data === "Error" || data2.data === "Error") {
                            if (data1.data === "Error") {
                                alertProperties(true, "error", "Error", "Error on first link!");
                            } else if (data2.data === "Error") {
                                alertProperties(true, "error", "Error", "Error on second link!");
                            } else {
                                alertProperties(true, "error", "Error", "Errors occured on both links!");
                            }
                        } else {
                            alertProperties(true, "success", "Success", "Operation end successfully!");
                            setFirstRepoData(data1.data);
                            setSecondRepoData(data2.data);

                            setFirstStatus(true);
                            setSecondStatus(true);

                            axios.all([
                                axios.post("http://localhost:8080/compare/commitsbyday", {
                                    storage: first_name
                                }),
                                axios.post("http://localhost:8080/compare/commitsbyday", {
                                    storage: second_name
                                }),
                                axios.post("http://localhost:8080/compare/languages", {
                                    storage: first_name
                                }),
                                axios.post("http://localhost:8080/compare/languages", {
                                    storage: second_name
                                }),
                                axios.post("http://localhost:8080/compare/authors", {
                                    storage: first_name
                                }),
                                axios.post("http://localhost:8080/compare/authors", {
                                    storage: second_name
                                }),
                                axios.post("http://localhost:8080/compare/commits", {
                                    storage: first_name
                                }),
                                axios.post("http://localhost:8080/compare/commits", {
                                    storage: second_name
                                }),
                                axios.post("http://localhost:8080/compare/files", {
                                    storage: first_name
                                }),
                                axios.post("http://localhost:8080/compare/files", {
                                    storage: second_name
                                })
                            ]).
                                then(axios.spread((response1, response2, response3, response4, response5, response6, response7, response8, response9, response10) => {
                                    if (response1.data === "Error") {
                                        alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                                    } else {
                                        setFirstDates(response1.data.data);
                                        setFirstNumberOfCommits(response1.data.total_per_day);
                                    }
                                    if (response2.data === "Error") {
                                        alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                                    } else {
                                        setSecondDates(response2.data.data);
                                        setSecondNumberOfCommits(response2.data.total_per_day);
                                    }
                                    if (response3.data === "Error") {
                                        alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                                    } else {
                                        setFirstSizeLanguage(response3.data.size);
                                        setFirstLanguageChart(response3.data.language);
                                        setFirstTotalSize(response3.data.total);
                                    }
                                    if (response4.data === "Error") {
                                        alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                                    } else {
                                        setSecondSizeLanguage(response4.data.size);
                                        setSecondLanguageChart(response4.data.language);
                                        setSecondTotalSize(response4.data.total);
                                    }
                                    if (response5.data === "Error") {
                                        alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                                    } else {
                                        setFirstAuthors(response5.data.authors);
                                        setFirstAuthorsNumbers(response5.data.numbers);
                                    }
                                    if (response6.data === "Error") {
                                        alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                                    } else {
                                        setSecondAuthors(response6.data.authors);
                                        setSecondAuthorsNumbers(response6.data.numbers);
                                    }
                                    if (response7.data === "Error") {
                                        alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                                    } else {
                                        setFirstRepoCommits(response7.data);
                                    }
                                    if (response8.data === "Error") {
                                        alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                                    } else {
                                        setSecondRepoCommits(response8.data);
                                    }
                                    if (response9.data === "Error") {
                                        alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                                    } else {
                                        setFirstRepoFiles(response9.data);
                                    }
                                    if (response10.data === "Error") {
                                        alertProperties(true, "error", "Error", "Some error occured while trying to get chart informations!");
                                    } else {
                                        setSecondRepoFiles(response10.data);
                                    }
                                }))
                        }
                    }))
            } else {
                alertProperties(true, "error", "Error", "This is not a valid github link!");
            }
        }
    }

    /*
    *   functions for compare between 2 commits 
    */

    const handleCompareCommits = (e) => {
        let first_sha = document.getElementById("sha-input-one").value;
        let second_sha = document.getElementById("sha-input-two").value;

        setFirstSelectedSha(first_sha);
        setSecondSelectedSha(second_sha);

        if (first_sha == "" || second_sha == "") {
            alertProperties(true, "error", "Error", "Complete both fields!");
        }
        else {
            axios.all([
                axios.post("http://localhost:8080/compare/filesforonecommit", {
                    sha: first_sha,
                    storage: firstSelectedRepo
                }),
                axios.post("http://localhost:8080/compare/filesforonecommit", {
                    sha: second_sha,
                    storage: secondSelectedRepo
                })
            ])
                .then(axios.spread((data1, data2) => {
                    if (data1.data === "Error" || data2.data === "Error") {
                        if (data1.data === "Error" && data2.data === "Error") {
                            alertProperties(true, "error", "Error", "Errors occured on both shas!");
                        } else if (data2.data === "Error") {
                            alertProperties(true, "error", "Error", "Error on second sha!");
                        } else {
                            alertProperties(true, "error", "Error", "Error on first sha!");
                        }
                    } else {
                        alertProperties(true, "success", "Success", "Operation end successfully!");
                        setFirstList(data1.data);
                        setSecondList(data2.data);
                    }
                }));
        }
    }

    const handleChangeFirst = (e) => {
        let repo = "";

        const localRepo = localStorage.getItem('compare1');

        if (firstSelectedRepo === "") {
            repo = localRepo;
        } else {
            repo = firstSelectedRepo;
        }

        let file = e.value;

        var file_ext = file.split('.').pop();
        let extension = file_ext;
        programming_languages.map(elem => {
            if (elem.extension == extension) {
                setLanguage(elem.name);
            };
        });

        axios
            .post("http://localhost:8080/compare/filecode", {
                file: e.value,
                storage: repo,
                sha: firstSelectedSha
            })
            .then((response) => {
                if (response.data === "Error") {
                    alertProperties(true, "error", "Error", "Error on geting file code!");
                } else {
                    setCode(response.data);
                }
            })
    }

    const handleChangeSecond = (e) => {
        let repo = "";
        const secondLocalRepo = localStorage.getItem('compare2');

        if (secondSelectedRepo === "") {
            repo = secondLocalRepo;
        } else {
            repo = secondSelectedRepo;
        }

        axios
            .post("http://localhost:8080/compare/filecode", {
                file: e.value,
                storage: repo,
                sha: secondSelectedSha
            })
            .then((response) => {
                if (response.data === "Error") {
                    alertProperties(true, "error", "Error", "Error on geting file code!");
                } else {
                    setSecondCode(response.data);
                }
            })
    }

    const renderSelectList = () => {
        if (firstList.length !== 0 && secondList.length !== 0) {
            return (
                <>
                    <div className='select-file-repository'>
                        <div className='first-list'>
                            <div style={{ width: '200px', marginLeft: '5px', marginTop: '5px', marginBottom: '5px' }}>
                                <Select maxMenuHeight={100} placeholder="Select a file" options={firstList.files_list.map((file) => (
                                    { value: file, label: file }
                                ))} onChange={handleChangeFirst} styles={customStyles}>
                                </Select>
                            </div>
                        </div>
                        <div className='second-list'>
                            <div style={{ width: '200px', marginLeft: '5px', marginTop: '5px', marginBottom: '5px' }}>
                                <Select maxMenuHeight={100} placeholder="Select a file" options={secondList.files_list.map((file) => (
                                    { value: file, label: file }
                                ))} onChange={handleChangeSecond} styles={customStyles}>
                                </Select>
                            </div>
                        </div>
                    </div>
                </>
            )
        }
    }

    const handleFileChangeFirstForChart = (e) => {
        let repo = "";

        const localRepo = localStorage.getItem('compare1');

        if (firstSelectedRepo === "") {
            repo = localRepo;
        } else {
            repo = firstSelectedRepo;
        }

        axios
            .post("http://localhost:8080/compare/lines", {
                file: e.value,
                storage: repo,
                list: firstRepoCommits.globalCommits
            })
            .then((response) => {
                if (response.data === "Error") {
                    alertProperties(true, "error", "Error", "Error on geting file code!");
                } else {
                    setLinesFirstRepo(response.data.changes);
                    setDatesFirstRepo(response.data.date);
                }
            })
    }

    const handleFileChangeSecondForChart = (e) => {
        let repo = "";

        const localRepo = localStorage.getItem('compare2');

        if (secondSelectedRepo === "") {
            repo = localRepo;
        } else {
            repo = secondSelectedRepo;
        }

        axios
            .post("http://localhost:8080/compare/lines", {
                file: e.value,
                storage: repo,
                list: secondRepoCommits.globalCommits
            })
            .then((response) => {
                if (response.data === "Error") {
                    alertProperties(true, "error", "Error", "Error on geting file code!");
                } else {
                    setLinesSecondRepo(response.data.changes);
                    setDatesSecondRepo(response.data.date);
                }
            })
    }

    const renderFileList = () => {
        if (firstRepoFiles.length !== 0 && secondRepoFiles.length !== 0) {
            return (
                <>
                    <div className='chart-container-file-list'>
                        <div className='chart-container-file-list-1'>
                            <div style={{ width: '200px', marginLeft: '5px', marginTop: '5px', marginBottom: '5px' }}>
                                <Select placeholder="Select a file" options={firstRepoFiles.map((file) => (
                                    { value: file, label: file }
                                ))} onChange={handleFileChangeFirstForChart} styles={customStyles}>
                                </Select>
                            </div>
                        </div>
                        <div className='chart-container-file-list-2'>
                            <div style={{ width: '200px', marginLeft: '5px', marginTop: '5px', marginBottom: '5px' }}>
                                <Select placeholder="Select a file" options={secondRepoFiles.map((file) => (
                                    { value: file, label: file }
                                ))} onChange={handleFileChangeSecondForChart} styles={customStyles}>
                                </Select>
                            </div>
                        </div>
                    </div>
                </>
            )
        }
    }

    /* 
    *   first table 
    */

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - firstRepoData.globalCommits.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    /* 
    *   second table 
    */

    const [secondPage, setSecondPage] = useState(0);
    const [secondRowsPerPage, setSecondRowsPerPage] = useState(5);

    const secondEmptyRows =
        secondPage > 0 ? Math.max(0, (1 + secondPage) * secondRowsPerPage - secondRepoData.globalCommits.length) : 0;

    const handleChangeSecondPage = (event, newPage) => {
        setSecondPage(newPage);
    };

    const handleChangeSecondRowsPerPage = (event) => {
        setSecondRowsPerPage(parseInt(event.target.value, 10));
        setSecondPage(0);
    };

    /* 
    *   handle selection table
    */

    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [firstSha, setFirstSha] = useState("");
    const [secondSha, setSecondSha] = useState("");

    const [changedSha, setSetChangedSha] = useState(false);

    const [selected, setSelected] = useState([]);;

    const handleRowClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selected.length < 2) {
            if (selectedIndex === -1) {
                newSelected = newSelected.concat(selected, name);
            } else if (selectedIndex === 0) {
                newSelected = newSelected.concat(selected.slice(1));
            } else if (selectedIndex === selected.length - 1) {
                newSelected = newSelected.concat(selected.slice(0, -1));
            } else if (selectedIndex > 0) {
                newSelected = newSelected.concat(
                    selected.slice(0, selectedIndex),
                    selected.slice(selectedIndex + 1),
                );
            }
        } else {
            setFirstSha("");
            setSecondSha("");
        }

        setSelected(newSelected);

        let repo = document.getElementById(localStorage.getItem('compare1')).id;

        let repo2 = document.getElementById(localStorage.getItem('compare2')).id;

        let value = event.target.id;

        if (selected.length < 2 && selectedIndex !== 0) {
            if (firstSha === "") {
                setFirstSha(name);
                if (value == 1) {
                    setFirstSelectedRepo(repo);
                } else {
                    setFirstSelectedRepo(repo2);
                }
            } else if (secondSha === "") {
                setSecondSha(name);
                if (value == 1) {
                    setSecondSelectedRepo(repo);
                } else {
                    setSecondSelectedRepo(repo2);
                }
            } else if (firstSha !== "" && secondSha !== "" && changedSha === false) {
                setFirstSha(name);
                if (value == 1) {
                    setFirstSelectedRepo(repo);
                } else {
                    setFirstSelectedRepo(repo2);
                }
                setSetChangedSha(true);
            } else if (firstSha !== "" && changedSha === true) {
                setSecondSha(name);
                if (value == 1) {
                    setSecondSelectedRepo(repo);
                } else {
                    setSecondSelectedRepo(repo2);
                }
                setSetChangedSha(false);
            }
        }
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;

    /*
    *   charts data
    */

    const series_commits_first = [{
        name: "Source",
        data: firstNumberOfCommits
    }];
    const options_commits_first = {
        chart: {
            height: 350,
            type: 'line',
            zoom: {
                enabled: false
            },
            foreColor: '#8b949e'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        title: {
            text: 'Commits by dau source',
            align: 'left'
        },
        grid: {
            row: {
                colors: ['#0d1117'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        xaxis: {
            categories: firstDates,
            title: {
                text: 'Day'
            }
        },
        yaxis: {
            title: {
                text: 'Commits'
            }
        }
    };

    const series_commits_second = [{
        name: "Target",
        data: secondNumberOfCommits
    }];
    const options_commits_second = {
        chart: {
            height: 350,
            type: 'line',
            zoom: {
                enabled: false
            },
            foreColor: '#8b949e'
        },
        colors: ['#00d4a0'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        title: {
            text: 'Commits by day target',
            align: 'left'
        },
        grid: {
            row: {
                colors: ['#0d1117'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        xaxis: {
            categories: secondDates,
            title: {
                text: 'Day'
            }
        },
        yaxis: {
            title: {
                text: 'Commits'
            }
        }
    };

    const series_language_first = firstSizeLanguage;
    const options_language_first = {
        chart: {
            type: 'donut',
            foreColor: '#8b949e'
        },
        labels: firstLanguageChart,
        title: {
            text: 'Source languages used',
            align: 'left'
        },
        responsive: [{
            breakpoint: firstTotalSize[0],
            options: {
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    const series_language_second = secondSizeLanguage;
    const options_language_second = {
        chart: {
            type: 'donut',
            foreColor: '#8b949e'
        },
        labels: secondLanguageChart,
        title: {
            text: 'Target languages used',
            align: 'left'
        },
        responsive: [{
            breakpoint: secondTotalSize[0],
            options: {
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    const series_authors_first = [
        {
            name: "Source",
            data: firstAuthorsNumbers
        }
    ];
    const options_authors_first = {
        chart: {
            type: 'bar',
            foreColor: '#8b949e',
            height: 350
        },
        title: {
            text: 'Commits made by authors - source',
            align: 'left'
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: firstAuthors
        },
    };

    const series_authors_second = [
        {
            name: "Target",
            data: secondAuthorsNumbers
        }
    ];
    const options_authors_second = {
        chart: {
            type: 'bar',
            foreColor: '#8b949e',
            height: 350
        },
        title: {
            text: 'Commits made by authors - target',
            align: 'left'
        },
        colors: ['#00d4a0'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: secondAuthors
        }
    };

    const series_lines_changed = [
        {
            name: "Source",
            data: linesFirstRepo
        }
    ];
    const options_lines_changed = {
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
            text: 'Lines by commits - source',
            align: 'left'
        },
        grid: {
            row: {
                colors: ['#0d1117'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        xaxis: {
            categories: datesFirstRepo,
            title: {
                text: 'Day'
            }
        },
        yaxis: {
            title: {
                text: 'Commits'
            }
        }
    };

    const series_lines_changed_second_repo = [
        {
            name: "Target",
            data: linesSecondRepo
        }
    ];
    const options_lines_changed_second_repo = {
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
            text: 'Lines by commits - target',
            align: 'left'
        },
        colors: ['#00d4a0'],
        grid: {
            row: {
                colors: ['#0d1117'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        xaxis: {
            categories: datesSecondRepo,
            title: {
                text: 'Day'
            }
        },
        yaxis: {
            title: {
                text: 'Commits'
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: -15,
            offsetX: -5
        }
    };

    const [checked, setChecked] = useState(false);

    const handleRepoType = (e) => {
        setChecked(e.target.checked);
    }

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

    return <>
        <div className='content-cr-body'>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                    <AlertTitle>{errorTitle}</AlertTitle>
                    {toastMessage}
                </Alert>
            </Snackbar>
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
            <div className="content-cr">
                <div className='write-repository'>
                    <div className='informations'>
                        <p style={{ color: "#8b949e" }}>
                            Write link of 2 repository for compare operation.
                        </p>
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
                    <div className='manipulation'>
                        <div className='source-container'>
                            <div className="source-parentbox"><div style={{ color: "white" }} className="source-childbox">Source</div></div>
                            <BootstrapInput id="repository-input-one" />
                        </div>
                        <div className='target-container'>
                            <div className="target-parentbox"><div style={{ color: "white" }} className="target-childbox">Target</div></div>
                            <BootstrapInput id="repository-input-two" />
                        </div>
                        <CompareRepoButton id='link-compare-button' variant="contained" onClick={handleCompareRepos}>Compare</CompareRepoButton>
                    </div>
                </div>
                <div className="content-cr-work">
                    <div className="content-cr-choose-files">
                        <Box sx={{ width: '100%' }}>
                            <Box>
                                <Tabs TabIndicatorProps={{
                                    style: {
                                        backgroundColor: "orange"
                                    }
                                }} value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab style={{ textTransform: "capitalize", color: "#8b949e", backgroundColor: "#181c24", border: "1px solid #30363d", borderRadius: "10px 10px 0px 0px" }} label="Commits" {...a11yProps(0)} />
                                    <Tab style={{ textTransform: "capitalize", color: "#8b949e", backgroundColor: "#181c24", border: "1px solid #30363d", borderRadius: "10px 10px 0px 0px" }} label="Statistics" {...a11yProps(1)} />
                                </Tabs>
                            </Box>
                            <TabPanel style={{ color: "white", backgroundColor: "#181c24", border: "1px solid #30363d" }} value={value} index={0}>
                                <div className='write-commits'>
                                    <div className='source-container'>
                                        <div className="source-parentbox"><div className="source-childbox">Source</div></div>
                                        <BootstrapInput id="sha-input-one" value={firstSha} />
                                    </div>
                                    <div className='target-container'>
                                        <div className="target-parentbox"><div className="target-childbox">Target</div></div>
                                        <BootstrapInput id="sha-input-two" value={secondSha} />
                                    </div>
                                    <ColorButton id="commits-compare-button" variant="contained" onClick={handleCompareCommits}>Compare</ColorButton>
                                </div>
                                {firstStatus !== false && secondStatus !== false ?
                                    <>
                                        <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: 500, backgroundColor: "#0d1117", border: "1px solid #30363d" }} aria-label="custom pagination table">
                                                <TableHead style={{ color: "white" }}>
                                                    <TableRow>
                                                        <TableCell style={{ color: "white", borderBottom: "1px solid #30363d" }}>
                                                            Selected
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" style={{ color: "white", borderBottom: "1px solid #30363d" }}>
                                                            Commit Sha
                                                        </TableCell>
                                                        <TableCell style={{ width: 120, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                            Date
                                                        </TableCell>
                                                        <TableCell style={{ width: 300, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                            Message
                                                        </TableCell>
                                                        <TableCell style={{ width: 200, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                            Author
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody id={localStorage.getItem('compare1')}>
                                                    {firstStatus !== false
                                                        ? (rowsPerPage > 0 ? firstRepoData.globalCommits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                            : firstRepoData.globalCommits).map(({ time, message, sha, name, summary }, index) => (
                                                                <TableRow hover
                                                                    id="1"
                                                                    onClick={(event) => handleRowClick(event, sha)}
                                                                    role="checkbox"
                                                                    aria-checked={isSelected(sha)}
                                                                    tabIndex={-1}
                                                                    key={sha}
                                                                    selected={isSelected(sha)}
                                                                    sx={{ borderBottom: "1px solid #30363d" }}
                                                                >
                                                                    <TableCell id="1" padding="checkbox" sx={{ borderBottom: "1px solid #30363d" }}>
                                                                        <Checkbox
                                                                            id="1"
                                                                            color="primary"
                                                                            checked={isSelected(sha)}
                                                                            inputProps={{
                                                                                'aria-labelledby': sha,
                                                                            }}
                                                                            style={{ color: "orange" }}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell id="1" style={{ color: "white", borderBottom: "1px solid #30363d" }} component="th" scope="row">
                                                                        {sha}
                                                                    </TableCell>
                                                                    <TableCell id="1" style={{ width: 120, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                                        {time}
                                                                    </TableCell>
                                                                    <TableCell id="1" style={{ width: 300, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                                        {message}
                                                                    </TableCell>
                                                                    <TableCell id="1" style={{ width: 200, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                                        {name}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )) : <></>}

                                                    {emptyRows > 0 && (
                                                        <TableRow style={{ height: 53 * emptyRows }}>
                                                            <TableCell colSpan={6} />
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                                <TableFooter>
                                                    <TableRow>
                                                        <TablePagination
                                                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                                            colSpan={3}
                                                            style={{ color: "white", borderBottom: "1px solid #30363d" }}
                                                            count={firstStatus !== false ? firstRepoData.globalCommits.length : 0}
                                                            rowsPerPage={rowsPerPage}
                                                            page={page}
                                                            onPageChange={handleChangePage}
                                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                                            ActionsComponent={TablePaginationActions}
                                                        />
                                                    </TableRow>
                                                </TableFooter>
                                            </Table>
                                        </TableContainer>
                                        <br></br>
                                        <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: 500, backgroundColor: "#0d1117", border: "1px solid #30363d" }} aria-label="custom pagination table">
                                                <TableHead style={{ color: "white" }}>
                                                    <TableRow>
                                                        <TableCell style={{ color: "white", borderBottom: "1px solid #30363d" }}>
                                                            Selected
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" style={{ color: "white", borderBottom: "1px solid #30363d" }}>
                                                            Commit Sha
                                                        </TableCell>
                                                        <TableCell style={{ width: 120, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                            Date
                                                        </TableCell>
                                                        <TableCell style={{ width: 300, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                            Message
                                                        </TableCell>
                                                        <TableCell style={{ width: 200, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                            Author
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody id={localStorage.getItem('compare2')}>
                                                    {secondStatus !== false
                                                        ? (secondRowsPerPage > 0 ? secondRepoData.globalCommits.slice(secondPage * secondRowsPerPage, secondPage * secondRowsPerPage + secondRowsPerPage)
                                                            : secondRepoData.globalCommits).map(({ time, message, sha, name, summary }, index) => (

                                                                <TableRow hover
                                                                    onClick={(event) => handleRowClick(event, sha)}
                                                                    role="checkbox"
                                                                    aria-checked={isSelected(sha)}
                                                                    tabIndex={-1}
                                                                    key={sha}
                                                                    selected={isSelected(sha)}
                                                                    sx={{ borderBottom: "1px solid #30363d" }}
                                                                >
                                                                    <TableCell padding="checkbox" sx={{ borderBottom: "1px solid #30363d" }}>
                                                                        <Checkbox
                                                                            color="primary"
                                                                            checked={isSelected(sha)}
                                                                            inputProps={{
                                                                                'aria-labelledby': sha,
                                                                            }}
                                                                            style={{ color: "orange" }}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell style={{ color: "white", borderBottom: "1px solid #30363d" }} component="th" scope="row" id={sha}>
                                                                        {sha}
                                                                    </TableCell>
                                                                    <TableCell style={{ width: 120, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                                        {time}
                                                                    </TableCell>
                                                                    <TableCell style={{ width: 300, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                                        {message}
                                                                    </TableCell>
                                                                    <TableCell style={{ width: 200, color: "white", borderBottom: "1px solid #30363d" }} align="right">
                                                                        {name}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )) : <></>}

                                                    {secondEmptyRows > 0 && (
                                                        <TableRow style={{ height: 53 * secondEmptyRows }}>
                                                            <TableCell colSpan={6} />
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                                <TableFooter>
                                                    <TableRow>
                                                        <TablePagination
                                                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                                            colSpan={3}
                                                            style={{ color: "white", borderBottom: "1px solid #30363d" }}
                                                            count={secondStatus !== false ? secondRepoData.globalCommits.length : 0}
                                                            rowsPerPage={secondRowsPerPage}
                                                            page={secondPage}
                                                            onPageChange={handleChangeSecondPage}
                                                            onRowsPerPageChange={handleChangeSecondRowsPerPage}
                                                            ActionsComponent={TablePaginationActions}
                                                        />
                                                    </TableRow>
                                                </TableFooter>
                                            </Table>
                                        </TableContainer>
                                    </>
                                    :
                                    <>
                                        <div className='loading-container'>
                                            <img className='image' style={{ width: "64px" }} src={loading} alt="loading" />
                                        </div>
                                    </>
                                }
                            </TabPanel>
                            <TabPanel style={{ backgroundColor: "#181c24", border: "1px solid #30363d" }} value={value} index={1}>
                                {firstNumberOfCommits.length !== 0 && secondNumberOfCommits !== 0 ?
                                    <>
                                        <div className='chart-container-1'>
                                            <div className='chart-container-1-1'>
                                                <Chart options={options_commits_first} series={series_commits_first} type="line" height={350} />
                                            </div>
                                            <div className='chart-container-1-2'>
                                                <Chart options={options_commits_second} series={series_commits_second} type="line" height={350} />
                                            </div>
                                        </div>
                                        <div className='chart-container-2'>
                                            <div className='chart-container-2-1'>
                                                <Chart options={options_language_first} series={series_language_first} type="donut" height={350} />
                                            </div>
                                            <div className='chart-container-2-2'>
                                                <Chart options={options_language_second} series={series_language_second} type="donut" height={350} />
                                            </div>
                                        </div>
                                        <div className='chart-container-4'>
                                            <div className='chart-container-4-1'>
                                                <Chart options={options_authors_first} series={series_authors_first} type="bar" height={350} />
                                            </div>
                                            <div className='chart-container-4-2'>
                                                <Chart options={options_authors_second} series={series_authors_second} type="bar" height={350} />
                                            </div>
                                        </div>
                                        <div className='chart-container-3'>
                                            {firstRepoFiles.length !== 0 && secondRepoFiles.length !== 0 ? renderFileList() : <></>}
                                            <div className='chart-container-3-1'>
                                                <div className='chart-container-3-1-1'>
                                                    <Chart options={options_lines_changed} series={series_lines_changed} type="line" height={350} />
                                                </div>
                                                <div className='chart-container-3-1-2'>
                                                    <Chart options={options_lines_changed_second_repo} series={series_lines_changed_second_repo} type="line" height={350} />
                                                </div>
                                            </div>
                                        </div>
                                    </> :
                                    <>
                                        <div className='loading-container'>
                                            <img className='image' style={{ width: "64px" }} src={loading} alt="loading" />
                                        </div>
                                    </>
                                }
                            </TabPanel>
                        </Box>
                    </div>
                    {firstList.length !== 0 && secondList.length != 0 ? renderSelectList() : <></>}
                    {code !== "" && secondCode !== "" ?
                        <div className="content-cr-diff-editor">
                            <MonacoDiffEditor
                                height="60vh"
                                width="auto"
                                theme="vs-dark"
                                original={code ? code : ""}
                                modified={secondCode ? secondCode : ""}
                                language={language}
                            />
                        </div>
                        : <></>}
                </div>
            </div>
        </div>
    </>
}
