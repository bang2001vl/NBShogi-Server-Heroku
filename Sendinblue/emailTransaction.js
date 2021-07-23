const SibApiV3Sdk = require('sib-api-v3-sdk');
let defaultClient = SibApiV3Sdk.ApiClient.instance;

let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SMTP_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let sender = {"name":"NB Shogi","email":"noreply@nbshogi.com"}

const sendEmailVerifyCode = (email, name, subject, code, callbackData, callbackError) =>{
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "{{params.subject}}";
    sendSmtpEmail.htmlContent = "<html><body><h1>Your verification code is <h1 style=\"color:Tomato;\">{{params.code}}</h1></h1></body></html>";
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = [{"email":email,"name":name}];
    sendSmtpEmail.headers = {"ThunderStudio":"Making game is playing game"};
    sendSmtpEmail.params = {"code":code,"subject":subject};
    apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
        callbackData(data);
    }, function(error) {
        callbackError(error);
    });
}

module.exports = {
    apiInstance,
    sendEmailVerifyCode
}