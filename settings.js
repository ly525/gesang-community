//用于保存该博客工程的配置信息,比如数据库的连接信息

var mongodbSettings = {
    //    cookieSecret 用于 Cookie 加密与数据库无关,我们留作后用
    cookieSecret: 'mypotato',
    db: 'potato',
    host: 'localhost',
    port: 27017

};
var mysqlSettings = {
    //    //    cookieSecret 用于 Cookie 加密与数据库无关,我们留作后用
    //    cookieSecret: 'mypotato',
    //    db: 'potato',
    //    host: 'localhost',
    //    port: 27017

};
module.exports = {
    mongodbSettings: mongodbSettings,
    mysqlSettings: mysqlSettings
};