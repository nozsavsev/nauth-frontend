import axios from "axios"
import { observer } from "mobx-react"
import { useEffect, useState } from "react"
import { NAUTH_Connector } from "../_app"

const dev = process.env.NODE_ENV !== 'production'


import Lottie from "lottie-react";
import loading from "../../public/lottie/loading.json";
import done from "../../public/lottie/done.json";
import error from "../../public/lottie/error.json";

const IndexPage = observer(

  ({ NAUTH }: { NAUTH: NAUTH_Connector }) => {

    const [status, setStatus] = useState("Verifing email")

    useEffect(() => {
      const token = window.location.href.split("?token=")[1]
      NAUTH.REST_verifyEmail(token).then(res => {
        if (res.status === 'success') {

          setStatus("Email verified")
        }
        else {
          setStatus("Error")
        }
      });
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



          <div >
            {
              status === "Email verified" ? <Lottie animationData={done} loop={false} /> :
                status === "Error" ? <Lottie animationData={error} loop={false} /> : <Lottie animationData={loading} loop={true} />
            }
          </div>

        </div>

      </div>
    )
  }
)
export default IndexPage;