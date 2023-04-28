#!/usr/bin/env node
const slugify = require('slugify')
const inquirer = require('inquirer');

const chalk = require('chalk');
const log = console.log;

const GitCreate = require('./gitCreate');

class TagNewClass {
  createFirstTag() {
    inquirer.prompt([{
      name: 'prefix',
      message: '¿Algun prefix?'
    }]).then(answers => {

      let version = '0.0.1';
      let prefix = slugify(answers.prefix).trim();

      if (prefix === '') {
        log(chalk.yellow('No se va a usar prefix'));
      } else {
        log(chalk.yellow('Se va a usar el prefix:'), chalk.green(prefix));
        version = prefix + '-' + version;
      }

      inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Se va a crear el tag "' + version + '" ¿Crear?'
      }]).then(answers => {
        if (answers.confirm === false) {
          log(chalk.red('No se va a crear el tag'));
          process.exit(0);
        }

        GitCreate.createTagAndPush(version);
      });
    });

  }
}

module.exports = new TagNewClass();
