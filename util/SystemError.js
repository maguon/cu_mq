'use strict'

const restify = require('restify');
const sysMsg = require('./SystemMsg.js');

const CODES = {
    BadDigest: 400,
    BadMethod: 405,
    Internal: 500, // Don't have InternalErrorError
    InvalidArgument: 409,
    InvalidContent: 400,
    InvalidCredentials: 401,
    InvalidHeader: 400,
    InvalidVersion: 400,
    MissingParameter: 409,
    NotAuthorized: 403,
    PreconditionFailed: 412,
    RequestExpired: 400,
    RequestThrottled: 429,
    ResourceNotFound: 404,
    WrongAccept: 406
};

const InvalidArgumentError = (msg , outMsg) =>{
    let error = new restify.InvalidArgumentError(msg);
    if(outMsg){
        error.body.outMsg = outMsg;
    }
    return error;
}

const NotAuthorizedError = () =>{
    let error = new restify.NotAuthorizedError();
    error.body.outMsg = sysMsg.SYS_AUTH_TOKEN_ERROR;

    return error;
}

const BadMethodError = (msg , outMsg) =>{
    let error = new restify.BadMethodError(msg);
    if(outMsg){
        error.body.outMsg = outMsg;
    }
    return error;
}

const MissingParameterError = (msg , outMsg) =>{
    let error = new restify.MissingParameterError(msg);
    if(outMsg){
        error.body.outMsg = outMsg;
    }
    return error;
}

const ResourceNotFoundError = (msg , outMsg) =>{
    let error = new restify.ResourceNotFoundError(msg);
    if(outMsg){
        error.body.outMsg = outMsg;
    }
    return error;
}

const InternalError = (msg , outMsg) => {
    let error = new restify.InternalError(msg);
    if(outMsg){
        error.body.outMsg = outMsg;
    }
    return error;
}
module.exports = { InvalidArgumentError , NotAuthorizedError , MissingParameterError ,ResourceNotFoundError ,BadMethodError,InternalError}