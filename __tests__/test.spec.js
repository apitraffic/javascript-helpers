const lib = require('../src/index');


//const redis = r.createClient();

beforeEach(() => {

});

describe("Url Helper Functions", () => {

    describe("while creating the proxy url", () => {

        test("should successfully create url using http.", async () => {

            const options = {
                target: "https://www.boredapi.com/api/activity/",
                bucketSid: "123456abc"
            };

            const result = lib.constructProxyUrl(options);
            
            expect(result.urlAsString).toEqual("https://www-boredapi-com-123456abc.apitraffic.io/api/activity/");


        });

        describe("when only modifying without a path", () => {



            test("should successfully create url using http.", async () => {

                const options = {
                    target: "http://api.testdomain.com",
                    bucketSid: "123456abc"
                };

                const result = lib.constructProxyUrl(options);
                
                expect(result.urlAsString).toEqual("http://api-testdomain-com-123456abc.apitraffic.io");


            });

            test("should successfully create url using https.", async () => {

                const options = {
                    target: "https://api.testdomain.com",
                    bucketSid: "123456abc"
                };

                const result = lib.constructProxyUrl(options);
                
                expect(result.urlAsString).toEqual("https://api-testdomain-com-123456abc.apitraffic.io");


            });

            test("should successfully create url that has a dash in the url.", async () => {

                const options = {
                    target: "https://api-testing.testdomain.com",
                    bucketSid: "123456abc"
                };

                const result = lib.constructProxyUrl(options);
                
                expect(result.urlAsString).toEqual("https://api--testing-testdomain-com-123456abc.apitraffic.io");

            });

            test("should successfully create url if the original url had a trailing slash", async () => {

                const options = {
                    target: "https://api.testdomain.com/",
                    bucketSid: "123456abc"
                };

                const result = lib.constructProxyUrl(options);
                
                expect(result.urlAsString).toEqual("https://api-testdomain-com-123456abc.apitraffic.io/");

            });

            test("should successfully create url where a custom port is provided.", async () => {

                const options = {
                    target: "https://api.testdomain.com:8000",
                    bucketSid: "123456abc"
                };

                const result = lib.constructProxyUrl(options);
                
                expect(result.urlAsString).toEqual("https://api-testdomain-com-123456abc.apitraffic.io:8000");

            });



        });

        describe("when only modifying with a path", () => {

            test("should successfully create url with a single path segment", async () => {

                const options = {
                    target: "http://api.testdomain.com/v1",
                    bucketSid: "123456abc"
                };

                const result = lib.constructProxyUrl(options);
                
                expect(result.urlAsString).toEqual("http://api-testdomain-com-123456abc.apitraffic.io/v1");


            });

            test("should successfully create url with multiple path segments", async () => {

                const options = {
                    target: "http://api.testdomain.com/v1/test",
                    bucketSid: "123456abc"
                };

                const result = lib.constructProxyUrl(options);
                
                expect(result.urlAsString).toEqual("http://api-testdomain-com-123456abc.apitraffic.io/v1/test");


            });

            test("should successfully create url that uses basic auth.", async () => {

                const options = {
                    target: "https://jason:test@www.boredapi.com:8100/api/activity/?testing=1",
                    bucketSid: "123456abc"
                };

                const result = lib.constructProxyUrl(options);
                
                expect(result.urlAsString).toEqual("https://jason:test@www-boredapi-com-123456abc.apitraffic.io:8100/api/activity/?testing=1");


            });


        });


    });

    describe("while deconstructing the proxy url", () => {

    
        describe("when only modifying with a path", () => {

            test("should successfully extract url with no path segment or trailing slash", async () => {
                const result = lib.deconstructProxyUrl("http://api-testdomain-com-123456abc.apitraffic.io");

                expect(result.url).toEqual("http://api.testdomain.com");
                expect(result.host).toEqual("api.testdomain.com");
                expect(result.bucketSid).toEqual("123456abc");
                expect(result.tld).toEqual("apitraffic.io");

            });

            test("should successfully extract url with no path segment but has a trailing slash", async () => {
                const result = lib.deconstructProxyUrl("http://api-testdomain-com-123456abc.apitraffic.io/");

                expect(result.url).toEqual("http://api.testdomain.com/");
                expect(result.host).toEqual("api.testdomain.com");
                expect(result.bucketSid).toEqual("123456abc");
                expect(result.tld).toEqual("apitraffic.io");

            });

            test("should successfully extract url that uses https", async () => {
                const result = lib.deconstructProxyUrl("https://api-testdomain-com-123456abc.apitraffic.io");

                expect(result.url).toEqual("https://api.testdomain.com");
                expect(result.host).toEqual("api.testdomain.com");
                expect(result.bucketSid).toEqual("123456abc");
                expect(result.tld).toEqual("apitraffic.io");

            });

            test("should successfully extract url that uses a custom port", async () => {
                const result = lib.deconstructProxyUrl("http://api-testdomain-com-123456abc.apitraffic.io:8000");

                expect(result.url).toEqual("http://api.testdomain.com:8000");
                expect(result.host).toEqual("api.testdomain.com");
                expect(result.bucketSid).toEqual("123456abc");
                expect(result.tld).toEqual("apitraffic.io");

            });

            test("should successfully extract url with a single path segment", async () => {
                const result = lib.deconstructProxyUrl("http://api-testdomain-com-123456abc.apitraffic.io/v1");

                expect(result.url).toEqual("http://api.testdomain.com/v1");
                expect(result.host).toEqual("api.testdomain.com");
                expect(result.bucketSid).toEqual("123456abc");
                expect(result.tld).toEqual("apitraffic.io");

            });


        });


    });



});