const express = require('express');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const LPAuthRouter = require('./routes/license-plate-auth');

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
