var express = require('express');
var router = express.Router();

/* GET home page. */


module.exports = function(lm, mq) {
    
    router.get('/status', function(req, res, next) {
        lm.getAllOutletStatus().then((status) => {
            res.json(status);
        });
    });

    router.post('/outlet/:outletid', function(req, res, next) {
        lm.setOutlet(req.params.outletid, req.body.status).then((status) => {
            res.json(status);
            io.emit('lights:outlet:status', status);
        });
    });



    return router;
};
