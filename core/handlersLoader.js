const fs = require('fs');

class HandlersLoader {
    constructor(handlersFolder) {
        this.handlers = [];
        this.rootPath = handlersFolder;
    }

    /**
     * Loading all of the handlers
     * @param path The root folder of all handlers
     */
    async loadAll(path) {
        if (path === undefined) {
            path = this.rootPath;
        }

        let dir = fs.readdirSync(path);

        for (let i = 0; i < dir.length; i++) {
            let dirElem = dir[i].split('.');
            let currentPath = path;

            if (dirElem.length === 1) {
                currentPath += `/${dirElem[0]}`;
                this.loadAll(currentPath);
            } else if (dirElem.length === 2 && dirElem[1] === 'js') {
                this.handlers.push(require(`../../.${currentPath}/${dirElem[0]}`));
            }
        }
    }

    /**
     * @return Object of all of enabled actions
     */
    async getEnabledActions(modules) {
        let enabledActions = {};

        this.loadAll(this.rootPath).then(res => {
            for (let i = 0; i < this.handlers.length; i++) {
                if (this.handlers[i].enabled === false) {
                    continue;
                }
    
                for (let key in this.handlers[i].routes) {
                    if (this.handlers[i].routes[key].enabled === true) {
                        enabledActions[key] = {
                            action: this.handlers[i][key].bind(modules),
                            route: this.handlers[i].routes[key]
                        };
                    }
                }
            }
        });
        
        return enabledActions;
    }
}

module.exports = HandlersLoader;