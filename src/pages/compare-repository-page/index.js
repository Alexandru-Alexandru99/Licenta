import React from 'react'
import Sidebar from "../../common-components/sidebar";

import MyDiffEditor from '../../components-compare-repository-page/diffEditor'

export default function Compare() {
    return (
        <>
            <Sidebar></Sidebar>
            <MyDiffEditor/>
        </>
    )
}
