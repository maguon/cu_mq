'use strict'
const amqp = require('amqplib/callback_api');
const sysConfig = require('../../config/SystemConfig');
const serverLogger = require('../../util/ServerLogger');
const logger = serverLogger.createLogger('MqCon');

let mqConnection = null;
const  getConnection = ()=>{
    if (mqConnection) {
        return mqConnection;
    } else {
        amqp.connect(sysConfig.rabbitUrl , function (err, con) {
            if (err) {
                logger.error("Connect rabbit error :" + err.message);
                if (con) con.close(function () {
                    process.exit(1);
                });
                return null;
            } else {
                mqConnection = con;
                return mqConnection;
            }
        });
    }
}

getConnection();
module.exports ={
    getConnection
}