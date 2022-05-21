import { useEffect, useState } from "react"

import { MainStore } from "../_app"
import { observer } from "mobx-react"
import { lightTheme, darkTheme } from "../../themes/defaultThemes"
import { LinkButton, ThemeSelector } from "../../components/components"

const IndexPage = observer(
    
    ({ mstore }: { mstore: MainStore }) => {
    
    var currentTheme = mstore.theme === "light" ? lightTheme : darkTheme; 

    return (
        <div className="container center" style={{ userSelect: "none", flexDirection: "column", fontSize: 40, textAlign: "left", backgroundColor: currentTheme.background }}>
            
            <ThemeSelector visual={mstore} />

            <img src={currentTheme.logoTagline} style={{ objectFit: "contain", height: "25%", width: "25%" }} />
            <div style={{ display: "flex", fontSize: 20, fontWeight: "bold" }}>
                <LinkButton link="/legal/prp" theme={mstore.theme}>Privacy policy</LinkButton>
                <LinkButton link="/legal/tos" theme={mstore.theme}>Terms of usage</LinkButton>
            </div>
        </div>
    )
}

)

export default IndexPage;