var pool = require('../database');
var htmlencode = require('htmlencode');

// user with userid
exports.getUserByID = function(userid, callback) {
  var sql = "SELECT users.username, users.id, users.admin, users.email, users.removed, GROUP_CONCAT(groupmembers.groupid) groupids FROM users "+
  "LEFT JOIN groupmembers ON groupmembers.userid = users.id "+
  "WHERE users.id=? AND removed = 0 "+
  "GROUP BY users.id";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [userid], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

// user with userid
exports.getUser = function(callback) {
  var sql = "SELECT * FROM users WHERE removed = 0";
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

// user with name
exports.getUserByName = function(name, callback) {
  var sql = "SELECT users.username, users.id, users.admin, users.email, users.removed, users.salt, users.password, GROUP_CONCAT(groupmembers.groupid) groupids FROM users "+
  "LEFT JOIN groupmembers ON groupmembers.userid = users.id "+
  "WHERE users.username=? AND removed = 0 "+
  "GROUP BY users.id";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [name], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

// user with email
exports.getUserByEmail = function(email, callback) {
  var sql = "SELECT users.username, users.id, users.admin, users.email, users.removed, users.salt, users.password, GROUP_CONCAT(groupmembers.groupid) groupids FROM users "+
  "LEFT JOIN groupmembers ON groupmembers.userid = users.id "+
  "WHERE users.email=? AND removed = 0 "+
  "GROUP BY users.id";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [email], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};


// add user
exports.addUser = function(obj, callback) {
  var sql = "INSERT INTO users (username, salt, email, password, admin) VALUES "+
    "('"+htmlencode.htmlEncode(obj.username)+"', '"+obj.salt+"', '"+htmlencode.htmlEncode(obj.email)+"', '"+obj.password+"', '0')";
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


exports.updateUser = function(obj, callback) {
  var sql = "UPDATE users SET username='"+htmlencode.htmlEncode(obj.username)+"', email='"+htmlencode.htmlEncode(obj.email)+"',"+
    "admin='"+obj.admin+"', removed='"+obj.removed+"'"+(obj.password != '' ? ", password='"+obj.password+"'" : "")+" WHERE id="+obj.id+"";
    console.log(sql);
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

exports.updateUserPassword = function(id, password, salt, callback) {
  var sql = "UPDATE users SET password='"+password+"', salt='"+salt+"' WHERE id="+id+"";
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

exports.removeUser = function(id, callback) {
  var sql = "UPDATE users SET removed='1' WHERE id="+id+"";
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

exports.userIsInGroup = function(userid, groupid, callback) {//
  var sql = "SELECT id FROM users "
      "JOIN groupmembers ON groupmembers.userid=users.id WHERE groupmembers.groupid = "+groupid+" AND users.id = "+userid+"";
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

exports.userIsInSameGroupAsProject = function(userid, projectid, callback) {//
  var sql = "SELECT project.id FROM project "
      "JOIN groupmembers ON groupmembers.groupid=project.groupid "+ 
      "WHERE (groupmembers.userid = 1 AND project.id = 2) "+
      "GROUP BY project.id";
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

exports.userCanEdit = function(userid, projectid, callback) {//
  var sql = "SELECT project.id FROM project "+
        "JOIN groupmembers ON groupmembers.groupid=project.groupid "+
        "WHERE (groupmembers.userid = "+userid+" AND project.id = "+projectid+" AND project.userid = 0) OR (project.userid = "+userid+" AND project.id = "+projectid+") "+
        "GROUP BY project.id";
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