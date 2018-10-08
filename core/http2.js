const Router = require('./router/router');
const http2 = require('http2');
const url = require('url');
const fs = require('fs');

const {
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_STATUS,
    HTTP2_HEADER_CONTENT_TYPE,
    HTTP2_HEADER_SCHEME,
    HTTP2_HEADER_AUTHORITY
} = http2.constants;

class Http2 {

    /**
     * @private
     */
    static async init(routesTable, props) { 
        if ( (props.certificates.privkey === undefined) || (props.certificates.cert === undefined) ) {
            throw new Error('No certificates found'); 
        }

        const server = http2.createSecureServer({
            key: fs.readFileSync(props.certificates.privkey),
            cert: fs.readFileSync(props.certificates.cert)
        });

        server.on('error', (err) => { 
            throw new Error(err); 
        }); 
            
        server.on('stream', async (stream, headers, flags) => {
            const requestUrl = url.parse(headers[HTTP2_HEADER_PATH]);

            if (requestUrl.pathname === '/favicon.ico' && props.blockFavicon === true) {
                return;
            }

            let body = '';
            stream.on('data', function (data) {
                body += data.toString();
            });

            stream.respond({
                'content-type': 'text/html',
                ':status': 200
            });

            Router.findAction(routesTable, requestUrl.pathname).then(res => {
                if (!res) {
                    stream.end(JSON.stringify('404'));
                } else {
                    if (headers[HTTP2_HEADER_METHOD].toLowerCase() === res.method) {

                        Router.getRouteData({
                            model: res.data,
                            body: body,
                            requestUrl: requestUrl
                        }).then(routeData => {
                            response.end(JSON.stringify(res.action(routeData)));
                        });

                    } else {
                        stream.end(JSON.stringify('404'));
                    }
                }
            });
        });    
        
        return server;
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

module.exports = Http2;