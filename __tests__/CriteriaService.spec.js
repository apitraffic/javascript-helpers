const lib = require('../src/index');
let baseRequestData = {};

/*
    {
        contextSid : "",
        direction : "in",
        request: {
            received: "",
            ip : "",
            url : "",
            method: "POST",
            headers : {},
            body : ""
        },
        response : {
            headers : {}, 
            status : 200,
            responseTime : 254,
            body : ""
        },
        tags : [{}],
        traces : []
    }


*/
beforeEach(() => {
    // reset the base request data...
    baseRequestData = {
        contextSid : "ctx_2oF60Bka6dQzcRCP94r68mFdUc5",
        direction : "in",
        request: {
            received: "2024-11-01T09:19:47.908Z",
            ip : "",
            url : "https://api.mydomain.com/v1/customers?type=active",
            method: "GET",
            headers : {
                "host": "localhost:82",
                "user-agent": "curl/7.88.1",
                "accept": "*/*"
            },
            body : null
        },
        response : {
            headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": false,
                        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE",
                        "Access-Control-Allow-Headers": "Accept, Authorization, Content-Type, If-None-Match, X-Requested-With",
                        "Access-Control-Max-Age": 1728000,
                        "content-type": "application/json; charset=utf-8",
                        "cache-control": "no-cache",
                        "content-length": 16,
                        "accept-ranges": "bytes"
                    },
            status : 200,
            responseTime : 254,
            body : "{\"success\":\"ok\"}"
        },
        tags : {
            account_id: "acc_2PC0QyK71VwmqdsPZiMCc10CJy3",
            user_id: "usr_0CJwkRhFlUBPG183GgJ2Xq78o2P"
        },
        traces : []
    };
});



describe("Testing Criteria Matcher", () => {

    describe("while creating an instance of the critera matcher", () => {

        test("Should successfully create an instance of the matcher.", async () => {

            const matcher = new lib.CriteriaMatcher({requestData: baseRequestData});
            
            expect(matcher.direction).toEqual("in");
            expect(matcher.contextSid).toEqual("ctx_2oF60Bka6dQzcRCP94r68mFdUc5");

            expect(matcher.protocol).toEqual("https");
            expect(matcher.port).toEqual(443);
            expect(matcher.method).toEqual("GET");
            expect(matcher.host).toEqual("api.mydomain.com");
            expect(matcher.path).toEqual("/v1/customers");
            expect(matcher.responseReceivedTime).toEqual("2024-11-01T09:19:47.908Z");

            expect(matcher.duration).toEqual(254);
            expect(matcher.responseStatusCode).toEqual(200);
            expect(matcher.responseSize).toEqual(16);
            
        });

        test("Should error when not sending the request data.", async () => {
            expect(() => new lib.CriteriaMatcher()).toThrow("The request data must be passed into the CriteriaMatcher as the requestData property.");
        });


    });

    describe("while parsing criteria", () => {

        test("should successfully match on method.", async () => {

            const matcher = new lib.CriteriaMatcher({requestData: baseRequestData});
            const query = "method == GET";
            const matchResult = matcher.checkCriteria({query})

            expect(matchResult).toEqual(true);
            
        });

        test("should fail to match on incorrect method.", async () => {

            const matcher = new lib.CriteriaMatcher({requestData: baseRequestData});
            const query = "method == POST";
            const matchResult = matcher.checkCriteria({query})

            expect(matchResult).toEqual(false);
            
        });

        test("should successfully match on method AND status code", async () => {

            const matcher = new lib.CriteriaMatcher({requestData: baseRequestData});
            const query = "method == GET AND status_code == 200";
            const matchResult = matcher.checkCriteria({query})

            expect(matchResult).toEqual(true);
            
        });

        test("should successfully use the same instance to do checks.", async () => {

            const matcher = new lib.CriteriaMatcher({requestData: baseRequestData});
            
            const matchResult1 = matcher.checkCriteria({query: "method == GET AND status_code == 200"});
            const matchResult2 = matcher.checkCriteria({query: "method == POST AND status_code == 200"});

            expect(matchResult1).toEqual(true);
            expect(matchResult2).toEqual(false);
            
        });


    });
   

});