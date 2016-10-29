var _ = require('lodash'),
    q = require('q'),
    request = require('request')
    config = require('./outlet-config');

class OutletManager {
    constructor(baseUrl) {
        // the base url to access this set of outlet 
        this.baseUrl = baseUrl[baseUrl.length-1] === '/' ? baseUrl : baseUrl+'/';
        this.paths = {
            'status': '',
            'outlet': '<%= id %>'
        };
    }

    buildUrl(path, options) {
        var builtPath = this.paths[path];
        if(options) {
            builtPath = _.template(this.paths[path])(options);
        }
        return this.baseUrl+builtPath;
    }
    getStatus() {
        var url = this.buildUrl('status'),
            def = q.defer();
            
        request.get(url)
            .on('response', (res) => {
                def.resolve(res.data);
            })
            .on('error', (err) => {
                def.reject(err);
            });

        return def.promise;
    }
    setOutlet(id, status) {
        var url = this.buildUrl('outlet',{ id: id+config.offset }), // add the offset
            def = q.defer();
        console.log('setting outlet at', url, 'to', status);
        request.post(url, {form: {value: status ? 1:0}})
            .on('response', (res) => {
                def.resolve();
            })
            .on('error', (err) => {
                console.log('errrrror',err);
                def.reject(err);
            });

        return def.promise;
    }
}

module.exports = OutletManager;