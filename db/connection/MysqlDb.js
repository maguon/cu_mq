const mysql = require('mysql');
const sysConfig = require('../../config/SystemConfig');

const serverLogger = require('../../util/ServerLogger');
const logger = serverLogger.createLogger('MysqlDb');

const pool  = mysql.createPool(sysConfig.mysqlConnectOptions);

const getConnection = (callback) =>{
    pool.getConnection((err, connection) => {
        callback(err, connection);
    });
};


const dbQuery = (sql,values,callback) => {
    pool.getConnection((conError,con)=>{
        if(conError){
            logger.error("Connect mysql error :"+conError.message);
            callback(conError,null);
        }else{
            logger.debug(con.format(sql,values));
            con.query(sql,values,(error, rows) =>{
                if(error){
                    logger.error("Execute mysql query error :"+con.format(sql,values) +"\n" + error.message);
                    con.rollback();
                }
                con.release();
                callback(error,rows);
            })
        }

    })

}



module.exports = { getConnection, dbQuery };
