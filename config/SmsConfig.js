var smsOptions = {
    action: 'SMS/TemplateSMS',
    accountType: 'Accounts',
    accountSID: '8aaf07085e6037fd015e6e6eb5e60254',
    accountToken: '8f987b4902314ad38024c4b0ced9f0b3',
    appSID: '8a216da8662360a401665b7a25421242',
    appToken: '5dd9fb504940d610c229a1ec4dfd3688',

    server: 'app.cloopen.com',
    port: '8883' ,
    signTemplateId: 348517,
    notifyTemplateId : 348523 ,
};



module.exports = {
    smsOptions  : smsOptions
}