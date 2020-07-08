const express = require('express');
const pino = require('pino');
const expressPino = require('express-pino-logger');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const LPAuthRouter = require('./routes/license-plate-auth');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });
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

app.use(expressLogger);

app.listen(PORT, () => {
    logger.info(`app is running on port ${PORT}`);
});
