'use strict '
const smsConfig = require('../config/SmsConfig');
const sysMsg = require('../util/SystemMsg');
const sysError = require('../util/SystemError');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('Parking');
const parkingTask = require('../mq/PakTasker');
const sysConst = require('../util/SystemConst');
const userMessageDao = require('../dao/UserMessageDAO');

const sendMq =(params,res,next)=>{
    let ex = 'sms';
    let exType = sysConst.mqMsg.exType;
    //1.发现sms
    //2.发送小程序推送
    //3.app推送
    //rabbitmq topic
    parkingTask.sendTopicMsg(params,ex,exType,function (err,result) {
        if (err){
            logger.info('pushSmsCaptcha',err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else {
            logger.info('pushSmsParking' ,'success' );
            resUtil.resetCreateRes(res,result,null);
            return next();
        }
    });
}

const pushParkingMsg = (req,res,next) => {
    let params = req.params;
    params.type = sysConst.msgType.parking;
    params.content = params.plateNumber+','+params.timeStr+','+params.address;
    userMessageDao.addMessage(params,function (err,rows) {
        if (err){
            logger.info('addParkingMessage',err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info('addParkingMessage','success');
            //发送消息
            params.insertId = rows.insertId;
            sendMq(params,res,next);
        }
    });
}

module.exports = {
    pushParkingMsg
}