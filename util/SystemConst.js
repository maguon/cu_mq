const mqMsg = {
    exType:'topic',
    errExName :'errorExchange',
    errExType :'fanout',
    errQueue :'NO_ROUTE_QUEUE',
    errQueueTtl:7200000
}

const msgType = {
    captcha :1,
    parking :2
}

module.exports={
    mqMsg,
    msgType
}