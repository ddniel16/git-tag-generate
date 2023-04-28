#!/usr/bin/env node
const childProcess = require('child_process');
const chalk = require('chalk');
const log = console.log;

class TagListClass {
  constructor() {
    this.tagsRaw = [];
  }

  init() {
    this.fetchAllTags();
  }

  fetchAllTags() {
    var spawn = childProcess.spawnSync('git', ['fetch', '--all', '--tags'], {encoding: 'utf-8'});
    var errorText = spawn.stderr.toString().trim();

    if (errorText) {
      log(chalk.red('No es un repositorio git'));
      process.exit(0);
    } else {
      return spawn.stdout.toString().trim();
    }
  }

  getListPrefix() {
    var tagsRaw = this.getListRaw();
    var tagsPrefix = tagsRaw.map(function(tagRaw) {
      var version = tagRaw.split('-').pop();
      if (tagRaw.replaceAll(version, '') === '') {
        return '';
      }
      return tagRaw.replaceAll('-' + version, '');
    });

    tagsPrefix = [ ...new Set(tagsPrefix)];

    return tagsPrefix;
  }

  getLastTag() {
    if (this.getListRaw() === false) {
      return false;
    }
    return this.getListRaw().shift();
  }

  getLastTagByPrefix(searchPrefix) {
    return (function() {
      var args = [
        'tag',
        '-l', searchPrefix + '-*',
        '--format', '%(refname:strip=2)',
        '--sort', '-creatordate'
      ];

      var spawn = childProcess.spawnSync('git', args, {encoding: 'utf-8'});

      var errorText = spawn.stderr.toString().trim();

      if (errorText) {
        log(chalk.red('No es un repositorio git'));
        process.exit(0);
      } else {
        return spawn.stdout.toString().trim().split('\n').shift();
      }
    })();
  }

  getListRaw() {
    if (this.tagsRaw.length > 0) {
      return this.tagsRaw;
    }

    var tagListRaw = (function() {
      var spawn = childProcess.spawnSync('git', ['tag', '--format', '%(refname:strip=2)', '--sort', '-creatordate'], {encoding: 'utf-8'});
      var errorText = spawn.stderr.toString().trim();

      if (errorText) {
        log(chalk.red('No es un repositorio git'));
        process.exit(0);
      } else {
        return spawn.stdout.toString().trim();
      }
    })();

    if (tagListRaw.trim() === '') {
      return false;
    }

    var list = tagListRaw.trim().split('\n');

    for (let i = 0; i < list.length; i++) {
      this.tagsRaw.push(list[i].replaceAll('"', ''));
    }

    return this.tagsRaw;
  }
}

module.exports = new TagListClass();
