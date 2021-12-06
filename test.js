const fse = require('fs-extra');

const file = async () => {
    const myFile = await fse.readFile('./templates/component-template.js');
    console.log(myFile.toString());
};

console.log(file());
