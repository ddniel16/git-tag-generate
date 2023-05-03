const slugify = require('slugify');
const inquirer = require('inquirer');
const chalk = require('chalk');
const semver = require('semver');
const log = console.log;

const GitCreate = require('./gitCreate');
const TagList = require('./tagList');

/**
 * Clase para crear tags
 */
class TagNewClass {
  /**
   * Crea el primer tag
   * @param {object} args
   */
  createFirstTag(args) {
    inquirer.prompt([{
      name: 'prefix',
      message: '¿Algún prefix?',
    }]).then((answers) => {
      let version = '0.0.1';
      const prefix = slugify(answers.prefix).trim();

      if (prefix === '') {
        log(chalk.yellow('No se va a usar prefix'));
      } else {
        log(chalk.yellow('Se va a usar el prefix:'), chalk.green(prefix));
        version = prefix + '-' + version;
      }

      inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Se va a crear el tag "' + version + '" ¿Continuar?',
      }]).then((answers) => {
        if (answers.confirm === false) {
          log(chalk.red('No se creo el tag'));
          process.exit(0);
        }

        GitCreate.createTagAndPush(version, args);
      });
    });
  }

  /**
   * Crea el siguiente tag de un prefix
   * @param {object} args
   * @param {string} prefix
   */
  createNextTag(args, prefix) {
    const version = TagList.getLastTagByPrefix(prefix).split('-').pop();

    const vPatch = prefix + '-' + semver.inc(version, 'patch');
    const vMinor = prefix + '-' + semver.inc(version, 'minor');
    const vMajor = prefix + '-' + semver.inc(version, 'major');

    const newReleases = [
      {name: 'Patch ' + vPatch, value: vPatch},
      {name: 'Minor ' + vMinor, value: vMinor},
      {name: 'Major ' + vMajor, value: vMajor},
    ];

    inquirer.prompt([{
      type: 'list',
      name: 'release',
      message: '--------',
      choices: newReleases,
    }]).then((answers) => {
      GitCreate.createTagAndPush(answers.release, args);
    });
  }
}

module.exports = new TagNewClass();
