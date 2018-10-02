const Router = require('./router/router');
const https = require('https');
const url = require('url');
const fs = require('fs');

class Https {
    /**
     * @private
     */
    static async init(routesTable, props) {
        if (!props.certificates.privkey) {
            throw new Error('No server privateKey found'); 
        }
        if (!props.certificates.cert) {
            throw new Error('No server certificate found'); 
        }

        const CAkey = props.certificates.ca ? fs.readFileSync(props.certificates.ca) : null;
        const ServerCert =  props.certificates.cert ? fs.readFileSync(props.certificates.cert) : null;
        const ServerCertPassphrase = props.certificates.passphrase;
        const ServerKey =  props.certificates.privkey ? fs.readFileSync(props.certificates.privkey) : null;
        const ServerRequestClientCert = props.certificates.requestCert ? true : false;
        const ServerRejectUnauthorized = props.certificates.rejectUnauthorized ? true : false;

        if (ServerRequestClientCert && !CAkey) {
            throw new Error('No CAkey found'); 
        }

        const option = {
            key: ServerKey,
            cert: ServerCert,
            ca: CAkey,
            passphrase: ServerCertPassphrase,
            requestCert: ServerRequestClientCert,
            rejectUnauthorized: ServerRejectUnauthorized
        };

        return https.createServer(option, (request, response) => {
            let requestUrl = url.parse(request.url);

            if (requestUrl.pathname === '/favicon.ico' && props.blockFavicon === true) {
                return;
            }

            Router.findAction(routesTable, requestUrl.pathname).then(res => {
                if (!res) {
                    response.end(JSON.stringify('404'));
                } else {
                    if (request.method.toLowerCase() === res.method) {
                        
                        Router.getRouteData({
                            model: res.data,
                            body: {},
                            requestUrl: requestUrl
                        }).then(routeData => {
                            response.end(JSON.stringify(res.action(routeData)));
                        });

                    } else {
                        response.end(JSON.stringify('404'));
                    }
                }
            });
        });
    }

    /**
     * @public
     */
    static async listen(routesTable, props) {
        try {
            let server = await this.init(routesTable, props);
            server.listen(props.port, () => {
                console.log('JAPIX is working!');
            });
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Https;