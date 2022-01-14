const dev = process.env.NODE_ENV !== 'production'

import cookie from 'react-cookies'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { NAUTH_Login } from '../nauth/gui/nauthGUI';

export default function Page() {

    const router = useRouter()
    const [location, setLocation] = useState(null); 
    const [darkMode, setDarkMode] = useState(null);
    const [Back, setBack] = useState(null);

    useEffect(() => {
        setLocation(window.location);

        if (!cookie.load('accepted')) {
            router.push('/legal/accept');
        }

        var params = (new URL(document.location)).searchParams;
        
        setDarkMode(params.get("black") === 'true' ? true : false);

        setBack(params.get("back"));
    }, []);

    return (
        <div className="Container" style={{ flexDirection: "column", backgroundColor: darkMode ? "black" : "white" }}>

            <NAUTH_Login
                onAuth={(data) => {
                    router.push(Back !== null ? Back : "https://nozsa.com");
                }}

                onRegister={() => {
                    router.push(`/Register${Back !== null ? `?back=${Back}` : ''}`);
                }}

                logoURL={darkMode ? "/LogoWhite.svg" : "/LogoBlack.svg"}
                darkMode={darkMode}
            />


        </div>
    )
}