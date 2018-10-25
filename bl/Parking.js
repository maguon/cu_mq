'use strict '
const smsConfig = require('../config/SmsConfig');
const sysMsg = require('../util/SystemMsg');
const sysError = require('../util/SystemError');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('Parking');
// const parkingTask = require('../mq/PakTask');


const pushParkingMsg = (req,res,next) => {
    let params = req.params;
    let ex = 'sms';
    let exType = 'topic';
    // resUtil.resetCreateRes(res,{insertId:1},null);
    //1.发现sms
    //2.发送小程序推送
    //3.app推送
    //rabbitmq topic
    parkingTask.sendTopicMsg(params,ex,exType,function (err,ok) {
        if (err){
            logger.info('pushSmsCaptcha',err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else {
            logger.info('pushSmsParking' ,'success' + ok);
            resUtil.resetCreateRes(res,{insertId:1},null);
            return next();
        }
    });

}

module.exports = {
    pushParkingMsg
}