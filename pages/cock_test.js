import React, { useState, useEffect } from 'react'

import cookie from 'react-cookies'

export default function Page() {

    const [location, setLocation] = useState(null);

    const [Name, setName] = useState(null);
    const [Value, setValue] = useState(null);
    const [Path, setPath] = useState(null);
    const [Domain, setDomain] = useState(null);

    useEffect(() => {
        setLocation(window.location);
    }, []);


    return (
        <div className="Container" style={{ flexDirection: "column" }}>


            <div>
                <input type={"text"} value={Name} onChange={(e) => { setName(e.target.value) }} placeholder='name' />
                <input type={"text"} value={Value} onChange={(e) => { setValue(e.target.value) }} placeholder='value' />
                <input type={"text"} value={Path} onChange={(e) => { setPath(e.target.value) }} placeholder='path' />
                <input type={"text"} value={Domain} onChange={(e) => { setDomain(e.target.value) }} placeholder='domain' />
            </div>


            <button
                onClick={() => {

                    console.log(Name, Value, Path, Domain);

                    cookie.save(Name, Value, { path: Path, domain: Domain });

                }}
            >set</button>



        </div>
    )
}