import React, { useState, useEffect } from 'react'
import { Alert } from "react-bootstrap"
import './index.css'
import { alpha, styled } from '@mui/material/styles';
import { useHistory } from "react-router-dom"

import Link from '@mui/material/Link';

import logo from "../../images/favicon.ico";

import InputBase from '@mui/material/InputBase';

import Button from '@mui/material/Button';

import Checkbox from '@mui/material/Checkbox';

const crypto = require('crypto');

export default function HeroSection() {
    const history = useHistory();

    const [error, setError] = useState("");

    const [checked, setChecked] = useState(false);

    /*
    *   use effect 
    */

    useEffect(() => {
        window.localStorage.clear();
    }, [])

    /*
    *   functions
    */

    function handleClone() {
        let new_link = localStorage.getItem('githublink');
        let regex = new RegExp("((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?");

        let email = localStorage.getItem('email_credentials') !== null ? localStorage.getItem('email_credentials') : "";
        let name = localStorage.getItem('name_credentials') !== null ? localStorage.getItem('name_credentials') : "";

        if (email !== "" && name !== "") {
            if (regex.test(new_link)) {
                history.push("/workspace");
            } else {
                setError("This is not a valid github link!");
            }
        } else {
            setError("Set your credentials!");
        }
    }

    const handleChange = (e) => {
        let new_link = e.target.value;
        localStorage.setItem('githublink', new_link);
        const name = crypto.randomBytes(20).toString('hex');
        localStorage.setItem('repositoryName', name);
    }

    const handleUsername = (e) => {
        let new_username = e.target.value;
        localStorage.setItem('username', new_username);
    }

    const handleToken = (e) => {
        let new_token = e.target.value;
        localStorage.setItem('token', new_token);
    }

    const handleRepoType = (e) => {
        setChecked(e.target.checked);
    }

    const handleEmailChange = (e) => {
        let new_email = e.target.value;
        localStorage.setItem('email_credentials', new_email);
    }

    const handleNameChange = (e) => {
        let new_name = e.target.value;
        localStorage.setItem('name_credentials', new_name);
    }

    const handleWithoutLink = (e) => {
        let email = localStorage.getItem('email_credentials') !== null ? localStorage.getItem('email_credentials') : "";
        let name = localStorage.getItem('name_credentials') !== null ? localStorage.getItem('name_credentials') : "";

        if (email !== "" && name !== "") {
            history.push("/workspace");
        } else {
            setError("Set your credentials!");
        }
    }

    /*
    *   button
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
        width: '265px',
        height: '35px',
        marginLeft: '15px',
        marginRight: '15px',
        marginTop: '20px',
        marginBottom: '20px',
        lineHeight: 1.5,
        backgroundColor: 'green',
        color: "white",
        '&:hover': {
            backgroundColor: '#2ea043',
        },
    }));

    /*
    *   input
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
            width: '240px',
            height: '10px',
            marginLeft: '15px',
            marginRight: '15px',
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
            width: '195px',
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
        <section className='hero-container'>
            <div className="hero-background">
                <div className='logo-container'>
                    <div className='logo-tob-bar' style={{ marginTop: '30px', marginBottom: '30px' }}>
                        <div className='logo-img' style={{ width: '40px', margin: '0 auto' }}>
                            <img style={{ width: "40px", marginTop: "8px" }} src={logo} alt="logo" />
                        </div>
                    </div>
                    <div className='logo-name' style={{ marginBottom: '30px' }}>
                        <div className='informations' style={{ width: '200px', margin: '0 auto', textAlign: 'center' }}>
                            <h1 style={{ color: "#f9eec0", margin: '0 auto', width: 'auto' }}>GitVisual</h1>
                        </div>
                    </div>
                </div>
                <div className="container-link">
                    <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                        <p style={{ color: "#8b949e" }}>
                            Github link:
                        </p>
                    </div>
                    <div className='informations' style={{ marginLeft: '10px', marginTop: '-12px' }}>
                        <Checkbox
                            style={{
                                color: 'orange',
                            }}
                            checked={checked}
                            onChange={handleRepoType}
                            inputProps={{ 'aria-label': 'controlled' }}
                        />
                        <p style={{ color: "#8b949e", marginTop: '12px' }}>
                            Private repository
                        </p>
                    </div>
                    <LinkInput onChange={handleChange} />
                    {checked === true ?
                        <>
                            <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '-10px' }}>
                                <p style={{ color: "#8b949e" }}>
                                    Username:
                                </p>
                            </div>
                            <LinkInput onChange={handleUsername} />
                            <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '-10px' }}>
                                <p style={{ color: "#8b949e" }}>
                                    Token:
                                </p>
                            </div>
                            <LinkInput onChange={handleToken} />
                        </>
                        :
                        <>
                        </>
                    }
                    <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '-10px' }}>
                        <p style={{ color: "#8b949e" }}>
                            Credentials:
                        </p>
                    </div>
                    <div className='user-info-container'>
                        <div style={{ marginLeft: '5px' }} className="source-parentbox"><div style={{ color: "white" }} className="source-childbox">Email</div></div>
                        <EmailNameInput onChange={handleEmailChange} style={{ marginBottom: '10px' }} id="github-email" />
                    </div>
                    <div className='user-info-container'>
                        <div style={{ marginLeft: '5px' }} className="source-parentbox"><div style={{ color: "white" }} className="source-childbox">Name</div></div>
                        <EmailNameInput onChange={handleNameChange} style={{ marginBottom: '10px' }} id="github-name" />
                    </div>
                    <CloneButton onClick={handleClone}>Clone</CloneButton>
                    <div className='without' style={{ margin: '0 auto', textAlign: 'center', marginTop: '0px', marginBottom: '10px' }}>
                        <Link onClick={handleWithoutLink} underline="hover">
                            {' Go without enter link'}
                        </Link>
                    </div>
                    {error && <Alert style={{ marginLeft: '20px', marginRight: '20px' }} variant="danger">{error}</Alert>}
                </div>
                <div className='container-suggestions'>
                    <div className='container-informations'>
                        <div className='informations'>
                            <div style={{ margin: '0 auto', textAlign: 'center', marginTop: '10px' }}>
                                <p style={{ color: "#8b949e" }}>
                                    New to GitVisual?
                                    <Link href="/information" underline="hover">
                                        {' See informations '}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
