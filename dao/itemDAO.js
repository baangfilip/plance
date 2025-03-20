var pool = require('../database');
var htmlencode = require('htmlencode');

exports.getItemInformationByID = function(itemid, callback) {
  var sql = "SELECT * FROM item WHERE id=?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [itemid], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};


exports.getAllUserItem = function(userid, callback) {
  var sql = "SELECT item.id, item.points, item.listid, item.name, item.text, item.link, item.categoryid, item.views, item.created, item.modified, "+
  "item.position FROM item WHERE item.ownerid = ?"; 
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


exports.getAllItems = function(callback) {
  var sql = "SELECT * FROM item";
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

exports.addItem = function(obj, callback) {
  //console.log(obj);
  var sql = "INSERT INTO item (listid, text, link, name, position) VALUES ('"+obj.listid+"', '', '', 'New item', '"+obj.position+"')";
  //console.log(sql);
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


exports.updateItem = function(obj, callback) {
  //console.log(obj);
  var sql = "UPDATE item SET name='"+htmlencode.htmlEncode(obj.name)+"', text='"+htmlencode.htmlEncode(obj.text)+"', link='"+htmlencode.htmlEncode(obj.link)+"', "+
  "points='"+obj.points+"', "+
  "ownerid='"+obj.ownerid+"', categoryid='"+obj.categoryid+"', progress='"+obj.progress+"', "+
  "views='"+obj.views+"' " +
  "WHERE id = '"+obj.id+"'";
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

exports.changeList = function(obj, callback) {
  //console.log(obj);
  var sql = "UPDATE item SET listid = '"+obj.listid+"' WHERE id = '"+obj.itemid+"'";
  //console.log(sql);
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

exports.changePosition = function(obj, callback) {
  //console.log(obj);
  //sql = "UPDATE item SET position = '"+obj.position+"' WHERE id = '"+obj.itemid+"'";
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
      "UPDATE item " +
      "SET position = CASE id " + 
        whenThen +
      "END " +
      "WHERE id IN ("+inArr+")";
  //console.log(sql);
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
exports.deleteItem = function(itemid, callback) {
  var sql = "UPDATE item SET removed = 1 WHERE id = ?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [itemid], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};
