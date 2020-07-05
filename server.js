const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('server');
const knex = require('knex');

const indexRouter = require('./routes/index');
const LPAuthRouter = require('./routes/license-plate-auth');

//Set up DB connection:
const DB_URL = process.env.DB_URL;
DB_URL = '127.0.0.1';

const postgres = knex({
  client: 'pg',
  connection: {
    host : DB_URL,
    user : 'postgres',
    password : 'admin',
    database : 'license-plate-auth'
  }
});

const PORT = process.env.PORT;
const app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.use('/', indexRouter);
app.use('/license-plate-auth', LPAuthRouter);

// app.get('/', (req, res) => {
//     res.send('Hi');
// });

app.listen(PORT, () => {
    debug("Hi");
    console.log(`app is running on port ${PORT}`);
});
