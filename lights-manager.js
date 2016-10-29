var OutletsManager = require('./outlet-manager');
var _ = require('lodash');
var q = require('q');

class LightsManager {
    constructor(config) {
        this.config = this.parseConfig(config);
    }

    parseConfig(config) {
        var parsed = _.clone(config);

        parsed.outletManagers = _.map(config.boxes, (box) => new OutletsManager(box.url));
        parsed.outletMap = _.flatten(_.map(config.boxes, (box, index) => {
            return _.map(_.times(box.totalOutlets), (num) => {
                return {
                    manager: parsed.outletManagers[index],
                    status: false,
                    boxOutletId: num
                };
            });
        }));

        console.log(parsed.outletMap, parsed.outletManagers);

        return parsed;
    }

    getCachedStatus() {
       return _.map(this.config.outletMap, 'status');
    }

    getAllOutletStatus() {
        return q.all(_.map(this.config.outletManagers, function(om) {
            return om.getStatus();
        })).then(
            function() {
                var statuses = Array.prototype.slice.call(arguments,0);
                return _(statuses).flatten().map((status, outlet) => {
                    this.config.outletMap[outlet] = status;
                    return status;
                }).value();
            }
        );
    }

    setOutlet(outletid, status) {
        var mapOutlet = this.config.outletMap[outletid]; 
        return mapOutlet.manager.setOutlet(mapOutlet.boxOutletId, status).then(() => {
            this.config.outletMap[outletid].status = status;
            __io.emit('lights:outlet:status', this.getCachedStatus());

            return q.when(this.getCachedStatus());
        });
    }
}

module.exports = LightsManager;