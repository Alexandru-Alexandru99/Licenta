import React, { useState } from "react";
import { Alert } from "react-bootstrap"

import './index.css';

import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

const Popup = props => {

    const [error, setError] = useState("");

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
        width: '100%',
        height: '30px',
        marginTop: '10px',
        lineHeight: 1.5,
        backgroundColor: 'green',
        color: "white",
        '&:hover': {
            backgroundColor: '#2ea043',
        },
    }));

    const KeepCurrentButton = styled(Button)(({ theme }) => ({
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
        width: '100%',
        height: '30px',
        marginTop: '20px',
        lineHeight: 1.5,
        backgroundColor: '#21262d',
        color: "white",
        border: '0.5px solid #30363d',
        '&:hover': {
            border: '0.5px solid white',
            backgroundColor: '#21262d',
        },
    }));

    const handleChange = () => {
        let new_email = document.getElementById("new-github-email") !== null ? document.getElementById("new-github-email").value : '';
        let new_name = document.getElementById("new-github-name") !== null ? document.getElementById("new-github-name").value : '';

        if (new_email !== '' && new_name !== '') {
            localStorage.setItem('email_credentials', document.getElementById('new-github-email').value);
            localStorage.setItem('name_credentials', document.getElementById('new-github-name').value);
            props.handleClose();
        } else {
            setError("Please fill all fields!");
        }
    };

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
            width: 'fit-content',
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

    return (
        <div className="change-credentials-popup-box">
            <div className="change-credentials-box">
                <span className="change-credentials-close-icon" onClick={props.handleClose}>x</span>
                <div className="option-container">
                    <div className="text-container">
                        <span className="option-title-text">Change Credentials</span>
                        <div className="line">
                        </div>
                        <div style={{ marginTop: '10px' }} className='user-info-container'>
                            <div className="source-parentbox"><div style={{ color: "white" }} className="source-childbox">Email</div></div>
                            <EmailNameInput defaultValue={localStorage.getItem('email_credentials') !== null ? localStorage.getItem('email_credentials') : ''} style={{ marginBottom: '10px' }} id="new-github-email" />
                        </div>
                        <div className='user-info-container'>
                            <div className="source-parentbox"><div style={{ color: "white" }} className="source-childbox">Name</div></div>
                            <EmailNameInput defaultValue={localStorage.getItem('name_credentials') !== null ? localStorage.getItem('name_credentials') : ''} style={{ marginBottom: '10px' }} id="new-github-name" />
                        </div>
                        <ChangeButton onClick={handleChange}>Change</ChangeButton>
                        <KeepCurrentButton onClick={props.handleClose}>Keep current settings</KeepCurrentButton>
                        {error && <Alert style={{ marginTop: '20px' }} variant="warning">{error}</Alert>}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Popup;