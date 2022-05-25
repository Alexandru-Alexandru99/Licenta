import React, { useState, useEffect, useRef } from 'react'
import logo from "../../images/favicon.ico";
import './index.css'

import error_logo from "../../images/error.png";
import warning_logo from "../../images/attention.png";
import correct_logo from "../../images/check.png";

import { DiffEditor as MonacoDiffEditor } from '@monaco-editor/react';

import Chart from 'react-apexcharts'

import loading from "../../images/refresh.png";

import axios from "axios"

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';

import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

import Button from '@mui/material/Button';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import Select from 'react-select'
import LinesTable from '../second-table';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const crypto = require('crypto');

function createData(filename, common_lines, added_lines, deleted_lines, similarity) {
    return {
        filename,
        common_lines,
        added_lines,
        deleted_lines,
        similarity,
    };
}

function createSecondTableData(filename, lines, percent) {
    return {
        filename,
        lines,
        percent,
    };
}

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Files name',
    },
    {
        id: 'common_lines',
        numeric: true,
        disablePadding: false,
        label: 'Common lines',
    },
    {
        id: 'added_lines',
        numeric: true,
        disablePadding: false,
        label: 'Added lines',
    },
    {
        id: 'deleted_lines',
        numeric: true,
        disablePadding: false,
        label: 'Deleted lines',
    },
    {
        id: 'similarity',
        numeric: true,
        disablePadding: false,
        label: 'Similarity',
    },
];

function EnhancedTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead sx={{ borderBottom: '1px solid #30363d', color: 'white' }}>
            <TableRow sx={{ color: 'white' }} hover={false}>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'middle'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{ color: 'white', borderBottom: '1px solid #30363d' }}
                        hover={false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                            sx={{ color: 'white' }}
                        >
                            {headCell.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = (props) => {
    const { numSelected } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                backgroundColor: '#0d1117',
                borderTop: '1px solid #30363d',
                borderRight: '1px solid #30363d',
                borderLeft: '1px solid #30363d'
            }}
        >
            <Typography
                sx={{ flex: '1 1 100%', color: 'white' }}
                variant="h6"
                id="tableTitle"
                component="div"
            >
                Results from the comparison
            </Typography>
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};

export default function MyInformation() {
    const [rows, setRows] = React.useState([]);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('Common_lines');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(true);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const [checked, setChecked] = useState(false);

    const [files, setFiles] = useState([]);
    const [hashes, setHashes] = useState([]);

    const [currentHash, setCurrentHash] = useState('');

    const [linesChart, setLinesChart] = useState([]);
    const [datesChart, setDatesChart] = useState([]);

    const [sourceCode, setSourceCode] = useState('');
    const [targetCode, setTargetCode] = useState('');

    const [secondTableData, setSecondTableData] = useState([]);

    const [statusData, setStatusData] = useState(false);

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
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = rows.map((n) => n.name);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

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

        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDense = (event) => {
        setDense(event.target.checked);
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;


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
                const name = crypto.randomBytes(20).toString('hex');
                localStorage.setItem('repositoryNameForSimilarity', name);
                axios.post("http://localhost:8080/moss/hashes", {
                    link: new_link,
                    storage: name,
                    userName: new_username,
                    token: new_token
                })
                    .then((response) => {
                        if (response.data !== "Error") {
                            alertProperties(true, "success", "Success", "Clone successful!");
                            setHashes(response.data);
                        }
                        else {
                            alertProperties(true, "error", "Error", "Clone failed!");
                        }
                    })
            } else {
                alertProperties(true, "error", "Error", "This is not a valid github link!");
            }
        }

    };

    const handleChange = (e) => {
        if (currentHash !== '') {
            let repository = localStorage.getItem('repositoryNameForSimilarity');
            axios.all([
                axios.post("http://localhost:8080/moss/percentageofsimilarity", {
                    storage: repository,
                    file_selected: e.value,
                    files: files,
                    sha: currentHash
                }),
                axios.post("http://localhost:8080/moss/percentageofsamenumberoflines", {
                    storage: repository,
                    file_selected: e.value,
                    files: files,
                    sha: currentHash
                })
            ])
                .then(axios.spread((response, response1) => {
                    if (response.data === "Error") {
                        alertProperties(true, "error", "Error", "Some error occured while trying to get files similarity!");
                    } else {
                        let table_data = [];
                        console.log(response.data);
                        for (let i = 0; i < response.data.common_lines_vector.length; i++) {
                            table_data.push(createData(files[i], response.data.common_lines_vector[i], response.data.added_lines_vector[i], response.data.deleted_lines_vector[i], response.data.similarity_vector[i]));
                        }
                        setRows(table_data);
                        axios
                            .post("http://localhost:8080/moss/lines", {
                                storage: repository,
                                file_selected: e.value,
                                hashes: hashes
                            }).then((response1) => {
                                console.log(response1.data);
                                setLinesChart(response1.data.changes);
                                setDatesChart(response1.data.date);
                            })
                    }
                    if (response1.data === "Error") {
                        alertProperties(true, "error", "Error", "Some error occured while trying to get lines number!");
                    } else {
                        let table_data = [];
                        console.log(response1.data);
                        for (let i = 0; i < response1.data.number_of_lines_vector.length; i++) {
                            table_data.push(createSecondTableData(response1.data.common_files[i], response1.data.number_of_lines_vector[i], response1.data.percentage_of_lines_vector[i]));
                        }
                        setSecondTableData(table_data);
                        setStatusData(true);
                    }
                }))
        } else {
            alertProperties(true, "error", "Error", "You need to select a commit first!");
        }
    }

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

    const handleHashSelected = (e) => {
        setCurrentHash(e.value);
        let repository = localStorage.getItem('repositoryNameForSimilarity');
        axios
            .post("http://localhost:8080/moss/files", {
                storage: repository,
                sha: e.value
            })
            .then((response) => {
                if (response.data === "Error") {
                    alertProperties(true, "error", "Error", "Some error occured while trying to get files!");
                } else {
                    setFiles(response.data.files_list);
                }
            })
    }

    const renderHashesList = () => {
        if (hashes.length != 0) {
            return (
                <div style={{ width: '300px' }}>
                    <Select maxMenuHeight={400} placeholder="Select a file" options={hashes.map((hash) => (
                        { value: hash, label: hash }
                    ))} onChange={handleHashSelected} styles={customStyles}>
                    </Select>
                </div>
            )
        }
    }

    const handleSourceCode = (e) => {
        let repository = localStorage.getItem('repositoryNameForSimilarity');
        axios
            .post("http://localhost:8080/moss/filecode", {
                storage: repository,
                file_selected: e.value,
                files: files,
                sha: currentHash
            })
            .then((response) => {
                if (response.data === "Error") {
                    alertProperties(true, "error", "Error", "Some error occured while trying to get file code!");
                } else {
                    setSourceCode(response.data);
                }
            })
    }

    const handleTargetCode = (e) => {
        let repository = localStorage.getItem('repositoryNameForSimilarity');
        axios
            .post("http://localhost:8080/moss/filecode", {
                storage: repository,
                file_selected: e.value,
                files: files,
                sha: currentHash
            })
            .then((response) => {
                if (response.data === "Error") {
                    alertProperties(true, "error", "Error", "Some error occured while trying to get file code!");
                } else {
                    setTargetCode(response.data);
                }
            })
    }

    const renderFileListForCode = () => {
        if (files.length != 0) {
            return (
                <>
                    <div className='select-file-repository'>
                        <div className='first-list'>
                            <div style={{ width: '200px' }}>
                                <Select maxMenuHeight={400} placeholder="Select a file" options={files.map((file) => (
                                    { value: file, label: file }
                                ))} onChange={handleSourceCode} styles={customStyles}>
                                </Select>
                            </div>
                        </div>
                        <div className='second-list'>
                            <div style={{ width: '200px' }}>
                                <Select maxMenuHeight={400} placeholder="Select a file" options={files.map((file) => (
                                    { value: file, label: file }
                                ))} onChange={handleTargetCode} styles={customStyles}>
                                </Select>
                            </div>
                        </div>
                    </div>
                </>
            )
        }
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

    const handleRepoType = (e) => {
        setChecked(e.target.checked);
    }

    const renderSimilarityTypeIcon = (number) => {
        if (number < 40) {
            return (
                <>
                    <img style={{ width: "20px", marginLeft: '5px', marginRight: '5px' }} src={correct_logo} alt="logo" />
                </>)
        }
        else {
            if (number >= 40 && number <= 60) {
                return (
                    <>
                        <img style={{ width: "20px", marginLeft: '5px', marginRight: '5px' }} src={warning_logo} alt="logo" />
                    </>)
            } else {
                return (
                    <>
                        <img style={{ width: "20px", marginLeft: '5px', marginRight: '5px' }} src={error_logo} alt="logo" />
                    </>)
            }
        }
    }

    const series_lines_changed = [
        {
            name: "File selected",
            data: linesChart
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
            text: 'Lines by commit',
            align: 'left'
        },
        grid: {
            row: {
                colors: ['#0d1117'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        xaxis: {
            categories: datesChart,
            title: {
                text: 'Commit day'
            }
        },
        yaxis: {
            title: {
                text: 'Lines'
            }
        }
    };

    return <>
        <div className="moss-body">
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
            <div className='moss-container'>
                <div className='moss-container-clone-repository'>
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
                    {hashes ? <div className='informations-hash-list'>
                        <p style={{ color: "#8b949e" }}>
                            Choose a commit:
                        </p>
                    </div> : <></>}
                    <div className='select-hash'>
                        {hashes ? renderHashesList() : <></>}
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
                            {files ?
                                <div className='informations'>
                                    <p style={{ color: "#8b949e" }}>
                                        Choose a file you wanna watch:
                                    </p>
                                </div>
                                : <></>}
                            <div className='select-file'>
                                {files ? renderFileList() : <></>}
                            </div>
                        </div>
                        :
                        <></>
                    }
                </div>
                <div className='output-container'>
                    <div className='output-container-table'>
                        <Paper sx={{ width: '100%', mb: 2 }}>
                            <EnhancedTableToolbar numSelected={selected.length} />
                            <TableContainer sx={{ minWidth: 750 }}>
                                <Table
                                    sx={{ minWidth: 750, backgroundColor: '#0d1117', border: "1px solid #30363d" }}
                                    aria-labelledby="tableTitle"
                                    size={dense ? 'small' : 'medium'}
                                >
                                    <EnhancedTableHead
                                        numSelected={selected.length}
                                        order={order}
                                        orderBy={orderBy}
                                        onSelectAllClick={handleSelectAllClick}
                                        onRequestSort={handleRequestSort}
                                        rowCount={rows.length}
                                    />
                                    <TableBody>
                                        {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
                                        {stableSort(rows, getComparator(order, orderBy))
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((row, index) => {
                                                const isItemSelected = isSelected(row.filename);
                                                const labelId = `enhanced-table-checkbox-${index}`;

                                                return (
                                                    <TableRow
                                                        hover
                                                        onClick={(event) => handleClick(event, row.filename)}
                                                        role="checkbox"
                                                        aria-checked={isItemSelected}
                                                        tabIndex={-1}
                                                        key={row.filename}
                                                        selected={isItemSelected}
                                                    >
                                                        <TableCell
                                                            component="th"
                                                            id={labelId}
                                                            scope="row"
                                                            padding="none"
                                                            sx={{ color: 'white', border: "1px solid #30363d" }}
                                                        >
                                                            {renderSimilarityTypeIcon(row.similarity)}
                                                            {row.filename}
                                                        </TableCell>
                                                        <TableCell sx={{ color: 'white', border: "1px solid #30363d" }} align="right">{row.common_lines}</TableCell>
                                                        <TableCell sx={{ color: 'white', border: "1px solid #30363d" }} align="right">{row.added_lines}</TableCell>
                                                        <TableCell sx={{ color: 'white', border: "1px solid #30363d" }} align="right">{row.deleted_lines}</TableCell>
                                                        <TableCell sx={{ color: 'white', border: "1px solid #30363d" }} align="right">{row.similarity + '%'}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                sx={{ backgroundColor: '#0d1117', color: 'white', border: "1px solid #30363d" }}
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={rows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </Paper>
                    </div>
                    <div className='output-container-table'>
                        {statusData === true ?
                            <LinesTable data={secondTableData}></LinesTable>
                        :
                            <></>
                        }
                    </div>
                    <div className='output-container-chart'>
                        <Chart options={options_lines_changed} series={series_lines_changed} type="line" height={350} />
                    </div>
                </div>
                <div className='compare-container'>
                    {files ? renderFileListForCode() : <></>}
                    {sourceCode !== "" && targetCode !== "" ?
                        <div className="diff-editor">
                            <MonacoDiffEditor
                                height="60vh"
                                width="auto"
                                theme="vs-dark"
                                original={sourceCode ? sourceCode : ""}
                                modified={targetCode ? targetCode : ""}
                                language="c"
                            />
                        </div>
                        : <></>}
                </div>
                <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                        <AlertTitle>{errorTitle}</AlertTitle>
                        {toastMessage}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    </>
}