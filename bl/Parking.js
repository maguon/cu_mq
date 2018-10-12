'use strict '
const smsConfig = require('../config/SmsConfig');
const sysMsg = require('../util/SystemMsg');
const sysError = require('../util/SystemError');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('Parking');

const pushParkingMsg = (req,res,next) => {
    let params = req.params;
    params.templateId = smsConfig.smsOptions.disobeyTemplateId;
    params.dataArray = [params.plateNumber,params.timeStr,params.address,smsConfig.expiredOptions.parkingTime];
    resUtil.resetCreateRes(res,{insertId:1},null);
    //1.发现sms
    //2.发送小程序推送
    //3.app推送
}

module.exports = {
    pushParkingMsg
}