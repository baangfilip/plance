var pool = require('../database');
var htmlencode = require('htmlencode');

// Project with id
exports.getProjectByID = function(id, callback) {
  var sql = "SELECT * FROM project WHERE id=?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

exports.getProjectInformationByID = function(id, callback) {
  var sql = "SELECT COUNT(DISTINCT list.id) AS nbrOfLists, COUNT(DISTINCT item.id) AS nbrOfItems, users.username AS createdby FROM project "+
        "JOIN list ON list.projectid=project.id "+
        "JOIN item ON item.listid=list.id "+
        "JOIN users ON project.createdby=users.id "+
        "WHERE project.id=? AND list.removed = 0 AND item.removed = 0";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

exports.getProjectsByGroupID = function(groupid, callback) {
  var sql = "SELECT * FROM project WHERE groupid=? AND userid=0 AND removed=0";
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

// list of projects
exports.getRemovedProjects = function(callback) {
  var sql = "SELECT * FROM project WHERE removed = 1";
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



// list of projects 
exports.getProjects = function(obj, callback) {
  var sql = "SELECT project.id, project.name, project.public, project.created, project.groupid, project.userid, " +
            "groups.name AS groupname, groups.color AS groupcolor, " +
            "COALESCE(groupmembers.admin,0) AS groupadmin " +
            "FROM project " +
            "JOIN groups ON project.groupid = groups.id " +
            "LEFT JOIN groupmembers ON groups.id = groupmembers.groupid ";
            if(typeof obj !== 'undefined'){
              sql += "AND groupmembers.userid = " + obj.id + " ";
            }
            sql += "WHERE (";
            if(typeof obj !== 'undefined' && obj.groupids != null){
              var usergroups = obj.groupids.split(",");
              //console.log(usergroups);
              for(i = 0; i < usergroups.length; i++){
                sql += "(project.groupid = "+usergroups[i]+" AND project.userid = 0) OR ";  
              }
              sql += "project.userid = "+obj.id+" OR " 
            }
            sql += "project.public = 1) AND project.removed = 0 " +
            " GROUP BY project.id";
  // get a connection from the pool
  console.log(sql);
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

// project with name
exports.getProjectByName = function(name, callback) {
  var sql = "SELECT * FROM project WHERE name=?";
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
exports.addProject = function(obj, createdby, uuid, callback) {
  var sql = "INSERT INTO project (name, public, groupid, userid, createdby, uuid) VALUES ('"+htmlencode.htmlEncode(obj.name)+"', '"+obj.public+"', '"+obj.groupid+"', '"+obj.userid+"', '"+createdby+"', '"+uuid+"')";
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

exports.updateProject = function(obj, callback) {
  var sql = "UPDATE project SET name='"+htmlencode.htmlEncode(obj.name)+"', group='"+obj.groupid+"',"+
    "public='"+obj.public+"', removed='"+obj.removed+"' WHERE id="+obj.id+"";
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

exports.removeProject = function(id, callback) {
  var sql = "UPDATE project SET removed='1' WHERE id="+id+"";
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
