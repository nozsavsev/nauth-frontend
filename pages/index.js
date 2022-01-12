import React, { useState, useEffect } from 'react'
import axios from "axios";

import { NAUTH_Login, NAUTH_Register } from '../nauth/gui/nauthGUI';

export default function Page() {



    const [location, setLocation] = useState(null);

    useEffect(() => {
        setLocation(window.location);

    }, []);


    return (
        <div className="Container">

            <NAUTH_Login
                onAuth={(data) => {

                    

                }}
                logoURL="/LogoBlack.svg"
                darkMode={false}
                registerURL={'/Register'}
            />

            <NAUTH_Register
                onAuth={(data) => {

                   

                }}
                logoURL="/LogoBlack.svg"
                darkMode={false}
                loginURL={'/Login'}
            />
        
        </div>
    )
}