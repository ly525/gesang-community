var config = {

    // 社区名称
    club_name: '格桑花苑',
    club_host: 'gesanghuayuan',

    // mongodb 配置
    mongodb_dbname: 'gesanghuayuan',
    mongodb_host  : 'localhost',
    mongodb_port  : 27017,

    // redis 配置，默认是本地
    redis_host: '127.0.0.1',
    redis_port: 6379,
    redis_db  : 0,

    // session 配置
    session_secret: 'session_secret',
    cookie_secret : 'cookie_secret',
    cookie_name   : 'cookie_name',


    // 邮箱配置
    mail_smtp_options: {
        host  : 'smtp.aliyun.com',
        port  : 465,
        secure: true, // use SSL
        auth  : {
            user: 'liuyanshi@aliyun.com',
            pass: 'yanghan031216'
        }
    }


};

// 导出一个对象需要使用module.exports
module.exports = config;

