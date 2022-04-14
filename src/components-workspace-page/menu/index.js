import React, { useContext } from "react"
import { useHistory, Link } from "react-router-dom"
import "./index.css"

export default function LeftMenu({type}) {

    const history=useHistory();

    const logtype = window.localStorage.getItem('type');

    return (
        <>
            <div class="wrapper">
                <nav className={type}>
                    <div class="sidebar-header">
                        <span className="logoDash"></span>
                        <h3>project</h3>
                    </div>
                    <ul class="list-unstyled components">
                        <p>COMPONENTS</p>
                        <li class="active">
                            <Link to="/dashboard"> <i class="fa fa-fw fa-home"></i> Function 1</Link>
                        </li>
                        <li>
                            <Link to="/profile"> <i class="fa fa-fw fa-user"></i> Function 1</Link>
                        </li>
                        {logtype == "admin" ?
                        <li>
                            <Link to="/admin"> <i class="fa fa-fw fa-bolt"></i> Function 1</Link>
                        </li>: <></>}
                        <li>
                            <Link to="/wallet"> <i class="fa fa-fw fa-bank"></i> Function 1</Link>
                        </li>
                        <li>
                            <Link to="/assets"> <i class="fa fa-fw fa-diamond"></i> Function 1</Link>
                        </li>
                        <li>
                            <Link> <i class="fa fa-fw fa-anchor"></i> Logout</Link>
                        </li>
                        <p>EXTRAS</p>
                        <li>
                            <Link to="/information"> <i class="fa fa-fw fa-info-circle"></i> Function 1</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    )
}
