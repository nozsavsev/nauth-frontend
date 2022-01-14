import React from 'react'
import cookie from 'react-cookies'
import { useRouter } from 'next/router'

const dev = process.env.NODE_ENV !== 'production'


export default function App() {
    const router = useRouter()

    return (
        <div className="Container" style={{ flexDirection: "column" }}>

            <div style={{ fontSize: "20px", color: "black" }}>
                by using this website <br /> you accepting this <a style={{ color: "#1c1c1c" }} href="/legal/tos">terms and conditions</a> <br />as well as <a style={{ color: "#1c1c1c" }} href="/legal/prp">privacy policy</a> <br />also this website will use cookies.
            </div>

            <button
                style={{ background: "black", color: "white", fontSize: "20px", border: "none", padding: "10px", margin: "10px", borderRadius: "10px" }}
                onClick={() => {
                    cookie.save('accepted', true, { path: "/", domain: dev ? "localhost" : ".nozsa.com" });
                    router.back()
                }}
            >Press to accept</button>
        </div>
    )
}