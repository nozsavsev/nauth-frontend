

import { observer } from "mobx-react";
import { MainStore } from "../pages/_app";
import { lightTheme, darkTheme } from "../themes/defaultThemes"

export const LinkButton = (
    { children,
        link,
        theme = "light",
        background = "accent",
        color = "accentContent",
    }: {
        children?: any,
        link?: string,
        theme?: ("light" | "dark"),
        background?: ("accent" | "red" | "green" | "blue" | "darkBlue"),
        color?: ("accentContent" | "content" | "red" | "green" | "blue" | "darkBlue"),
    }
) => {

    const CurrentTheme = theme === "light" ? lightTheme : darkTheme;

    return <a
        href={link}
        style={{
            color: CurrentTheme[color],
            background: CurrentTheme[background],
            textDecoration: "none",
            transition: "0.1s",
            padding: "1rem",
            margin: "1rem",
            borderRadius: "0.5rem"
        }}
    >
        {children}
    </a>
}


export const ThemeSelector = observer(({ visual }: { visual: MainStore }) => {

    const CurrentTheme = visual.theme === "light" ? lightTheme : darkTheme;

    return <div style={{ userSelect: "none", fontSize: 40 }} onClick={() => { visual.theme = visual.theme == "dark" ? "light" : "dark" }}>
        {
            visual.theme === "light" ?
                <BiMoon style={{ cursor: "pointer", margin: "10px", color: CurrentTheme.content }} /> :
                <BiSun style={{ cursor: "pointer", margin: "10px", color: CurrentTheme.content }} />
        }
    </div>
})

function BiMoon(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M20.742,13.045c-0.677,0.18-1.376,0.271-2.077,0.271c-2.135,0-4.14-0.83-5.646-2.336c-2.008-2.008-2.799-4.967-2.064-7.723 c0.092-0.345-0.007-0.713-0.259-0.965C10.444,2.04,10.077,1.938,9.73,2.034C8.028,2.489,6.476,3.382,5.241,4.616 c-3.898,3.898-3.898,10.243,0,14.143c1.889,1.889,4.401,2.93,7.072,2.93c2.671,0,5.182-1.04,7.07-2.929 c1.236-1.237,2.13-2.791,2.583-4.491c0.092-0.345-0.008-0.713-0.26-0.965C21.454,13.051,21.085,12.951,20.742,13.045z M17.97,17.346c-1.511,1.511-3.52,2.343-5.656,2.343c-2.137,0-4.146-0.833-5.658-2.344c-3.118-3.119-3.118-8.195,0-11.314 c0.602-0.602,1.298-1.102,2.06-1.483c-0.222,2.885,0.814,5.772,2.89,7.848c2.068,2.069,4.927,3.12,7.848,2.891 C19.072,16.046,18.571,16.743,17.97,17.346z" /></svg>;
}

function BiSun(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19H12.998V22H10.998zM10.998 2H12.998V5H10.998zM1.998 11H4.998V13H1.998zM18.998 11H21.998V13H18.998z" /><path transform="rotate(-45.017 5.986 18.01)" d="M4.487 17.01H7.487V19.01H4.487z" /><path transform="rotate(-45.001 18.008 5.99)" d="M16.508 4.99H19.509V6.99H16.508z" /><path transform="rotate(-134.983 5.988 5.99)" d="M4.487 4.99H7.487V6.99H4.487z" /><path transform="rotate(134.999 18.008 18.01)" d="M17.008 16.51H19.008V19.511000000000003H17.008z" /></svg>;
}
