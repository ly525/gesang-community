


//var settings = require('../settings'),
//    mongodbSettings = settings.mongodbSettings,
//    mongodbDb = require('mongodb').Db,
//    mongodbConnection = require('mongodb').Connection,
//    mongodbServer = require('mongodb').Server;
//
//console.log('MongoDB Info:' + mongodbSettings.host + ':' + mongodbSettings.port + '/' + mongodbSettings.db);
////设置数据库名、数据库地址和数据库端口创建了一个数据库连接实例
//var mongodbInstance = new mongodbDb(mongodbSettings.db, new mongodbServer(mongodbSettings.host, mongodbSettings.port), {
//    safe: true
//});
////通过 module.exports 导出该实例.这样,我们就可以通过 require 这个文件来对数据库进行读写了。
//module.exports = mongodbInstance;