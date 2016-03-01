var nodemailer = require('nodemailer');
var config = require('../config');
var transporter = nodemailer.createTransport(config.mail_smtp_options);
//var SITE_ROOT_URL = 'http://' + config.club_host;
var SITE_ROOT_URL = 'http://localhost:3000';

/**
 * 发送邮件
 * @param {Object} data 需要发送的邮件数据
 * - from    发件人
 * - to      收件人
 * - subject 主题
 * - html    主体内容
 */
exports.sendMail = function (data, callback) {
    transporter.sendMail(data,callback);
};


/**
 * 发送激活邮件
 * @param {String} receiver 收件人邮件地址
 * @param {String} token 重置用的token字符串:根据uuid生成
 * @param {String} nickname 收件人的昵称
 * @param {String} uniquename 收件人在系统中的唯一用户名
 */

exports.sendActiveEmail = function (receiver, token, nickname, uniquename, callback) {
    var mailOptions = {
        from    : config.club_name + '<' + config.mail_smtp_options.auth.user + '>', // sender address
        to      : receiver, // list of receivers
        subject : config.club_name + ' 社区账户激活', // Subject line
        html    : '<p>您好：' + nickname + '</p>' +
        '<p>我们收到您在' + config.club_name + '社区的注册信息，请点击下面的链接来激活帐户：</p>' +
        '<a href  = "' + SITE_ROOT_URL + '/user/account-active?key=' + token + '&uniquename=' + uniquename + '">激活链接</a>' +
        '<p>若您没有在' + config.club_name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
        '<p>' + config.club_name + '社区 谨上。</p>'// html body
    };

    exports.sendMail(mailOptions, callback);
};


/**
 * 发送重置密码邮件
 * @param {String} receiver 收件人的邮箱
 * @param {String} token    重置用的token字符串:根据uuid生成
 * @param {String} nickname 收件人的昵称
 * @param {String} uniquename 收件人在系统中的唯一用户名
 */

exports.sendResetPasswordEmail = function (receiver, token, nickname, uniquename, callback) {
    var mailOptions = {
        from    : config.club_name + '<' + config.mail_smtp_options.auth.user + '>', // sender address
        to      : receiver, // list of receivers
        subject : config.club_name + ' 社区密码重置', // Subject line
        html    : '<p>您好：' + nickname + '</p>' +
        '<p>我们收到您在' + config.club_name + '社区重置密码的请求，请在24小时内单击下面的链接来重置密码:</p>' +
        '<a href  = "' + SITE_ROOT_URL + '/reset_pass?key=' + token + '&uniquename=' + uniquename + '">重置密码链接</a>' +
        '<p>若您没有在' + config.club_name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
        '<p>' + config.club_name + '社区 谨上。</p>'// html body
    };

    exports.sendMail(mailOptions, callback);
};