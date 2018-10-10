var crypto = require('crypto');

var md5Key = "mp".toString('ascii');
var aceKey = "mission";

function encryptByMd5(clearText){
    var md5 = crypto.createHmac('md5',md5Key);
    return md5.update(clearText).digest('hex').toUpperCase();
}

function encryptByMd5Key(clearText, key){
    clearText = clearText + key;

    return crypto.createHash('md5').update(clearText, 'utf8').digest("hex");
}

function encryptByMd5NoKey(clearText){
    var Buffer = require("buffer").Buffer;
    var buf = new Buffer(clearText);
    var str = buf.toString("binary");
    var md5 = crypto.createHash('md5');
    return md5.update(str).digest('hex').toUpperCase();
}

function encryptByAES(plainText){
    var cipher = crypto.createCipher('aes-256-cbc',aceKey);
    var cipherText = cipher.update(plainText,'utf8','hex');
    cipherText += cipher.final('hex');
    return cipherText;
}

function decryptByAES(cipherText){
    var decipher = crypto.createDecipher('aes-256-cbc',aceKey);
    var dec = decipher.update(cipherText,'hex','utf8');
    if(dec == null || dec.length<1){
        return null;
    }
    dec += decipher.final('utf8');

    return dec;
}

function createActiveCode(email,uid){
    var plaintext = email + "|" +uid + "|" + (new Date().getTime());
    return encryptByAES(plaintext);
}

function resolveActiveCode(activeCode){
    try{
        var plaintext = decryptByAES(activeCode);
        if(plaintext == null){
            return null;
        }else{
            var paramArray = plaintext.split("|");
            if(paramArray != null && paramArray.length >0){
                return paramArray;
            }else{
                return null;
            }
        }
    }catch(e){
        return null;
    }

}

function createLoginEmailCode(originEmail,newEmail,uid){
    var plaintext = originEmail + "|" + newEmail + "|" +uid + "|" + (new Date().getTime());
    return encryptByAES(plaintext);
}


function resolveLoginEmailCode(loginEmailCode){
    var plaintext = decryptByAES(loginEmailCode);
    if(plaintext == null){
        return null;
    }else{
        var paramArray = plaintext.split("|");
        if(paramArray != null && paramArray.length == 4){
            var paramObj = {};
            paramObj.originEmail = paramArray[0];
            paramObj.newEmail = paramArray[1];
            paramObj.uid = paramArray[2];
            paramObj.date = paramArray[3];
            return paramObj;
        }else{
            return null;
        }
    }
}

function base64Encode(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=";
    var i = 0;
    input = utf8Encode(input);
    while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output = output +
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    if(output != null ){
        var l = output.length%4;
        if(l>0){
            for(;l<5;l++){
                output = output + '=';
            }
        }
    }
    return output;
}


function base64Decode(input){
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=";
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }
    output = utf8Decode(output);
    return output;
}

function utf8Encode(string){
    string = string.replace(/\r\n/g,"\n");
    var encodeText = "";
    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            encodeText += String.fromCharCode(c);
        } else if((c > 127) && (c < 2048)) {
            encodeText += String.fromCharCode((c >> 6) | 192);
            encodeText += String.fromCharCode((c & 63) | 128);
        } else {
            encodeText += String.fromCharCode((c >> 12) | 224);
            encodeText += String.fromCharCode(((c >> 6) & 63) | 128);
            encodeText += String.fromCharCode((c & 63) | 128);
        }

    }
    return encodeText;
}

function utf8Decode(encodeText){
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
    while ( i < encodeText.length ) {
        c = encodeText.charCodeAt(i);
        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if((c > 191) && (c < 224)) {
            c2 = encodeText.charCodeAt(i+1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = encodeText.charCodeAt(i+1);
            c3 = encodeText.charCodeAt(i+2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return string;
}

function createGiftCode (custId,giftId,giftCode,orderId){
    var plaintext = custId + "|" +giftId +"|"+giftCode+"|"+orderId;
    return encryptByAES(plaintext);
}

function resolveGiftCode(code){
    var plaintext = decryptByAES(code);
    if(plaintext == null){
        return null;
    }else{
        var paramArray = plaintext.split("|");
        if(paramArray != null && paramArray.length == 4){
            return paramArray;
        }else{
            return null;
        }
    }

}

function getGiftOrderCode(){
    var t = (new Date()).getTime();
    t = t-1000000000000;
    return t ;
}

function getNumberRandomKey(max,min){
    var Range = max - min;
    var Rand = Math.random();
    return(min + Math.round(Rand * Range));
}

function getSmsRandomKey(){
    return getNumberRandomKey(9999,1000);
}

module.exports = {
    encryptByMd5 : encryptByMd5,
    encryptByMd5Key : encryptByMd5Key ,
    encryptByACE : encryptByAES,
    decryptByACE : decryptByAES,
    createActiveCode : createActiveCode,
    resolveActiveCode : resolveActiveCode,
    base64Decode : base64Decode,
    base64Encode :  base64Encode,
    createLoginEmailCode : createLoginEmailCode,
    resolveLoginEmailCode : resolveLoginEmailCode,
    encryptByMd5NoKey: encryptByMd5NoKey,
    createGiftCode : createGiftCode ,
    resolveGiftCode : resolveGiftCode,
    getGiftOrderCode :getGiftOrderCode ,
    encryptByMd5NoKey : encryptByMd5NoKey ,
    getSmsRandomKey : getSmsRandomKey
};