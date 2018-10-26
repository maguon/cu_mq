'use strict'
const db = require('../db/connection/MysqlDb');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('UserMessageDAO');

const addMessage=(params,callback)=>{

    let query = "insert into user_message(user_id,phone,content,type,user_type) values (?,?,?,?,?)";
    let paramsArray = [],i=0;
    paramsArray[i++] = params.userId;
    paramsArray[i++] = params.phone;
    paramsArray[i++] = params.content;
    paramsArray[i++] = params.type;
    paramsArray[i] = params.userType;
    db.dbQuery(query,paramsArray,(err,rows)=>{
        logger.debug('addMessage');
        callback(err,rows);
    });
}

const updateStatus =(params,callback)=>{

    params.updateDate = new Date();
    let query = "update user_message set status=?  where id = ?";
    let paramsArray = [],i=0;
    paramsArray[i++] = params.status;
    paramsArray[i] = params.insertId;
    db.dbQuery(query,paramsArray,(err,rows)=>{
        logger.debug('updateStatus');
        callback(err,rows);
    });
}

module.exports = {
    addMessage,
    updateStatus
}
