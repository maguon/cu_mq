'use strict '
const http = require('http');
const encrypt = require('../util/Encrypt.js')
const smsConfig = require('../config/SmsConfig.js');
const serverLogger = require('../util/ServerLogger.js');
const logger = serverLogger.createLogger('SmsDAO.js');
//const smsTemplate = require('../util/SmsTemplate.js');
//const xml2json = require('xml2json');
const dateUtil = require('../util/DateUtil.js');
const https = require('https');



const sendParamSms = (params, callback) => {
    const msg = {
        to: params.phone,
        appId: smsConfig.smsOptions.appSID,
        templateId: params.templateId,
        datas: params.dataArray
    };
    httpSend(msg, callback);
}



const  httpSend = (msg, callback) => {
    const d = new Date();
    let timeStampStr = dateUtil.getDateFormat(d, 'yyyyMMddhhmmss');

    let originSignStr = smsConfig.smsOptions.accountSID + smsConfig.smsOptions.accountToken + timeStampStr;
    let signature = encrypt.encryptByMd5NoKey(originSignStr);

    let originAuthStr = smsConfig.smsOptions.accountSID + ":" + timeStampStr;
    let auth = encrypt.base64Encode(originAuthStr);
    let url = "/2013-12-26/" + smsConfig.smsOptions.accountType + "/" +
        smsConfig.smsOptions.accountSID + "/" + smsConfig.smsOptions.action + "?sig=";

    url = url + signature;
    let postData = JSON.stringify(msg);
    let options = {
        host: smsConfig.smsOptions.server,
        port: smsConfig.smsOptions.port,
        path: url,
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf8',
            'Content-Length': Buffer.byteLength(postData, 'utf8'),
            'Authorization': auth
        }
    };

    const httpsReq = https.request(options, (result) => {
        let data = "";
        result.setEncoding('utf8');
        result.on('data', (d) => {
            data += d;
        }).on('end',  () => {
            var resObj = eval("(" + data + ")");
            logger.info("httpSend " + resObj);
            callback(null, resObj);
        }).on('error',  (e) => {
            logger.error("httpSend " + e.message);
            callback(e, null);
        });

    });

    httpsReq.write(postData + "\n", 'utf-8');
    httpsReq.end();
    httpsReq.on('error', function (e) {
        callback(e, null)
    });
}


module.exports = {
    sendParamSms
};