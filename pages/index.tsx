import axios from "axios"
import { observer } from "mobx-react"
import { useEffect, useState } from "react"
import { NAUTH_Connector } from "./_app"

const dev = process.env.NODE_ENV !== 'production'
const api = dev ? 'http://localhost:3001' : 'https://nauth-api.nozsa.com';


import Lottie from 'react-lottie-player'
import loading from "../public/lottie/loading.json";
import email from "../public/lottie/email.json";
import deleted from "../public/lottie/deleted.json";
import passwordChanged_lottie from "../public/lottie/passwordChanged.json";

const IndexPage = observer(

  ({ NAUTH }: { NAUTH: NAUTH_Connector }) => {

    const [Login_, setLogin_] = useState(false)

    const [userDeleted, setUserDeleted] = useState(false)
    const [passwordChanged, setPasswordChanged] = useState(false)
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const [status, setStatus] = useState('')

    useEffect(() => {
      NAUTH.userDeleted.addLIstner(() => {
        setUserDeleted(true);
      })

      NAUTH.passwordChanged.addLIstner(() => {
        setPasswordChanged(true);
      })
    }, [])


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

            <img src="/LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />

            <div style={{ minHeight: "1em", fontSize: "1em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
              Account deleted
            </div>



            <Lottie animationData={deleted} play={true} loop={false} />

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

            <img src="/LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />

            <div style={{ minHeight: "1em", fontSize: "1em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
              Password changed
            </div>

            <Lottie segments={[40, 150]} animationData={passwordChanged_lottie} play={true} loop={false} />

          </div>

        </div>

      )
    }

    if (NAUTH?.wStatus) {


      if (NAUTH.wStatus) {

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
              <img src="LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />
              <div style={{ minHeight: "1em", fontSize: "1em", fontWeight: "bolder", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                Email verification {NAUTH.CurrentUser.email}
              </div>
              <Lottie animationData={email} play={true} loop={true} />
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
              <img src="LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />
              <div style={{ minHeight: "1em", fontSize: "1em", fontWeight: "bolder", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
                Awaiting password reset
              </div>
              <Lottie animationData={email} play={true} loop={true} />
            </div>
          </div>
      }


    }
    else if (!NAUTH?.AuthStatus)
      return (
        <div className="container center" style={{ flexDirection: "row" }}>

          {
            Login_ ?
              <Register NAUTH={NAUTH} onLogin={(data: any) => { setLogin_(!Login_) }} />
              : <Login NAUTH={NAUTH} onRegister={(data: any) => { setLogin_(!Login_) }} />
          }

        </div>
      )
    else
      return (
        <div className="container center" style={{ flexDirection: "column" }}>

          <input className='flatInput' value={password} placeholder="password" type={"password"} onChange={(e) => { setPassword(e.target.value); }} />
          <input className='flatInput' value={newPassword} placeholder="new Pasword" type={"password"} onChange={(e) => { setNewPassword(e.target.value); }} />

          <button className='Button' style={{ fontSize: "15px", background: "red", fontWeight: "bold", border: "solid red" }} onClick={() => {
            NAUTH.REST_DeleteUser(password);
          }}>{"Delete user"}</button>

          <button className='Button' style={{ fontSize: "15px", fontWeight: "bold" }} onClick={() => {
            NAUTH.REST_ChangePasword(password, newPassword);
          }}>{"Change Password"}</button>

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
                  NAUTH.CurrentUser.sessions.map((session, index) => {

                    return <tr key={index}>

                      <td>
                        <table style={{ fontWeight: session.current ? "bold" : "normal" }}>
                          <tbody>
                            <tr>
                              <td> {session.os} |</td>
                              <td> {session.device} </td>
                            </tr>
                            <tr>
                              <td colSpan={3} style={{ fontSize: "0.5em", color: "#888" }}>{session.id}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>

                      <td> <button className='Button' style={{ fontSize: "15px", }} onClick={() => {

                        NAUTH.REST_RevokeSession(session.id);


                      }}>{session.current ? "Logout" : "Revoke"}</button></td>
                    </tr>
                  })
                }
              </tbody>
            </table>

          </div>
        </div>
      )
  }

)

export default IndexPage



export const Register = observer(({ onSuccess, onLogin, NAUTH }: { onSuccess?: any, onLogin: any, NAUTH: NAUTH_Connector }) => {

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

export const Login = observer(({ onSuccess, onRegister, NAUTH }: { onSuccess?: any, onRegister: any, NAUTH: NAUTH_Connector }) => {

  const [status, setStatus] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

      <img src="LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />



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