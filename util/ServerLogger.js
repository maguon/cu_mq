'use strict'
const sysConfig = require('../config/SystemConfig');
const log4js = require('log4js');

const createLogger = (name) => {
    const log4js = require('log4js');
    log4js.configure(sysConfig.loggerConfig);
    return log4js.getLogger(name);
}

module.exports = {createLogger }