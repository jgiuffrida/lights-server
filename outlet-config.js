module.exports = {
    // how far should we offset the mapping between the outlets
    // for example, the api starts at 1, not 0, so offset of 1 would correct that
    // if you wanted to skip the first outlet, offset would be 2
    offset: 2,
    boxes: [
        {
            totalOutlets: 15,
            url: 'http://192.168.2.13:3000/outlets/'
        },
        {
            totalOutlets: 15,
            url: 'http://192.168.2.14:3000/outlets/'
        }
    ],
    messageTiming: {
        on: 2500,
        break: 500,
        space: 1500,
        betweenMessages: 4000
    }
};


// mapping
/*

outlet: actual

1: 1
2: 2 // yay
3: not working
4: 4
5: 13
6: 6
7: 7
8: 8
9: 9
10: 10
11: not working
12: 12
13: 14
14: 5
15: not working

swap order:
14 out
13 to 14
5 to 13
loose (14) to 5

*/