'use strict '
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('CaptchaBl');
const resUtil = require('../util/ResponseUtil');
const sysError = require('../util/SystemError');
const sysMsg = require('../util/SystemMsg');
const captchaTask = require('../mq/CapTask');
const userMessageDao = require('../dao/UserMessageDao');
const smsConfig = require('../config/SmsConfig');
const sysConst = require('../util/SystemConst');

const sendMq =(params,res,next)=>{
    let ex = 'sms';
    let exType = sysConst.mqMsg.exType;
    //rabbitmq topic
    captchaTask.sendTopicMsg(params,ex,exType,function (err,result) {
        if (err){
            logger.info('pushSmsCaptcha'+err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else {
            logger.info('pushSmsCaptcha:' + 'success' );
            resUtil.resetCreateRes(res,result,null);
            return next();
        }
    });
}

const pushSmsCaptcha = (req,res,next) =>{
    let params = req.params;
    params.type = sysConst.msgType.captcha;
    params.content = 'captcha:'+params.captcha+',captchaTime:'+smsConfig.expiredOptions.captchaTime;
    userMessageDao.addMessage(params,(err,rows)=>{
        if (err){
            logger.info('addMessage',err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info('addMessage','success');
            //发送消息
            params.insertId = rows.insertId;
            sendMq(params,res,next);
        }
    });

}

module.exports = {
    pushSmsCaptcha
}