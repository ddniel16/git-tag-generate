const childProcess = require('child_process');
const chalk = require('chalk');
const log = console.log;

/**
 * Clase para crear y pushear
 */
class GitCreateClass {
  /** Constructor */
  constructor() {
    this.spawnOptions = {encoding: 'utf-8'};
  }

  /**
   * Crear un tag
   * @param {string} tag
   */
  createTag(tag) {
    const spawn = childProcess.spawnSync(
        'git',
        ['tag', tag],
        this.spawnOptions,
    );

    if (spawn.status !== 0) {
      const errorText = spawn.stderr.toString().trim();
      log(chalk.red('No se pudo crear el tag'));
      log(errorText);
      process.exit(0);
    }

    log('Se creo el tag:', chalk.green(tag));
  }

  /**
   * Pushear un tag
   * @param {string} tag
   */
  pushTag(tag) {
    const spawn = childProcess.spawnSync(
        'git',
        ['push', 'origin', tag],
        this.spawnOptions,
    );

    if (spawn.status !== 0) {
      const errorText = spawn.stderr.toString().trim();
      log(chalk.red('No se pudo pushear el tag'));
      log(errorText);
      process.exit(0);
    }

    log('Se pusheo el tag:', chalk.green(tag));
  }

  /**
   * Crear y pushear un tag
   * @param {string} tag
   * @param {object} args
   */
  createTagAndPush(tag, args) {
    this.createTag(tag);
    if (args['no-push'] === false || args['no-push'] === undefined) {
      this.pushTag(tag);
    }
  }
}

module.exports = new GitCreateClass();
