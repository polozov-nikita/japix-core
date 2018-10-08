const http = require('http');
const url = require('url');
const Router = require('./router/router');

class Http {
    /**
     * @private
     */
    static async init(routesTable, props) {
        return http.createServer((request, response) => {
            const requestUrl = url.parse(request.url);

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
            const server = await this.init(routesTable, props);
            server.listen(props.port, () => {
                console.log('JAPIX is working!');
            });
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Http;  