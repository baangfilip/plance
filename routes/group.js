var express = require('express');
var router = express.Router();
var groupDAO = require('../dao/groupDAO');
var groupInvitesDAO = require('../dao/groupInvitesDAO');
var userDAO = require('../dao/userDAO');
var encryption = require('../logic/encryption');
var _ = require('underscore');


/*
 * GET groupinformation for group with id
 */
router.get('/:groupid', function(req, res) {
    groupDAO.getGroupByID(req.param("groupid"), function (err, groups) {
      var group = groups[0];
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(group);
    });
});


/*
 * GET all members of a group
 */
router.get('/members/:groupid', function(req, res) {
  if(req.user){
      var id = req.param("groupid");
      groupDAO.userIsAdminForGroup(req.user.id, id, function(errr, result){ //check so user is admin
        if(result[0].admin == 1){
            groupDAO.getUsersInGroup(id, function (err, members) {
              res.header("Content-Type", "application/json; charset=utf-8");
              res.json(members);
            });
        }else{
            res.status(403).json({message: 'Forbidden, you are not an admin for the group', success: false});
        }
      });
  }else{
      res.status(401).json({message: 'Not authorized', success: false});
  }
});

/*
 * GET all open groups
 */
router.get('/open/all', function(req, res) {
    groupDAO.getOpenGroups(function (err, groups) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(groups);
    });
});

/*
 * POST to add a user to a group
 */
router.post('/:groupid', function(req, res) {
  var groupid = req.param("groupid");
  if(req.user){
    groupDAO.getGroupByID(groupid, function(err, group){
      if(group[0].open == 1){
        //everyone can join
        connectUserToGroup(req, req.user.id, groupid, function(result){
          res.header("Content-Type", "application/json; charset=utf-8");
          res.json(result);
        });
      }else{
        //group is not open
        //check for invite, otherwise just give 403
        groupInvitesDAO.hasGroupInvite(req, req.user.id, groupid, function(err, invites){
          if(invites.length > 0){
            connectUserToGroup(req.user.id, groupid, function(result){
              groupInvitesDAO.removeGroupInvite(req.user.id, groupid, function(err, invite){
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(result);
              });
            });
          }else{
            res.status(403).json({message: 'Forbidden, group is locked and you dont have an invite', success: false});
          } 
        });
      }
      
    }); //get group
  }else{
      res.status(401).json({message: 'Not authorized', success: false});
  }
});

function connectUserToGroup(req, userid, groupid, callback){
  groupDAO.connectUserToGroup(userid, groupid, 0, function (err, groups) {
    //update logged in user
    userDAO.getUserByID(userid, function (err, user) {
      req.login(user[0], function(err) {
        if (err) return callback(err);
        //res.send(200);
        callback({"success": true});    
      });
    });
  }); //connect user
}

/*
 * PUT to update group makes sure a admin does the update
 */
router.put('/', function(req, res) {
    // console.log(req.body.name);
  if(req.user){
      var id = req.body.groupid;
      groupDAO.userIsAdminForGroup(req.user.id, req.body.groupid, function(errr, result){ //check so user is admin
        if(result[0].admin == 1){
            groupDAO.updateGroup(req.body, function(error, group){                           //update the group
                groupDAO.getGroupByID(id, function (err, groups) {                  //get the newly saved group
                    var group = groups[0];
                    res.header("Content-Type", "application/json; charset=utf-8");
                    res.json(group);
                });  
            });
        }else{
            res.status(403).json({message: 'Forbidden, you are not an admin for the group', success: false});
        }
      });
  }else{
      res.status(401).json({message: 'Not authorized', success: false});
  }
});

/*
 * PUT to make a user admin for group, makes sure a admin does the update
 */
router.put('/makeadmin/:userid/:groupid', function(req, res) {
    // console.log(req.body.name);
  if(req.user){
      var id = req.param("groupid");
      groupDAO.userIsAdminForGroup(req.user.id, id, function(errr, result){ //check so user is admin
        if(result[0].admin == 1){
            groupDAO.makeAdmin(req.param("userid"), id, function(error, group){                           //update the user in the group
                groupDAO.getUsersInGroup(id, function (err, groups) {                  //get the newly updated memberlist
                    var group = groups[0];
                    res.header("Content-Type", "application/json; charset=utf-8");
                    res.json(group);
                });  
            });
        }else{
            res.status(403).json({message: 'Forbidden, you are not an admin for the group', success: false});
        }
      });
  }else{
      res.status(401).json({message: 'Not authorized', success: false});
  }
});

/*
 * PUT to revoke admin rights for a user in the group, makes sure a admin does the update
 */
router.put('/revokeadmin/:userid/:groupid', function(req, res) {
    // console.log(req.body.name);
  if(req.user){
      var id = req.param("groupid");
      groupDAO.userIsAdminForGroup(req.user.id, id, function(errr, result){ //check so user is admin
        if(result[0].admin == 1){
            groupDAO.revokeAdmin(req.param("userid"), id, function(error, group){      //update the user in the group
                groupDAO.getUsersInGroup(id, function (err, groups) {                  //get the newly updated memberlist
                    var group = groups[0];
                    res.header("Content-Type", "application/json; charset=utf-8");
                    res.json(group);
                });  
            });
        }else{
            res.status(403).json({message: 'Forbidden, you are not an admin for the group', success: false});
        }
      });
  }else{
      res.status(401).json({message: 'Not authorized', success: false});
  }
});

/*
 * POST to create a group make sure the logged in user gets admin for the group
 */
router.post('/', function(req, res) {
    // console.log(req.body.name);
  if(req.user){
      var id = req.body.id;
      groupDAO.addGroup(req.body, function(errr, result){
        groupDAO.connectUserToGroup(req.user.id, result.insertId, 1, function(errr, resulter){
          groupDAO.getGroupByID(result.insertId, function(error, groups){
              res.header("Content-Type", "application/json; charset=utf-8");
              res.json(groups[0]);    
          });
        });
      });
  }else{
      res.status(401).json({message: 'Not authorized', success: false});
  }
});

/*
 * GET count of groups with name
 */
router.get('/name/:groupname', function(req, res) {
    groupDAO.getGroupByName(req.param("groupname"), function (err, group) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json({"groupalreadyexist": group.length});
    });
});

/*
 * DELETE to remove logged in user from group
 */
router.delete('/user/:groupid', function(req, res) {
    var userid = req.user.id;
    var groupid = req.param("groupid");
    groupDAO.removeUserFromGroup(groupid, userid, function (err, result) {
      //update logged in user
      userDAO.getUserByID(req.user.id, function (err, user) {
        req.login(user[0], function(err) {
          if (err) return next(err)
          //res.send(200);
          res.header("Content-Type", "application/json; charset=utf-8");
          res.json({"success": true});    
        });
      });
    });
});

/*
 * DELETE to remove the group make sure a admin does this.
 */
router.delete('/:groupid', function(req, res) {
  if(req.user){
      var groupid = req.param("groupid");
      var userid = req.user.id;
      groupDAO.userIsAdminForGroup(userid, groupid, function(errr, resu){
          if(resu[0].admin == 1){
              groupDAO.removeGroup(groupid, function (error, ress) {
                  groupDAO.removeAllUsersFromGroup(groupid, function (err, result) {
                      res.json(result);
                  });
              });
          }else{
              res.status(403).json({message: 'Forbidden, you are not an admin for the group', success: false});
          }
      });
  }else{
      res.status(401).json({message: 'Not authorized', success: false});
  }
});

/*
 * DELETE to remove another user from the group, but only groupadmin can do this
 */
router.delete('/user/:userid/:groupid', function(req, res) {
    var groupid = req.param("groupid");
    var userid = req.param("userid");
    if(req.user){
        groupDAO.userIsAdminForGroup(req.user.id, groupid, function(errr, resu){
            if(resu[0].admin == 1){
                groupDAO.removeUserFromGroup(groupid, userid, function (err, result) {
                    res.json(result);
                }); 
            }else{
                res.status(403).json({message: 'Forbidden, you are not an admin for the group', success: false});
            }
        });
    }else{
        res.status(401).json({message: 'Not authorized', success: false});
    }
});

/*
 * DELETE to remove an invite
 */
router.delete('/invite/:groupid', function(req, res) {
    var groupid = req.param("groupid");
    if(req.user){
        var userid = req.user.id;
        groupInvitesDAO.hasGroupInvite(userid, groupid, function(err, invite){
          if(invite.length > 0){
            groupInvitesDAO.removeGroupInvite(userid, groupid, function(err, invite){
              res.status(200).json({message: 'Removed', success: true});
            });
          }else{
            res.status(403).json({message: 'Forbidden, you dont have the specified invite', success: false});
          }
        });
    }else{
        res.status(401).json({message: 'Not authorized', success: false});
    }
});

/*
 * POST to invite a user
 */
router.post('/invite/:groupid', function(req, res) {
  if(req.user){
      var id = req.param("groupid");
      groupDAO.userIsAdminForGroup(req.user.id, id, function(errr, result){ //check so user is admin
        if(result[0].admin == 1){
            userDAO.getUserByEmail(req.body.email, function(error, users){        //check if users exist already
                if(users.length > 0){
                  //user exists
                  var user = users[0];
                  var usergroups = (user.groupids != null ? user.groupids.split(",") : "");
                  if(!_.contains(usergroups, id)){
                    groupInvitesDAO.hasGroupInvite(user.id, id, function(err, alreadyHas){
                      if(alreadyHas.length > 0){
                        res.json({message: 'User already invited', success: false});
                      }else{
                        groupInvitesDAO.addGroupInvite(user.id, id, req.user.id, function(err, result){
                          groupInvitesDAO.hasGroupInvite(user.id, id, function(err, invite){
                            res.json(invite);
                          });
                        });
                      }
                    });
                  }else{
                    //user already in the group
                    res.json({message: 'User already in the group', success: false});
                  }
                }else{
                  //invite to plance? or just say that they dont exist?
                  res.json({message: 'User doesnt exist', success: false});
                }
            });
        }else{
            res.status(403).json({message: 'Forbidden, you are not an admin for the group', success: false});
        }
      });
  }else{
      res.status(401).json({message: 'Not authorized', success: false});
  }
});

/*
 * GET invites for logged in user
 */
router.get('/invites/:userid', function(req, res) {
  if(req.user){
    groupInvitesDAO.getUsersGroupInvites(req.user.id, function (err, invites) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(invites);
    });
  }else{
      res.status(401).json({message: 'Not authorized', success: false});
  }
});

module.exports = router;
