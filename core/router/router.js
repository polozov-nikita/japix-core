const pathRegexp = require('./pathRegexp');

class Router {
    static async findAction(routesTable, pathname) {
        let regexpTest = null;

        for (let i = 0; i < routesTable.length; i++) {
            regexpTest = routesTable[i].regexp.exec(pathname);

            if (regexpTest) {
                return { 
                    ...routesTable[i],
                    data: regexpTest
                };
            }
        }

        return false;
    }

    static async getRoutesTable(actions) {
        let actionTable = [];

        for (let key in actions) {
            actionTable.push({
                action: actions[key].action,
                method: actions[key].route.method,
                path: actions[key].route.path,
                regexp: await pathRegexp.create(actions[key].route.path)
            });
        }

        return actionTable;
    }

    static async getRouteData(data) {
        let routeData = {
            model: {
                elems: []
            },
            body: {},
            requestUrl: data.requestUrl
        };

        for (let i = 1; i < data.model.length; i++) {
            if (data.model[i] === undefined) {
                break;
            } else {
                routeData.model.elems.push(data.model[i].split('').splice(1, data.model[i].length).join(''));
            }
        }

        return routeData;
    }
}

module.exports = Router;