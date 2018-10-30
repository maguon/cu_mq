'use strict'
const capSmsReceive = require('./mq/CaptchaSmsRecv');
const pakSmsReceive = require('./mq/PakSmsRecv');

capSmsReceive.doCapSmsReceive();
pakSmsReceive.doPakSmsReceive();

