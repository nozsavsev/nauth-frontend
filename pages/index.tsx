const dev = process.env.NODE_ENV !== 'production'

import cookie from 'react-cookies'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import dynamic from "next/dynamic";
import axios from 'axios';
import QrReader from 'react-qr-scanner'
import { v4 } from 'uuid';
import QRCode from 'qrcode.react'

export function Register({ onSuccess }: { onSuccess: any }) {

    const [status, setStatus] = useState('');

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');
    const [passwordOneMoreTime, setPasswordOneMoreTime] = useState('');

    return (
        <div style={{
            margin: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "1em",
            borderRadius: "0.5em",
            boxShadow: "0px 0px 20px 1px #ccc"
        }}>

            <div style={{ minHeight: "1em", fontSize: "0.7em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                {status}
            </div>

            <input className='flatInput' value={username} placeholder="username" onChange={(e) => { setUsername(e.target.value); }} />
            <input className='flatInput' value={email} placeholder="email" onChange={(e) => { setEmail(e.target.value); }} />
            <input className='flatInput' value={password} placeholder="password" type={"password"} onChange={(e) => { setPassword(e.target.value); }} />
            <input className='flatInput' value={passwordOneMoreTime} placeholder="one more time" type={"password"} onChange={(e) => { setPasswordOneMoreTime(e.target.value); }} />

            <div style={{ color: "#bbb", fontSize: 14, maxWidth: "17em", marginTop: "1em" }}>
                I agree to<br />
                <a style={{ color: "#888", textDecoration: "none" }} target="_blank" href="/legal/tos">Terms of Service</a> and <a style={{ color: "#888", textDecoration: "none" }} target="_blank" href="/legal/prp">Privacy policy</a>
            </div>

            <button className='Button' onClick={() => {

                if (password !== passwordOneMoreTime)
                    return setStatus("Passwords don't match");

                var payload = Buffer.from(JSON.stringify({ username: username, email: email, password: password })).toString('base64');;
                axios.get(`${location.origin}/api/public/registerUserWithEmail?data=${payload}`).then(res => {

                    if (res.data.code === "SUREUS")
                        onSuccess(res.data)
                    else
                        setStatus(res.data.message);

                }).catch(err => { console.log(err); });
            }}>Register</button>
        </div>
    )
}

export function Login({ onSuccess }: { onSuccess: any }) {

    const [status, setStatus] = useState('');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div style={{
            margin: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "1em",
            borderRadius: "0.5em",
            boxShadow: "0px 0px 20px 1px #ccc"
        }}>

            <div style={{ minHeight: "1em", fontSize: "0.7em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                {status}
            </div>

            <input className='flatInput' value={username} placeholder="username or email" onChange={(e) => { setUsername(e.target.value); }} />
            <input className='flatInput' value={password} placeholder="password" type={"password"} onChange={(e) => { setPassword(e.target.value); }} />

            <button className='Button' onClick={() => {
                var payload = Buffer.from(JSON.stringify({ username: username, password: password })).toString('base64');;
                axios.get(`${location.origin}/api/public/LoginWithPassword?data=${payload}`).then(res => {

                    if (res.data.code === "SLOGIN")
                        onSuccess(res.data)
                    else
                        setStatus(res.data.message);

                }).catch(err => { console.log(err); });
            }}>Login</button>
        </div>
    )
}

export function SessionManager({ sessions }: any) {

    return (
        <div style={{
            margin: "20px",
            width: "350px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "1em",
            borderRadius: "0.5em",
            boxShadow: "0px 0px 20px 1px #ccc"
        }}>

            <table>
                <tbody>
                    {
                        sessions?.map((session, index) => {

                            return <tr key={index}>

                                <td>
                                    <table style={{ fontWeight: session.current ? "bold" : "normal" }}>
                                        <tbody>
                                            <tr>
                                                <td> {session.useragent.os} |</td>
                                                <td> {session.useragent.browser} </td>
                                            </tr>
                                            <tr>
                                                <td colSpan={3} style={{ fontSize: "0.5em", color: "#888" }}>{session.sessionID}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>

                                <td> <button className='Button' style={{ fontSize: "15px", }} onClick={() => {

                                    var payload = Buffer.from(JSON.stringify({ sessionID: session.sessionID })).toString('base64');;

                                    axios.get(`${location.origin}/api/private/revokeSession?data=${payload}`).then(res => {
                                        console.log(res.data);
                                    }).catch(err => { console.log(err); });

                                }}>Logout</button></td>
                            </tr>
                        })
                    }
                </tbody>
            </table>

        </div>
    )
}




export function ChangePassword({ onSuccess }: { onSuccess: any }) {

    const [status, setStatus] = useState('');

    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordOneMoreTime, setPasswordOneMoreTime] = useState('');

    return (
        <div style={{
            margin: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "1em",
            borderRadius: "0.5em",
            boxShadow: "0px 0px 20px 1px #ccc"
        }}>

            <div style={{ minHeight: "1em", fontSize: "0.7em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                {status}
            </div>



            <input className='flatInput' value={oldPassword} placeholder="current password" type={"password"} onChange={(e) => { setOldPassword(e.target.value); }} />

            <input className='flatInput' value={password} placeholder="password" type={"password"} onChange={(e) => { setPassword(e.target.value); }} />
            <input className='flatInput' value={passwordOneMoreTime} placeholder="one more time" type={"password"} onChange={(e) => { setPasswordOneMoreTime(e.target.value); }} />

            <button className='Button' onClick={() => {

                if (password !== passwordOneMoreTime)
                    return setStatus("Passwords don't match");

                var payload = Buffer.from(JSON.stringify({ newPassword: password, password: oldPassword })).toString('base64');;
                axios.get(`${location.origin}/api/private/changePassword?data=${payload}`).then(res => {

                    if (res.data.code === "PASSCH")
                        onSuccess(res.data)
                    else
                        setStatus(res.data.message);

                }).catch(err => { console.log(err); });
            }}>Change</button>
        </div>
    )
}








export default function Page({ socket, user, authStatus, setAuthStatus, setUser }) {

    const router = useRouter()
    const [location, setLocation] = useState(null);
    const [qrLoginToken, setQrLoginToken] = useState(v4());

    const [scanned, setScanned] = useState(false);

    const [token, __setToken] = useState(cookie.load('token'));
    function setToken(token: string) {
        __setToken(token);
        cookie.save("token", token, { path: "/", expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) });
    }

    useEffect(() => {
        setLocation(window.location);
    }, []);

    if (authStatus === false)
        return (
            <div className="Container" style={{ flexDirection: "row", backgroundColor: "white" }}>
                <Login
                    onSuccess={(data) => {
                        setAuthStatus(true);
                        setUser(data.user);

                        setToken(data.token);
                        console.log(data);
                        socket?.emit('auth', { token: data.token });
                    }} />
            </div>
        )
    else
        return (
            <div className="Container" style={{ flexDirection: "column", backgroundColor: "white" }}>



                <ChangePassword onSuccess={(data) => {

                    console.log(data);

                }} />


                <SessionManager sessions={user?.sessionStorage} />

            </div>
        )
}