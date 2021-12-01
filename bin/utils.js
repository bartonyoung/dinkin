const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const packageJsonTemplate = require('../src/templates/package-template');

const showHelp = () => {
    console.log(`Ello, my name's Dinkin! What would you like to do?`);
    console.log('\tCreate a new project\r');
    console.log('\tGenerate a new React component\r');
    console.log('\tShow available commands\r');
};

const promptWithQuestions = () => {
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
					getAppName();
					break;
				case 'create component':
					getComponentName();
					break;
				default:
					console.log(`what?`);
			  }
		})
		// .catch((error) => {
		// 	if (error.isTtyError) {
			// Prompt couldn't be rendered in the current environment
			// } else {
			// Something else went wrong
		// 	}
		// });
};

const getAppName = () => {
	return inquirer
		.prompt({
			type: 'input',
			name: 'app_name',
			message: 'What would you like to name your application?',
			require: true,
			validate: (answer) => {
				if (!answer) {
					return 'You must provid an application name.'
				}
				return true;
			}
		})
		.then((answer)=> {
			return setupApplication(answer.app_name);
		});
};
/** TODO: add function that removes app whenever there is an error */
const setupApplication = async (appName) => {
	const projectName = appName.split(' ').join('-');

	exec(`mkdir ${projectName} && cd ${projectName} && npm init -f`,  (initErr, initStdout, initStderr) => {
			if(initErr) {
				console.error('There was an issue initializing your application:', initErr);
				return;
			} 

			fs.readFile(`${projectName}/package.json`)
				.then((data) => {
					console.log(data.toString());
					const result = JSON.parse(data);
					result['scripts'] = packageJsonTemplate.scripts;
					return result;
				})
				.then((data) => {
					return fs.writeFile(`${projectName}/package.json`, JSON.stringify(data, null, 4));
				})
				.catch((err) => {
					console.error(err);
					return;
				});

			console.log(`${projectName} initialized!`);

			const { dependencies, devDependencies } = packageJsonTemplate;
			const deps = Object.keys(dependencies).join(' ');
			const devDeps = Object.keys(devDependencies).join(' ');
		
			console.log('installing dependencies...');

			// exec(`cd ${projectName} && npm install -D ${devDeps} && npm i -S ${deps}`, (npmErr, npmStdout, npmStderr) => { 
			// 	if(npmErr) {
			// 		console.error('There was an issue installing dependencies:', npmErr);
			// 		return;
			// 	} 
			// 	// TODO: add a loading spinner here
			// 	console.log('dependencies installed!');
			// });
		});

	// console.log('what is this', );
	// await fs.readdir(`${__dirname}/../src/scaffold`).then((data) => {
	// 	console.log('data', data);
	// });
		
	// await Promise.all(files.map(async (file) => {
	// 	const contents = await fs.readFile(file, 'utf8')
	// 	console.log('--CONTENTS--', contents)
	// }));

	// await fs.cp(`./${projectName}`, scaffoldFiles)
	
	try {
		copyDir(`${__dirname}/../src/scaffold`, `./${projectName}/`);
	} catch (error) {
		throw error;
	}
};

const getComponentName = () => {
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

const createPackageJson = (appName) => {
	const template = packageJsonTemplate;
	template.name = appName;
	return JSON.stringify(template, null, 4);
};

const copyDir = async (src, dest) => {
    // await fs.mkdir(dest, { recursive: true });
	// console.log('')
    let entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory() ?
            await copyDir(srcPath, destPath) :
            await fs.copyFile(srcPath, destPath);
    }
}

module.exports = { showHelp, promptWithQuestions };