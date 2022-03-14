import './global.css'

import socketIOClient from "socket.io-client";
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import cookie from 'react-cookies'

const dev = process.env.NODE_ENV !== 'production'

export default function MyApp({ Component, pageProps }) {

  const [socket, setSocket] = useState(null)
  const [authStatus, setAuthStatus] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {

    axios.get(`${window.location.origin}/api/private/getSessions`).then(res => {
      if (res.data.code === "SESFET")
        setUser(res.data.user);
    }).catch(err => { });

  }, [])

  useEffect(() => {

    if (!socket) {

      console.log(window.location.origin)

      var _socket = socketIOClient(dev ? 'http://localhost:3000' : 'https://nauth.nozsa.com', { withCredentials: true, });

      setSocket(_socket);

      _socket.on('connect', e => {
        _socket.emit('auth', { token: cookie.load('token') });
        console.log('connect');
        setSocket(_socket)
      })
      _socket.on('disconnect', e => {
        _socket?.disconnect();
        setSocket(null)
      })
    }

    if (socket) {
      socket.on('authSuccess', (data) => {
        setAuthStatus(true);
        setUser(data.user);
      })

      socket.on('authError', (data) => {
        setAuthStatus(false);
        setUser(null);
      })

      socket.on('sessionExpired', (data) => {
        setUser({ ...user, sessionStorage: [...user?.sessionStorage.filter(s => s.sessionID !== data.sessionID)] });
      })

      socket.on('newSession', (data) => {
        setUser({ ...user, sessionStorage: [...user?.sessionStorage, data.session] });
      })

      socket.on('sessionRevoked', (data) => {
        setAuthStatus(false);
        setUser(null);
      })

      return () => {
        socket.off('authSuccess')
        socket.off('authError')
        socket.off('sessionExpired')
        socket.off('newSession')
        socket.off('sessionRevoked')
      }
    }

  }, [socket, user, authStatus])



  return <Component
    {...pageProps}
    socket={socket}
    authStatus={authStatus}
    user={user}
    setAuthStatus={(s) => { setAuthStatus(s) }}
    setUser={(s) => { setUser(s) }}
  />
}