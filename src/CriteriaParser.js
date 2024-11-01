const validOperators = ["==", "!=", ">=", "<=", ">", "<", "like"];
module.exports = class CriteriaParser {
    
    constructor(options) {

        this.keywords = options.keywords ? options.keywords : [];

        return this;

    }

    parse(criteria){
        if(criteria.length){
            const conditions = this._parse(criteria);
            this._validateKeywords(conditions);
            
            return {
                "AND" : conditions
            }
        }else{
            return {};
        }
    }

    splitAndOr(input) {
        const parts = [];
    let currentPart = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        
        if (char === '"' || char === "'") {
            if (inQuotes && char === quoteChar) {
                inQuotes = false;
                quoteChar = '';
            } else if (!inQuotes) {
                inQuotes = true;
                quoteChar = char;
            }
        }
        
        if (!inQuotes && input.slice(i, i + 4) === ' AND') {
            parts.push(currentPart.trim());
            currentPart = '';
            i += 3; // Skip ' AND'
        } else if (!inQuotes && input.slice(i, i + 3) === ' OR') {
            parts.push(currentPart.trim());
            currentPart = '';
            i += 2; // Skip ' OR'
        } else {
            currentPart += char;
        }
    }
    
    if (currentPart.trim()) {
        parts.push(currentPart.trim());
    }
    
    return parts;
    }

    _parse(criteria){
        // first lets split the string up so we can handle each part...
        // this will look for all spaces (including consecutive) but not include any that have quotes around them...
        const criteraPartsRegex = /\s+(?==(?:[^"]*"[^"]*")*[^"]*$)/g;
        // grab the parts of the criteria string...        
        //const criteriaParts = criteria.split(criteraPartsRegex);
        // find all the AND and OR keywords that are not in quotes and have at least one space before and after...
        const criteriaParts = this.splitAndOr(criteria);
        // loop each handling as needed...
        const conditions = [];
        const _extractPath = this._extractPath;
        criteriaParts.forEach(function(condition) {
            const conditionObj = {
                operator:null,
                seperator: null,
                keyword:null,
                path:null,
                value: null,
                exclusion: false,
                text: condition
            };
            // Does this condition have any keyword component.
            //const regex = /(?<![0-9]):|<=|>=|==|!=|[=<>]/;
            const escapedOperators = validOperators.map(op => op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            const regexPattern = new RegExp(`(?<!["'])\\s*(${escapedOperators.join('|')})\\s*(?!["'])`, 'g');

            const conditionDetails = condition.match(regexPattern);
            
            if (conditionDetails && conditionDetails.length === 1) {    
                
                if(conditionDetails[0].length && validOperators.includes(conditionDetails[0].trim())){
                    conditionObj.seperator = conditionDetails[0].trim();

                    conditionObj.operator = conditionDetails[0].trim();
                    
                    // great now split up the parts...
                    const conditionParts = condition.split(conditionObj.seperator);

                    conditionObj.keyword = conditionParts[0].trim();
                    let value = conditionParts[1].trim();
                    
                    // the value part of the condition had colons, so put that part back to gether...
                    // This handles parsing dates for example...
                    if(conditionParts.length > 2){    
                        conditionParts.shift(); // to remove the first value.
                        value = conditionParts.join(":");
                    }
                    
                    // we are just going to make sure all quotes are removed...
                    conditionObj.value = value.replace(/"/g, '');

                    // if the keyword starts with a - then we need to count as an exclusion.
                    if (conditionObj.keyword.startsWith('-') || conditionObj.keyword.startsWith('!')) {
                        conditionObj.exclusion = true;
                        // now clean up the keyword...
                        conditionObj.keyword = conditionObj.keyword.substring(1);
                    }

                    _extractPath(conditionObj);

                    conditions.push(conditionObj);
                }else{

                    let error = {
                        "status": "error",
                        "message": `Invalid Syntax: Invalid operator.`,
                        "code": "invalid-operator",
                        "condition": conditionObj
                    };

                    throw error;

                }
            }else{

                let error = {
                    "status": "error",
                    "message": `Invalid Syntax: ${condition} is not allowed.`,
                    "code": "invalid-syntax",
                    "condition": conditionObj
                };

                throw error;
            }

        });
        return conditions;
    
    }

    _extractPath(conditionObj){
        const keywordParts = conditionObj.keyword.split(':');

        if(keywordParts.length > 1){
            // the first part is the keyword, so set that back..
            conditionObj.keyword = keywordParts[0];
            // remove the keyword from the array.
            keywordParts.shift();
            conditionObj.path = keywordParts.join(':');
        }
    }

    _validateKeywords(conditions){
        const _this = this;
        conditions.forEach(function(condition) {
            if (!_this.keywords.includes(condition.keyword)) {

                let error = {
                    "status": "error",
                    "message": `Invalid Condition: The keyword ${condition.keyword} is not valid.`,
                    "code": "invalid-condition",
                    "condition": condition
                };

                throw error;
            }
        });       
    }
    
};