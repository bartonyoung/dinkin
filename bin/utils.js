const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const fsPromise = fs.promises;
const packageJSONTemplate = require('./templates/package-template.json');

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

	try {
		await fsPromise.mkdir(`./${projectName}`, { recursive: true })
	} catch (error) {
		console.error('There was an issue setting up your application.');
		throw error;
	}

	const packageData = createPackageJson(projectName);
	try {
		await fsPromise.writeFile(`./${projectName}/package.json`, packageData, { flag: 'w+', encoding: 'utf8' });
	} catch (error) {
		console.error('There was an issue setting up the package.json file.');
		throw error;
	}

	try {
		const scaffoldFiles = await fsPromise.readdir(`${__dirname}/scaffold`);
		
		// await Promise.all(files.map(async (file) => {
		// 	const contents = await fs.readFile(file, 'utf8')
		// 	console.log('--CONTENTS--', contents)
		// }));
		// await fsPromise.cp(`./${projectName}`, )

		copyDir(`${__dirname}/scaffold`, `./${projectName}`);
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
	const template = packageJSONTemplate;
	template.name = appName;
	return JSON.stringify(template, null, 4);
};

const copyDir = async (src, dest) => {
    await fsPromise.mkdir(dest, { recursive: true });
    let entries = await fsPromise.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory() ?
            await copyDir(srcPath, destPath) :
            await fsPromise.copyFile(srcPath, destPath);
    }
}

module.exports = { showHelp, promptWithQuestions };