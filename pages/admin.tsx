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
import { nauth } from "./_app"

const IndexPage = observer(

    ({ NAUTH }: { NAUTH: NAUTH_Connector }) => {

        const [users, setUsers] = useState<nauth.client.user[]>([])

        return (
            <div className="container center" style={{ flexDirection: "column" }}>


                <button className="Button" onClick={async () => setUsers((await NAUTH.REST_GetUsers(0, 10)).users)}>Get User</button>

                <table>
                    <tbody>

                        {users.map((user: nauth.client.user) => {

                            return <tr key={user.id} >
                                <td >{user.email}</td>
                                <td>{user.username}</td>
                                <td>{user.systemAdmin ? "admin" : "user"}</td>
                                <td>{user.enabled ? "enabled" : "disabled"}</td>
                                <td><button className="Button" style={{ background: "red", border: "2px solid red" }}>Ban user</button></td>
                            </tr>

                        })}


                    </tbody>
                </table>


                <NAUTH_Component silent={false} NAUTH={NAUTH} requireAdmin={true} />
            </div>
        )
    }

)

export default IndexPage
