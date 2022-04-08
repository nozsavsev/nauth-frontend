import './global.css'

import socketIOClient, { Socket } from "socket.io-client";
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import cookie from 'react-cookies'

const dev = process.env.NODE_ENV !== 'production'

import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react"

namespace nauth {
  export namespace client {

    export interface user {
      username: string
      email: string
      sessionStorage: session[]
      id: string
    }

    export interface useragent {
      browser: string
      os: string
      platform: string
      ip: string
    }

    export interface session {
      sessionID: string
      expiryDate: string
      useragent: useragent
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
  private token = cookie.load('token');

  private setToken(token: string) {
    this.token = token;
    cookie.save("token", token, { path: "/", expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) });
  }

  //public state getters
  public getCurrentUser(): nauth.client.user { return this.user; }
  public getCurrentSession(): nauth.client.session { return this.session; }
  public getAuthStatus(): boolean { return this.authStatus; }

  //user events
  public authSuccess: event<void, (nauth.client.user)>
  public sessionExpired: event<void, (string)>
  public newSession: event<void, (nauth.client.session)>
  public authError: event<void, (void)>
  public sessionRevoked: event<void, (void)>

  //public actions
  public socketAuth(token: string) {
    this.authSocket?.emit('auth', { token: token });
  }

  public logout() {
    this.revokeSession(this.session.sessionID);
  }

  public revokeSession(sessionID: string) {
    var payload = Buffer.from(JSON.stringify({ sessionID: sessionID })).toString('base64');;
    axios.get(`${location.origin}/api/private/revokeSession?data=${payload}`).catch(err => { });
  }






  constructor() {

    this.authSuccess = new event<void, (nauth.client.user)>();
    this.sessionExpired = new event<void, (string)>();
    this.newSession = new event<void, (nauth.client.session)>();
    this.authError = new event<void, (void)>();
    this.sessionRevoked = new event<void, (void)>();

    makeAutoObservable(this)

    this.initialize_connection();
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
  private initialize_connection() {

    if (this.authSocket) {
      this.authSocket.disconnect();
      this.authSocket = null;
    }

    this.authSocket = socketIOClient(dev ? 'http://localhost:3000' : 'https://nauth.nozsa.com', { withCredentials: false, })
    this.authSocket.on('connect', this.on_connect.bind(this));
  }

  private on_connect() {
    if (this.authSocket) {

      this.authSocket.off('disconnect');
      this.authSocket.off('authSuccess');
      this.authSocket.off('authError');
      this.authSocket.off('sessionExpired');
      this.authSocket.off('newSession');
      this.authSocket.off('sessionRevoked');

      this.authSocket.on('disconnect', this.on_disconnect.bind(this));
      this.authSocket.on('authSuccess', this.on_authSuccess.bind(this));
      this.authSocket.on('authError', this.on_authError.bind(this));
      this.authSocket.on('sessionExpired', this.on_sessionExpired.bind(this));
      this.authSocket.on('newSession', this.on_newSession.bind(this));
      this.authSocket.on('sessionRevoked', this.on_sessionRevoked.bind(this));

      this.authSocket.emit('auth', { token: cookie.load('token') });
    }
  }

  private on_disconnect() {
    if (!this.disposed)
      this.initialize_connection();
  }

  private on_authSuccess(data: { user: nauth.client.user }) {
    this.authStatus = true;
    this.user = data.user;
    this.session = this.user.sessionStorage.find(s => s.current);
    this.authSuccess.emit(data.user);
  }

  private on_authError() {
    this.authStatus = false;
    this.user = null;
    this.authError.emit();
  }

  private on_sessionExpired(data: { sessionID: string }) {
    this.user = { ...this.user, sessionStorage: [...this.user?.sessionStorage.filter(s => s.sessionID !== data.sessionID)] };
    this.sessionExpired.emit(data.sessionID);
  }

  private on_newSession(data: { session: nauth.client.session }) {
    this.user = { ...this.user, sessionStorage: [...this.user?.sessionStorage, data.session] };
    this.newSession.emit(data.session);
  }

  private on_sessionRevoked() {
    this.user = null;
    this.authStatus = false;
    this.sessionRevoked.emit();
  }
}

export default function MyApp({ Component, pageProps }) {

  const NAUTH = new NAUTH_SocketConnector();

  useEffect(() => {
   
    var token = cookie.load('token');
   
    setInterval(() => {

      if (NAUTH) {
       
        var ttok = cookie.load('token');
        if(ttok !== token) {
          NAUTH.socketAuth(ttok);
          token = ttok;
        }
      }
    }, 100);
  }, [])

  return <Component {...pageProps} NAUTH={NAUTH} />
}