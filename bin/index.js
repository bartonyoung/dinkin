#!/usr/bin/env node
/* eslint-disable no-console */
const yargs = require('yargs');
const process = require('process');
const { pascalCase } = require('pascal-case');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const packageJsonTemplate = require('../templates/package-template.json');
const componentTemplate = require('../templates/component-template');

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

/**
 * @param appName
 */
async function setupApplication(appName) {
  const projectName = appName.split(' ').join('-');

  exec(`mkdir ${projectName} && cd ${projectName} && npm init -f`, (initErr) => {
    const removeDirectory = () => {
      exec(`rm -rf ${projectName}`, (err) => {
        if (err) {
          console.log(`ERROR REMOVING DIRECTORY: ${projectName}`, err);
        }
        console.log('application aborted :(');
      });
    };

    if (initErr) {
      console.error('There was an issue initializing your application:', initErr);
      return;
    }

    fse.readFile(`${projectName}/package.json`)
      .then((data) => {
        const result = JSON.parse(data);

        result.scripts = packageJsonTemplate.scripts;
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
      if (npmErr) {
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
}

function shouldAddToDirectory() {
  return inquirer
    .prompt([
      {
        name: 'addToExistingDirectory',
        type: 'confirm',
        message: 'Should the component live in an existing component sub-directory?',
      },
    ])
    .then(({ addToExistingDirectory }) => addToExistingDirectory);
}

function getComponentName() {
  return inquirer
    .prompt([
      {
        name: 'component',
        type: 'input',
        message: 'What is the name of the component?',
      },
    ])
    .then(({ component }) => component);
}

function getComponentDirectoryName() {
  return inquirer
    .prompt([
      {
        name: 'directoryName',
        type: 'input',
        message: 'Enter the name of an existing component directory',
      },
    ])
    .then(({ directoryName }) => directoryName);
}

/**
 * @param location
 */
async function findComponentDirectory(location) {
  const dirents = await fse.readdir(location, { withFileTypes: true }).catch((err) => err);

  if (!dirents) {
    return [];
  }

  const folders = await Promise.all(dirents.map((dirent) => {
    if (!dirent.name.includes('node_modules')) {
      const res = path.resolve(location, dirent.name);

      if (dirent.name.toLowerCase() === 'components') {
        return res;
      }

      if (dirent.isDirectory()) {
        return findComponentDirectory(res);
      }
    }
    return [];
  }));

  return folders.filter(Boolean).flat();
}

async function addComponentToSubDirectory(componentToMake, componentSubDirectory) {
  const subDirectoryExists = await fse.pathExists(componentSubDirectory)
    .then((exists) => exists)
    .catch((err) => console.error(err));

  const componentPath = path.join(componentSubDirectory, componentToMake);
  if (subDirectoryExists) {
    await fse.mkdir(componentPath)
      .then(() => console.log('Component Directory Created'))
      .catch((err) => console.error('Directory not created:', err));
  } else {
    await fse.mkdir(componentSubDirectory)
      .then(() => fse.mkdir(componentPath)).catch((err) => console.error('Directory not created:', err));
  }

  const updatedComponentTemplate = componentTemplate.replace(/COMPONENT_NAME/gi, pascalCase(componentToMake));
  await fse.writeFile(`${path.join(componentPath, componentToMake)}.tsx`, updatedComponentTemplate);
}

/**
 * @param componentName
 * @param componentSubDirectory
 */
async function createComponentDirectory(componentName, componentSubDirectory) {
  const [existingComponentDir] = await findComponentDirectory(process.cwd());

  if (!existingComponentDir) {
    console.error('A "components" directory is required to create a new component.');
    return;
  }

  if (componentSubDirectory) {
    const subDirectory = await (path.join(existingComponentDir, componentSubDirectory));
    await addComponentToSubDirectory(componentName, subDirectory);
  }
}

async function promptComponent() {
  const componentName = (await getComponentName()).toLowerCase().split(' ').join('-');
  const addToExistingDirectory = await shouldAddToDirectory();

  if (addToExistingDirectory) {
    const componentDirectoryName = (await getComponentDirectoryName()).toLowerCase().split(' ').join('-');

    createComponentDirectory(componentName, componentDirectoryName);
  } else {
    createComponentDirectory(componentName);
  }
}

function createApp() {
  inquirer
    .prompt({
      type: 'input',
      name: 'app_name',
      message: 'What would you like to name your application?',
      require: true,
      validate: (answer) => {
        if (!answer) {
          return 'You must provide an application name.';
        }
        return true;
      },
    })
    .then((answer) => {
      setupApplication(answer.app_name);
    })
    .catch((err) => {
      console.error('Something went wrong. Aborting.:', err);
    });
}

function promptWithQuestions() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'intro',
        message: "Ello, my name's Dinkin. What would you like to do?",
        choices: [
          { name: 'Create a new React application.', value: 'create app' },
          { name: 'Generate a new React component', value: 'create component' },
          { name: 'Get Help.', value: 'help' },
        ],
      },
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
          console.error('Please make a valid selection.');
      }
    })
    .catch((error) => {
      console.error('Something went wrong. Aborting.:', error);
    });
}

if (!yargs.argv._[0]) {
  promptWithQuestions();
}
