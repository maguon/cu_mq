'use strict'
const amqp = require('amqplib/callback_api');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('CaptchaSmsRecv');
const sysError = require('../util/SystemError');
const sysMsg = require('../util/SystemMsg');
const myCon = require('../db/connection/MqCon');
const sysConst = require('../util/SystemConst');
const key = 'captchaMsg';
const exType = sysConst.mqMsg.exType;

const sendTopicMsg = (params, exName, topic, callback) =>{

    let rabbitConnect = myCon.getConnection();

    if (rabbitConnect == null) {
        logger.error("can not connect rabbit :" + sysMsg.SYS_MESSAGE_QUEUE_ERROR_MSG);
        return callback(sysError.InternalError, null);
    }

    const confirmChannel=(err,ch)=>{
        if (err != null){
            logger.error("create rabbit channel error :" + err.message);
            callback(error, null);
        } else {

            let exOpts = {durable:false};
            let publishOpts ={durable:false,mandatory:true};
            let message = new Buffer(JSON.stringify(params));

            ch.assertExchange(exName,exType,exOpts);

            ch.publish(exName, key, message,publishOpts);

            ch.on('return',function (msg) {
                let params = msg.fields;
                params.content = msg.content.toString();
                let errorExchange = sysConst.mqMsg.errExName;
                let errQueue = sysConst.mqMsg.errQueue;
                //error交换器
                ch.assertExchange(errorExchange,sysConst.mqMsg.errExType,{durable:true},()=>{
                    //NO_ROUTE队列,设置TTL 消息2小时后会过期
                    let errQueOptions = {durable:true,autoDelete:false,exclusive: false};
                    let options = Object.create(errQueOptions);
                    options.arguments={'x-message-ttl':sysConst.mqMsg.errQueueTtl};
                    ch.assertQueue(errQueue,options);
                    //绑定
                    ch.bindQueue(errQueue,errorExchange,'');
                    //将出问题的消息保存在队列内
                    ch.sendToQueue(errQueue,new Buffer(JSON.stringify(params)),{durable:false},function () {
                        ch.close();
                    });
                });
            });

            logger.info(" send to rabbit exchange success :" + message);
            callback(err, ch);

        }
    }
    rabbitConnect.createConfirmChannel(confirmChannel);
}

module.exports ={
    sendTopicMsg
}