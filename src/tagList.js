const childProcess = require('child_process');
const chalk = require('chalk');
const log = console.log;

/**
 * Clase para obtener información de los tags
 */
class TagListClass {
  /** Constructor */
  constructor() {
    this.tagsRaw = [];
    this.fetchAllTags();
  }

  /**
   * Actualiza la lista de tags del repositorio
   * @return {string} stdout
   */
  fetchAllTags() {
    const spawn = childProcess.spawnSync(
        'git',
        ['fetch', '--all', '--tags'],
        {encoding: 'utf-8'},
    );

    if (spawn.status !== 0) {
      const errorText = spawn.stderr.toString().trim();
      log(chalk.red('No es un repositorio git'));
      log(errorText);
      process.exit(0);
    }

    return spawn.stdout.toString().trim();
  }

  /**
   * Devuelve el listado de prefijos que hay en el repositorio
   * @return {array} tags
   */
  getListPrefix() {
    const tagsRaw = this.getListRaw();
    let tagsPrefix = tagsRaw.map(function(tagRaw) {
      const version = tagRaw.split('-').pop();
      if (tagRaw.replaceAll(version, '') === '') {
        return '';
      }
      return tagRaw.replaceAll('-' + version, '');
    });

    tagsPrefix = [...new Set(tagsPrefix)];
    return tagsPrefix;
  }

  /**
   * Devuelve el último tag del repositorio
   * @return {array} tags
   */
  getLastTag() {
    if (this.getListRaw() === false) {
      return false;
    }
    const first = [...this.getListRaw()].shift();
    return first;
  }

  /**
   * Devuelve el último tag del repositorio que empieza por el prefijo indicado
   * @param {string} searchPrefix
   * @return {string} tag
   */
  getLastTagByPrefix(searchPrefix) {
    return (function() {
      const args = [
        'tag',
        '-l', searchPrefix + '-*',
        '--format', '%(refname:strip=2)',
        '--sort', '-creatordate',
      ];

      const spawn = childProcess.spawnSync('git', args, {encoding: 'utf-8'});
      if (spawn.status !== 0) {
        const errorText = spawn.stderr.toString().trim();
        log(chalk.red('No es un repositorio git'));
        log(errorText);
        process.exit(0);
      }

      return spawn.stdout.toString().trim().split('\n').shift();
    })();
  }

  /**
   * Devuelve el listado de tags del repositorio
   * @return {array} tags
   */
  getListRaw() {
    if (this.tagsRaw.length > 0) {
      return this.tagsRaw;
    }

    const tagListRaw = (function() {
      const spawn = childProcess.spawnSync(
          'git',
          ['tag', '--format', '%(refname:strip=2)', '--sort', '-creatordate'],
          {encoding: 'utf-8'},
      );

      if (spawn.status !== 0) {
        const errorText = spawn.stderr.toString().trim();
        log(chalk.red('No es un repositorio git'));
        log(errorText);
        process.exit(0);
      }

      return spawn.stdout.toString().trim();
    })();

    if (tagListRaw.trim() === '') {
      return false;
    }

    const list = tagListRaw.trim().split('\n');

    for (let i = 0; i < list.length; i++) {
      this.tagsRaw.push(list[i].replaceAll('"', ''));
    }

    return this.tagsRaw;
  }
}

module.exports = new TagListClass();
