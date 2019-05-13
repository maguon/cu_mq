'use strict'
const amqp = require('amqplib/callback_api');
const all = require('bluebird').all;
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('PakSmsRecv');
const smsDao = require('../dao/SmsDAO');
const sysError = require('../util/SystemError');
const sysMsg = require('../util/SystemMsg');
const smsConfig = require('../config/SmsConfig');
const sysConst = require('../util/SystemConst');
const userMessageDao = require('../dao/UserMessageDAO');

let keys = ['#.parkingMsg'];
let exName = 'sms';

const bail=(err, conn)=> {
    logger.error('mq PakSmsRecv error :'+err.message);
    if (conn) conn.close(function() { process.exit(1); });
}

const getMqMsg=(msg)=>{
    logger.info('mq '+" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
    //发送违停短信
    sendParkingSms(msg);
}

const updateMessage=(params)=>{
    userMessageDao.updateStatus(params,(err)=>{
        if (err){
            logger.error('mq updateMessage ',err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info('mq updateMessage ','success');
        }
    });

}

const sendParkingSms=(data)=> {
    let json = data.content.toString();
    let params = JSON.parse(json);
    params.templateId = smsConfig.smsOptions.parkingTemplateId;
    params.dataArray = [params.plateNumber,params.timeStr,params.address,smsConfig.expiredOptions.parkingTime];

    smsDao.sendParamSms(params, (err, result) => {
        if (err) {
            logger.error('mq sendParkingSms error:'+ result.toString());
            throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info('mq sendParkingSms ', 'success');
            //更新信息状态
            params.status = '1';//发送成功
            updateMessage(params);
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
                logger.info('mq '+' [*] Waiting for logs. To exit press CTRL+C.');
            });
        });
    }

    conn.createConfirmChannel(confirmChannel);

}

const doPakSmsReceive =()=>{
    amqp.connect(connect);
}

module.exports ={
    doPakSmsReceive
}
