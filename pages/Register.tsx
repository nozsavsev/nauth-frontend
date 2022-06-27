import axios from "axios"
import { observer } from "mobx-react"
import { useEffect, useState } from "react"
import { NAUTH_Connector } from "./_app"

const dev = process.env.NODE_ENV !== 'production'
const api = dev ? 'http://localhost:3001' : 'https://nauth-api.nozsa.com';

import Lottie from 'react-lottie-player'
import { useRouter } from "next/router"

const IndexPage = observer(({ NAUTH }: { NAUTH: NAUTH_Connector }) => {

    const router = useRouter();

        return <div className="container">
            <Register
                NAUTH={NAUTH}
                onLogin={() => router.push('/Login')}
                onSuccess={() => {




                }}
            />
        </div >
})

export default IndexPage



export const Register = observer(({ onSuccess, onLogin, NAUTH }: { onSuccess?: any, onLogin: any, NAUTH: NAUTH_Connector }) => {

    const [status, setStatus] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordOneMoreTime, setPasswordOneMoreTime] = useState('');

    return (
        <div style={{
            margin: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "1em",
            paddingTop: "0",
            borderRadius: "0.5em",
            boxShadow: "0px 0px 20px 1px #ccc",
            maxWidth: "10em",
        }}>


            <img src="LogoBlack.svg" style={{ flex: 0, width: "90%", margin: "10px", objectFit: "contain" }} />


            <div style={{ minHeight: "1em", fontSize: "0.7em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                {status}
            </div>

            <input className='flatInput' value={username} placeholder="username" onChange={(e) => { setStatus(''); setUsername(e.target.value); }} />
            <input className='flatInput' value={email} placeholder="email" onChange={(e) => { setStatus(''); setEmail(e.target.value); }} />
            <input className='flatInput' value={password} placeholder="password" type={"password"} onChange={(e) => { setStatus(''); setPassword(e.target.value); }} />
            <input className='flatInput' value={passwordOneMoreTime} placeholder="one more time" type={"password"} onChange={(e) => { setStatus(''); setPasswordOneMoreTime(e.target.value); }} />

            <div style={{ color: "#bbb", fontSize: 14, maxWidth: "17em", marginTop: "1em" }}>
                I agree to<br />
                <a style={{ color: "#888", textDecoration: "none" }} target="_blank" href="/legal/tos">Terms of Service</a> and <a style={{ color: "#888", textDecoration: "none" }} target="_blank" href="/legal/prp">Privacy policy</a>
            </div>

            <button className='Button' style={{ width: "100%" }} onClick={async () => {

                setStatus('');

                if (password !== passwordOneMoreTime)
                    return setStatus("Passwords don't match");

                let res = await NAUTH.REST_createUser(username, email, password);

                if (res.status === "success") {
                    setPassword('');
                    setPasswordOneMoreTime('');
                    if (onSuccess) onSuccess(res);
                }
                else
                    setStatus(res.error);

            }}>Register</button>

            <button className='flatButton' style={{ flex: 1, width: "100%" }} onClick={onLogin}>Login</button>

        </div>

    )
})