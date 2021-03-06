'use strict '
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('CaptchaBl');
const resUtil = require('../util/ResponseUtil');
const sysError = require('../util/SystemError');
const sysMsg = require('../util/SystemMsg');
const captchaTask = require('../mq/CapTasker');
const userMessageDao = require('../dao/UserMessageDAO');
const sysConst = require('../util/SystemConst');
const moment = require('moment/moment.js');

const sendMq =(params,res,next,rows)=>{
    let ex = 'sms';
    let exType = sysConst.mqMsg.exType;
    //rabbitmq topic
    captchaTask.sendTopicMsg(params,ex,exType,function (err) {
        if (err){
            logger.error('mqbl sendMq sendTopicMsg '+err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else {
            logger.info('mqbl sendMq sendTopicMsg ' + 'success' );
            resUtil.resetCreateRes(res,rows,null);
            return next();
        }
    });
}

const pushSmsCaptcha = (req,res,next) =>{
    let params = req.params;
    params.type = sysConst.msgType.captcha;
    params.content = params.captcha;
    params.dateId = moment().format("YYYYMMDD");
    userMessageDao.addMessage(params,(err,rows)=>{
        if (err){
            logger.error('mqbl pushSmsCaptcha addMessage ',err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info('mqbl pushSmsCaptcha addMessage ','success');
            //发送消息
            params.insertId = rows.insertId;
            sendMq(params,res,next,rows);
        }
    });

}

module.exports = {
    pushSmsCaptcha
}