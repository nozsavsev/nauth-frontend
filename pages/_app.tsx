import './global.css'

import socketIOClient, { Socket } from "socket.io-client";
import React, { useState, useEffect } from 'react'
import axios from 'axios';

const dev = process.env.NODE_ENV !== 'production'

const api = dev ? 'http://localhost:3001' : 'https://nauth-api.nozsa.com';

function BiMoon(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1.5em" width="1.5em" {...props}><path d="M20.742,13.045c-0.677,0.18-1.376,0.271-2.077,0.271c-2.135,0-4.14-0.83-5.646-2.336c-2.008-2.008-2.799-4.967-2.064-7.723 c0.092-0.345-0.007-0.713-0.259-0.965C10.444,2.04,10.077,1.938,9.73,2.034C8.028,2.489,6.476,3.382,5.241,4.616 c-3.898,3.898-3.898,10.243,0,14.143c1.889,1.889,4.401,2.93,7.072,2.93c2.671,0,5.182-1.04,7.07-2.929 c1.236-1.237,2.13-2.791,2.583-4.491c0.092-0.345-0.008-0.713-0.26-0.965C21.454,13.051,21.085,12.951,20.742,13.045z M17.97,17.346c-1.511,1.511-3.52,2.343-5.656,2.343c-2.137,0-4.146-0.833-5.658-2.344c-3.118-3.119-3.118-8.195,0-11.314 c0.602-0.602,1.298-1.102,2.06-1.483c-0.222,2.885,0.814,5.772,2.89,7.848c2.068,2.069,4.927,3.12,7.848,2.891 C19.072,16.046,18.571,16.743,17.97,17.346z" /></svg>;
}

function BiSun(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1.5em" width="1.5em" {...props}><path d="M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19H12.998V22H10.998zM10.998 2H12.998V5H10.998zM1.998 11H4.998V13H1.998zM18.998 11H21.998V13H18.998z" /><path transform="rotate(-45.017 5.986 18.01)" d="M4.487 17.01H7.487V19.01H4.487z" /><path transform="rotate(-45.001 18.008 5.99)" d="M16.508 4.99H19.509V6.99H16.508z" /><path transform="rotate(-134.983 5.988 5.99)" d="M4.487 4.99H7.487V6.99H4.487z" /><path transform="rotate(134.999 18.008 18.01)" d="M17.008 16.51H19.008V19.511000000000003H17.008z" /></svg>;
}








import { makeAutoObservable } from "mobx";
import { makePersistable } from 'mobx-persist-store';
import Head from 'next/head';

export class MainStore {

    public _theme: ("light" | "dark") = 'light';
    get theme() { return this._theme }
    set theme(value: "light" | "dark") { this._theme = value }


    constructor() {
        makeAutoObservable(this);
        if (typeof window !== "undefined") {
            makePersistable(this, { name: 'VisualStore', properties: ['_theme'], storage: localStorage });
        }
    }

}


export default function MyApp({ Component, pageProps }) {

    const mstore = new MainStore();

    const NAUTH_Socket = new NAUTH_SocketConnector();

    useEffect(() => {

        NAUTH_Socket.initialize_connection();

    }, [])


    return <>


        <Head>
            <title>NAUTH</title>
            <link rel="shortcut icon" href="/favicon.png" />
        </Head>

        <Component {...pageProps} mstore={mstore} NAUTH_Socket={NAUTH_Socket} />

    </>
}





namespace nauth {
    export namespace client {

        export interface user {
            id: string

            username: string
            email: string

            emailVerified: Boolean
            systemAdmin: Boolean

            sessions: session[]
        }

        export interface session {

            id: string

            os: String
            device: String
            ip: String
            createDate: Date
            current: boolean
        }
    }


}


class event<R, A> {
    private callback_storage: ((arg: A) => R)[] = []

    emit(arg: A) { this.callback_storage.forEach(c => { c(arg); }) }
    clearListeners() { this.callback_storage = []; }
    addLIstner(callback: (arg: A) => R) { this.callback_storage.push(callback); }
    removeListener(callback: (arg: A) => R) { this.callback_storage = this.callback_storage.filter(c => c !== callback); }
}

export class NAUTH_SocketConnector {

    //private state
    private authSocket: Socket = null;
    private disposed: boolean = false;
    private user: nauth.client.user = null;
    private session: nauth.client.session = null;
    private authStatus: boolean = false;
    public status_working: boolean = false;
    public type_working: "emailVeref" | "restoringSession" = "restoringSession";
    public token: string = null;

    //public state getters
    public get CurrentUser(): nauth.client.user { return this.user; }
    public get CurrentSession(): nauth.client.session { return this.session; }
    public get AuthStatus(): boolean { return this.authStatus; }


    //user events
    public authSuccess: event<void, (nauth.client.user)>
    public sessionExpired: event<void, (string)>
    public newSession: event<void, (nauth.client.session)>
    public authError: event<void, (void)>
    public sessionRevoked: event<void, (void)>

    //public actions
    public socketAuth(token: string) {

        if (token)
            this.token = token;

        this.status_working = true;
        this.type_working = "restoringSession";

        this.authSocket?.emit('auth', { token: this.token });
    }

    constructor() {
        makeAutoObservable(this)

        this.authSuccess = new event<void, (nauth.client.user)>();
        this.sessionExpired = new event<void, (string)>();
        this.newSession = new event<void, (nauth.client.session)>();
        this.authError = new event<void, (void)>();
        this.sessionRevoked = new event<void, (void)>();

        if (typeof window !== "undefined") {
            makePersistable(this, { name: 'NAUTH_Credentials_Store', properties: ['token'], storage: localStorage });
        }

    }

    dispose() {
        this.disposed = true;
        this.authSocket.disconnect();
        this.authSocket = null;
        this.authStatus = false;
        this.user = null;

        this.authSuccess.clearListeners();
        this.authError.clearListeners();
        this.sessionExpired.clearListeners();
        this.newSession.clearListeners();
        this.sessionRevoked.clearListeners();
    }

    //socket events
    public initialize_connection() {

        if (this.authSocket) {
            this.authSocket.disconnect();
            this.authSocket = null;
        }

        this.authSocket = socketIOClient(
            api,
            { withCredentials: false, reconnection: false, timeout: 5000 });
        console.log("connecting");

        this.authSocket.on('connect', this.on_connect.bind(this));

    }

    private on_connect() {

        console.log("connect");

        if (this.authSocket) {

            this.authSocket.removeAllListeners();

            this.authSocket.on('disconnect', this.on_disconnect.bind(this));
            this.authSocket.on('authSuccess', this.on_authSuccess.bind(this));
            this.authSocket.on('authError', this.on_authError.bind(this));
            this.authSocket.on('sessionExpired', this.on_sessionExpired.bind(this));
            this.authSocket.on('newSession', this.on_newSession.bind(this));
            this.authSocket.on('sessionRevoked', this.on_sessionRevoked.bind(this));
            this.authSocket.on('emailVerification', this.on_emailVerification.bind(this));
            this.authSocket.on('emailVerified', this.on_emailVerified.bind(this));

            console.log('auth');

            this.socketAuth(null);
        }
    }

    private on_disconnect() {

        if (this.authSocket) {
            this.authSocket.disconnect();
            this.authSocket = null;
        }

        this.user = null;
        this.authStatus = false;
        this.session = null;

        if (!this.disposed)
            this.initialize_connection();
    }

    private on_authSuccess(data: { user: nauth.client.user, sessionID: string }) {

        this.status_working = false;

        this.authStatus = true;
        this.user = data.user;
        this.session = this.user.sessions.find(s => s.id === data.sessionID);

        if (this.session)
            this.session.current = true;

        this.authSuccess.emit(data.user);
    }

    private on_authError() {

        this.status_working = false;
        this.authStatus = false;
        this.user = null;
        this.session = null;
        this.authError.emit();
    }

    private on_sessionExpired(data: { sessionID: string }) {
        this.user = { ...this.user, sessions: [...this.user?.sessions.filter(s => s.id !== data.sessionID)] };
        this.sessionExpired.emit(data.sessionID);
    }

    private on_newSession(data: { session: nauth.client.session }) {
        this.user = { ...this.user, sessions: [...this.user?.sessions, data.session] };
        this.newSession.emit(data.session);
    }

    private on_sessionRevoked() {
        this.user = null;
        this.authStatus = false;
        this.sessionRevoked.emit();
        this.authSocket.disconnect();
    }

    private on_emailVerification(data: { user: nauth.client.user }) {
        this.user = data.user;
        this.authStatus = false;

        this.status_working = true;
        this.type_working = "emailVeref";
    }

    private on_emailVerified() {
        this.status_working = false;
        this.socketAuth(null);
    }


}