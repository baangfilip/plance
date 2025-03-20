var express = require('express');
var router = express.Router();
var _ = require('underscore');
var userDAO = require('../dao/userDAO');
var groupDAO = require('../dao/groupDAO');
var encryption = require('../logic/encryption');
var resetpassword = require('../logic/resetpassword');
/*
 * GET list of users.
 */
/*
router.get('/', function(req, res) {
    userDAO.getUser(function (err, users) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(users);
    });
});
*/
/*
 * GET user with userid
 */
/*
router.get('/user/:userid', function(req, res) {
    userDAO.getUserByID(req.param("userid"), function (err, user) {
      var user = user[0];
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(user);
    });
});
*/

/*
 * GET groups for user with userid
 */
router.get('/groups/member/:userid', function(req, res) {
    groupDAO.getGroupsWhereUserIsMember(req.param("userid"), function (err, groups) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(groups);
    });
});

/*
 * GET groups for user where user is admin with userid
 */
router.get('/groups/admin', function(req, res) {
    groupDAO.getGroupsWhereUserIsAdmin(req.user.id, function (err, groups) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(groups);
    });
});

/*
 * GET count of user with username
 */
router.get('/taken/:username', function(req, res) {
    userDAO.getUserByName(req.param("username"), function (err, user) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json({"usernameistaken": user.length});
    });
});

/*
 * GET count of users with email
 */
router.get('/email/:email', function(req, res) {
    userDAO.getUserByEmail(req.param("email"), function (err, user) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json({"emailalreadyexist": user.length});
    });
});

/*
 * PUT to update a users password.
 */
router.put('/updatepassword', function(req, res) {
  var id = req.body.id;
  var token = req.body.token;
  var url = req.protocol + '://' + req.get('host');
  resetpassword.isValidToken(token, id, url, true, function(valid){
    if(valid == 1){
      userDAO.getUserByID(id, function(errr, users){
        var salt = encryption.createSalt();
        var password = encryption.hashPassword(req.body.password, salt);
        userDAO.updateUserPassword(id, password, salt, function (err, result) {
          res.header("Content-Type", "application/json; charset=utf-8");
          res.json({"success": true});
        });
      });
    }else{
      res.header("Content-Type", "application/json; charset=utf-8");
      res.status(403);
      res.json({"success": false, "message": "Invalid token", "errorcode": valid});
    }
    
  });
});

/*
 * PUT to update user.
 */
router.put('/', function(req, res) {
    // console.log(req.body.name);
    if(req.user){
        if(req.user.id == req.body.id){
            var id = req.body.id;
            req.body.admin = 0;
            userDAO.getUserByName(req.body.username, function(errr, users){
                req.body.password = (req.body.password != "" ? encryption.hashPassword(req.body.password, users[0].salt) : ""); //get the salt here, so we never expose it to frontend
                userDAO.updateUser(req.body, function (err, result) {
                    userDAO.getUserByID(id, function(error, user){
                        res.header("Content-Type", "application/json; charset=utf-8");
                        req.login(user[0], function(err) {
                            if (err) return next(err)
                            //res.send(200);
                            res.json(user[0]);    
                        });
                    });
                });
            });
        }else{
          res.status(403).json({message: 'Forbidden', success: false});
        }
    }else{
      res.status(401).json({message: 'Not authorized', success: false});
    }
});

/*
 * DELETE to remove user.
 */
router.delete('/:id', function(req, res) {
    if(req.user){
        var userid = req.params.id;
        if(req.user.id == userid){
            userDAO.removeUser(userid, function (err, result) {
                res.json(result);
            });
        }else{
            res.status(403).json({message: 'Forbidden', success: false});
        }
    }else{
        res.status(401).json({message: 'Not authorized', success: false});
    }
});

module.exports = router;
