//const debug = require('debug')('server');
const knex = require('knex');

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

exports.addToDB = async function(record) {
  DB_URL('decisions').insert(record);
}; 

exports.getAllRecords = async function() {
  postgres.select('*').from('decisions').then(data=>data);
}; 