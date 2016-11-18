# Lights Server

A side project for controlling raspberry pi controlled banks of outlets. Uses express.js and socket.io 
to communicate between clients and configured raspberry pi's

Specific implementation is to simulate the lights in the netflix series stranger things... plus some other controllable outlets

Expects outlets project to be running on raspberry pi
(https://github.com/jgiuffrida/outlets)

## configuration
All config lives within ./outlet-config.js

### offset
Outlet id offset, converts recognized outlets in ui to an outlet id recognized by raspberry pi outlets

### boxes
Array of outlet boxes to use, each box must specify:
- totalOutlets: total count of outlets controlled by outlet box
- url: base url to contact raspberry pi with

### messageTiming
Various timing configurations
- on: duration of light on
- break: duration of light off after on
- space: duration of all lights off between words in message
- betweenMessages: duration to wait between messages

### turnBackOn
Outlets to turn back on after a message/pattern plays

### patterns
Object of configured canned patterns to play on button press, automatically added to message screen as single button light patterns to play

#### pattern config template
```javascript
{
    label: 'Some label', // label to display as button in ui
    pattern: [
        {
            lights: [1,2,3], // outlets to flicker
            on: 200, // lights on duration
            after: 200 // duration of off period, after on period
        }
    ] 
}
```


## running

`npm start`
- Starts express.js server on port 4000 which maintains client connections with socket.io and communicates with raspberry pi(s) through http requests
