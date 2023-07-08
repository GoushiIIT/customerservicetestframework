/**
 * Copyright 2023 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

const { defineConfig } = require('cypress')


/**
 * Get the recent email from your Gmail account.
 * @type {Cypress.PluginConfig}
 *`on` is used to hook into various events Cypress emits.
 *`config` is the resolved Cypress config.
 * <reference types="cypress" />
 */

const { rm } = require("fs/promises");
const fs = require("fs");
const { install, ensureBrowserFlags } = require("@neuralegion/cypress-har-generator")
//const installLogsPrinter = require("cypress-terminal-report/src/installLogsPrinter");


module.exports = defineConfig({
    _comment:
        'This JSON file is used to store any configuration values in dev and stage environments. To apply the same configuration for prod environmnet please update production-config.json file ',
    //screenshotsFolder: 'cypress/screenshots/chrome',
    videosFolder: 'cypress/videos/chrome',
    videoCompression: 15,
    videoUploadOnPasses: false,
    screenshotOnRunFailure: true,  
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        reporterEnabled: 'mochawesome, cypress-qase-reporter',
        mochawesomeReporterOptions: {
            reportDir: 'cypress/reports/mocha',
            reportFilename: 'chrome',
            quiet: true,
            overwrite: false,
            html: true,
            json: true,
        },
        cypressQaseReporterReporterOptions: {
            projectCode: 'ASG',
            logging: true,
            sendScreenshot: true,
            runComplete: true,
        },
    },
    pageLoadTimeout: 240000,
    execTimeout: 120000,
    taskTimeout: 120000,
    defaultCommandTimeout: 60000,
    chromeWebSecurity: false,
    viewportWidth: 1280,
    viewportHeight: 1250,
    numTestsKeptInMemory: 0,
    projectId: '',
    env: {
        cypress_record_key: '',
        logFolder: 'console-logs/chrome',
        MAILOSAUR_API_KEY: '',
        hars_folders: 'cypress/hars',
        snapshotOnly: true,
        requestMode: true
    },
    experimentalRunEvents: true,
    experimentalSessionAndOrigin: true,
    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {

            // Switch to the different environment config file
            let envars;
            if (config.env.environment) {
                envars = require(`./cypress.env.${config.env.environment}.json`);
            }
            else {
                envars = require("./cypress.env.json");
            }
            config.env = {
                ...config.env,
                ...envars
            };

            //Switch spec pattern and exclude pattern based on the region
            if (config.env.region) {

                var consoleUrl = config.env.accessUrlConsole;
                if (consoleUrl.includes("https://console.asgardeo.io")){
                    var specPatternJSON = JSON.parse(fs.readFileSync("./config-prod-" + config.env.region + ".json", "utf8"));
                    config.specPattern = specPatternJSON.specPattern;
                    config.excludeSpecPattern = specPatternJSON.excludeSpecPattern;

                }
                else
                {
                    specPatternJSON = JSON.parse(fs.readFileSync("./config-" + config.env.region + ".json", "utf8"));
                    config.specPattern = specPatternJSON.specPattern;
                    config.excludeSpecPattern = specPatternJSON.excludeSpecPattern;
                }
            }
            else
            {
                specPatternJSON = JSON.parse(fs.readFileSync("./config-dev.json", "utf8"));
                config.specPattern = specPatternJSON.specPattern;
                config.excludeSpecPattern = specPatternJSON.excludeSpecPattern;
            }

            config.baseUrl = config.env.accessUrlConsole;

            const options_log_printer = {
                printLogsToFile: "always",
                outputRoot: config.projectRoot + "/cypress/logs/" + config.env.logFolder + "/",
                //specRoot: path.relative(config.fileServerFolder, config.integrationFolder),
                outputTarget: {
                    "cypress-logs|json": "json",
                    "cypress-logs|txt": "txt",
                },
            };

            //installLogsPrinter(on, options_log_printer);

            on("before:run", () => {
                fs.rmdir(config.projectRoot + "/cypress/logs/" + config.env.logFolder + "/",
                    { maxRetries: 10, recursive: true }, (err) => {
                        if (err) {
                            console.error(err)
                        }
                    })
            });

            install(on, config);
            on("before:browser:launch", (browser = {}, launchOptions) => {
                ensureBrowserFlags(browser, launchOptions);
                return launchOptions;
            });

            /**
             * This configuration for process and save videos only for failed test specification. 
             * Consider the video process for executing each test specification separately.
             * Successful executions are not processed and discarded videos.
             */
            const filesToDelete = [];
            on("after:spec", (spec, results) => {

                if (results.stats.failures === 0 && fs.existsSync(results.video)) {
                    filesToDelete.push(results.video);
                }
            });

            on("after:run", async () => {

                console.log(
                    "Deleting %d videos from successful specs",
                    filesToDelete.length
                );
                await Promise.all(filesToDelete.map((videoFile) => rm(videoFile)));
            });

            return config;


        },
        experimentalRunAllSpecs: true
    },
});
