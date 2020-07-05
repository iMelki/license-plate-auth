const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('server');

const indexRouter = require('./routes/index');
const LPAuthRouter = require('./routes/license-plate-auth');

const app = express();

//TODO: Set up DB connection

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

app.listen(3000, () => {
    debug("Hi");
    console.log('app is running on port 3000');
});
