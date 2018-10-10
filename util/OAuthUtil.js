
/**
 * Created by ibm on 14-3-25.
 */

var serializer = require('serializer');
var serverLogger = require('./ServerLogger.js');
var logger = serverLogger.createLogger('OAuthUtil.js');
//var userDao = require('../dao/UserDAO.js')
var options ={
    crypt_key: 'mp',
    sign_key: 'bizwise'
};



var clientType = {
    temp : 'temp',
    user : 'user' ,
    admin : 'admin'
};



var clientId ="mp";

var headerTokenMeta = "auth-token";

//The expired time 30 days
var expiredTime = 30*24*60*60*1000;
serializer = serializer.createSecureSerializer(options.crypt_key, options.sign_key);



function _extend(dst,src) {

    var srcs = [];
    if ( typeof(src) == 'object' ) {
        srcs.push(src);
    } else if ( typeof(src) == 'array' ) {
        for (var i = src.length - 1; i >= 0; i--) {
            srcs.push(this._extend({},src[i]))
        };
    } else {
        throw new Error("Invalid argument")
    }

    for (var i = srcs.length - 1; i >= 0; i--) {
        for (var key in srcs[i]) {
            dst[key] = srcs[i][key];
        }
    };

    return dst;
}




function createAccessToken(clientType,userId ,status){
    var out ;
    out = _extend({}, {
        access_token: serializer.stringify([clientType,  userId ,+new Date,status ]),
        refresh_token: null
    });
   /* userDao.updateUserLoginDate({userId:userId},function(error,result){
        if (error) {
            logger.error(' createAccessToken  updateUserLoginDate ' + error.message);
        } else {
            logger.info(' createAccessToken  updateUserLoginDate ' + result.affectedRows>0);
        }
    });*/
    return out.access_token;
}



function parseAccessToken(accessToken){
    try{
        var data = serializer.parse(accessToken);
        var tokenInfo ={};
        tokenInfo.clientType = data[0];
        tokenInfo.userId = data[1];
        tokenInfo.grantDate = data[2];
        tokenInfo.status = data[3];
        return tokenInfo;
    }catch(e){
        logger.error(' parseNewAccessToken :'+ e.message);
        return null;
    }
}


function parseUserToken(req){
    //var cookiesToken = getCookie(req.headers.cookie,cookieTruckMeta);
    var cookiesToken = req.headers[headerTokenMeta];
    if(cookiesToken == undefined){
        return null;
    }
    var tokenInfo = parseAccessToken(cookiesToken);
    if(tokenInfo == undefined){
        return null;
    }

    if(tokenInfo.clientType == undefined || tokenInfo.clientType != clientType.user){
        return null;
    }else if((tokenInfo.grantDate == undefined) || ((tokenInfo.grantDate + expiredTime)<(new Date().getTime()))){
        return null;
    }
    var resultObj = {};
    resultObj ={userId:tokenInfo.userId,userType:clientType.user,status:tokenInfo.status};
    return resultObj;
}


function parseAdminToken(req){
    var cookiesToken = req.headers[headerTokenMeta];
    if(cookiesToken == undefined){
        return null;
    }
    var tokenInfo = parseAccessToken(cookiesToken);
    if(tokenInfo == undefined){
        return null;
    }

    if(tokenInfo.clientType == undefined || tokenInfo.clientType != clientType.admin){
        return null;
    }else if((tokenInfo.grantDate == undefined) || ((tokenInfo.grantDate + expiredTime)<(new Date().getTime()))){
        return null;
    }
    var resultObj = {};
    resultObj ={userId:tokenInfo.userId,userType:clientType.admin,status:tokenInfo.status};
    return resultObj;
}





function getCookie(cookie ,name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=cookie.match(reg))
        return (unescape(arr[2]));
    else
        return null;
}

module.exports = {
    createAccessToken: createAccessToken,
    parseAccessToken : parseAccessToken,
    clientType : clientType,
    parseAdminToken:parseAdminToken,
    parseUserToken : parseUserToken
};
