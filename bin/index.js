#! /usr/bin/env node
const yargs = require('yargs');
const utils = require('./utils');
const inquirer = require('inquirer');
const fse =  require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const packageJsonTemplate = require('../src/templates/package-template');

if (!yargs.argv._[0]) {
    promptWithQuestions();
}

// const usage = "\nUsage: dink --create <my-application-name> to start a new React project";
// const options = yargs  
//       .usage(usage)  
//       .option("c", { alias:"create", describe: "Create a basic React app with Typescript and TailwindCSS.", type: "boolean", demandOption: false })                                                                                                    
//       .help(true)  
//       .argv;

function showHelp() {
    console.log(`Ello, my name's Dinkin! What would you like to do?`);
    console.log('\tCreate a new project\r');
    console.log('\tGenerate a new React component\r');
    console.log('\tShow available commands\r');
};

function promptWithQuestions() {
    inquirer
		.prompt([
			{ 	
				type: 'list',
				name: 'intro',
				message: `Ello, my name's Dinkin. What would you like to do?`,
				choices: [
					{ name: 'Create a new React application.', value: 'create app' },
					{ name:'Generate a new React component', value: 'create component' }, 
					{ name: 'Get Help.', value: 'help' }
				]
			}
		])
		.then(({ intro }) => {
			switch (intro) {
				case 'create app':
					createApp();
					break;
				case 'create component':
					getComponentName();
					break;
				default:
					console.error(`Please make a valid selection.`);
			  }
		})
		.catch((error) => {
			console.error('Something went wrong. Aborting.:', error);
		});
};

function createApp() {
	return inquirer
		.prompt({
			type: 'input',
			name: 'app_name',
			message: 'What would you like to name your application?',
			require: true,
			validate: (answer) => {
				if (!answer) {
					return 'You must provide an application name.'
				}
				return true;
			}
		})
		.then((answer)=> {
			return setupApplication(answer.app_name);
		})
        .catch((err) => { 
            console.error('Something went wrong. Aborting.:', err);
            // TODO: create and call removeDirectory() method
        })
};

async function setupApplication(appName) {
	const projectName = appName.split(' ').join('-');

	exec(`mkdir ${projectName} && cd ${projectName} && npm init -f`,  (initErr) => {

		const removeDirectory = () => {
			exec(`rm -rf ${projectName}`, (err, sdtout, stdouterror) => {
				if (err) {
					console.log(`ERROR REMOVING DIRECTORY: ${projectName}`, err);
				}
				console.log('application aborted :(');
			});
		}

		if(initErr) {
			console.error('There was an issue initializing your application:', initErr);
			return;
		} 

		fse.readFile(`${projectName}/package.json`)
			.then((data) => {
				const result = JSON.parse(data);
				result['scripts'] = packageJsonTemplate.scripts;
				return result;
			})
			.then((data) => {
				return fse.writeFile(`${projectName}/package.json`, JSON.stringify(data, null, 4));
			})
			.catch((err) => {
				console.error(err);
				removeDirectory();
			});

		console.log(`${projectName} initialized!`);

		const { dependencies, devDependencies } = packageJsonTemplate;
		const deps = Object.keys(dependencies).join(' ');
		const devDeps = Object.keys(devDependencies).join(' ');
	
		console.log('installing dependencies...');

		// exec(`cd ${projectName} && npm install -D ${devDeps} && npm i -S ${deps}`, async (npmErr) => { 
		exec(`cd ${projectName}`, async (npmErr) => { 
			if(npmErr) {
				console.error('There was an issue installing dependencies:', npmErr);
				removeDirectory();
			} 
			// TODO: add a loading spinner here
			console.log('dependencies installed!');
			console.log('copying additional files...');

			await fse.copy(`${__dirname}/../src/scaffold`, `./${projectName}`, { filter: (srcFile) => !srcFile.includes('.git') })
				.then(() => console.log(`success! ${projectName} is ready to go!`))
				.catch((err) => {
					console.error('There was an issue copying the required files:', err);
					removeDirectory();
				});
		});
	});
};

function getComponentName() {
	return inquirer
		.prompt({
			type: 'input',
			name: 'component_name',
			message: 'What is the name of the component?'
		})
		.then((answer)=> {
			console.log(`...creating a component named ${answer.component_name}`);
		});
};

module.exports = { showHelp, promptWithQuestions };