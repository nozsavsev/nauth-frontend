import React, { useState, useEffect } from 'react'
import axios from "axios";

import { NAUTH_Login, NAUTH_Register } from '../nauth/gui/nauthGUI';

export default function Page() {

    const [location, setLocation] = useState(null);

    useEffect(() => {
        setLocation(window.location);
    }, []);


    return (
        <div className="Container" style={{ flexDirection: "column" }}>

            <div style={{ fontSize: "30px", margin: "20px" }}>
                {Status}
            </div>


                <NAUTH_Login
                    onAuth={(data) => {


                    }}
                    logoURL="/LogoBlack.svg"
                    darkMode={false}
                    registerURL={'/Register'}
                />


       
        </div>
    )
}