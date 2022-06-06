import React, { useState, useEffect, useRef } from 'react';
import "./index.css"

import logo from "../../images/favicon.ico";

import axios from "axios"

import folder_logo from "../../images/folder.png";

import PropTypes from 'prop-types';
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

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

import Button from '@mui/material/Button';

const crypto = require('crypto');

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function createData(reponame, commits, commits_per_month, changes, changes_per_commit, changes_per_month) {
  return {
    reponame,
    commits,
    commits_per_month,
    changes,
    changes_per_commit,
    changes_per_month,
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
    id: 'reponame',
    numeric: false,
    disablePadding: false,
    label: 'Repos name',
  },
  {
    id: 'commits',
    numeric: true,
    disablePadding: false,
    label: 'Commits',
  },
  {
    id: 'commits_per_month',
    numeric: true,
    disablePadding: false,
    label: 'Commits per month',
  },
  {
    id: 'changes',
    numeric: true,
    disablePadding: false,
    label: 'Changes',
  },
  {
    id: 'changes_per_commit',
    numeric: true,
    disablePadding: false,
    label: 'Changes per commit',
  },
  {
    id: 'changes_per_month',
    numeric: true,
    disablePadding: false,
    label: 'Changes per month',
  },
  {
    id: 'grade',
    numeric: true,
    disablePadding: false,
    label: 'Grade',
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

export default function MyCompare() {
  const [rows, setRows] = React.useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('Common_lines');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [grade, setGrade] = React.useState('0');

  const [repos, setRepos] = React.useState([]);

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

  /*
  *  functions for table 
  */

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

  const RetrainButton = styled(Button)(({ theme }) => ({
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
    height: '25px',
    marginLeft: '10px',
    marginTop: '10px',
    lineHeight: 1.5,
    backgroundColor: 'green',
    color: "white",
    '&:hover': {
      backgroundColor: '#2ea043',
    },
  }));

  const GetGradeButton = styled(Button)(({ theme }) => ({
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
    width: '90px',
    height: '25px',
    marginLeft: '10px',
    marginTop: '10px',
    lineHeight: 1.5,
    backgroundColor: 'green',
    color: "white",
    '&:hover': {
      backgroundColor: '#2ea043',
    },
  }));

  const GetDataButton = styled(Button)(({ theme }) => ({
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
    lineHeight: 1.5,
    backgroundColor: 'green',
    color: "white",
    '&:hover': {
      backgroundColor: '#2ea043',
    },
  }));

  const UploadButton = styled(Button)(({ theme }) => ({
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

  const [file, setFile] = useState();

  const handleSend = () => {
    console.log("Send");

    const data = new FormData();
    const name = crypto.randomBytes(20).toString('hex');

    data.append('file', file);
    data.append('name', name);

    axios.post("http://localhost:8080/compare-multiple/upload", data)
      .then(res => {
        console.log(res);
        setRepos(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }

  const handleChangeFile = (event) => {
    setFile(event.target.files[0]);
  }

  const handleGetData = () => {
    console.log(repos);
    axios.all([
      axios.post("http://localhost:8080/compare-multiple/details", {
        repos: repos
      }),
      axios.post("http://localhost:8080/compare-multiple/changes", {
        repos: repos
      })
    ])
      .then(axios.spread((response1, response2) => {
        if (response1.data === "Error") {
          alertProperties(true, "error", "Error", "Some error occured while trying to get details!");
        } else {
          console.log(response1.data);
          if (response2.data === "Error") {
            alertProperties(true, "error", "Error", "Some error occured while trying to get changes!");
          } else {
            console.log(response2.data);
            let table_data = [];
            for (let i = 0; i < repos.length; i++) {
              let number_commits = 0;
              let number_commits_per_month = 0;
              let number_changes = 0;
              let number_changes_per_commit = 0;
              let number_changes_per_month = 0;
              let number_months = 0;

              for (let j = 0; j < response1.data.length; j++) {
                if (repos[i] === response1.data[j].repo) {
                  number_commits = response1.data[j].counter;
                  number_commits_per_month = number_commits / response1.data[j].months_with_commits[0].length;
                  number_months = response1.data[j].months_with_commits[0].length;
                }
              }

              for (let j = 0; j < response2.data.length; j++) {
                if (repos[i] === response2.data[j].repo) {
                  for (let q = 0; q < response2.data[j].lines_all_commits.length; q++) {
                    for (let k = 0; k < response2.data[j].lines_all_commits[q].length; k++) {
                      number_changes += response2.data[j].lines_all_commits[q][k].l;
                    }
                  }
                  number_changes_per_commit = number_changes / response2.data[j].lines_all_commits.length;
                  number_changes_per_month = number_changes / number_months;
                }
              }
              table_data.push(createData(repos[i], number_commits, parseInt(number_commits_per_month), number_changes, parseInt(number_changes_per_commit), parseInt(number_changes_per_month)));
            }
            console.log(table_data);
            axios.post("http://localhost:8080/compare-multiple/grades", {
              repos: table_data
            })
              .then(res => {
                if (res.data === "Error") {
                  alertProperties(true, "error", "Error", "Some error occured while trying to get grades!");
                } else {
                  setRows(res.data);
                }
              })
          }
        }
      }));
  }

  const handleRetrain = () => {
    axios.post("http://localhost:8080/compare-multiple/retrain", {
      data: rows
    })
      .then(res => {
        alertProperties(true, "success", "Success", "Model retrained!");
      })
  }

  const handleGetGrade = () => {
    let link = document.getElementById("github-link-for-grade").value;
    console.log(link);

    if (link === '') {
      alertProperties(true, "info", "Info", "You need to write a link!");
    } else {
      let regex = new RegExp("((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?");
      if (regex.test(link)) {
        axios.all([
          axios.post("http://localhost:8080/compare-multiple/details", {
            repos: [link, link]
          }),
          axios.post("http://localhost:8080/compare-multiple/changes", {
            repos: [link, link]
          })
        ])
          .then(axios.spread((response1, response2) => {
            if (response1.data === "Error") {
              alertProperties(true, "error", "Error", "Some error occured while trying to get details!");
            } else {
              console.log(response1.data);
              if (response2.data === "Error") {
                alertProperties(true, "error", "Error", "Some error occured while trying to get changes!");
              } else {
                console.log(response2.data);
                let table_data = [];
                for (let i = 0; i < 1; i++) {
                  let number_commits = 0;
                  let number_commits_per_month = 0;
                  let number_changes = 0;
                  let number_changes_per_commit = 0;
                  let number_changes_per_month = 0;
                  let number_months = 0;

                  for (let j = 0; j < 1; j++) {
                    if (link === response1.data[j].repo) {
                      number_commits = response1.data[j].counter;
                      number_commits_per_month = number_commits / response1.data[j].months_with_commits[0].length;
                      number_months = response1.data[j].months_with_commits[0].length;
                    }
                  }

                  for (let j = 0; j < 1; j++) {
                    if (link === response2.data[j].repo) {
                      for (let q = 0; q < response2.data[j].lines_all_commits.length; q++) {
                        for (let k = 0; k < response2.data[j].lines_all_commits[q].length; k++) {
                          number_changes += response2.data[j].lines_all_commits[q][k].l;
                        }
                      }
                      number_changes_per_commit = number_changes / response2.data[j].lines_all_commits.length;
                      number_changes_per_month = number_changes / number_months;
                    }
                  }
                  table_data.push(createData(repos[i], number_commits, parseInt(number_commits_per_month), number_changes, parseInt(number_changes_per_commit), parseInt(number_changes_per_month)));
                }
                axios.post("http://localhost:8080/compare-multiple/grades", {
                  repos: table_data
                })
                  .then(res => {
                    if (res.data === "Error") {
                      alertProperties(true, "error", "Error", "Some error occured while trying to get grades!");
                    } else {
                      console.log(res.data);
                      setGrade(res.data[0].grade);
                    }
                  })
              }
            }
          }));
      } else {
        alertProperties(true, "error", "Error", "This is not a valid github link!");
      }
    }
  }

  const LinkInput = styled(InputBase)(({ theme }) => ({
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

  return (
    <>
      <div className='my-compare-body'>
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
        <div className='my-compare-container'>
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
              <AlertTitle>{errorTitle}</AlertTitle>
              {toastMessage}
            </Alert>
          </Snackbar>
          <div className='my-compare-container-body'>
            <div className='upload-container'>
              <div className='upload-container-body' style={{ color: "#8b949e" }}>
                <p style={{ color: "#8b949e" }}>
                  Choose a file from your system:
                </p>
                <input className="inputfile" type="file" accept='.txt' onChange={handleChangeFile} />
                <UploadButton style={{ color: "#8b949e" }} onClick={handleSend}>
                  Upload
                </UploadButton>
                <GetDataButton onClick={handleGetData}>Get Data</GetDataButton>
              </div>
            </div>
            <div className='result-container'>
              <div className='result-container-body'>
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
                            const isItemSelected = isSelected(row.reponame);
                            const labelId = `enhanced-table-checkbox-${index}`;

                            return (
                              <TableRow
                                hover
                                onClick={(event) => handleClick(event, row.reponame)}
                                role="checkbox"
                                aria-checked={isItemSelected}
                                tabIndex={-1}
                                key={row.reponame}
                                selected={isItemSelected}
                              >
                                <TableCell
                                  component="th"
                                  id={labelId}
                                  scope="row"
                                  padding="none"
                                  sx={{ color: 'white', border: "1px solid #30363d" }}
                                >
                                  <img style={{ width: "20px", marginLeft: '5px', marginRight: '5px' }} src={folder_logo} alt="logo" />
                                  {row.reponame}
                                </TableCell>
                                <TableCell sx={{ color: 'white', border: "1px solid #30363d" }} align="right">{row.commits}</TableCell>
                                <TableCell sx={{ color: 'white', border: "1px solid #30363d" }} align="right">{row.commits_per_month}</TableCell>
                                <TableCell sx={{ color: 'white', border: "1px solid #30363d" }} align="right">{row.changes}</TableCell>
                                <TableCell sx={{ color: 'white', border: "1px solid #30363d" }} align="right">{row.changes_per_commit}</TableCell>
                                <TableCell sx={{ color: 'white', border: "1px solid #30363d" }} align="right">{row.changes_per_month}</TableCell>
                                <TableCell sx={{ color: 'white', border: "1px solid #30363d" }} align="right">{row.grade}</TableCell>
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
            </div>
            <div className='retrain-button-container'>
              <p style={{ color: "#8b949e", marginLeft: '10px', marginTop: '10px' }}>
                Retrain model with new data:
              </p>
              <RetrainButton onClick={handleRetrain}>Retrain</RetrainButton>
            </div>
            <div className='get-grades-container'>
              <p style={{ color: "#8b949e", marginLeft: '10px', marginTop: '10px' }}>
                Enter a link to get grades:
              </p>
              <LinkInput id="github-link-for-grade"></LinkInput>
              <GetGradeButton onClick={handleGetGrade}>Get Grade</GetGradeButton>
              <div className='get-grades-container-body' style={{display: 'flex', float: 'right'}}>
                <p style={{ color: "#8b949e", marginLeft: '30px', marginTop: '10px' }}>
                  Grade:
                </p>
                <p style={{ color: "orange", marginLeft: '10px', marginTop: '10px' }}>
                  {grade}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>)
}
