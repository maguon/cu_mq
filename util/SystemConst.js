const mqMsg = {
    exType:'topic',
    errExName :'errorExchange',
    errExType :'fanout',
    errQueue :'NO_ROUTE_QUEUE'
}

const msgType = {
    captcha :1,
    parking :2
}

module.exports={
    mqMsg,
    msgType
}