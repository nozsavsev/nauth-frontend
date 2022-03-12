const port = 3000
const dev = process.env.NODE_ENV !== 'production'

//misc
const { uuid, regex } = require('uuidv4');
const crypto = require('crypto')

//nextJS server
const nextjs = require('next')
const next = nextjs({ dev })
const handle = next.getRequestHandler()

//create express rest api server
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var useragent = require('express-useragent');
const cors = require('cors')

const express = require('express')
const app = express()
const server = require('http').createServer(app)

//init database
var MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb://650a328cce5542068230388e45d12cd1:35120b4c0aba424c8c33d414241f8e80@207.154.197.15:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
const client = new MongoClient(mongoURL);

const jwt = require('jsonwebtoken');
const JWT_key = "ad47eef533a2e5271b64db04ce160939cef2099550cd7c119f835e75c4a2ed06"

next.prepare().then(() => {

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

    if (!token)
      return res.json({ status: "error", message: "less data then required | request should contain token", code: "LEDATR" });

    var decodedToken = null;
    try { decodedToken = jwt.verify(token, JWT_key); } catch (err) { }

    if (!decodedToken)
      return res.json({ status: "error", message: "invalid token", code: "AUTHER" });

    await client.connect();
    const database = client.db("auth");
    const users = database.collection("users");


    var user = null;
    user = await users.findOne({ id: decodedToken.data.userId });
    if (!user) {
      //await client.close();
      return res.json({ status: "error", message: "invalid token no user found", code: "AUTHER" });
    }

    var session = user.sessionStorage.find(session => session.sessionID === decodedToken.data.sessionID);

    if (!session) {
      //await client.close();
      return res.json({ status: "error", message: "invalid token no session found", code: "AUTHER" });
    }

    //check token hash
    var decodedTokenHash = crypto.createHash(user.credentials.algorithm)
      .update(user.credentials.salt)
      .update(token)
      .update(user.credentials.salt)
      .digest('hex');

    if (session.tokenHash !== decodedTokenHash)
      return res.json({ status: "error", message: "invalid token hash missmatch", code: "AUTHER" });

    //cleanup invalid sessions
    user.sessionStorage.forEach((ses, si) => {
      if (ses.expiryDate < Date.now() && ses.sessionID !== decodedToken.data.sessionID) {
        user.sessionStorage.splice(si, 1);
      }
    });

    //update user
    await users.updateOne({ id: user.id }, { $set: { sessionStorage: user.sessionStorage } });
    //await client.close();

    req.user = user;
    req.session = session;
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

    var passwordRegex = /^[A-z0-9*()$%@#]{8,32}$/gm;
    var usernameRegex = /^[A-z0-9_]{3,32}$/gm;
    var emailRegex = /[A-z0-9\.]{1,}\@[A-z0-9-\.]{1,}\.[A-z0-9-\.]{1,}/gm;
    var data = JSON.parse(Buffer.from(req.query.data, 'base64').toString());

    //if request have all required data
    if (!data.username || !data.email || !data.password)
      return res.json({ status: "error", message: "less data then required | request should contain username", code: "LEDATR" });

    //check password validity
    if (data.password.length < 8 || data.password.length > 32 || passwordRegex.exec(data.password)?.length !== 1)
      return res.json({ status: "error", message: "password doesn't match regex (8-32 symbols [A-z0-9*()$%@#])", code: "PADMAR" });

    //check username validity
    if (data.username.length < 3 || data.username.length > 32 || usernameRegex.exec(data.username)?.length !== 1)
      return res.json({ status: "error", message: "username doesn't match regex (3-32 symbols [A-z0-9_])", code: "USDMAR" });

    //check email validity
    if (data.email.length < 3 || data.email.length > 32 || emailRegex.exec(data.email)?.length !== 1)
      return res.json({ status: "error", message: "email doesn't match regex", code: "EMDMAR" });


    await client.connect();
    const database = client.db("auth");
    const users = database.collection("users");

    //check if user with this username already exists
    if (await users.findOne({ username: data.username }) !== null) {
      //await client.close();
      return res.json({ status: "error", message: "user with this username already exists", code: "USALEX" });
    }
    //check if user with this email already exists
    if (await users.findOne({ email: data.email }) !== null) {
      //await client.close();
      return res.json({ status: "error", message: "user with this email already exists", code: "USALEX" });
    }

    //generate credentials
    var credentials = { passwordHash: "", salt: "", algorithm: "sha512" };
    credentials.salt = uuid(); //salt
    credentials.passwordHash = crypto.createHash(credentials.algorithm)
      .update(credentials.salt)
      .update(data.password)
      .update(credentials.salt)
      .digest('hex');          //hash

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
    //await client.close();

    res.json({ status: "success", message: "successfully registered user", user: user, code: "SUREUS" });
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

    var passwordRegex = /^[A-z0-9*()$%@#]{8,32}$/gm;
    var usernameRegex = /^[A-z0-9_@.]{3,32}$/gm;

    var data = JSON.parse(Buffer.from(req.query.data, 'base64').toString());



    //if request have all required data
    if (!data.username || !data.password)
      return res.json({ status: "error", message: "less data then required | request should contain username", code: "LEDATR" });

    //check password validity
    if (data.password.length < 8 || data.password.length > 32 || passwordRegex.exec(data.password)?.length !== 1)
      return res.json({ status: "error", message: "password doesn't match regex (8-32 symbols [A-z0-9*()$%@#])", code: "PADMAR" });

    //check username validity
    if (data.username.length < 3 || data.username.length > 32 || usernameRegex.exec(data.username)?.length !== 1)
      return res.json({ status: "error", message: "username doesn't match regex (3-32 symbols [A-z0-9_])", code: "USDMAR" });



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
      //await client.close();
      return res.json({ status: "error", message: "no user found", code: "NOUSFO" });
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
      //await client.close();
      return res.json({ status: "error", message: "incorrect password", code: "INPASS" });
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

    //cleanup use before sending response
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
    //await client.close();

    res.json({ status: "success", message: "successfully logged in", user: user, token: token, code: "SLOGIN" });

  })

  /*
    codes
        INVTOK - invalid token
        TOKDEC - decoded token
  */
  app.get('/api/public/AuthByToken', async function (req, res) {

    var data = JSON.parse(Buffer.from(req.query.data, 'base64').toString());

    if (!data.token)
      return res.json({ status: "error", message: "less data then required | request should contain token", code: "LEDATR" });

    await client.connect();
    const database = client.db("auth");
    const users = database.collection("users");


    var decodedToken = null;

    try { decodedToken = jwt.verify(data.token, JWT_key); } catch (err) { }

    if (!decodedToken) {
      //await client.close();
      return res.json({ status: "error", message: "invalid token", code: "INVTOK" });
    }
    var user = null;

    //findUserByID
    user = await users.findOne({ id: decodedToken.data.userId });

    if (!user) {
      //await client.close();
      return res.json({ status: "error", message: "invalid token no user found", code: "INVTOK" });
    }
    var session = user.sessionStorage.find(session => session.sessionID === decodedToken.data.sessionID);

    if (!session) {
      //await client.close();
      return res.json({ status: "error", message: "invalid token no session found", code: "INVTOK" });
    }
    //check token hash
    var decodedTokenHash = crypto.createHash(user.credentials.algorithm)
      .update(user.credentials.salt)
      .update(data.token)
      .update(user.credentials.salt)
      .digest('hex');

    if (session.tokenHash !== decodedTokenHash) {
      //await client.close();
      return res.json({ status: "error", message: "invalid token hash missmatch", code: "INVTOK" });
    }

    //generate new token
    var newToken = jwt.sign({ data: decodedToken.data, }, JWT_key, { expiresIn: 60 * 60 * 24 * 365 });//1 year expiry;

    //cleanup invalid sessions
    user.sessionStorage.forEach((ses, si) => {
      if (ses.sessionID === decodedToken.data.sessionID) {

        ses.tokenHash = crypto.createHash(user.credentials.algorithm)
          .update(user.credentials.salt)
          .update(newToken)
          .update(user.credentials.salt)
          .digest('hex');

        ses.expiryDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);//1 year expiry
      }
      else if (ses.expiryDate < Date.now()) {
        user.sessionStorage.splice(si, 1);
      }
    });

    //update user
    await users.updateOne({ id: user.id }, { $set: { sessionStorage: user.sessionStorage } });

    //cleanup user before sending response
    user.sessionStorage = user.sessionStorage.map(ses => {
      return {
        current: ses.sessionID === decodedToken.data.sessionID,
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

    //await client.close();

    res.json({ status: "success", message: "decoded token", user: user, newToken: newToken, code: "TOKDEC" });
  })


  /*
    codes
        INVSID - invalid session
        SESREV - succesfully revoked session
  */
  app.get('/api/private/revokeSession', async function (req, res) {

    var data = JSON.parse(Buffer.from(req.query.data, 'base64').toString());

    if (!data.sessionID)
      return res.json({ status: "error", message: "less data then required | request should contain sessionID", code: "LEDATR" });

    await client.connect();
    const database = client.db("auth");
    const users = database.collection("users");

    var user = req.user;
    user.sessionStorage.forEach((ses, si) => {
      if (ses.sessionID === data.sessionID) {
        user.sessionStorage.splice(si, 1);
      }
    })

    //update user
    await users.updateOne({ id: user.id }, { $set: { sessionStorage: user.sessionStorage } });
    //await client.close();

    res.json({ status: "success", message: "revoked session", code: "SESREV" });
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




  app.all('*', (req, res) => {
    handle(req, res)
  })

  server.listen(port, () => {
    console.log(`nauth! => Ready and listen on ${port}`)
  })
});
