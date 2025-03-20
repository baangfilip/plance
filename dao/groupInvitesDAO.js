var pool = require('../database');

//all open groups
exports.getUsersGroupInvites = function(userid, callback) {
  var sql = "SELECT * FROM groupinvites "+
  "JOIN groups ON groupinvites.groupid = groups.id "+
  "WHERE userid=" + userid;
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    connection.query(sql, function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

// add groupinvite
exports.addGroupInvite = function(userid, groupid, invitedby, callback) {
  var sql = "INSERT INTO groupinvites (userid, groupid, invitedby) VALUES ("+userid+", "+groupid+", "+invitedby+")";
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

// add groupinvite
exports.hasGroupInvite = function(userid, groupid, callback) {
  var sql = "SELECT * FROM groupinvites WHERE userid="+userid+" AND groupid="+groupid+"";
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

exports.removeGroupInvite = function(userid, groupid, callback) {
  var sql = "DELETE FROM groupinvites WHERE userid="+userid+" AND groupid="+groupid+"";
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
