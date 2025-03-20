var express = require('express');
var router = express.Router();
var _ = require('underscore');
var listdao = require('../dao/listDAO');
var rightsmanagement = require('../logic/rightsmanagement');
/*
 * GET list list, all lists in the database.
 */
router.get('/', function(req, res) {
    //var advLogger = require('logger').logg("Get statlist.", req);
    listdao.getAllLists(function (err, list) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(list);
    });
});

/*
 * GET all lists where the user is "owner"
 */
router.get('/user/:userid', function(req, res) {
    //var advLogger = require('logger').logg("Get statlist.", req);
    listdao.getAllUserList(req.param("userid"), function (err, list) {
      var items = _.groupBy(list, "listname");
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(items);
    });
});


/*
 * GET all lists that isnt removed with items for a project. !!!THIS NEEDS TO BE LOCKED WITH THE SAME RIGHTS AS RIGHTSMANAGEMTN THINGY
 */

router.get('/:projectid', function(req, res) {
  //var advLogger = require('logger').logg("Get statlist runid " + req.param("runid"));
  listdao.getListContentByID(req.param("projectid"), function (err, items) {
    //console.log(items);
    items = _.groupBy(items, "listid");
    res.header("Content-Type", "application/json; charset=utf-8");
    res.json(items);
  });
});

/*
 * POST to addlist.
 */
router.post('/', function(req, res) {
  //console.log(req.body);
    if(req.user){
        rightsmanagement.userCanEdit(req.body.projectid, req.user.id, function(userCanEdit){
            if(userCanEdit){
                listdao.addList(req.body, function (err, result) {
                    listdao.getListInformationByID(result.insertId, function(error, list){
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
 * PUT to update list.
 */
router.put('/', function(req, res) {
   // console.log(req.body.name);
    if(req.user){
        rightsmanagement.userCanEdit(req.body.projectid, req.user.id, function(userCanEdit){
            if(userCanEdit){
                var id = req.body.id;
                listdao.updateList(req.body, function (err, result) {
                    listdao.getListInformationByID(id, function(error, list){
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
 * PUT update listordering.
 */
router.put('/listorder/:projectid', function(req, res) {
   // console.log(req.body.name);
   // find other lists in project and update their position to.... all lists between origin and position
    if(req.user){
        rightsmanagement.userCanEdit(req.param("projectid"), req.user.id, function(userCanEdit){
            if(userCanEdit){
                var id = req.body.id;
                listdao.changePosition(req.body, function (err, result) {
                    listdao.getListInformationByID(id, function(error, list){   // change to query that gets listordering
                        res.header("Content-Type", "application/json; charset=utf-8");
                        res.json({message: 'Updated listorder', success: true}); //not up to standard
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
 * DELETE to deletelist.
 */
router.delete('/:id', function(req, res) {
    if(req.user){
        rightsmanagement.userCanEdit(req.body.projectid, req.user.id, function(userCanEdit){
            if(userCanEdit){
                var listid = req.params.id;
                listdao.deleteList(listid, function (err, list) {
                    res.json(list);
                });
            }else{
                res.status(403).json({message: 'Forbidden', success: false});
            }
        });
    }else{
        res.status(401).json({message: 'Not authorized', success: false});
    }
});

module.exports = router;
