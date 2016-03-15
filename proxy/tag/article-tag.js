var Article = require('../../models/index').Article;


/**
 * 统计Article中标签出现的次数，采用MapReduce进行实时计算
 * @param callback --> result: _id(tag name), value(occupied count)
 */
exports.tagArticleStatistical = function (callback) {
    var o    = {};
    o.map    = function () {
        this.tags.forEach(function (z) {  //z即是具体的某个tag了
            emit(z, 1);                    //对某个tag出现一次就计数一次
        });
    }
    o.reduce = function (k, values) {
        var total = 0;
        for (var i = 0; i < values.length; i++) {
            total += values[i];
        }
        return total;
    }
    Article.mapReduce(o, function (err, results) {
        if (err) {
            console.log("mapReduce err:" + err);
        }
        if (typeof results !== "undefined"){
            results.sort(function (a, b) {
                return a.value < b.value ? 1 : -1;
            }).slice(0, 3);
             return  callback(results);

        }

        callback([]);
    })
};

exports.getArticlesByTagName = function (tag_name, callback) {
    console.log(tag_name);
    Article.find({tags: tag_name}).exec(callback);
    
};