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

const layout = [
    {
        lt: `\`!@#$%^&*()_+`,
        rt: `  "№; :?     `,
        lb: "~1234567890-=",
        rb: "Ё            ",
    },

    {
        lt: `QWERTYUIOP{}`,
        rt: `            `,
        lb: `          []`,
        rb: `ЙЦУКЕНГШЩЗХЪ`,
    },

    {
        lt: ` ASDFGHJKL:"|`,
        rt: `            /`,
        lb: `          ;'\\`,
        rb: ` ФЫВАПРОЛДЖЭ `,
    },

    {
        lt: `ZXCVBNM<>?`,
        rt: `          `,
        lb: `        ./`,
        rb: `ЯЧСМИТЬБЮ.`,
    },

]


const IndexPage = observer(

    ({ NAUTH }: { NAUTH: NAUTH_Connector }) => {

        const [users, setUsers] = useState<nauth.client.user[]>([])

        return (
            <div className="container center" style={{ flexDirection: "column" }}>

                {
                    layout.map((l) => {


                        return <div style={{ display: "flex", flexDirection: "row" }}>

                            {
                                l.lb.split('').map((row, i) => {

                                    return <Key
                                        lt={l.lt[i]}
                                        rt={l.rt[i]}
                                        lb={l.lb[i]}
                                        rb={l.rb[i]}
                                    />
                                })}
                        </div>


                    })


                }

            </div>
        )
    }

)

export default IndexPage

const Key = observer(({ lt, lb, rt, rb }: { lt: string, lb: string, rt: string, rb: string }) => {

    return <div style={{
        display: "flex",
        margin: "5px",
        justifyContent: "space-between",
        flexDirection: "column",
        padding: "7px 10px 7px 10px",
        border: (lt === lb && lt === rt && lt === rb) ? "2px solid transparent" : "2px solid black",
        borderRadius: "7px",
        background: (lt === lb && lt === rt && lt === rb) ? "transparent" : "transparent",

        width: "44px",
        height: "50px"
    }}>

        <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "row" }}>
            <div>
                {lt}
            </div>
            <div>
                {rt}
            </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "row" }}>
            <div>
                {lb}
            </div>
            <div>
                {rb}
            </div>
        </div>

    </div>
})