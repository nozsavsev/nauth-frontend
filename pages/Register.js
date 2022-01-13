import React, { useState, useEffect } from 'react'
import axios from "axios";

import { NAUTH_Login, NAUTH_Register } from '../nauth/gui/nauthGUI';

export default function Page() {

    const [location, setLocation] = useState(null);

    useEffect(() => {
        setLocation(window.location);

        let params = (new URL(document.location)).searchParams;
        let back = params.get("back");

        console.log(back);

    }, []);


    return (
        <div className="Container" style={{ flexDirection: "column" }}>
            <div style={{ display: "flex" }}>

                <NAUTH_Register
                    onAuth={(data) => {

                  

                    }}
                    logoURL="/LogoBlack.svg"
                    darkMode={false}
                    loginURL={'/Login'}
                />

            </div>
        </div>
    )
}