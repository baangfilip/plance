var express = require('express');
var router = express.Router();
var _ = require('underscore');
var projectDAO = require('../dao/projectDAO');
var groupDAO = require('../dao/groupDAO');
var rightsmanagement = require('../logic/rightsmanagement');
var encryption = require('../logic/encryption');

/*
 * GET projects, all lists in the database.
 */
router.get('/', function(req, res) {
    //var advLogger = require('logger').logg("Get statlist.", req);
    projectDAO.getProjects(req.user, function (err, projects) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(projects);
    });
});

/*
 * GET ceratin project.
 */
router.get('/:projectid', function(req, res) {
    //var advLogger = require('logger').logg("Get statlist.", req);
    projectDAO.getProjectInformationByID(req.param("projectid"), function (err, project) {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(project[0]);
    });
});

/*
 * GET projects by group
 */
router.get('/group/:groupid', function(req, res) {
  if(req.user){
      var id = req.param("groupid");
      rightsmanagement.userIsInGroup(req.body.groupid, req.user.id, function(userInGroup){ //make sure the requester is in the group
        if(userInGroup){
            projectDAO.getProjectsByGroupID(req.param("groupid"), function (err, projects) {
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(projects);
            });
        }else{
            res.status(403).json({message: 'Forbidden, you are not a member of the group', success: false});
        }
      });
  }else{
      res.status(401).json({message: 'Not authorized', success: false});
  }
    
});

/*
 * POST to addproject.
 */
router.post('/', function(req, res) {
    if(req.user){
        //console.log(req.body);
        var createdby = req.user.id;
        req.body.userid = 0;
        if(req.body.groupid == 0){ 
            req.body.userid = req.user.id;
            req.body.groupid = 1;
        }
        var uuid = encryption.createSalt();
        rightsmanagement.userIsInGroup(req.body.groupid, req.user.id, function(userInGroup){
            if(userInGroup){
                projectDAO.addProject(req.body, createdby, uuid, function (err, result) {
                    projectDAO.getProjectByID(result.insertId, function(error, project){
                        res.json(project[0]);
                    });
                });
            }else{
                res.status(403).json({message: 'Forbidden', success: false});
            }
        });
    }else{
        res.status(401).json({message: 'Not authorized', success: false});
    }
});

/*
 * PUT to update project.
 */
router.put('/', function(req, res) {
  // console.log(req.body.name);
    if(req.user){
        rightsmanagement.userCanEdit(req.body.projectid, req.user.id, function(userCanEdit){
            if(userCanEdit){
                var id = req.body.id;
                projectDAO.updateProject(req.body, function (err, result) {
                    projectDAO.getProjectByID(id, function(error, list){
                        res.json(list[0]);
                    });
                });
            }else{
                res.status(403).json({message: 'Forbidden', success: false});
            }
        });
    }else{
        res.status(401).json({message: 'Not authorized', success: false});
    }
});

/*
 * DELETE to remove project
 */
router.delete('/:id/:groupid', function(req, res) {
    if(req.user){
        var id = req.params.id;
        var groupid = req.params.groupid;
        var userid = req.user.id;
        if(groupid != 0){
            groupDAO.userIsAdminForGroup(userid, groupid, function(error, ress){
                if(typeof ress[0] !== 'undefined' && ress[0].admin == 1){
                    projectDAO.removeProject(id, function (err, result) {
                        res.json(result);
                    });
                }else{
                    res.status(403).json({message: 'Forbidden', success: false});
                }
            });
        }else{
             projectDAO.getProjectByID(id, function(error, ress){
                if(ress[0].userid == userid){
                    projectDAO.removeProject(id, function (err, result) {
                        res.json(result);
                    });
                }else{
                    res.status(403).json({message: 'Forbidden', success: false});
                }
            });
        }
    }else{
        res.status(401).json({message: 'Not authorized', success: false});
    }
});

module.exports = router;
