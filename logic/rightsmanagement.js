var _ = require('underscore');
var userDAO = require('../dao/userDAO');

exports.projectrightsmanager = function(project, req){
  var readonly = 1;
  var allowedToOpen = false;
  var projectpublic = project.public;
  var projectgroupid = project.groupid;
  var projectuserid = project.userid;
  var loggedIn = req.user;
  var loggedInUserGroups;
  var loggedInUserID = -1;
  if(loggedIn){
    loggedInUserID = req.user.id;
    loggedInUserGroups = (req.user.groupids != null ? req.user.groupids.split(",") : [0]);
  }
  var editRights = false;
  var allowedToOpen = false;
  if(loggedIn){
    editRights = (projectuserid == loggedInUserID || (_.contains(loggedInUserGroups, projectgroupid+'') && projectuserid == 0)); 
  }
  allowedToOpen = (projectuserid == loggedInUserID || _.contains(loggedInUserGroups, projectgroupid+'') || projectpublic);

  return {"readonly": (editRights ? 0 : 1), "allowedToOpen": allowedToOpen};
};

exports.userCanEdit = function(projectid, userid, callback){
  userDAO.userCanEdit(userid, projectid, function(err, result){
    callback((typeof result[0] !== 'undefined' && result[0].id) ? result[0].id > 0 : false);
  });
}
exports.userIsInGroup = function(groupid, userid, callback){
  userDAO.userIsInGroup(userid, groupid, function(err, result){
    console.log(result);
    callback((typeof result[0] !== 'undefined' && result[0].id) ? result[0].id > 0 : false);
  });
}

exports.userIsInSameGroupAsProject = function(projectid, userid, callback){
  userDAO.userIsInGroup(userid, projectid, function(err, result){
    callback((typeof result[0] !== 'undefined' && result[0].id) ? result[0].id > 0 : false);
  });
};