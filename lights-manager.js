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

    turnBackOn() {
        _.each(this.config.turnBackOn, (light) => {
            this.setOutlet(light-1, true);
        });
    }

    playPattern(pattern, def) {
        def = def || q.defer();
        if(pattern.length) {
            this.currentPattern = _.clone(pattern);
            console.log('playing pattern', this.currentPattern);
            let section = this.currentPattern.shift();
            this.playPatternSection(section).then(
                () => {
                    this.playPattern(this.currentPattern, def);
                }
            );
        }else{
            this.turnBackOn();
            def.resolve();
        }

        return def.promise;
    }

    playPatternSection(section) {
        var def = q.defer();

        q.all(_.map(section.lights, (l) => {
            console.log('turning outlet', l, 'on');
           return this.setOutlet(l-1, true); 
        })).then(() => {
            console.log('turning off after', section.on, 'for', section.after);
            setTimeout(() => {
                q.all(_.map(section.lights, (l) => {
                    return this.setOutlet(l-1, false);
                })).then(() => {
                  if(section.after) {
                        setTimeout(() => {
                            def.resolve();
                        }, section.after)
                    }else{
                        def.resolve();
                    }  
                });
            }, section.on);
        });

        return def.promise;
    }
}

module.exports = LightsManager;