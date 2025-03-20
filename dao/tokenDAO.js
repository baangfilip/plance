var pool = require('../database');

var tokenTypes = {
  "resetPasswordToken": 1
}

exports.saveResetPasswordToken = function(userid, token, salt, callback) {//
  var sql = "INSERT INTO token (userid, tokentype, salt, token) VALUES ("+userid+", "+tokenTypes.resetPasswordToken+", '"+salt+"', '"+token+"')";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

exports.getResetPasswordTokenForUserID = function(userid, token, callback){
  var sql = "SELECT * FROM token WHERE userid = ? AND token = ? AND tokentype = " + tokenTypes.resetPasswordToken;
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [userid, token], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

exports.deleteToken = function(token, callback){
  var sql = "DELETE FROM token WHERE token = ?";
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [token], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};