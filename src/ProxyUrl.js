
module.exports = {

    constructProxyUrl : function (options) {
        
        const result = {};
        const target = options.target;
        const bucketSid = options.bucketSid;
        const gatewayDomain = options.gatewayDomain || "apitraffic.io";

        const url = new URL(target);
        const conversionSteps = [];
        
        let hostname = url.hostname;

        // replace any dashes with double dashes
        hostname = hostname.replace(/-/g, '--');
        conversionSteps.push({ description: "Replace any dash with a double dash.", result: hostname });

        // replace any periods with a dash
        hostname = hostname.replace(/\./g, '-');
        conversionSteps.push({ description: "Replace any period with a dash.", result: hostname });

        // add the bucket to the end.
        hostname = hostname + '-' + bucketSid;
        conversionSteps.push({ description: `Append a dash and then id of this bucket "${bucketSid}" `, result: hostname });

        // add the api traffic domain.
        hostname = hostname + '.' + gatewayDomain;
        conversionSteps.push({ description: "Append the string as the subdomain to the API Traffic gateway hostname.", result: hostname });

        // just replace the host name now...
        url.hostname = hostname;

        result.url = url;
        result.urlAsString = url.toString();

        // check to see if a trailing slash was passed in originally...
        if(target.charAt(target.length - 1) !== "/" && result.urlAsString.charAt(result.urlAsString.length - 1) === "/"){
            result.urlAsString = result.urlAsString.slice(0, -1);
        }

        result.steps = conversionSteps;

        return result;
    },

    deconstructProxyUrl : function (target) {
        const result = {
            host: "",
            tld: "",
            url : "",
            bucketSid : ""
        };

        const url = new URL(target);

        const hostParts = url.hostname.split('.');
        const hostPartsCount = hostParts.length;
        let targetHost = hostParts[0];

        //result.tld = hostParts[hostPartsCount - 2];
        hostParts.shift();
        result.tld = hostParts.join(".");

        //substitue multiple dashes.
        targetHost = targetHost.replace(/----/g, '::::');
        targetHost = targetHost.replace(/---/g, ':::');
        targetHost = targetHost.replace(/--/g, '::');

        // replace single dashes 
        targetHost = targetHost.replace(/-/g, '.');

        targetHost = targetHost.replace(/::::/g, '---');
        targetHost = targetHost.replace(/:::/g, '--');
        targetHost = targetHost.replace(/::/g, '-');
        
        // split apart the target host...
        let targetHostParts = targetHost.split('.');

        // get the bucket id which will be the last item in the array.
        result.bucketSid = targetHostParts[targetHostParts.length - 1];

        // remove the last item in the array since it is just the bucket Id and it has been extracted.
        targetHostParts.pop();

        targetHost = targetHostParts.join('.');

        result.host = targetHost;
        url.host = result.host;

        result.url = url.toString();

        // check to see if a trailing slash was passed in originally...
        if(target.charAt(target.length - 1) !== "/" && result.url.charAt(result.url.length - 1) === "/"){
            result.url = result.url.slice(0, -1);
        }

        return result;

    }
    
};