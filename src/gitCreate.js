#!/usr/bin/env node
const childProcess = require('child_process');
const chalk = require('chalk');
const log = console.log;

class GitCreateClass {
  createTag(tag) {
    var spawn = childProcess.spawnSync('git', ['tag', tag], {encoding: 'utf-8'});
    var errorText = spawn.stderr.toString().trim();

    if (errorText) {
      log(chalk.red('No se pudo crear el tag'));
      log(errorText);
      process.exit(0);
    }

    log(chalk.green('Se creo el tag:', tag));
  }
  pushTag(tag) {
    var spawn = childProcess.spawnSync('git', ['push', 'origin', tag], {encoding: 'utf-8'});
    var errorText = spawn.stderr.toString().trim();

    if (errorText) {
      log(chalk.red('No se pudo pushear el tag'));
      log(errorText);
      process.exit(0);
    }

    log(chalk.green('Se pusheo el tag:', tag));
  }

  createTagAndPush(tag) {
    this.createTag(tag);
    this.pushTag(tag);
  }
}

module.exports = new GitCreateClass();
