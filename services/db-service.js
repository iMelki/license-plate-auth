const debug = require('debug')('db');
const knex = require('knex');

//Set up DB connection:
const DB_URL = process.env.DATABASE_URL || '127.0.0.1';
let db;

if (DB_URL == '127.0.0.1'){
  db = knex({
    client: 'pg',
    connection: {
      host : DB_URL,
      user : 'postgres',
      password : 'admin',
      database : 'postgres'
    }
  });
}else{
  db = knex({
    client: 'pg',
    connection: {
      connectionString : DB_URL
      //ssl = true
    }
  });
}

exports.addToDB = async function(record) {
  await db('decisions').insert(record);
}; 

exports.getAllRecords = async function() {
  return await db.select('*').from('decisions');
}; 