var pool = require('../database');
var htmlencode = require('htmlencode');

exports.getListContentByID = function(listid, callback) {
  var sql = "SELECT COALESCE(item.id, 0) AS id, COALESCE(item.points,0) AS points, COALESCE(item.listid, 0) AS itemlistid, "+
  "COALESCE(item.name, 0) AS name, COALESCE(item.text, 0) AS text, COALESCE(item.link, 0) AS link, COALESCE(item.ownerid, 0) AS ownerid, COALESCE(item.categoryid, 0) AS categoryid, "+
  "COALESCE(item.views, 0) AS views, COALESCE(item.created, 0) AS created, COALESCE(item.progress, 0) AS progress, COALESCE(item.modified, 0) AS modified, "+
  "COALESCE(item.position,0) AS position, list.id AS listid, list.ruler AS ruler, list.name AS listname, list.projectid AS projectid, list.position AS listposition, list.created AS listcreated, "+
  "list.modified AS listmodified, list.userid AS userid, list.description AS description, list.link AS listlink "+
  "FROM item "+
  "RIGHT JOIN list on list.id=item.listid AND item.removed = 0 WHERE list.projectid = ? AND list.removed = 0";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [listid], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};


exports.getListInformationByID = function(listid, callback) {
  var sql = "SELECT * FROM list WHERE id=?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [listid], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};


exports.getAllUserList = function(userid, callback) {
  var sql = "SELECT item.id, item.points, item.listid, item.name, item.text, item.link, item.categoryid, item.views, item.created, item.modified, "+
  "item.position, list.id AS listid, list.name AS listname, list.position AS listposition, list.created AS listcreated, "+
  "list.modified AS listmodified "+
  "FROM item JOIN list on item.listid=list.id AND list.removed = 0 WHERE list.userid = ?"; 
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

//for admin like
exports.getAllLists = function(callback) {
  var sql = "SELECT * FROM list";
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

exports.addList = function(obj, callback) {
  var sql = "INSERT INTO list (name, link, projectid, description) VALUES ('"+htmlencode.htmlEncode(obj.name)+"', '"+htmlencode.htmlEncode(obj.link)+"', "+
    "'"+obj.projectid+"', '')";
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


exports.updateList = function(obj, callback) {
  var sql = "UPDATE list SET name='"+htmlencode.htmlEncode(obj.name)+"', description='"+htmlencode.htmlEncode(obj.description)+"', link='"+htmlencode.htmlEncode(obj.link)+"', "+
  "position='"+obj.position+"', ruler='"+obj.ruler+"', "+
  "projectid='"+obj.projectid+"', removed='"+obj.removed+"', userid='"+obj.userid+"' WHERE id=?";
  // get a connection from the pool
  //console.log(sql);
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [obj.id], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

exports.changePosition = function(obj, callback) {
  var whenThen = "";
  var inArr = [];
  //console.log(obj.length);
  for(i = 0; i < obj.length; i++){
    console.log(obj[i].items.length);
    for(j = 0; j < obj[i].items.length; j++){
      whenThen += "WHEN " + obj[i].items[j] + " THEN " + j + " ";
      inArr.push(obj[i].items[j]);
    }
  }
  var sql = ""+
      "UPDATE list " +
      "SET position = CASE id " + 
        whenThen +
      "END " +
      "WHERE id IN ("+inArr+")";
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


// delete list
exports.deleteList = function(listid, callback) {
  var sql = "UPDATE list SET removed = 1 WHERE id = ?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [listid], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};
