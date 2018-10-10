'use strict'
const http = require('http');
const https = require('https');
const qs = require('querystring');

const httpGet = (host,url,req,params,callback) => {
    if(params !=null){
        url = url + "?" + qs.stringify(params);
    }
    httpRequest(host,url,req,{},callback,'get');
}

const httpRequest = (host,url,req,params,callback,method) => {
    let paramStr = JSON.stringify(params);
    let options = {
        host: host.host,
        port: host.port,
        path: url,
        method: method!=null?method:'post',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length' : Buffer.byteLength(paramStr, 'utf8')
        }
    }
    try{
        let req = http.request(options, (res) => {
            let data = "";
            res.on('data', (d)=>{
                data += d;
            });
            res.on('end', () =>{
                let resObj = eval("(" + data + ")");
                callback(null,resObj);
            });
        });
        req.write(paramStr);
        req.end();
        req.on('error', (e) =>{
            callback(e,null);
        });
    }catch(e){
        console.log(e);
    }
}

const httpsRequest = (host,port,url,params,callback,method) => {
    let paramStr = JSON.stringify(params);
    let options = {
        host: host,
        port : port || 443,
        path: url,
        method: method!=null?method:'post',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length' : Buffer.byteLength(paramStr, 'utf8')
        }
    }
    try{
        let req = https.request(options, (res) => {
            var data = "";
            res.on('data', (d) =>{
                data += d;
            });
            res.on('end', () =>{
                try{
                    let resObj = eval("(" + data + ")");
                    callback(null,resObj);
                }catch(e){
                    callback(e,null);
                }

            });
        });
        req.write(paramStr);
        req.end();
        req.on('error', (e) => {
            callback(e,null);
        });
    }catch(e){
        callback(e,null);
    }
}

const httpPost = (host,url,req,params,callback) => {
    httpRequest(host,url,req,params,callback,'post');
}

const httpPut = (host,url,req,params,callback) => {
    httpRequest(host,url,req,params,callback,'put');
}

const httpDelete = (host,url,req,params,callback) => {
    httpRequest(host,url,req,params,callback,'delete');
}

const httpsGet = (host,port,url,params,callback) => {
    if(params !=null){
        url = url + "?" + qs.stringify(params);
    }
    httpsRequest(host,port,url,{},callback,'get');
}

module.exports ={ httpGet ,httpPost,httpPut ,httpDelete ,httpsGet }