
var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : '25',
  host     : 'database',
  database : 'plance',
  user     : 'root',
  password : 'rootroot'
});

module.exports = pool;