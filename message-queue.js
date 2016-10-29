var config = require('./outlet-config');
var q = require('q');
var _ = require('lodash');

class MessageQueue {
    constructor(lightsManager) {
        this.lightsManager = lightsManager;
        this.messages = [];
        this.isProcessing = false;
        this.alphaToOutlet = {};
            
        _('abcdefghijklmnopqrstuvwxyz')
            .split('')
            .forEach((item, idx) => {
                this.alphaToOutlet[item] = idx;
            });
    }

    getMessages() {
        return this.messages;
    }

    addMessage(msg) {
        this.messages.push(msg);
        if(!this.isProcessing) {
            this.isProcessing = true;
            this.process();
        }
        return this;
    }

    process() {
        let msg = this.messages[0];
        this.writeMessage(msg)
            .then(() => {
                this.messages.shift();
                if(this.messages.length) {
                    if(config.messageTiming.betweenMessages) {
                        setTimeout(() => {
                            __io.emit('lights:message:status', this.getMessages());
                            this.process();
                        }, config.messageTiming.betweenMessages);
                    }else{
                        __io.emit('lights:message:status', this.getMessages());
                        this.process();
                    }
                }else{
                    __io.emit('lights:message:status', this.getMessages());
                    this.isProcessing = false;
                }
            });
        return this;
    }

    writeMessage(msg) {
        let letters = msg.split(''),
            def = q.defer(),
            progress = 0,
            letterCount = 0;
        console.log('writing messsage', msg);
        this.writeLetters(_.clone(letters),def);
        def.promise.progress((letter) => {
            letterCount++;
            progress = parseInt((letterCount/letters.length)*100, 10);
            __io.emit('lights:message:progress', { 'progress': progress });
        });

        return def.promise;
    }

    writeLetters(letters, deferred) {
        if(_.size(letters)) { // are we out of letters yet?
            let letter = letters.shift();
            this.writeLetter(letter)
                .then(() => { // We did a letter, now lets do the next.
                    deferred.notify(letter);
                    this.writeLetters(letters,deferred);
                });
        }else{
            // oh shit we're done, let's move on.
            // resolve the provided deferred so that process can either move onto the next one or finish up
            deferred.resolve();
        }

    }

    writeLetter(letter) {
        var def = q.defer(),
            outlet = this.alphaToOutlet[letter.toLowerCase()];
        console.log('writing',letter == ' ' ? '[space]' : letter, 'to', outlet);
        if(letter == ' ') {
            setTimeout(() => {
                def.resolve();
            }, config.messageTiming.space);
        }else{
            if(outlet !== undefined) { // if we found an outlet for this character, cool
                this.lightsManager.setOutlet(outlet, true);
                setTimeout(() => { // wait for the config time to keep it on
                    this.lightsManager.setOutlet(outlet, false);
                    if(config.messageTiming.break) { // wait if it's configured, if not just move on
                        setTimeout(() => {
                            def.resolve();
                        }, config.messageTiming.break);
                    }else{
                        def.resolve();
                    }
                }, config.messageTiming.on);
            }else{
                def.resolve(); // no outlet for this character, just skip it.
            }
        }

        return def.promise;
    }
}

module.exports = MessageQueue;