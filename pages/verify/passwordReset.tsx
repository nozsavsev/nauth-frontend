import axios from "axios"
import { observer } from "mobx-react"
import { useEffect, useState } from "react"
import { NAUTH_Connector } from "../_app"

const dev = process.env.NODE_ENV !== 'production'


import Lottie from "react-lottie-player";
import loading from "../../public/lottie/loading.json";
import done from "../../public/lottie/done.json";
import error from "../../public/lottie/error.json";

const IndexPage = observer(

  ({ NAUTH }: { NAUTH: NAUTH_Connector }) => {

    const [status, setStatus] = useState("Please enter new password")
    const [token, setToken] = useState("")
    const [password, setPassword] = useState("")

    const [os, setOs] = useState("")
    const [ip, setIp] = useState("")
    const [device, setDevice] = useState("")

    const [logMeIn, setLogMeIn] = useState<boolean>(false)

    useEffect(() => {
      const query = new URLSearchParams(window.location.search);
      
      setToken(query.get("token") || "")
      
      setOs(query.get("os") || "") 
      setIp(query.get("ip") || "")
      setDevice(query.get("device") || "")

    }, [])


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
            {status}
          </div>


          <input className='flatInput' type={"password"} value={password} placeholder="password" onChange={(e) => { setStatus(''); setPassword(e.target.value); }} />

          <div>
            <input className='flatInput' type={"checkbox"} checked={logMeIn} onChange={(e) => { setLogMeIn(e.target.checked); }} />
            log me on {device} {os} ({ip})
          </div>
          <button className='Button' style={{ flex: 1, width: "100%" }} onClick={async () => {

            NAUTH.REST_ResetPassword(token, password,logMeIn).then(res => {
              if (res.status === "success")
                setStatus("Password changed successfully");
              else
                setStatus(res.error)
            }).catch(err => { setStatus('unexpected error') })

          }}>Reset</button>

        </div>

      </div>
    )
  }
)
export default IndexPage;