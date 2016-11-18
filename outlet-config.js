var _ = require('lodash');

function generateAllRangeArray(obj) {
    let rangeArr = _.range(1,
                _.reduce(_.map(obj.boxes, 'totalOutlets'), (sum, n) => {
                    return sum+n;
                },1)
            );
    return rangeArr;
}

var config = {
    // how far should we offset the mapping between the outlets
    // for example, the api starts at 1, not 0, so offset of 1 would correct that
    // if you wanted to skip the first outlet, offset would be 2
    offset: 2,
    boxes: [
        {
            totalOutlets: 15,
            url: 'http://192.168.2.202:3000/outlets/'
        },
        {
            totalOutlets: 15,
            url: 'http://192.168.2.204:3000/outlets/'
        }
    ],
    messageTiming: {
        on: 1800,
        break: 200,
        space: 800,
        betweenMessages: 10000
    },
    turnBackOn: [27, 29, 30],
    patterns: {
        messageApproach: {
            pattern: [
                {lights: [27],on: 50, after: 0},
                {lights: [28],on: 50,after: 50},
                {lights: [28],on: 150,after: 50},
                {lights: [27],on: 100,after: 100},
                {lights: [27],on: 100,after: 75},
                {lights: [29],on: 100,after: 0},
                {lights: [28],on: 250,after: 0},
                {lights: [29,30],on: 200, after: 0},
                {lights: [30],on: 100,after: 50},
                {lights: [29],on: 150,after: 50},
                {lights: [29, 30],on: 50,after: 0}
            ],
            label: 'Approaching Message'
        },
        allOff: {
            pattern: [],
            label: 'All Off'
        },
        fan: {
            pattern: [],
            label: 'Fan All'
        },
        fanLetters: {
            pattern: [],
            label: 'Fan Letters'
        },
        flashAll: {
            pattern: [],
            label: 'Flash All!'
        }
    }
};

config.patterns.allOff.pattern = _.map(generateAllRangeArray(config),(n) => {
    return {lights: [n], on: 0, after: 0};
});

config.patterns.fan.pattern = _.map(generateAllRangeArray(config),(n) => {
    return {lights: [n], on: 100, after: 0};
});

config.patterns.fanLetters.pattern = _.map(_.range(1,27),(n) => {
    return {lights: [n], on: 100, after: 0};
});

config.patterns.flashAll.pattern = [
    { lights: generateAllRangeArray(config), on: 50, after: 50 },
    { lights: generateAllRangeArray(config), on: 150, after: 0 },
    { lights: generateAllRangeArray(config), on: 50, after: 150 },
    { lights: generateAllRangeArray(config), on: 200, after: 100 }
];

module.exports = config;