const CriteriaParser = require('./CriteriaParser.js');

module.exports = class CriteriaMatcher {
    constructor(options) {

        if(!options?.requestData){   
            throw new Error('The request data must be passed into the CriteriaMatcher as the requestData property.');
        }

        const url = new URL(options?.requestData?.request?.url);

        this.contextSid = options?.requestData.contextSid || null;
        this.direction = options?.requestData.direction || null;
        this.host = url.hostname;
        this.method = options?.requestData?.request.method || null;
        this.path = url.pathname;
        this.protocol = url.protocol.replace(":", "");
        
        this.port = url.port;
        if(!this.port || this.port.length){
            this.port = (this.protocol === "http") ? 80 : 443;
        }        
        
        this.queryString = {};
        
        const queryString = url.searchParams;
        // Iterating the search parameters
        for (const key of queryString.keys()) {
            if(!this.queryString[key]){
                let values = queryString.getAll(key);

                if(values.length === 1){
                    values = values[0];
                }

                this.queryString[key] = values;
            }
          }
        
        this.headers = options?.requestData?.request.headers || {};
        
        this.url = options?.requestData?.request?.url;
        
        this.responseHeaders = options?.requestData?.response.headers || {};
        this.responseStatusCode = options?.requestData?.response.status || null;

        this.responseSize = this.requestSize = this.getValueIgnoreCase(this.responseHeaders, 'content-length');;
        this.requestSize = this.getValueIgnoreCase(this.headers, 'content-length');
        
        this.duration = options?.requestData?.response.responseTime || null;
        
        this.tags = options?.requestData?.tags || [];
        this.traces = options?.requestData?.traces || [];
        
        this.responseReceivedTime = options?.requestData?.request.received;

        const criteriaParserOptions = {
            keywords: Object.keys(this.getCriteriaMap())
        }

        this.CParser = new CriteriaParser(criteriaParserOptions);

       

        return this;

    }

    getCriteriaMap(){
        return {
            method : {es: "request.method", class:"method"},     
            capture : {es: "capture", class:"capture"},
            received : {es: "@timestamp", class:"createdAt"},
            url : {es: "request.url", class:"url"}, 
            url_path : {es: "request.path", class:"path"},
            duration : {es: "timings.duration", class:"duration"},
            host : {es: "request.host", class:"host"},
            request_size : {es: "request.size", class:"requestSize"},
            response_size : {es: "response.size", class:"responseSize"},
            status_code : {es: "response.statusCode", class:"responseStatusCode"},
            request_header : {es: "request.headers", class:"headers"},
            response_header : {es: "response.headers", class:"responseHeaders"},
            query_param : {es: "request.queryString", class:"queryString"},
            tag : {es: "tags", class:"tags"},
            direction : {es: "direction", class:"direction"},
            context_sid : {es: "contextSid", class:"contextSid"}
        };
    }

    compareValues(left, operator, right){
        try{
            if(operator === '=='){
                if(!(left == right)){
                    return false;
                }
            }else if(operator === '!='){
                if(!(left != right)){
                    return false;
                }
            }else if(operator === '>='){
                if(!(left >= right)){
                    return false;
                }
            }else if(operator === '<='){
                if(!(left <= right)){
                    return false;
                }                        
            }else if(operator === '>'){
                if(!(left > right)){
                    return false;
                }
            }else if(operator === '<'){
                if(!(left < right)){
                    return false;
                }
            }else if(operator === 'like'){
                // make sure the search string (right variable) does not start with a star...if so strip it.
                right = right.replace(/^\*/, '')



                const regex = new RegExp(right);
                // Test if the pattern exists in the search string

                const found = regex.test(left);

                if(!found){
                    return false;
                }
            }
        }catch(e){
            console.log(e);
            return false;
        }
        return true;
    }

    /**
     * This function checks if the given criteria matched the object's properties.
     * @param {Object} criteria - The criteria object that contains the query to check against.
     * @param {string} criteria.query - The query string that we are attempting to match against.
     * @returns {boolean} - Returns true if the criteria matched, false otherwise.
     */
    checkCriteria(criteria){
        let filterObj;
        // criteria must have a string property..
        if(!criteria.query){
            throw new Error("The criteria object must have a query property that contains the query to check against.");
        }

        try{
            filterObj = this.CParser.parse(criteria.query);
        }catch(e){
            return false;
        }

        // ok now we have the criteria...lets check for a match..
        if(filterObj.hasOwnProperty("AND")){
            const filterArr = filterObj.AND;
            const criteriaKeywordMap = this.getCriteriaMap();
            // check each condition, if there is not a match, we will return false right away...
            for (const condition of filterArr) {
                const classPropertyName = criteriaKeywordMap[condition.keyword].class;
                if(classPropertyName && !condition.path){         
                    const objectValue = this[classPropertyName] || null
                    if(!(this.compareValues(objectValue, condition.operator, condition.value))){
                        return false;
                    }
                }else if(classPropertyName && condition.path){
                    const objectValue = this[classPropertyName] || null;
                    const property = condition.path;
                    // check to see if property we are looking for is even a key in the object...
                    if((this.isJsonObject(objectValue)) && objectValue.hasOwnProperty(property)){
                        const classValue = objectValue[property];
                        // call the function to check.
                        if(!(this.compareValues(classValue, condition.operator, condition.value))){
                            return false;
                        }
                    }else{
                        // the object does not even have the property...
                        return false;
                    }
                }else{
                    // not a valid keyword...
                    return false;
                }
            }
        }else{
            // the fiters does not have an AND property...
            return false;
        }
        // if we made it this far... there was a match!
        return true;       
    }

    isJsonObject(value){
        if(Array.isArray(value)){
            return true;
        }else{
            try {
                if (value instanceof Object) {
                    return true;
                }else{
                    return false;
                }
            } catch (e) {
                return false;
            }
        }        
    }

    getValueIgnoreCase(obj, key) {
        const lowerKey = key.toLowerCase();
        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey);
        return foundKey ? obj[foundKey] : null;
    }

};