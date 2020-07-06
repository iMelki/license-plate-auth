const express = require('express');
const bodyParser = require('body-parser');
//const debug = require('debug')('server');
//const knex = require('knex');

const indexRouter = require('./routes/index');
const LPAuthRouter = require('./routes/license-plate-auth');
/*
//Set up DB connection:
//const DB_URL = process.env.DB_URL;
const DB_URL = process.env.DATABASE_URL || '127.0.0.1';

const postgres = knex({
  client: 'pg',
  connection: {
    connectionString : DB_URL,
    ssl = true
  }
});
*/
const PORT = process.env.PORT || 3000;
const app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.use('/', indexRouter);
app.use('/license-plate-auth', LPAuthRouter);

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
});
