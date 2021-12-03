// const inquirer = require('inquirer');
// const path = require('path');
// const fse =  require('fs-extra');
// const { exec } = require('child_process');
// const packageJsonTemplate = require('../src/templates/package-template');

// const showHelp = () => {
//     console.log(`Ello, my name's Dinkin! What would you like to do?`);
//     console.log('\tCreate a new project\r');
//     console.log('\tGenerate a new React component\r');
//     console.log('\tShow available commands\r');
// };

// const promptWithQuestions = () => {
//     inquirer
// 		.prompt([
// 			{ 	
// 				type: 'list',
// 				name: 'intro',
// 				message: `Ello, my name's Dinkin. What would you like to do?`,
// 				choices: [
// 					{ name: 'Create a new React application.', value: 'create app' },
// 					{ name:'Generate a new React component', value: 'create component' }, 
// 					{ name: 'Get Help.', value: 'help' }
// 				]
// 			}
// 		])
// 		.then(({ intro }) => {
// 			switch (intro) {
// 				case 'create app':
// 					getAppName();
// 					break;
// 				case 'create component':
// 					getComponentName();
// 					break;
// 				default:
// 					console.error(`something went wrong while prompting the user.`);
// 			  }
// 		})
// 		// .catch((error) => {
// 		// 	if (error.isTtyError) {
// 			// Prompt couldn't be rendered in the current environment
// 			// } else {
// 			// Something else went wrong
// 		// 	}
// 		// });
// };

// const getAppName = () => {
// 	return inquirer
// 		.prompt({
// 			type: 'input',
// 			name: 'app_name',
// 			message: 'What would you like to name your application?',
// 			require: true,
// 			validate: (answer) => {
// 				if (!answer) {
// 					return 'You must provid an application name.'
// 				}
// 				return true;
// 			}
// 		})
// 		.then((answer)=> {
// 			return setupApplication(answer.app_name);
// 		});
// };
// /** TODO: add function that removes app whenever there is an error */
// const setupApplication = async (appName) => {
// 	const projectName = appName.split(' ').join('-');

// 	exec(`mkdir ${projectName} && cd ${projectName} && npm init -f`,  (initErr) => {
// 			if(initErr) {
// 				console.error('There was an issue initializing your application:', initErr);
// 				return;
// 			} 

// 			fse.readFile(`${projectName}/package.json`)
// 				.then((data) => {
// 					const result = JSON.parse(data);
// 					result['scripts'] = packageJsonTemplate.scripts;
// 					return result;
// 				})
// 				.then((data) => {
// 					return fse.writeFile(`${projectName}/package.json`, JSON.stringify(data, null, 4));
// 				})
// 				.catch((err) => {
// 					console.error(err);
// 					return;
// 				});

// 			console.log(`${projectName} initialized!`);

// 			const { dependencies, devDependencies } = packageJsonTemplate;
// 			const deps = Object.keys(dependencies).join(' ');
// 			const devDeps = Object.keys(devDependencies).join(' ');
		
// 			console.log('installing dependencies...');

// 			exec(`cd ${projectName} && npm install -D ${devDeps} && npm i -S ${deps}`, async (npmErr) => { 
// 				if(npmErr) {
// 					console.error('There was an issue installing dependencies:', npmErr);
// 					return;
// 				} 
// 				// TODO: add a loading spinner here
// 				console.log('dependencies installed!');
// 				console.log('copying additional files...')
// 				await fse.copy(`${__dirname}/../src/scaffold`, `./${projectName}`)
// 					.then(() => console.log(`success! ${projectName} is ready to go!`))
// 					.catch((err) => {
// 						console.error('There was an issue copying the required files:',err);
// 					});
// 			});
// 		});
// };

// const getComponentName = () => {
// 	return inquirer
// 		.prompt({
// 			type: 'input',
// 			name: 'component_name',
// 			message: 'What is the name of the component?'
// 		})
// 		.then((answer)=> {
// 			console.log(`...creating a component named ${answer.component_name}`);
// 		});
// };

// module.exports = { showHelp, promptWithQuestions };