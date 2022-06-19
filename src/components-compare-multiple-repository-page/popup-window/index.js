import React, { useState, useRef } from "react";
import { Form } from "react-bootstrap"

import './index.css';

import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';


import axios from "axios"

const crypto = require('crypto');


const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const Popup = props => {

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


    const numberOfDataRef = useRef();
    const commitsIntervalMinRef = useRef();
    const commitsIntervalMaxRef = useRef();
    const numberOfMonthsRef = useRef();
    const changesIntervalMin = useRef();
    const changesIntervalMax = useRef();
    const maxGradeNumberOfCommitsRef = useRef();
    const maxGradeNumberOfChangesRef = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();

        const csv_name = crypto.randomBytes(20).toString('hex');
        localStorage.setItem('user_csv_name', csv_name);

        axios
            .post("http://localhost:8080/compare-multiple/create", {
                csv_name: csv_name,
                number_of_data: numberOfDataRef.current.value,
                commits_interval_min: commitsIntervalMinRef.current.value,
                commits_interval_max: commitsIntervalMaxRef.current.value,
                number_of_months: numberOfMonthsRef.current.value,
                changes_interval_min: changesIntervalMin.current.value,
                changes_interval_max: changesIntervalMax.current.value,
                max_grade_for_x_number_of_commits: maxGradeNumberOfCommitsRef.current.value,
                max_grade_for_x_number_of_changes_per_commit: maxGradeNumberOfChangesRef.current.value
            })
            .then((response) => {
                if (response.data === "Error") {
                    alertProperties(true, "error", "Error", "Push can't be made!");
                } else {
                    alertProperties(true, "success", "Success", "Successfully push!");
                }
            });
    }

    const CreateButton = styled(Button)(({ theme }) => ({
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

    return (
        <div className="create-model-popup-box">
            <div className="create-model-box">
                <span className="create-model-close-icon" onClick={props.handleClose}>x</span>
                <div className="option-container">
                    <span style={{ color: "#8b949e" }} className="option-title-text">Create your own data and model</span>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="numberOfData" style={{ display: 'flex' }}>
                            <Form.Label style={{ color: "#8b949e", width: '200px', marginTop: '10px' }}>Number of data:</Form.Label>
                            <Form.Control ref={numberOfDataRef} type="number" required style={{ marginLeft: '5px', marginRight: '5px', marginTop: '5px', marginBottom: '5px' }} />
                        </Form.Group>
                        <Form.Group id="commitsInterval" style={{ display: 'flex' }}>
                            <Form.Label style={{ color: "#8b949e", width: '400px', marginTop: '10px' }}>Commits interval:</Form.Label>
                            <Form.Control ref={commitsIntervalMinRef} type="number" required style={{ marginLeft: '5px', marginRight: '5px', marginTop: '5px', marginBottom: '5px' }} />
                            <Form.Control ref={commitsIntervalMaxRef} type="number" required style={{ marginLeft: '5px', marginRight: '5px', marginTop: '5px', marginBottom: '5px' }} />
                        </Form.Group>
                        <Form.Group id="numberOfMonths" style={{ display: 'flex' }}>
                            <Form.Label style={{ color: "#8b949e", width: '300px', marginTop: '10px' }}>Number of months:</Form.Label>
                            <Form.Control ref={numberOfMonthsRef} type="number" required style={{ marginLeft: '5px', marginRight: '5px', marginTop: '5px', marginBottom: '5px' }} />
                        </Form.Group>
                        <Form.Group id="changesInterval" style={{ display: 'flex' }}>
                            <Form.Label style={{ color: "#8b949e", width: '400px', marginTop: '10px' }}>Changes interval:</Form.Label>
                            <Form.Control ref={changesIntervalMin} type="number" required style={{ marginLeft: '5px', marginRight: '5px', marginTop: '5px', marginBottom: '5px' }} />
                            <Form.Control ref={changesIntervalMax} type="number" required style={{ marginLeft: '5px', marginRight: '5px', marginTop: '5px', marginBottom: '5px' }} />
                        </Form.Group>
                        <Form.Group id="gradeNumberOfCommits" style={{ display: 'flex' }}>
                            <Form.Label style={{ color: "#8b949e", width: '600px', marginTop: '10px' }}>Max grade for x number of commits:</Form.Label>
                            <Form.Control ref={maxGradeNumberOfCommitsRef} type="number" required style={{ marginLeft: '5px', marginRight: '5px', marginTop: '5px', marginBottom: '5px' }} />
                        </Form.Group>
                        <Form.Group id="gradeChangesPerCommit" style={{ display: 'flex' }}>
                            <Form.Label style={{ color: "#8b949e", width: '600px', marginTop: '10px' }}>Max grade for x changes per commit:</Form.Label>
                            <Form.Control ref={maxGradeNumberOfChangesRef} type="number" required style={{ marginLeft: '5px', marginRight: '5px', marginTop: '5px', marginBottom: '5px' }} />
                        </Form.Group>
                        <CreateButton type="submit">Create</CreateButton>
                    </Form>
                </div>
            </div>
        </div >
    );
};

export default Popup;