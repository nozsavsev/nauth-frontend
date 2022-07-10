
import { observer } from "mobx-react"
import { useEffect, useState } from "react"
import { NAUTH_Connector } from "../pages/_app";

import { useRouter } from "next/router";
const dev = process.env.NODE_ENV !== 'production'

import Lottie from "react-lottie-player";
// @ts-ignore
import loading from "/public/lottie/loading.json";
// @ts-ignore
import email from "/public/lottie/email.json";
// @ts-ignore
import deleted from "/public/lottie/deleted.json";
// @ts-ignore
import error from "/public/lottie/error.json";
// @ts-ignore
import passwordChanged_lottie from "/public/lottie/passwordChanged.json";


const NAUTH_Component = observer(({ NAUTH }: { NAUTH: NAUTH_Connector }) => {

    const router = useRouter();



    useEffect(() => {
        NAUTH.initialize_connection();
    }, [router.pathname]);

    const [Login_, setLogin_] = useState(false)
    const [userDeleted, setUserDeleted] = useState(false)
    const [userDisabled, setUserDisabled] = useState(false)
    const [passwordChanged, setPasswordChanged] = useState(false)

    useEffect(() => {
        NAUTH.userDeleted.addListner(() => { setUserDeleted(true); })
        NAUTH.passwordChanged.addListner(() => { setPasswordChanged(true); })
        NAUTH.userDisabled.addListner(() => { console.log('disabled'); setUserDisabled(true); })
    }, [])

    if (NAUTH.AuthStatus || NAUTH.PassedFirstChecks === false)
        return <div />
    else {
        if (userDisabled)
            return <div className="container center" style={{ flexDirection: "row" }}>

                <div style={{
                    margin: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "1em",
                    borderRadius: "0.5em",
                    boxShadow: "0px 0px 20px 1px #ccc",
                    maxWidth: "10em",
                }}>

                    <img src="https://nauth.nozsa.com/LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />

                    <div style={{ minHeight: "1em", fontSize: "1em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                        Account disabled
                    </div>

                    <Lottie animationData={error} play={true} loop={false} />

                    <button className="Button" onClick={() => { router.push('/legal'); }} style={{ width: "100%" }}>Learn how to behave</button>

                </div>

            </div>

        if (userDeleted) {
            return (
                <div className="container center" style={{ flexDirection: "row" }}>

                    <div style={{
                        margin: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "1em",
                        borderRadius: "0.5em",
                        boxShadow: "0px 0px 20px 1px #ccc",
                        maxWidth: "10em",
                    }}>

                        <img src="https://nauth.nozsa.com/LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />

                        <div style={{ minHeight: "1em", fontSize: "1em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                            Account deleted
                        </div>



                        <Lottie animationData={deleted} play={true} loop={false} />

                        <button className="Button" onClick={() => { setLogin_(true); setUserDeleted(false); setPasswordChanged(false); }} style={{ width: "100%" }}>Register</button>


                    </div>

                </div>

            )
        }

        if (passwordChanged) {
            return (
                <div className="container center" style={{ flexDirection: "row" }}>

                    <div style={{
                        margin: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "1em",
                        borderRadius: "0.5em",
                        boxShadow: "0px 0px 20px 1px #ccc",
                        maxWidth: "10em",
                    }}>

                        <img src="https://nauth.nozsa.com/LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />

                        <div style={{ minHeight: "1em", fontSize: "1em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                            Password changed
                        </div>

                        <Lottie segments={[40, 150]} animationData={passwordChanged_lottie} play={true} loop={false} />

                        <button className="Button" onClick={() => { setLogin_(false); setUserDeleted(false); setPasswordChanged(false); }} style={{ width: "100%" }}>Login</button>

                    </div>

                </div>

            )
        }

        if (NAUTH?.wStatus) {
            if (NAUTH.wType === "restoringSession")
                return <div className="container">
                    <div style={{
                        margin: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "1em",
                        borderRadius: "0.5em",
                        boxShadow: "0px 0px 20px 1px #ccc",
                        maxWidth: "10em",
                    }}>
                        <img src="LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />
                        <div style={{ minHeight: "1em", fontSize: "1em", fontWeight: "bolder", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                            Restoring session
                        </div>
                        <Lottie animationData={loading} play={true} loop={true} />
                    </div>
                </div>
            else if (NAUTH.wType === "emailVeref")
                return <div className="container">
                    <div style={{
                        margin: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "1em",
                        borderRadius: "0.5em",
                        boxShadow: "0px 0px 20px 1px #ccc",
                        maxWidth: "10em",
                    }}>
                        <img src="https://nauth.nozsa.com/LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />
                        <div style={{ minHeight: "1em", fontSize: "1em", fontWeight: "bolder", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                            Email verification {NAUTH?.CurrentUser?.email}
                        </div>
                        <Lottie animationData={email} play={true} loop={true} />

                        <button className="Button" onClick={async () => { console.log(await NAUTH.REST_resendEmailVerification(NAUTH?.CurrentUser?.email)) }} style={{ width: "100%" }}>Resend email</button>

                    </div>
                </div>
            else if (NAUTH.wType === "awaitingPasswordReset")
                return <div className="container">
                    <div style={{
                        margin: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "1em",
                        borderRadius: "0.5em",
                        boxShadow: "0px 0px 20px 1px #ccc",
                        maxWidth: "10em",
                    }}>
                        <img src="https://nauth.nozsa.com/LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />
                        <div style={{ minHeight: "1em", fontSize: "1em", fontWeight: "bolder", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                            Awaiting password reset
                        </div>
                        <Lottie animationData={email} play={true} loop={true} />
                    </div>
                </div>
        }

        return <div className="container center" style={{ flexDirection: "row" }}>

            {
                Login_ ?
                    <Register NAUTH={NAUTH} onLogin={(data: any) => { setLogin_(!Login_) }} />
                    : <Login NAUTH={NAUTH} onRegister={(data: any) => { setLogin_(!Login_) }} />
            }

        </div>
    }

})

export default NAUTH_Component;

const Register = observer(({ onSuccess, onLogin, NAUTH }: { onSuccess?: any, onLogin: any, NAUTH: NAUTH_Connector }) => {

    const [status, setStatus] = useState('');

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');
    const [passwordOneMoreTime, setPasswordOneMoreTime] = useState('');

    const [finished, setFinished] = useState(false);

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


            <img src="https://nauth.nozsa.com/LogoBlack.svg" style={{ flex: 0, width: "90%", margin: "10px", objectFit: "contain" }} />


            <div style={{ minHeight: "1em", fontSize: "0.7em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                {status}
            </div>

            <input className='flatInput' value={username} placeholder="username" onChange={(e) => { setStatus(''); setUsername(e.target.value); }} />
            <input className='flatInput' value={email} placeholder="email" onChange={(e) => { setStatus(''); setEmail(e.target.value); }} />
            <input className='flatInput' value={password} placeholder="password" type={"password"} onChange={(e) => { setStatus(''); setPassword(e.target.value); }} />
            <input className='flatInput' value={passwordOneMoreTime} placeholder="one more time" type={"password"} onChange={(e) => { setStatus(''); setPasswordOneMoreTime(e.target.value); }} />

            <div style={{ color: "#bbb", fontSize: 14, maxWidth: "17em", marginTop: "1em" }}>
                I agree to<br />
                <a style={{ color: "#888", textDecoration: "none" }} target="_blank" href="https://nauth.nozsa.com/legal/tos">Terms of Service</a> and <a style={{ color: "#888", textDecoration: "none" }} target="_blank" href="/legal/prp">Privacy policy</a>
            </div>

            <button className='Button' style={{ width: "100%" }} onClick={async () => {

                setStatus('');

                if (password !== passwordOneMoreTime)
                    return setStatus("Passwords don't match");

                let res = await NAUTH.REST_createUser(username, email, password);

                if (res.status === "success") {
                    setPassword('');
                    setPasswordOneMoreTime('');
                    if (onSuccess)
                        onSuccess(res);
                }
                else
                    setStatus(res.error);

            }}>Register</button>

            <button className='flatButton' style={{ flex: 1, width: "100%" }} onClick={() => {
                onLogin();
            }}>Login</button>

        </div>

    )
})

const Login = observer(({ onSuccess, onRegister, NAUTH }: { onSuccess?: any, onRegister: any, NAUTH: NAUTH_Connector }) => {

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
            boxShadow: "0px 0px 20px 1px #ccc",
            maxWidth: "10em",
        }}>

            <img src="https://nauth.nozsa.com/LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />



            <div style={{ minHeight: "1em", fontSize: "0.7em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                {status}
            </div>

            <input className='flatInput' value={username} placeholder="username or email" onChange={(e) => { setStatus(''); setUsername(e.target.value); }} />
            <input className='flatInput' value={password} placeholder="password" type={"password"} onChange={(e) => { setPassword(e.target.value); }}
                onKeyDown={async (e) => {
                    setStatus('');

                    if (e.key === "Enter") {

                        let res = await NAUTH.REST_Login(username, password);

                        if (res.status === "success") {
                            setStatus('');
                            setPassword("");
                            if (onSuccess)
                                onSuccess(res);
                        }
                        else
                            setStatus(res.error);
                    }
                }}
            />

            <button className='Button' style={{ flex: 1, width: "100%" }} onClick={async () => {

                let res = await NAUTH.REST_Login(username, password);

                if (res.status === "success") {
                    setStatus('');
                    setPassword("");
                    if (onSuccess)
                        onSuccess(res);
                }
                else
                    setStatus(res.error);

            }}>Login</button>

            <button className='flatButton' style={{ flex: 1, width: "100%" }} onClick={() => {
                onRegister();
            }}>Register</button>


            <button className='flatButton' style={{ flex: 1, height: "20px", fontSize: "16px", width: "100%" }} onClick={() => {

                NAUTH.REST_RequestPasswordReset(username).then(res => {

                    if (res.status === "success")
                        setStatus("Password reset link sent to your email");
                    else
                        setStatus(res.error);

                });

            }}>Reset Password</button>



        </div>
    )
})