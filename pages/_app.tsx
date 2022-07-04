import './global.css'

import socketIOClient, { Socket } from "socket.io-client";
import React, { useState, useEffect } from 'react'
import cookie from 'react-cookies'
import axios from 'axios';


const dev = process.env.NODE_ENV !== 'production'

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

    const NAUTH = new NAUTH_Connector();

    useEffect(() => {

        NAUTH.initialize_connection();

    }, [])


    return <>


        <Head>
            <title>NAUTH</title>
            <link rel="shortcut icon" href="/favicon.png" />
        </Head>

        <Component {...pageProps} mstore={mstore} NAUTH={NAUTH} />

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



export class NAUTH_Connector {

    private api = 'https://nauth-api.nozsa.com';//dev ? 'http://localhost:3001' : 'https://nauth-api.nozsa.com';

    //private state
    private authSocket: Socket = null;
    private disposed: boolean = false;
    private user: nauth.client.user = null;
    private session: nauth.client.session = null;
    private authStatus: boolean = false;
    private w_status: boolean = false;
    private w_type: "emailVeref" | "restoringSession" | "awaitingPasswordReset" = "restoringSession";

    private getToken(): string { return cookie.load('NAUTH_AUTHENTICATION_TOKEN') || null; }
    private setToken(value: string) {
        if (value)
            cookie.save('NAUTH_AUTHENTICATION_TOKEN', value, { path: '/', maxAge: 987987987 });
        else
            cookie.remove('NAUTH_AUTHENTICATION_TOKEN', { path: '/' });
    }


    private getWaitToken(): string { return cookie.load('NAUTH_WAIT_TOKEN') || null; }
    private setWaitToken(value: string) {

        if (value)
            cookie.save('NAUTH_WAIT_TOKEN', value, { path: '/', maxAge: 987987987 });
        else
            cookie.remove('NAUTH_WAIT_TOKEN', { path: '/', });

    }


    //public state getters
    public get CurrentUser(): nauth.client.user { return this.user; }
    public get CurrentSession(): nauth.client.session { return this.session; }
    public get AuthStatus(): boolean { return this.authStatus; }
    public get Token(): string { return this.getToken(); }
    public get wStatus(): boolean { return this.w_status; }
    public get wType(): "emailVeref" | "restoringSession" | "awaitingPasswordReset" { return this.w_type; }

    //user events
    public authSuccess: event<void, (nauth.client.user)>
    public sessionExpired: event<void, (string)>
    public newSession: event<void, (nauth.client.session)>
    public authError: event<void, (void)>
    public sessionRevoked: event<void, (void)>
    public userDeleted: event<void, (void)>
    public passwordChanged: event<void, (void)>

    public async REST_verifyEmail(token: string): Promise<{ status: "error" | "success", error: string }> {

        return (await axios.get(`${this.api}/verifyEmail?token=${token}`)).data;

    }

    public async REST_createUser(username: string, email: string, password: string): Promise<{ status: "error" | "success", error: string }> {


        let res = await axios.get(`${this.api}/register?email=${email}&username=${username}&password=${password}`);
        if (res.data.status === "success") {
            return await this.REST_Login(email, password);
        }

        return res.data;

    }

    public async REST_resendEmailVerification(email: string): Promise<{ status: "error" | "success", error: string, time?: number }> {
        let res = await axios.get(`${this.api}/resendVerificationEmail?email=${email}`);
        return res.data;
    }

    public async REST_Login(username: string, password: string): Promise<{ status: "error" | "success", error: string }> {

        let res = await axios.get(`${this.api}/Login?username=${username}&password=${password}`);

        if (res.data.status === "success") {
            this.socketAuth(res.data.token);
        }

        return res.data;
    }

    public async REST_RevokeSession(sessionId: string) {

        if (!this.authStatus) return;
        if (!sessionId) sessionId = this.session?.id;

        await axios.get(`${this.api}/private/revokeSession?sessionId=${sessionId}&token=${this.getToken()}`);
    }

    public async REST_DeleteUser(password: string): Promise<{ status: "error" | "success", error: string }> {
        return (await axios.get(`${this.api}/private/deleteUser?password=${password}&token=${this.getToken()}`)).data;
    }

    public async REST_ChangePasword(oldPassword: string, newPassword: string): Promise<{ status: "error" | "success", error: string }> {
        return (await axios.get(`${this.api}/private/changePassword?oldPassword=${oldPassword}&newPassword=${newPassword}&token=${this.getToken()}`)).data;
    }

    public async REST_RequestPasswordReset(username: string): Promise<{ status: "error" | "success", error: string }> {

        console.log("requesting password reset");

        let data = (await axios.get(`${this.api}/requestPasswordReset?username=${username}`)).data;

        console.log(data);


        if (data.status === "success") {

            this.w_status = true;
            this.w_type = "awaitingPasswordReset";

            this.setWaitToken(data.waitToken);
            this.authSocket.emit("waitForPasswordReset", { waitToken: this.getWaitToken() });
        }

        return data;
    }

    public async REST_ResetPassword(token: string, password: string, logMeIn: boolean): Promise<{ status: "error" | "success", error: string }> {
        return (await axios.get(`${this.api}/resetPassword?token=${token}&password=${password}&login=${logMeIn}`)).data;
    }

    //public actions
    public socketAuth(token: string) {

        if (token) this.setToken(token);

        if (!this.getToken()) {
            this.w_status = false;
            this.waitPasswordReset();
            return; 
        }

        this.w_status = true;
        this.w_type = "restoringSession";

        this.authSocket?.emit('auth', { token: this.getToken() });

    }

    constructor() {
        makeAutoObservable(this)

        this.authSuccess = new event<void, (nauth.client.user)>();
        this.sessionExpired = new event<void, (string)>();
        this.newSession = new event<void, (nauth.client.session)>();
        this.authError = new event<void, (void)>();
        this.sessionRevoked = new event<void, (void)>();
        this.userDeleted = new event<void, (void)>();
        this.passwordChanged = new event<void, (void)>();
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
        this.userDeleted.clearListeners();
        this.passwordChanged.clearListeners();
    }



    //socket events
    public initialize_connection() {

        if (this.authSocket) {
            this.authSocket.disconnect();
            this.authSocket = null;
        }

        this.authSocket = socketIOClient(
            this.api,
            { withCredentials: false, reconnection: false, timeout: 5000 });
        this.authSocket.on('connect', this.on_connect.bind(this));

    }

    private waitPasswordReset() {
        if (this.getWaitToken()) {
            this.w_status = true;
            this.w_type = "awaitingPasswordReset";
            this.authSocket.emit('waitForPasswordReset', { waitToken: this.getWaitToken() });
        }

    }

    private on_connect() {

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
            this.authSocket.on('userDeleted', this.on_userDeleted.bind(this));
            this.authSocket.on('waitForPasswordReset', this.on_waitForPasswordReset.bind(this));

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

    private on_authSuccess(data: { user: nauth.client.user, sessionId: string }) {

        this.w_status = false;

        this.authStatus = true;
        this.user = data.user;
        this.session = this.user.sessions.find(s => s.id === data.sessionId);

        if (this.session)
            this.session.current = true;

        this.setWaitToken(null);

        this.authSuccess.emit(data.user);
    }

    private on_authError() {
        this.w_status = false;
        this.authStatus = false;
        this.user = null;
        this.session = null;
        this.setToken(null);

        this.waitPasswordReset();

        this.authError.emit();
    }

    private on_sessionExpired(data: { sessionId: string }) {
        this.user = { ...this.user, sessions: [...this.user?.sessions.filter(s => s.id !== data.sessionId)] };
        this.sessionExpired.emit(data.sessionId);
    }

    private on_newSession(data: { session: nauth.client.session }) {
        this.user = { ...this.user, sessions: [...this.user?.sessions, data.session] };
        this.newSession.emit(data.session);
    }

    private on_sessionRevoked(data: { reason: string, sessionId: string }) {

        if (data?.reason === "passwordChanged" && data?.sessionId === this.session?.id) {
            this.user.sessions = this.user.sessions.filter(s => s.id === data.sessionId);
            return;
        }

        this.w_status = false;
        this.authStatus = false;
        this.user = null;
        this.session = null;
        this.setToken(null);

        if (data?.reason === "passwordChanged")
            this.passwordChanged.emit();

        else if (data?.reason === "userDeleted")
            this.userDeleted.emit();

        else
            this.sessionRevoked.emit();

        this.authSocket.disconnect();
    }

    private on_emailVerification(data: { user: nauth.client.user }) {
        this.user = data.user;
        this.authStatus = false;

        this.w_status = true;
        this.w_type = "emailVeref";
    }

    private on_emailVerified() {
        this.w_status = false;
        this.socketAuth(null);
    }

    private on_userDeleted() {

        this.w_status = false;
        this.authStatus = false;
        this.user = null;
        this.session = null;
        this.setToken(null);

        this.userDeleted.emit();
    }

    private on_waitForPasswordReset(data: { status: "error" | "success", token: string }) {

        this.setWaitToken(null);

        if (data.status === "success")
            this.socketAuth(data.token);

        else if (data.status === "error" && this.w_type === "awaitingPasswordReset") {
            this.w_status = false;
            this.authStatus = false;
            this.user = null;
            this.session = null;
            this.setToken('');
        }
    }
}