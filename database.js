
var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : '25',
  host     : 'localhost',
  database : 'plance',
  user     : 'user',
  password : 'password'
});

module.exports = pool;