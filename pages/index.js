import React, { useState, useEffect } from 'react'
import axios from "axios";

import { NAUTH_Login, NAUTH_Register } from '../nauth/gui/nauthGUI';

export default function Page() {



    const [location, setLocation] = useState(null);
    const [Status, setStatus] = useState(null);

    useEffect(() => {
        setLocation(window.location);

        setStatus("Logging in with local credentials");


        axios.get("/api/private/getUser").then(res => {
            if (!res.data.error)
                setStatus("Logged in with local credentials as: " + res.data.email);
            else
                setStatus("Login required");

        }).catch(err => { setStatus("Login required"); });


    }, []);


    return (
        <div className="Container" style={{ flexDirection: "column" }}>

            <div style={{ fontSize: "30px", margin: "20px" }}>
                {Status}
            </div>

            <div style={{ display: "flex" }}>


                <button>Login</button>


                <NAUTH_Login
                    onAuth={(data) => {

                        setStatus("login complete, logged in as: " + data.user.email);

                        var params = `width=400,height=600,top=0,left=0`;
                        window.open('/login', 'test', params);

                    }}
                    logoURL="/LogoBlack.svg"
                    darkMode={false}
                    registerURL={'/Register'}
                />

                <NAUTH_Register
                    onAuth={(data) => {

                        setStatus("registration complete,logged in as: " + data.user.email);

                    }}
                    logoURL="/LogoBlack.svg"
                    darkMode={false}
                    loginURL={'/Login'}
                />

            </div>
        </div>
    )
}