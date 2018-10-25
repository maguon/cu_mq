'use strict'
const amqp = require('amqplib/callback_api');
const all = require('bluebird').all;
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('CaptchaSms');
const smsDao = require('../dao/SmsDAO');
const sysError = require('../util/SystemError');
const sysMsg = require('../util/SystemMsg');
const smsConfig = require('../config/SmsConfig');
const userMessageDao = require('../dao/UserMessageDao');
const sysConst = require('../util/SystemConst');

let keys = ['#.captchaMsg'];
let exName = 'sms';

const bail=(err, conn)=> {
    console.error(err);
    if (conn) conn.close(function() { process.exit(1); });
}

const getMqMsg=(msg)=>{
    logger.info(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
    //发送验证码短信
    sendCaptchaSms(msg);
}

const sendCaptchaSms=(data)=> {
    let json = data.content.toString();
    let params = JSON.parse(json);
    params.templateId = smsConfig.smsOptions.captchaTemplateId;
    params.dataArray = [params.captcha,smsConfig.expiredOptions.captchaTime];

    smsDao.sendParamSms(params, (err, result) => {
        if (err) {
            logger.info('sendCaptchaSms error', result.toString());
            throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info('sendCaptchaSms', 'success');
            //更新数据库内容
            params.status = '1';//发送成功
            updateMessage(params);
        }
    });
}

const updateMessage=(params)=>{
    userMessageDao.updateStatus(params,(err)=>{
        if (err){
            logger.info('updateMessage',err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info('updateMessage','success');
        }
    });

}

const connect=(err,conn)=>{
    if (err !== null) return bail(err);

    const confirmChannel=(err,ch)=>{
        if (err !== null) return bail(err, conn);

        let exOpts = {durable:false};
        let queueOptions = {exclusive:true};

        ch.assertExchange(exName, sysConst.mqMsg.exType, exOpts);
        ch.assertQueue('', queueOptions,(err,qok)=>{
            if (err !== null) return bail(err, conn);

            let queue = qok.queue;
            all(keys.map((rk) => {
                ch.bindQueue(queue, exName, rk);
            }));

            ch.consume(queue, getMqMsg, {noAck: true},(err)=>{//noAck:true  RabbitMQ 会自动把发送出去的 消息置为确认，然后从内存(或者磁盘)中删除
                if (err !== null) return bail(err, conn);
                logger.info(' [*] Waiting for logs. To exit press CTRL+C.');
            });
        });
    }

    conn.createConfirmChannel(confirmChannel);

}
amqp.connect(connect);
