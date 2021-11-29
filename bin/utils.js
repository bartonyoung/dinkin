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
					console.log('...building your new React application');
					break;
				case 'create component':
					console.log('...building your new React component');
					break;
				// default:
				//   console.log(`what?`);
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

module.exports = { showHelp, promptWithQuestions };