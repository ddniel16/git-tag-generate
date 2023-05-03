#!/usr/bin/env node

const commandLineArgs = require('command-line-args');
const inquirer = require('inquirer');
const chalk = require('chalk');
const log = console.log;

const MSG_CREATE_NEW_PREFIX = 'Crear nuevo prefix';

const optionDefinitions = [
  {name: 'no-push', type: Boolean},
];
const args = commandLineArgs(optionDefinitions);

const tagList = require('./src/tagList');
const tagNew = require('./src/tagNew');

if (tagList.getLastTag() === false) {
  log(chalk.yellow('No hay tags previos'));
  tagNew.createFirstTag(args);
} else {
  log('El último tag es:', chalk.green(tagList.getLastTag()));

  const choicesList = tagList.getListPrefix();
  choicesList.push(new inquirer.Separator());
  choicesList.push(MSG_CREATE_NEW_PREFIX);

  inquirer.prompt([{
    type: 'list',
    name: 'prefix',
    message: '¿Seguir con el prefix o con uno nuevo?',
    choices: choicesList,
  }]).then((answers) => {
    if (answers.prefix === MSG_CREATE_NEW_PREFIX) {
      tagNew.createFirstTag(args);
      return;
    }

    tagNew.createNextTag(args, answers.prefix);
  });
}
