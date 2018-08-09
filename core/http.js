const http = require('http');
const url = require('url');
const Router = require('./router/router');

class Http {
    /**
     * @private
     */
    static async init(routesTable, props) {   
        let requestUrl = '';

        return http.createServer((request, response) => {
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

module.exports = Http;  