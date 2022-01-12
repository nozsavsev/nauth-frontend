import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import React, { useState, } from 'react'

import { useCookies } from 'react-cookie';

import initFirebase from "../firebase";

import styles_white from './nauth_white.module.css'
import styles_black from './nauth_black.module.css'



export function NAUTH_Login({ onAuth, logoURL, registerURL, darkMode }) {

    initFirebase();

    const [Login, setLogin] = useState("");
    const [Password, setPassword] = useState("");
    const [Status, setStatus] = useState("");
    const [cookies, setCookie] = useCookies(['']);

    if (typeof darkMode == 'undefined')
        darkMode = false;

    var styles = darkMode ? styles_black : styles_white;

    return (

        <div className={styles.Container}>

            <img src={logoURL} alt="logo" className={styles.Logo} />

            <div>
                {Status}
            </div>

            <input
                className={styles.Input}
                value={Login}
                onChange={e => { setLogin(e.target.value); setStatus(''); }}
                placeholder="Login"
                type="text"
            />

            <input
                className={styles.Input}
                value={Password}
                onChange={e => { setPassword(e.target.value); setStatus(''); }}
                placeholder="Password"
                type="password"
            />

            <div style={{ display: "flex", flexDirection: "column", justifyItems: "center", alignItems: "center", flex: 1 }}>

                <button className={styles.Button}
                    onClick={async () => {

                        const auth = getAuth();

                        signInWithEmailAndPassword(auth, Login, Password)
                            .then(async (userCredential) => {

                                if (!userCredential.user.emailVerified) {
                                    var auth = getAuth();
                                    auth.currentUser;
                                    sendEmailVerification(auth.currentUser)
                                    setStatus('Veryfy email\n and you are ready to go!');
                                    return;
                                }

                                setCookie('token', userCredential.user.accessToken);
                                setStatus("success");
                                onAuth(userCredential)
                            })
                            .catch((error) => {
                                console.log(error);
                                setCookie('token', '');
                                setStatus("check email or password");
                            });

                    }}>Take me in</button>
                <a style={{ textDecoration: "none", transition: "1s", color: darkMode ? "white" : "black", margin: "15px", userSelect: "none" }} href={registerURL} >Register</a>

            </div>

        </div >
    )
}

export function NAUTH_Register({ onAuth, logoURL, loginURL, darkMode }) {

    const [cookies, setCookie] = useCookies(['']);

    initFirebase();

    const [Login, setLogin] = useState("");
    const [Password, setPassword] = useState("");
    const [Status, setStatus] = useState("");

    if (typeof darkMode == 'undefined')
        darkMode = false;

    var styles = darkMode ? styles_black : styles_white;

    return (

        <div className={styles.Container}>

            <img src={logoURL} alt="logo" className={styles.Logo} />

            <div>
                {Status}
            </div>

            <input
                className={styles.Input}
                value={Login}
                onChange={e => { setLogin(e.target.value); setStatus(''); }}
                placeholder="Login"
                type="text"
            />

            <input
                className={styles.Input}
                value={Password}
                onChange={e => { setPassword(e.target.value); setStatus(''); }}
                placeholder="Password"
                type="password"
            />

            <div style={{ display: "flex", flexDirection: "column", justifyItems: "center", alignItems: "center", flex: 1 }}>

                <button className={styles.Button}
                    onClick={() => {

                        const auth = getAuth();

                        createUserWithEmailAndPassword(auth, Login, Password)
                            .then((userCredential) => {


                                if (!userCredential.user.emailVerified) {
                                    var auth = getAuth();
                                    auth.currentUser;
                                    sendEmailVerification(auth.currentUser)
                                    setStatus('Veryfy email\n and you are ready to go!');
                                    return;
                                }

                                setCookie('token', userCredential.user.accessToken, { domain: 'http://nozsa.com' });
                                setStatus("success");
                                onAuth(userCredential)
                            })
                            .catch((error) => {
                                setCookie('token', '');
                                setStatus("something wrong\n try another login or password");
                            });

                    }}>Register</button>
                <a style={{ textDecoration: "none", transition: "1s", color: darkMode ? "white" : "black", margin: "15px" }} href={loginURL} >Login</a>

            </div>

        </div >
    )
}