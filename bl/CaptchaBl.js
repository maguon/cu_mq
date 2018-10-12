'use strict '
const smsConfig = require('../config/SmsConfig');
const sysMsg = require('../util/SystemMsg');
const sysError = require('../util/SystemError');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('CaptchaBl');

const pushSmsCaptcha = (req,res,next) => {
    let params = req.params;
    params.templateId = smsConfig.smsOptions.captchaTemplateId;
    params.dataArray = [params.captcha,smsConfig.expiredOptions.captchaTime];
    resUtil.resetCreateRes(res,{insertId:1},null);

}

module.exports = {
    pushSmsCaptcha
}