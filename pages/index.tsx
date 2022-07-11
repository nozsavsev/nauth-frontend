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
import NAUTH_Component from "../components/NAUTH-gui"

const IndexPage = observer(

  ({ NAUTH }: { NAUTH: NAUTH_Connector }) => {


    return (
      <div className="container center" style={{ flexDirection: "column" }}>

        <div style={{ padding: "10px", margin: "10px", background: "black", color: "white", display: "flex",alignItems:"center", flexDirection: "row", borderRadius: "10px" }}>

          <div style={{ color: "#bbb", marginRight: "10px" }}>
            logged in as
          </div>
          <div>
            {NAUTH?.CurrentUser?.username}
          </div>
          {NAUTH?.CurrentUser?.systemAdmin ? <div style={{ marginLeft:"10px",padding:"4px 7px 4px 7px",background: "white", color: "black", borderRadius: "5px" }}>
            admin
          </div> : <div />}

        </div>

        <div style={{ display: "flex" }}>
          <DeleteUser NAUTH={NAUTH} />
          <ChangePassword NAUTH={NAUTH} />
        </div>
        <SessionManager NAUTH={NAUTH} />

        <NAUTH_Component silent={false} requireAdmin={false} NAUTH={NAUTH} />

      </div>
    )
  }

)

export default IndexPage


export const SessionManager = observer(({ NAUTH }: { NAUTH: NAUTH_Connector }) => {

  if (!NAUTH.AuthStatus)
    return <div />

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
            NAUTH.CurrentUser.sessions.map((session, index) => {

              return <tr key={index}>

                <td>

                  <table style={{ fontWeight: session.current ? "bold" : "normal", }}>
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
                }}>{session.current ? "Logout" : "Revoke"}</button>
                </td>
              </tr>
            })
          }
        </tbody>
      </table>

    </div>


  )
})

export const DeleteUser = observer(({ onSuccess, NAUTH }: { onSuccess?: any, NAUTH: NAUTH_Connector }) => {

  const [status, setStatus] = useState('');

  const [password, setPassword] = useState('');


  if (!NAUTH.AuthStatus)
    return <div />

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


      <img src="LogoBlack.svg" style={{ flex: 0, width: "90%", margin: "10px", marginTop: '30px', objectFit: "contain" }} />


      <div style={{ minHeight: "1em", fontSize: "0.7em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
        {status}
      </div>

      <input className='flatInput' value={password} placeholder="password" type={"password"} onChange={(e) => { setStatus(''); setPassword(e.target.value); }} />


      <button style={{ fontSize: "15px", background: "red", fontWeight: "bold", border: "solid red" }} className='Button' onAnimationEnd={() => { console.log('end') }} onClick={async () => {

        if ((await NAUTH.REST_DeleteUser(password)).status === "success") {
          if (onSuccess)
            onSuccess();
        }
        else
          setStatus("Password incorrect");

      }}>{"Delete user"}</button>

    </div>

  )
})

export const ChangePassword = observer(({ onSuccess, NAUTH }: { onSuccess?: any, NAUTH: NAUTH_Connector }) => {

  const [status, setStatus] = useState('');

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');


  if (!NAUTH.AuthStatus)
    return <div />

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


      <div style={{ minHeight: "1em", fontSize: "0.7em", maxWidth: "15em", wordBreak: "break-word", margin: "0.2em" }}>
        {status}
      </div>

      <input className='flatInput' value={password} placeholder=" old password" type={"password"} onChange={(e) => { setStatus(''); setPassword(e.target.value); }} />
      <input className='flatInput' value={newPassword} placeholder="and a new one" type={"password"} onChange={(e) => { setStatus(''); setNewPassword(e.target.value); }} />


      <button className='Button' style={{ fontSize: "15px", fontWeight: "bold" }} onClick={async () => {

        let res = await NAUTH.REST_ChangePasword(password, newPassword);
        if (res.status === "success") {
          if (onSuccess)
            onSuccess(res);
        }
        else
          setStatus(res.error);

      }}>{"Change Password"}</button>

    </div>

  )
})