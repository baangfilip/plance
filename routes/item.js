var express = require('express');
var router = express.Router();
var _ = require('underscore');
var itemdao = require('../dao/itemDAO');
var rightsmanagement = require('../logic/rightsmanagement');
/*
 * GET list list, all lists in the database.
 */
/*
router.get('/', function(req, res) {
    //var advLogger = require('logger').logg("Get statlist.", req);
    listdao.getAllItems(function (err, items) {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.json(items);
    });
});
*/

/*
 * GET all items where the user is "owner"
 */
router.get('/user/:userid', function(req, res) {
    //var advLogger = require('logger').logg("Get statlist.", req);
    if(req.user){
        if(req.user.id == req.param("userid")){
            itemdao.getAllUserItems(req.param("userid"), function (err, list) {
                var items = _.groupBy(list, "listid");
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(items);
            });
        }else{
            res.status(403).json({message: 'Forbidden', success: false}); //not to be the user itself to get its own items for now, later admins should be able to do this
        }
    }else{
        res.status(401).json({message: 'Not authorized', success: false});
    }
});

/*
 * POST to item.
 */
router.post('/', function(req, res) {
   // console.log(req.body.name);
    if(req.user){
        rightsmanagement.userCanEdit(req.body.projectid, req.user.id, function(userCanEdit){
            if(userCanEdit){
                itemdao.addItem(req.body, function (err, result) {
                    itemdao.getItemInformationByID(result.insertId, function(error, item){
                        res.json(item[0]);
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
 * PUT to update item.
 */
router.put('/changelist', function(req, res) {
   // console.log(req.body.name);
   // find neccesary items and update them to
   // all items between origin and target need to be updated
    if(req.user){
        rightsmanagement.userCanEdit(req.body.projectid, req.user.id, function(userCanEdit){
            if(userCanEdit){
                var id = req.body.itemid;
                itemdao.changeList(req.body, function (err, result) {
                    itemdao.getItemInformationByID(id, function(error, list){
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
 * PUT to update item.
 */
router.put('/position/:projectid', function(req, res) {
   // console.log(req.body.name);
   // find neccesary items and update them to
   // get Position, and then all with position => Position do +1 could be minus to, hmm
   //console.log(req.body);
    if(req.user){
        rightsmanagement.userCanEdit(req.param("projectid"), req.user.id, function(userCanEdit){
            if(userCanEdit){
                var id = req.body.itemid;
                itemdao.changePosition(req.body, function (err, result) {
                    itemdao.getItemInformationByID(id, function(error, list){
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
 * PUT to update item.
 */
router.put('/', function(req, res) {
   // console.log(req.body.name);
    if(req.user){
        rightsmanagement.userCanEdit(req.body.projectid, req.user.id, function(userCanEdit){
            if(userCanEdit){
                var id = req.body.id;
                itemdao.updateItem(req.body, function (err, result) {
                    itemdao.getItemInformationByID(id, function(error, list){
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
 * DELETE to deletelist.
 */
router.delete('/:id', function(req, res) {
    if(req.user){
        rightsmanagement.userCanEdit(req.body.projectid, req.user.id, function(userCanEdit){
            if(userCanEdit){
                var itemid = req.params.id;
                itemdao.deleteItem(itemid, function (err, result) {
                    res.json(result);
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
