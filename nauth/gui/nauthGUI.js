const dev = process.env.NODE_ENV !== 'production'

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import React, { useState, } from 'react'

import cookies from 'react-cookies';

import initFirebase from "../firebase";
import styles_white from './nauth_white.module.css'
import styles_black from './nauth_black.module.css'



export function NAUTH_Login({ onAuth, onRegister, logoURL, darkMode }) {

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

                                cookies.save('token', userCredential.user.accessToken, { path: "/", domain: dev ? "localhost" : ".nozsa.com" });

                                setStatus("success");
                                onAuth(userCredential)
                            })
                            .catch((error) => {
                                console.log(error);
                                cookies.save('token', '', { path: "/", domain: dev ? "localhost" : ".nozsa.com" });
                                setStatus("check email or password");
                            });

                    }}>Take me in</button>
                <div style={{ textDecoration: "none", transition: "1s", color: darkMode ? "white" : "black", margin: "15px", userSelect: "none" }} onClick={onRegister} >Register</div>

            </div>

        </div >
    )
}

export function NAUTH_Register({ onLogin, onAuth, logoURL, darkMode }) {

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

                                cookies.save('token', userCredential.user.accessToken, { path: "/", domain: dev ? "localhost" : ".nozsa.com" });

                                setStatus("success");
                                onAuth(userCredential)
                            })
                            .catch((error) => {
                                cookies.save('token', '', { path: "/", domain: dev ? "localhost" : ".nozsa.com" });
                                setStatus("something wrong\n try another login or password");
                            });

                    }}>Register</button>
                <div style={{ textDecoration: "none", transition: "1s", color: darkMode ? "white" : "black", margin: "15px", userSelect: "none" }} onClick={onLogin} >Login</div>

            </div>

        </div >
    )
}