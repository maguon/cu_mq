'use strict'
const getopt = require('posix-getopt');
const restify = require('restify');
const mpServer = require('./server');
const sysConfig = require('./config/SystemConfig')
const serverLogger = require('./util/ServerLogger');
const logger = serverLogger.createLogger('main');

const NAME = 'log_mp_api';

// In true UNIX fashion, debug messages go to stderr, and audit records go

const parseOptions = () => {
    let option = {};
    let opts = {}
    let parser = new getopt.BasicParser(':h:p:(port)', process.argv);

    while ((option = parser.getopt()) !== undefined) {
        switch (option.option) {
            case 'p':
                opts.port = parseInt(option.optarg, 10);
                break;
            case 'h':
                usage();
                break;

            default:
                usage('invalid option: ' + option.option);
                break;
        }
    }

    return (opts);
}


const usage = (msg) => {
    if (msg)
        console.error(msg);

    let str = 'usage: ' +
        NAME +
        '[-p port] [-h]';
    console.error(str);
    process.exit(msg ? 1 : 0);
}


(() =>{
    let opt=parseOptions();
    const server = mpServer.createServer();
    server.listen((opt.port?opt.port:9202), () => {
        server.get('/',(req,res,next)=>{
            res.send(200,{success : true,result:"success"})
            next();
        });
        logger.info('LOG-MP-API server has been  started ,listening at %s', server.url);
    });
})();