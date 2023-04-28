#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const log = console.log;

const tagList = require('./src/tagList');
const tagNew = require('./src/tagNew');

tagList.init();

if (tagList.getLastTag() === false) {
  log(chalk.yellow('No hay tags previos'));
  tagNew.createFirstTag();
} else {
  // ya hay tags
}
