var mongodbInstance = require('./db');

function Article(author, title, content) {
    this.author = author;
    this.title = title;
    this.content = content;
}

Article.prototype.save = function (callback) {

    // 这部分的知识点在做日志分析的时候讲过一些 2016年02月02日15:40:31
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + '-' + (date.getMonth() + 1),
        day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        hour: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours(),
        minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes < 10 ? '0' + date.getMinutes() : date.getMinutes()),
        second: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ":" + (date.getSeconds < 60 ? '0' + date.getSeconds() : date.getSeconds()),
        postTime: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ":" + (date.getSeconds < 60 ? '0' + date.getSeconds() : date.getSeconds())
    };

    var article = {
        author: this.author,
        time: time,
        title: this.title,
        content: this.content
    };
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            collection.insert(article, {
                safe: true
            }, function (err) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null); //回调函数中若是传回错误就处理发表文章错误,并且跳转到首页;若是没有错误,flash提示发表成功,并且跳转到发表文章列表首页

            });
        });
    });
};

Article.get = function (author, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {

            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            var query = {};
            if (author) {
                query.author = author;
            }
            // 根据query对象查询文章
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, articles) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null, articles); // 返回根据检索条件检索到的所有文章合集,以数组形式返回查询的结果
            });
        });
    });
};
module.exports = Article;