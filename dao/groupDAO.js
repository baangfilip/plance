var pool = require('../database');
var htmlencode = require('htmlencode');

//group with groupid
exports.getGroupByID = function(groupid, callback) {
  var sql = "SELECT * FROM groups where id=?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [groupid], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

//all open groups
exports.getOpenGroups = function(callback) {
  var sql = "SELECT * FROM groups WHERE open = 1 AND removed = 0";
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

exports.getGroupsWhereUserIsMember = function(userid, callback){
  var sql = "SELECT * FROM groups " +
    "JOIN groupmembers ON groups.id=groupmembers.groupid WHERE groupmembers.userid = ? AND groups.removed = 0";
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
}


exports.getGroupsWhereUserIsAdmin = function(userid, callback){
  var sql = "SELECT * FROM groups " +
    "JOIN groupmembers ON groups.id=groupmembers.groupid WHERE groupmembers.userid = ? AND groups.removed = 0 AND groupmembers.admin = 1";
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
}

exports.updateUsersInGroup = function(){
  /*
  update users for groupid
  DELETE FROM groupmembers where groupid = groupid
  INSERT INTO groupmembers (groupid, userid) 
  VALUES
  (1, 8),
  (1, 9),
  (1, 10),
  (1, 11);

  */
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

// user with userid
exports.getUsersInGroup = function(groupid, callback) {
  var sql = "SELECT users.username, users.email, users.id, groupmembers.admin FROM users "+
    "JOIN groupmembers ON users.id=groupmembers.userid WHERE groupmembers.groupid = ? AND users.removed = 0";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [groupid], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

// user with name
exports.getGroupByName = function(name, callback) {
  var sql = "SELECT * FROM groups where name=?";
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

// add project
exports.addGroup = function(obj, callback) {
  var sql = "INSERT INTO groups (name, color, open) VALUES ('"+htmlencode.htmlEncode(obj.name)+"', '"+htmlencode.htmlEncode(obj.color)+"', "+obj.open+")";
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

exports.updateGroup = function(obj, callback) {
  var sql = "UPDATE groups SET name='"+htmlencode.htmlEncode(obj.name)+"', color='"+htmlencode.htmlEncode(obj.color)+"' WHERE id="+obj.id+"";
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

exports.userIsAdminForGroup = function(userid, groupid, callback){
var sql = "SELECT admin FROM groupmembers WHERE userid ="+userid+" AND groupid="+groupid+"";
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

exports.removeGroup = function(id, callback) {
  var sql = "DELETE FROM groups WHERE id="+id+"";
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

exports.removeAllUsersFromGroup = function(groupid, callback) {
  var sql = "DELETE FROM groupmembers WHERE groupid="+groupid+"";
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

// maakes user admin for the group
exports.makeAdmin = function(userid, groupid, callback) {
  var sql = "UPDATE groupmembers SET admin=1 WHERE userid="+userid+" AND groupid="+groupid+"";
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

// maakes user admin for the group
exports.revokeAdmin = function(userid, groupid, callback) {
  var sql = "UPDATE groupmembers SET admin=0 WHERE userid="+userid+" AND groupid="+groupid+"";
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


// add users to group
exports.connectUserToGroup = function(userid, groupid, admin, callback) {
  var sql = "INSERT INTO groupmembers (groupid, userid, admin) VALUES ('"+groupid+"', '"+userid+"', "+admin+")";
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

exports.removeUserFromGroup = function(groupid, userid, callback) {
  var sql = "DELETE from groupmembers WHERE groupid="+groupid+" AND userid="+userid+"";
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


