import axios from "axios"
import { observer } from "mobx-react"
import { useEffect, useState } from "react"
import { NAUTH_SocketConnector } from "./_app"

const dev = process.env.NODE_ENV !== 'production'
const api = dev ? 'http://localhost:3001' : 'https://nauth-api.nozsa.com';


import Lottie from "lottie-react";
import loading from "../public/lottie/loading.json";
import email from "../public/lottie/email.json";

const IndexPage = observer(

  ({ NAUTH_Socket }: { NAUTH_Socket: NAUTH_SocketConnector }) => {

    const [Login_, setLogin_] = useState(false)

    useEffect(() => {



    }, [])

    if (NAUTH_Socket.status_working) {

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

            <img src="LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />

            <div style={{ minHeight: "1em", fontSize: "1em", maxWidth: "15em", wordBreak: "break-word", textAlign: "center", margin: "0.2em" }}>
              {
                (NAUTH_Socket.type_working === "emailVeref") ? "Email verification for\n" + NAUTH_Socket?.CurrentUser?.email :
                  (NAUTH_Socket.type_working === "restoringSession") ? "Logging in" : ""
              }
            </div>

            {
              (NAUTH_Socket.type_working === "emailVeref") ? <Lottie animationData={email} loop={true} /> :
                (NAUTH_Socket.type_working === "restoringSession") ? <Lottie animationData={loading} loop={true} /> : ""
            }

          </div>

        </div>
      )
    }
    else if (!NAUTH_Socket.AuthStatus)
      return (
        <div className="container center" style={{ flexDirection: "row" }}>

          {
            Login_ ?
              <Register onSuccess={() => { setLogin_(false); }} onLogin={(data: any) => { setLogin_(!Login_) }} />
              : <Login onSuccess={(data: any) => { NAUTH_Socket.socketAuth(data.token) }} onRegister={(data: any) => { setLogin_(!Login_) }} />
          }

        </div>
      )
    else
      return (
        <div className="container center" style={{ flexDirection: "row" }}>


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
                  NAUTH_Socket.CurrentUser.sessions.map((session, index) => {

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

                        axios.get(`${api}/private/revokeSession?sessionID=${session.id}&token=${NAUTH_Socket.token}`).then(res => {
                          console.log(res.data);
                        }).catch(err => { console.log(err); });

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



export const Register = observer(({ onSuccess, onLogin }: { onSuccess: any, onLogin: any }) => {

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

      <button className='Button' style={{ width: "100%" }} onClick={() => {
        setStatus('');
        if (password !== passwordOneMoreTime)
          return setStatus("Passwords don't match");

        axios.get(`${api}/register?email=${email}&username=${username}&password=${password}`).then(res => {


          if (res.data.status === "success") {

            setEmail("");
            setUsername("");
            setPassword("");
            setPasswordOneMoreTime("");

            onSuccess(res.data);

          } else {

            setStatus(res.data.error);

          }


        }).catch(err => { console.log(err); });


      }}>Register</button>

      <button className='flatButton' style={{ flex: 1, width: "100%" }} onClick={() => {
        onLogin();
      }}>Login</button>

    </div>

  )
})

export const Login = observer(({ onSuccess, onRegister }: { onSuccess: any, onRegister: any }) => {

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

      <img src="LogoBlack.svg" style={{ flex: 0, width: "90%", marginBottom: "10px", objectFit: "contain" }} />



      <div style={{ minHeight: "1em", fontSize: "0.7em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
        {status}
      </div>

      <input className='flatInput' value={username} placeholder="username or email" onChange={(e) => { setStatus(''); setUsername(e.target.value); }} />
      <input className='flatInput' value={password} placeholder="password" type={"password"} onChange={(e) => { setPassword(e.target.value); }}
        onKeyDown={(e) => {


          setStatus('');

          if (e.key === "Enter") {

            axios.get(`${api}/Login?username=${username}&password=${password}`).then(res => {

              if (res.data.status === "success")
                onSuccess(res.data)
              else
                setStatus(res.data.error);

              setPassword("");
            }).catch(err => { console.log(err); });

          }
        }}
      />

      <button className='Button' style={{ flex: 1, width: "100%" }} onClick={() => {

        var payload = Buffer.from(JSON.stringify({ username: username, password: password })).toString('base64');;
        axios.get(`${api}/Login?username=${username}&password=${password}`).then(res => {

          setStatus('');

          if (res.data.status === "success")
            onSuccess(res.data)
          else
            setStatus(res.data.error);

          setPassword("");
        }).catch(err => { console.log(err); });
      }}>Login</button>



      <button className='flatButton' style={{ flex: 1, width: "100%" }} onClick={() => {
        onRegister();
      }}>Register</button>



    </div>
  )
})