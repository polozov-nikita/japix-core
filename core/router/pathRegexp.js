/**
 * @class The class is intended for creating regex for address templates
 */
class PathRegexp {
    static get regexpElems() {
        return {
            start: '^',
            end: '$',
            slash: '\\/',
            slashNotRequired: '(\\/)?'
        };
    }

    static get dataTypes() {
        return {
            any: '(\/\\S{1,})',

            int: '(\\/-?\\d{1,})',
            unsignedInt: '(\\/\\d{1,})',
            minusInt: '(\\/-\\d{1,})',

            float: '(\\/-?\\d{1,}\.\d{1,})',
            unsignedFloat: '(\\/\\d{1,}\\.\\d{1,})',
            minusFloat: '(\\/-\\d{1,}\\.\\d{1,})',
            
            string: '(\\/\\w{1,})'
        };
    }

    /**
     * Gets all elements of the template
     * 
     * @param {string} template
     * @private
     */
    static async getTemplateElems(template) {
        let templateElems = template.split('/');
    
        if (templateElems[0] === '') {
            templateElems = templateElems.splice(1, templateElems.length);
        }
    
        if (templateElems[templateElems.length - 1] === '') {
            templateElems = templateElems.splice(0, templateElems.length - 1);
        }
    
        return templateElems;
    }

    /**
     * Gets the param data
     * 
     * @param {string} param
     * @private
     */
    static async getParamData(param) {
        let paramData = {
            name: '',
            type: 'any',
            isRequired: true
        };
    
        let startIndex = 0;

        if (param[startIndex] === '?') {
            paramData.isRequired = false;
            startIndex++;
        }
    
        if (param[startIndex] === '(') {
            startIndex++;
            paramData.type = '';
            
            for (let i = startIndex; param[i] !== ')'; i++) {
                paramData.type += param[i];
                startIndex++;
            }

            startIndex++;
        }

        for (let i = startIndex; i < param.length; ++i) {
            paramData.name += param[i];
        }

        return paramData;
    }
    
    /**
     * Creates a new `RegExp` in `string` for the types
     * 
     * @param {string} type
     * @param {bool} isRequired
     * @private
     */
    static getTypeRegexp(type, isRequired) {
        let reg = '';

        switch (type.toLowerCase()) {
            case 'string':
                reg += isRequired === true ? this.dataTypes.string : this.dataTypes.string + '?';
            break;

            case 'int':
                reg += isRequired === true ? this.dataTypes.int : this.dataTypes.int + '?';
            break;
            case 'unsignedint':
                reg += isRequired === true ? this.dataTypes.unsignedInt : this.dataTypes.unsignedInt + '?';
            break;
            case 'minusint':
                reg += isRequired === true ? this.dataTypes.minusInt : this.dataTypes.minusInt + '?';
            break;

            case 'float':
                reg += isRequired === true ? this.dataTypes.float : this.dataTypes.float + '?';
            break;
            case 'unsignedfloat':
                reg += isRequired === true ? this.dataTypes.unsignedFloat : this.dataTypes.unsignedFloat + '?';
            break;
            case 'minusfloat':
                reg += isRequired === true ? this.dataTypes.minusFloat : this.dataTypes.minusFloat + '?';
            break;

            default:
                reg += isRequired === true ? this.dataTypes.any : this.dataTypes.any + '?';
            break;
        }

        return reg;
    }

    /**
     * Creates a new `RegExp` by the template
     * 
     * @param {string} template
     * @public
     */
    static async create(template) {
        let params = await this.getTemplateElems(template);
        let reg = this.regexpElems.start;
        let tempParamData = null;
    
        for (let i = 0; i < params.length; i++) {
            if (params[i][0] === ':') {
                tempParamData = await this.getParamData(params[i].split('').splice(1, params[i].length).join(''));
                reg += this.getTypeRegexp(tempParamData.type.toLowerCase(), tempParamData.isRequired);
            } else {
                reg += this.regexpElems.slash;
                reg += params[i];
            }
        }
    
        reg += this.regexpElems.slashNotRequired;
        reg += this.regexpElems.end;
    
        return new RegExp(reg);
    }
}

module.exports = PathRegexp;