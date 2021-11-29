const inquirer = require('inquirer');


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
			message: 'What would you like to name your application?'
		})
		.then((answer)=> {
			console.log(`...creating an application named ${answer.app_name}`);
		});
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

module.exports = { showHelp, promptWithQuestions };