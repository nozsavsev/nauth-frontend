const dev = process.env.NODE_ENV !== 'production'

import cookie from 'react-cookies'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { NAUTH_Login } from '../nauth/gui/nauthGUI';
import axios from 'axios';

export default function Page({ user, users }) {

    const router = useRouter()
    const [location, setLocation] = useState(null);
    const [darkMode, setDarkMode] = useState(true);
    const [Back, setBack] = useState(null);

    useEffect(() => {
        setLocation(window.location);

        if (!cookie.load('accepted')) {
            router.push('/legal/accept');
        }

        if (user.role !== 'admin')
            router.push('/Login');

        var params = (new URL(document.location)).searchParams;

        setDarkMode(true);

        console.log(users);

        setBack(params.get("back"));
    }, []);

    return (
        <div className="Container" style={{ flexDirection: "column", backgroundColor: "black" }}>

            {
                user.role !== 'admin' ? <div /> :
                    <div style={{ background: "#1c1c1c", overflow: "scroll", color: "white", display: "flex", alignItems: 'center', flexDirection: "column", maxHeight: "80%" }}>
                        {
                            users.map((u) => {


                                return (<div key={u.email} style={{ background: "#2c2c2c", margin: "10px", padding: "10px", display: "flex", flexDirection: "column", }}>

                                    {u.email} {u.role}

                                    <button style={{ marginTop: "20px", marginLeft: "10px", padding: "10px", borderRadius: "10px", width: "300px" }}

                                        onClick={() => {

                                            u.role = u.role === 'admin' ? '' : 'admin'

                                            axios.post('https://nauth.nozsa.com/api/private/updateUser', { u });

                                        }}>
                                        {u.role === 'admin' ? 'demote' : 'promote'}
                                    </button>

                                    <button style={{ marginLeft: "10px", margin: "10px", padding: "10px", borderRadius: "10px", width: "300px" }}
                                        onClick={() => {
                                            u.testerGuiAllowed = u.testerGuiAllowed === 'true' ? 'false' : 'true'

                                            axios.post('https://nauth.nozsa.com/api/private/updateUser', { u });
                                        }}>
                                        {u.testerGuiAllowed === 'true' ? 'Deny testerGUI' : 'Allow testerGUI'}
                                    </button>

                                </div>);



                            })
                        }
                    </div>
            }



        </div>
    )
}





export async function getServerSideProps(context) {

    const { req } = context;


    var rrr = null;

    await axios.get('https://nauth.nozsa.com/api/private/getUser', {
        headers: {
            Cookie: `token=${req.cookies.token}`
        }
    }).then(res => {
        rrr = res.data;
    });


    var usersss = [];


    await axios.get('https://nauth.nozsa.com/api/private/getUsers', {
        headers: {
            Cookie: `token=${req.cookies.token}`
        }
    }).then(res => {
        usersss = res.data;
    }).catch(() => { });

    return {
        props: { user: rrr, users: usersss },
    }
}