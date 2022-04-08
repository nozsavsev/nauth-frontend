//misc
const port = 3000
const dev = process.env.NODE_ENV !== 'production'
const { uuid, regex } = require('uuidv4');
const crypto = require('crypto')
const userAgent = require('user-agent');

//nextJS server
const nextjs = require('next')
const next = nextjs({ dev })
const handle = next.getRequestHandler()

//parcers for express
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var useragent = require('express-useragent');

//express
const cors = require('cors')
const express = require('express')
const app = express()
const server = require('http').createServer(app)

//socket io
var cookie = require("cookie") //installed from npm;
const socketIo = require("socket.io");
const io = socketIo(server);

//init database
var MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb://650a328cce5542068230388e45d12cd1:35120b4c0aba424c8c33d414241f8e80@207.154.197.15:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
const client = new MongoClient(mongoURL);

//init jsonwebtoken
const jwt = require('jsonwebtoken');
const JWT_key = "ad47eef533a2e5271b64db04ce160939cef2099550cd7c119f835e75c4a2ed06"


/*
    codes
        PASMSS - passwords are the same 
        PADMAR - new password doesn't match regex
        INPASS - incorrect password 
        PASSCH - password changed
*/

async function changePassword(password, newPassword, user, session) {

  var passwordRegex = /^[A-z0-9*()$%@#]{8,32}$/gm;

  if (password === newPassword)
    return { status: "error", message: "passwords are the same", code: "PASMSS" }

  if (newPassword.length < 8 || newPassword.length > 32 || passwordRegex.exec(newPassword.password)?.length !== 1)
    return { status: "error", message: "password doesn't match regex (8-32 symbols [A-z0-9*()$%@#])", code: "PADMAR" }



  var saltedPasswordHash = crypto.createHash(user.credentials.algorithm)
    .update(user.credentials.salt)
    .update(password)
    .update(user.credentials.salt)
    .digest('hex');

  if (saltedPasswordHash !== user.credentials.passwordHash)
    return { status: "error", message: "incorrect password", code: "INPASS" }

  user.sessionStorage.forEach((ses, si) => {
    if (ses.sessionID !== session.sessionID) {
      io.to(ses.sessionID).emit('sessionRevoked');
      io.in(ses.sessionID).socketsLeave(user.id);
      io.in(ses.sessionID).socketsLeave(ses.sessionID);

      io.to(user.id).emit('sessionExpired', { sessionID: ses.sessionID });

    }
  })



  user.sessionStorage = [session];

  user.credentials.passwordHash = crypto.createHash(user.credentials.algorithm)
    .update(user.credentials.salt)
    .update(newPassword)
    .update(user.credentials.salt)
    .digest('hex');

  //insert user to database
  await client.connect();
  const database = client.db("auth");
  const users = database.collection("users");
  await users.updateOne({ id: user.id }, { $set: { credentials: user.credentials, sessionStorage: user.sessionStorage } });

  return { status: "success", message: "password changed", code: "PASSCH" }
}




/*
codes
    USALEX - user already exists
    SUREUS - successfully registered user
    LEDATR - invalid request less data then required
    PADMAR - password doesn't match regex
    USDMAR - username doesn't match regex
    EMDMAR - email doesn't match regex
*/
async function registerUserWithEmailAndPAssword(username, email, password) {

  var passwordRegex = /^[A-z0-9*()$%@#]{8,32}$/gm;
  var usernameRegex = /^[A-z0-9_]{3,32}$/gm;
  var emailRegex = /[A-z0-9\.]{1,}\@[A-z0-9-\.]{1,}\.[A-z0-9-\.]{1,}/gm;

  var data = { username: username, email: email, password: password }

  //if request have all required data
  if (!data.username || !data.email || !data.password)
    return { status: "error", message: "less data then required | request should contain username", code: "LEDATR" }

  //check password validity
  if (data.password.length < 8 || data.password.length > 32 || passwordRegex.exec(data.password)?.length !== 1)
    return { status: "error", message: "password doesn't match regex (8-32 symbols [A-z0-9*()$%@#])", code: "PADMAR" }

  //check username validity
  if (data.username.length < 3 || data.username.length > 32 || usernameRegex.exec(data.username)?.length !== 1)
    return { status: "error", message: "username doesn't match regex (3-32 symbols [A-z0-9_])", code: "USDMAR" }

  //check email validity
  if (data.email.length < 3 || data.email.length > 32 || emailRegex.exec(data.email)?.length !== 1)
    return { status: "error", message: "email doesn't match regex", code: "EMDMAR" }




  await client.connect();
  const database = client.db("auth");
  const users = database.collection("users");

  //check if user with this username already exists
  if (await users.findOne({ username: data.username }) !== null)
    return { status: "error", message: "user with this username already exists", code: "USALEX" }

  //check if user with this email already exists
  if (await users.findOne({ email: data.email }) !== null)
    return { status: "error", message: "user with this email already exists", code: "USALEX" }


  //generate credentials
  var credentials = { passwordHash: "", salt: "", algorithm: "sha512" };
  credentials.salt = uuid(); //salt
  credentials.passwordHash = crypto.createHash(credentials.algorithm)
    .update(credentials.salt)
    .update(data.password)
    .update(credentials.salt)
    .digest('hex');//hash

  //create user object
  var user = {
    id: uuid(),
    credentials: credentials,
    username: data.username,
    email: data.email,
    providers: ["email"],
    roles: ["user", "filled"],
    sessionStorage: [],
  }

  //insert user
  await users.insertOne(user);

  return { status: "success", message: "successfully registered user", user: user, code: "SUREUS" }
}

/*
  codes
      NOUSFO - no user found
      SLOGIN - successfully logged in
      LEDATR - invalid request less data then required
      INPASS - incorrect password 
      USDMAR - username doesn't match regex
  */
async function loginWithPassword(username, password, req) {

  var passwordRegex = /^[A-z0-9*()$%@#]{8,32}$/gm;
  var usernameRegex = /^[A-z0-9_@.]{3,32}$/gm;

  var data = { username: username, password: password };

  //if request have all required data
  if (!data.username || !data.password)
    return { status: "error", message: "less data then required | request should contain username", code: "LEDATR" }

  //check password validity
  if (data.password.length < 8 || data.password.length > 32 || passwordRegex.exec(data.password)?.length !== 1)
    return { status: "error", message: "password doesn't match regex (8-32 symbols [A-z0-9*()$%@#])", code: "PADMAR" }

  //check username validity
  if (data.username.length < 3 || data.username.length > 32 || usernameRegex.exec(data.username)?.length !== 1)
    return { status: "error", message: "username doesn't match regex (3-32 symbols [A-z0-9_])", code: "USDMAR" }

  await client.connect();
  const database = client.db("auth");
  const users = database.collection("users");

  var user = null;

  //determine what to use email or username
  if (data.username.includes("@"))
    user = await users.findOne({ email: data.username });
  else
    user = await users.findOne({ username: data.username });

  //check if user exists
  if (!user) {
    return { status: "error", message: "no user found", code: "NOUSFO" }
  }



  //generate credentials
  var credentials = user.credentials;

  //generate hash from incoming password
  var incomingPasswordHash = crypto.createHash(credentials.algorithm)
    .update(credentials.salt)
    .update(data.password)
    .update(credentials.salt)
    .digest('hex');

  //compare hashes
  if (incomingPasswordHash !== credentials.passwordHash) {
    return { status: "error", message: "incorrect password", code: "INPASS" }
  }


  //generate token 
  var sessionID = uuid();
  var token = jwt.sign({ data: { userId: user.id, sessionID: sessionID }, }, JWT_key, { expiresIn: 60 * 60 * 24 * 365 });//1year expiry

  var tokenHash = crypto.createHash(credentials.algorithm)
    .update(credentials.salt)
    .update(token)
    .update(credentials.salt)
    .digest('hex');

  //generate session
  var mongo_session = {
    tokenHash: tokenHash,
    sessionID: sessionID,
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),//2m expiry
    useragent: { browser: req.useragent.browser, os: req.useragent.os, platform: req.useragent.platform, ip: req.socket.remoteAddress },
  }

  //add session to user
  user.sessionStorage.push(mongo_session);

  //update user
  await users.updateOne({ id: user.id }, { $set: { sessionStorage: user.sessionStorage } });

  //cleanup user before sending response
  user.sessionStorage = user.sessionStorage.map(ses => {
    return {
      current: ses.sessionID === mongo_session.sessionID,
      sessionID: ses.sessionID,
      expiryDate: ses.expiryDate,
      useragent: ses.useragent,
    };
  });

  user = {
    username: user.username,
    email: user.email,
    sessionStorage: user.sessionStorage,
    id: user.id,
  }

  io.to(user.id).emit("newSession", { session: { sessionID: mongo_session.sessionID, useragent: mongo_session.useragent, current: false } });

  return { status: "success", message: "successfully logged in", user: user, token: token, code: "SLOGIN" }
}

/*
  codes
      INVTOK - invalid token
      TOKDEC - decoded token
*/
async function authByToken(token, noCleanup = false) {

  if (!token)
    return { status: "error", message: "less data then required | request should contain token", code: "LEDATR" }

  await client.connect();
  const database = client.db("auth");
  const users = database.collection("users");

  var decodedToken = null;

  try { decodedToken = jwt.verify(token, JWT_key); } catch (err) { }

  if (!decodedToken) {
    return { status: "error", message: "invalid token", code: "INVTOK" }
  }
  var user = null;

  //findUserByID
  user = await users.findOne({ id: decodedToken.data.userId });

  if (!user) {
    return { status: "error", message: "invalid token no user found", code: "INVTOK" }
  }
  var session = user.sessionStorage.find(session => session.sessionID === decodedToken.data.sessionID);

  if (!session)
    return { status: "error", message: "invalid token no session found", code: "INVTOK" }

  //check token hash
  var decodedTokenHash = crypto.createHash(user.credentials.algorithm)
    .update(user.credentials.salt)
    .update(token)
    .update(user.credentials.salt)
    .digest('hex');

  if (session.tokenHash !== decodedTokenHash) {

    return { status: "error", message: "invalid token hash missmatch", code: "INVTOK" }
  }

  //cleanup invalid sessions
  user.sessionStorage.forEach((ses, si) => {
    if (ses.expiryDate < Date.now() && ses.sessionID !== decodedToken.data.sessionID) {
      user.sessionStorage.splice(si, 1);
    }
  });

  //update user
  await users.updateOne({ id: user.id }, { $set: { sessionStorage: user.sessionStorage } });

  if (noCleanup)
    return { status: "success", message: "decoded token", user: user, session: session, code: "TOKDEC" }


  //cleanup user before sending response
  user.sessionStorage = user.sessionStorage.map(ses => {
    return {
      current: ses.sessionID === decodedToken.data.sessionID,
      sessionID: ses.sessionID,
      expiryDate: ses.expiryDate,
      useragent: ses.useragent,
    };
  });

  session = {
    sessionID: session.sessionID,
    expiryDate: session.expiryDate,
    useragent: session.useragent,
  }

  user = {
    username: user.username,
    email: user.email,
    sessionStorage: user.sessionStorage,
    id: user.id,
  }

  return { status: "success", message: "decoded token", user: user, session: session, code: "TOKDEC" }
}

/*
  codes              
      LEDATR - invalid request less data then required
      INVSID - invalid session
      SESREV - succesfully revoked session
*/
async function revokeSession(user, sessionID) {

  if (!sessionID)
    return { status: "error", message: "less data then required | request should contain sessionID", code: "LEDATR" }

  await client.connect();
  const database = client.db("auth");
  const users = database.collection("users");

  var foundAny = false;
  user.sessionStorage.forEach((ses, si) => {
    if (ses.sessionID === sessionID) {
      user.sessionStorage.splice(si, 1);
      foundAny = true;
    }
  })

  if (foundAny) {

    //update user
    await users.updateOne({ id: user.id }, { $set: { sessionStorage: user.sessionStorage } });

    //send socket notification
    io.to(sessionID).emit('sessionRevoked');
    io.in(sessionID).socketsLeave(user.id);
    io.in(sessionID).socketsLeave(sessionID);

    io.to(user.id).emit('sessionExpired', { sessionID: sessionID });

    return { status: "success", message: "revoked session", code: "SESREV" }
  }
  return { status: "error", message: "no session found", code: "INVSID" }
}


next.prepare().then(() => {

  //socket-io for realtime
  io.on('connection', async (socket) => {

    console.log("connect");

    socket.on('auth', async (data) => {

      var token = data.token;
      var auth = await authByToken(token, true);

      if (auth.code === "TOKDEC") {

        socket.join(auth.user.id);
        socket.join(auth.session.sessionID);

        socket.auth = { authentificated: true, userID: auth.user.id, sessionID: auth.session.sessionID };

        auth.user.sessionStorage = auth.user.sessionStorage.map(ses => {
          return {
            current: ses.sessionID === auth.session.sessionID,
            sessionID: ses.sessionID,
            expiryDate: ses.expiryDate,
            useragent: ses.useragent,
          };
        });

        auth.session = {
          sessionID: auth.session.sessionID,
          expiryDate: auth.session.expiryDate,
          useragent: auth.session.useragent,
        }

        auth.user = {
          username: auth.user.username,
          email: auth.user.email,
          sessionStorage: auth.user.sessionStorage,
          id: auth.user.id,
        }


        socket.emit('authSuccess', { user: auth.user, session: auth.session });
      }
      else {
        socket.emit('authError', auth);
      }
    })

    socket.on('disconnect', () => {
      console.log("disconnect");
    })

  });

  app.use(cors())
  app.use(cookieParser())
  app.use(bodyParser())
  app.use(useragent.express());

  /*
  codes
      SMAINT - server is on active maintenance
  */
  app.use('/api', async function (req, res, next) {
    //check maintenance
    next();
  })

  /*
  codes
      LEDATR - login failed due to incorrect data
      AUTHER - auth error
      ACCDEN - acess deny error
  */
  app.use('/api/private', async function (req, res, next) {

    token = req.cookies.token;

    var retval = await authByToken(token, true)
    if (retval.code !== "TOKDEC")
      return res.json(retval);

    req.user = retval.user;
    req.session = retval.session;
    next();
  })

  /*
  codes
      USALEX - user already exists
      SUREUS - successfully registered user
      LEDATR - invalid request less data then required
      PADMAR - password doesn't match regex
      USDMAR - username doesn't match regex
      EMDMAR - email doesn't match regex
  */
  app.get('/api/public/registerUserWithEmail', async function (req, res) {
    var data = JSON.parse(Buffer.from(req.query.data, 'base64').toString());
    return res.json(await registerUserWithEmailAndPAssword(data.username, data.email, data.password, data.password));
  })

  /*
    codes
        NOUSFO - no user found
        SLOGIN - successfully logged in
        LEDATR - invalid request less data then required
        INPASS - incorrect password 
        USDMAR - username doesn't match regex
    */
  app.get('/api/public/LoginWithPassword', async function (req, res) {
    var data = JSON.parse(Buffer.from(req.query.data, 'base64').toString());
    return res.json(await loginWithPassword(data.username, data.password, req));
  })

  app.get('/api/private/ChangePassword', async function (req, res) {
    var data = JSON.parse(Buffer.from(req.query.data, 'base64').toString());
    return res.json(await changePassword(data.password, data.newPassword, req.user, req.session));
  })

  /*
    codes
        INVTOK - invalid token
        TOKDEC - decoded token
  */
  app.get('/api/public/AuthByToken', async function (req, res) {
    var data = JSON.parse(Buffer.from(req.query.data, 'base64').toString());
    return res.json(await authByToken(data.token, false));
  })

  /*
    codes
        INVSID - invalid session
        SESREV - succesfully revoked session
  */
  app.get('/api/private/revokeSession', async function (req, res) {
    var data = JSON.parse(Buffer.from(req.query.data, 'base64').toString());
    res.json(await revokeSession(req.user, data.sessionID));
  })

  /*
    codes
        SESFET - succesfully fetched session
  */
  app.get('/api/private/getSessions', async function (req, res) {

    req.user.sessionStorage = req.user.sessionStorage.map(ses => {
      return {
        current: ses.sessionID === req.session.sessionID,
        sessionID: ses.sessionID,
        expiryDate: ses.expiryDate,
        useragent: ses.useragent,
      };
    });

    res.json({ status: "success", sessions: req.user.sessionStorage, code: "SESFET" });
  })





  app.use('/api/private/admin', async function (req, res) {

    if (req.user.roles.contains("admin"))
      next();
    else
      res.json({ status: "error", message: "access denied", code: "ACCDEN" });

  })








  app.all('*', (req, res) => {
    handle(req, res)
  })

  server.listen(port, () => {
    console.log(`nauth! => Ready and listen on ${port}`)
  })
});