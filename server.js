const port = 3000
const dev = process.env.NODE_ENV !== 'production'


const { uuid } = require('uuidv4');

//nextJS server
const nextjs = require('next')
const next = nextjs({ dev })
const handle = next.getRequestHandler()

//create express rest api server
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const app = express()
const server = require('http').createServer(app)


//init database
var MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb://root:906abe19069e41fb93fe88f5d8060083@188.166.170.244:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false"
const client = new MongoClient(mongoURL);

//init firebase auth
var admin = require("firebase-admin");
var serviceAccount = require("./nozsa-com-firebase-adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});





console.log(dev)

next.prepare().then(() => {

  app.use(cors())
  app.use(cookieParser())
  app.use(bodyParser())

  app.get('/api/getCookies', async function (req, res) {
    res.json(req.cookies);
  })


  app.use('/api/private', async function (req, res, next) {

    var decoded = null;
    try {

      await admin.auth()
        .verifyIdToken(req.cookies.token).then(
          (decodedToken) => {
            decoded = decodedToken;
          })
        .catch((error) => {
          decoded = null;
        });
    } catch { };

    if (decoded == null)
      return res.json({ error: "auth-required" });

    if (decoded && !decoded.email_verified)
      return res.json({ error: "email-verefication-required" });


    await client.connect();
    const database = client.db("users");
    const users = database.collection("users");

    var user = await users.findOne({ uid: decoded?.uid });

    if (user == null) {
      await users.insertOne({ uid: decoded.uid, email: decoded.email, createdAt: new Date(), fullfilled: false, name: "", username: "", gender: "", role: "", testerGuiAllowed: false });
      user = await users.findOne({ uid: decoded.uid });
    }

    client.close();

    req.user = user;
    next();
  })


  app.get('/api/private/getUser', async function (req, res) {
    res.json(req.user);
  })


  app.get('/api/private/getUsers', async function (req, res) {

    await client.connect();
    const database = client.db("users");
    const users = database.collection("users");

    if (req.user.role === 'admin') {
      var users_data = [];
      await users.find().forEach((e) => { users_data.push(e) });
      res.json(users_data);
    }
    else {
      res.json({});
    }
  })


  //auth api requests
  app.get('/api/private/getUser', async (req, res) => {
    res.json({ status: "success", user: req.user });
  })


  app.post('/api/private/updateUser', async (req, res) => {

    if (req.user.role === 'admin')
      if (req.user.uid !== req.body.u.uid) {

        await client.connect();
        const database = client.db("users");
        const users = database.collection("users");

        console.log(req.body.u.role, req.body.u.testerGuiAllowed);

        await users.updateOne({ uid: req.body.u.uid }, { $set: { role: req.body.u.role } });
        await users.updateOne({ uid: req.body.u.uid }, { $set: { testerGuiAllowed: req.body.u.testerGuiAllowed } });
        client.close();

      }


    res.json({});
  })




  app.all('*', (req, res) => {
    handle(req, res)
  })

  server.listen(port, () => {
    console.log(`click! => Ready and listen on ${port}`)
  })
});
