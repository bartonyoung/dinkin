#! /usr/bin/env node
const yargs = require('yargs');
const utils = require('./utils');

if (!yargs.argv._[0]) {
    utils.promptWithQuestions();
}

// const usage = "\nUsage: dink --create <my-application-name> to start a new React project";
// const options = yargs  
//       .usage(usage)  
//       .option("c", { alias:"create", describe: "Create a basic React app with Typescript and TailwindCSS.", type: "boolean", demandOption: false })                                                                                                    
//       .help(true)  
//       .argv;