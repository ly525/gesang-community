var mongoose = require('mongoose');
var mongodbConfig = require('../settings').mongodbSettings;

mongoose.connect("mongodb://localhost/potota-demo0", {server: {poolSize: 20}}, function (err) {
    if (err) {
        console.log("connect to %s error", mongodbConfig.db, err.message);
        process.exit(1);
    }
    console.log('数据库的链接信息' + mongodbConfig.host + ':' + mongodbConfig.port + '/' + mongodbConfig.db);
});

require('./user');
module.exports.User = mongoose.model('User');