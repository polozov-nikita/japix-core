const cluster = require('cluster');
const defaults = require('./defaults');
const Router = require('./router/router');
const HandlersLoader = require('./handlersLoader');

/**
 * The main class of the engine
 */
class Engine {
    constructor(startProps) {
        if (!startProps) {
            startProps = defaults.startProps;
        } else {
            startProps = this.compareProps(startProps, defaults.startProps);
        }
        
        this.props = startProps;
        
        this.handlersLoader = new HandlersLoader(this.props.handlersFolder);

        this.actions = null;
        
        this.routesTable = null;
    }

    /**
     * Compares `props` to `defaultProps` and adds missing
     * @private
     */
    compareProps(props, defaultProps) {
        for (let key in defaultProps) {
            if (props[key] === undefined) {
                if (defaultProps[key] !== undefined) {
                    props[key] = defaultProps[key];
                }
            }
        }
        return props;
    }
    
    /**
     * Starts the server
     * @public
     */
    async start() {
        /**
         * Pre-launching
         */
        this.actions = await this.handlersLoader.getEnabledActions({});
        this.routesTable = await Router.getRoutesTable(this.actions);

        if (this.props.clusters.threads) {
            await this.createCluster();
        } else {
            await this.startServer();
        }
    }

    /**
     * Cluster creation
     * @private
     */
    async createCluster() {
        if ( isNaN(this.props.clusters.threads) || this.props.clusters.threads <= 0 ) {
            return false; 
        } 
        if (cluster.isMaster) {
            cluster.on('disconnect', (worker, code, signal) => {
                cluster.fork();
            });
        
            for (let i = 0; i < this.props.clusters.threads; i++) {
                cluster.fork();
            }
        } else {
            await this.startServer();
        } 
    }

    /**
     * Choosing the protocol
     * @private
     */
    async startServer() {
        try {
            switch (this.props.protocol.toLowerCase()) {
                case 'http':
                    const http = require('./http');
                    await http.listen(this.routesTable, this.props);
                break;

                case 'https':
                    const https = require('./https');
                    await https.listen(this.routesTable, this.props);                
                break;
                case 'http2':
                    const http2 = require('./http2');
                    await http2.listen(this.routesTable, this.props);
                break;

                default:
                break;
            }
        } catch (err) {
            console.error(err.stack);
        }
    }
}

module.exports = Engine;