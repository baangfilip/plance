var express = require('express');
var router = express.Router();
var _ = require('underscore');
var searchlogic = require('../logic/search');


/*
 * GET all items where the user is "owner"
 */
router.get('/:query', function(req, res) {
    //var advLogger = require('logger').logg("Get statlist.", req);
    //1. do search with searchlogic
    searchlogic.search(req.param("query"), userid, function(){
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(projects);
    });
});

module.exports = router;
