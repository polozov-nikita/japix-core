const Router = require('./router/router');
const https = require('https');
const url = require('url');
const fs = require('fs');

class Https {
    /**
     * @private
     */
    static async init(routesTable, props) {
        let requestUrl = '';

        if ( (props.certificates.privkey === undefined) || (props.certificates.cert === undefined) ) {
            throw new Error('No certificates found'); 
        }

        const option = {
            key: fs.readFileSync(props.certificates.privkey),
            cert: fs.readFileSync(props.certificates.cert)
        };

        return https.createServer(option, (request, response) => {
            requestUrl = url.parse(request.url);

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
        this.init(routesTable, props).then(server => {
            server.listen(props.port, () => {
                console.log('JAPIX is working!');
            });
        })
    }
}

module.exports = Https;  