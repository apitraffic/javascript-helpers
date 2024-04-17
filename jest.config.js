// This configuration properties are taken from the official Jest documentation which is available at https://jestjs.io/docs/en/configuration.html 
//const {default} = require('jest-config');
module.exports = {
	// This configuration shows the  Jest testing framework whether or not each separate test cases should be reported during the executed test run
	verbose: true,
	// It indicates that each one imported modules in the tests must be mocked automatically
    // This configuration factors to the glob patterns Jest uses to detect test files
 	testMatch: [
   	"**/?(*.)+(spec|test).js?(x)"
 	],
	// This configuration indicates the Jest to an array of regexp pattern strings that are matched towards all test paths, matched tests are skipped
 	testPathIgnorePatterns: [
        "<rootDir>/config/",
        "<rootDir>/__tests/data/",
		"<rootDir>/__tests/helpers/",
        "<rootDir>/__mocks__/"
 	],
	// This configuration suggests framework to the root listing that Jest should check for the test cases and modules inside them
 	rootDir: null,
	// This configuration shows the Jest framework to the list of paths to directories that Jest ought to use to look for files inside them
	roots: [
   	"<rootDir>"
 	],
	// It shows whether or not it have to have the coverage data collected while executing the test
	collectCoverage: false,
 	// It indicates the directory in which Jest ought to output its coverage documents and test files
	coverageDirectory: 'coverage',
	// This property shows that an array of regexp sample strings used to skip the test coverage collection
 	coveragePathIgnorePatterns: [
		"/node_modules/",
		"<rootDir>/__tests_data/",
		"<rootDir>/__tests_helpers/",
		"<rootDir>/__mocks__/"
 	], 
	// It indicates that a list of reporter names that Jest makes use of whilst writing coverage reports
 	coverageReporters: [
   	"json",
   	"text",
   	"lcov",
   	"clover",
	"json-summary"
 	],
	// It indicates an array of directory names to be searched recursively up from the requiring module's location
 	moduleDirectories: [
   	"node_modules"
 	]
  };

