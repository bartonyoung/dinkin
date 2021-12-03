#! /usr/bin/env node
const yargs = require('yargs');
const process = require('process');
const inquirer = require('inquirer');
const fse =  require('fs-extra');
const { exec } = require('child_process');
const packageJsonTemplate = require('../templates/package-template');

if (!yargs.argv._[0]) {
    promptWithQuestions();
}

// const usage = "\nUsage: dink --create <my-application-name> to start a new React project";
// const options = yargs  
//       .usage(usage)  
//       .option("c", { alias:"create", describe: "Create a basic React app with Typescript and TailwindCSS.", type: "boolean", demandOption: false })                                                                                                    
//       .help(true)  
//       .argv;

// function showHelp() {
//     console.log(`Ello, my name's Dinkin! What would you like to do?`);
//     console.log('\tCreate a new project\r');
//     console.log('\tGenerate a new React component\r');
//     console.log('\tShow available commands\r');
// };

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
					promptComponent();
					break;
				default:
					console.error(`Please make a valid selection.`);
			  }
		})
		.catch((error) => {
			console.error('Something went wrong. Aborting.:', error);
		});
};

async function promptComponent() {
	const componentName = await getComponentName();
	const addToExistingDirectory = await shouldAddToDirectory();
	console.log(addToExistingDirectory);
	if (addToExistingDirectory) {
		const componentDirectoryName = await getComponentDirectoryName();
		createComponent(componentName, componentDirectoryName);
	} else {
		createComponent(componentName);
	}
	// inquirer
	// 	.prompt([
	// 		{ 	
	// 			name: 'component',
	// 			type: 'input',
	// 			message: `What is the name of the component?`
	// 		}
	// 	])
		// .then(({ component }) => {
			// await addToDirectoryPrompt();
			// inquirer
			// 	.prompt([
			// 		{ 	
			// 			name: 'addToExistingDirectory',
			// 			type: 'confirm',
			// 			message: `Should the component live in an existing component sub-directory?`
			// 		}
			// 	])
		// })
		// .then(({ addToExistingDirectory }) => {
		// 	let parentDirectory;
			// if (addToExistingDirectory) {
			// 	inquirer
			// 		.prompt([
			// 			{
			// 				name: 'parentDirectory',
			// 				type: 'input',
			// 				message: 'Enter the component\'s parent directory.'
			// 			}
			// 		])
			// 		.then(({ parentDir }) => {
			// 			parentDirectory = parentDir 
			// 		})
			// } else {
				
			// }
		// });
};

function createApp() {
	inquirer
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
			setupApplication(answer.app_name);
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
				return fse.writeFile(`${projectName}/package.json`, JSON.stringify(result, null, 4));
			})
			.catch((err) => {
				console.error('There was an error creating the package.json file:', err);
				removeDirectory();
			});

		console.log(`${projectName} initialized!`);

		const { dependencies, devDependencies } = packageJsonTemplate;
		const deps = Object.keys(dependencies).join(' ');
		const devDeps = Object.keys(devDependencies).join(' ');
	
		console.log('installing dependencies...');

		exec(`cd ${projectName} && npm install -D ${devDeps} && npm i -S ${deps}`, async (npmErr) => {
			if(npmErr) {
				console.error('There was an issue installing dependencies:', npmErr);
				removeDirectory();
			} 
			// TODO: add a loading spinner here
			console.log('dependencies installed!');
			console.log('copying additional files...');

			await fse.copy(`${__dirname}/../scaffold`, `./${projectName}`, { filter: (srcFile) => !srcFile.includes('.git') })
				.then(() => console.log(`success! ${projectName} is ready to go!`))
				.catch((err) => {
					console.error('There was an issue copying the required files:', err);
					removeDirectory();
				});
		});
	});
};

function createComponent(componentName, parentDirectory) {
	parentDirectory ? console.log(`${parentDirectory} ---->`, componentName) : console.log('no parent directory');
	exec(`pwd`, (locationCheckErr, location) => {
		if (locationCheckErr) {
			console.log('There was an error creating your component.');
			return;
		}
		
		// TODO:
		// confirm that the current directory contains a "components" directory
		// if passed a parentDirectory, search for that directory or create it
		console.log('current location--->', process.cwd())
		fse.readdir(process.cwd())
			.then((files) => console.log(files))
			.catch((err) => console.error('There was an error', err))
	});
};

function shouldAddToDirectory() {
	return inquirer
		.prompt([
			{ 	
				name: 'addToExistingDirectory',
				type: 'confirm',
				message: `Should the component live in an existing component sub-directory?`
			}
		])
		.then(( { addToExistingDirectory }) => addToExistingDirectory);
}

function getComponentName() {
	return inquirer
		.prompt([
			{ 	
				name: 'component',
				type: 'input',
				message: `What is the name of the component?`
			}
		])
		.then(( { component }) => component);
}; 

function getComponentDirectoryName() {
	return inquirer
		.prompt([
			{
				name: 'directoryName',
				type: 'input',
				message: 'Enter the name of an existing component directory'
			}
		])
		.then(( { directoryName }) => directoryName);
}
