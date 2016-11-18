// load and parse the config
var LightsManager = require('../lights-manager');
var config = require('../outlet-config');
var MsgQueue = require('../message-queue');
var _ = require('lodash');

module.exports = function (io, socket, lm, mq) {
    

    socket.on('lights:add:message', (data) => {
        mq.addMessage(data.message);
        io.emit('lights:message:status', mq.getMessages());
    });

    socket.on('lights:delete:message', (data) => {
        mq.removeMessage(data.message);
        io.emit('lights:message:status', mq.getMessages());
    });

    socket.on('lights:set:outlet', (data) => {
        lm.setOutlet(data.id, data.status);
    });

    socket.on('lights:premades:play', (data) => {
        lm.playPattern(config.patterns[data.id].pattern).then(() => {
            _.each(config.turnBackOn, (light) => {
                lm.setOutlet(light, on);
            });
        });
    });
};