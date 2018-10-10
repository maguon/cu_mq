'use strict'
const sysError = require('./SystemError.js');
const sysMsg= require('./SystemMsg.js');

const resetQueryRes = (res,result,errMsg) =>{
    res.send(200,{success : true,result:result,msg:errMsg});
}

const resetCreateRes = (res,result,errMsg) =>{
    if(result && result.insertId){
        res.send(200,{success : true,id:result.insertId});
    }else{
        res.send(200,{success : false,msg:errMsg});
    }
}

const resetUpdateRes = (res,result,errMsg)=>{
    if(result && result.affectedRows>0){
        res.send(200,{success : true});
    }else{
        res.send(200,{success : false,msg:errMsg});
    }
}

const resetFailedRes = (res,errMsg)=>{
    res.send(200,{success:false,msg:errMsg});
}

const resInternalError = (error , res ,next) => {
    return next(sysError.InternalError(sysMsg.SYS_INTERNAL_ERROR_MSG));
    //throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
}

module.exports = {
    resetQueryRes,resetCreateRes,resetUpdateRes ,resetFailedRes ,resInternalError
}