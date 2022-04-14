import React from 'react'
import logo from "../../images/favicon.ico";
import './index.css'

import loading from "../../images/refresh.png";

export default function MyInformation() {
    return <>
        <div className="information-body">
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
            <div className='information-container'>
                <div className='information-loading'>
                    <img className='image' style={{ width: "64px" }} src={loading} alt="loading" />
                </div>
            </div>
        </div>
    </>
}
