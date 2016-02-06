var mongodbInstance = require('./db'),
    markdown = require('markdown').markdown,
    ObjectID = require('mongodb').ObjectID;

function Article(author, title, content, tags) {
    this.author = author;
    this.title = title;
    this.content = content;
    this.tags = tags;
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
        tags: this.tags,
        content: this.content,
        comments: [],
        pv: 0
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

//获取一个人的所有文章(传入参数 name)或获取所有人的文章(不传入参数)
Article.getAll = function (author, callback) {
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
                articles.forEach(function (article) {
                    article.content = markdown.toHTML(article.content);
                });
                callback(null, articles); // 返回根据检索条件检索到的所有文章合集,以数组形式返回查询的结果
            });
        });
    });
};

// 一次获取10篇文章
Article.getTen = function (author, page, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                console.log('==[Error] in /models/article.js Article.getTen() ' + err);
                mongodbInstance.close();
                return callback(err);
            }
            var query = {};
            // 如果是查询某一个用户的文章的,比如:if('zhangsan')-> if(true)
            if (author) {
                query.author = author;
            }
            // 根据count返回特定查询的文档数 total
            collection.count(query, function (err, total) {
                console.log('==输出total的总量:' + total);
                // 根据query对象查询, 并且跳过前(page-1)*10个结果,并且返回之后的10个结果
                collection.find(query, {
                    skip: (page - 1) * 10,
                    limit: 10
                }).sort({time: -1}).toArray(function (err, articles) {
                    mongodbInstance.close();
                    if (err) return callback(err);
                    // 解析文章内容 markdown -> html
                    articles.forEach(function (article) {
                        article.content = markdown.toHTML(article.content);
                    });
                    callback(null, articles, total);
                });
            });
        });
    });

};

// 根据作者,标题,发表时间获得一篇文章
Article.getOne = function (_id, callback) {

    // 打开数据库
    // TODO 查一下open()返回结果db的查询 2016年02月03日08:50:34
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            collection.findOne({
                _id: new ObjectID(_id)
            }, function (err, article) {
                if (err) {
                    mongodbInstance.close();
                    return callback(err);
                }
                console.log(article.content);
                if (article) {
                    collection.update({
                        _id: new ObjectID(_id)
                    }, {$inc: {pv: 1}}, function (err) {
                        console.log(err);
                        mongodbInstance.close();
                        if (err) return callback(err);
                    });
                    // 解析markdown为html
                    //if (article === null) {
                    //    console.log(author + '-' + title);
                    //}
                    article.content = markdown.toHTML(article.content);
                    article.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                    return callback(null, article);
                }
            });
        });
    });
};

Article.getArchive = function (callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            collection.find({}, {author: 1, time: 1, title: 1}).sort({time: -1}).toArray(function (err, articles) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null, articles);
            });
        })
    });
};

Article.getTags = function (callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            collection.distinct('tags', function (err, tags) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null, tags);
            });
        })
    });

};

Article.getTag = function (tag, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            //
            collection.find({tags: tag}, {
                author: 1,
                time: 1,
                title: 1
            }).sort({time: -1}).toArray(function (err, articles) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null, articles);
            });
        });
    });
};

Article.edit = function (_id, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            collection.findOne({
                _id: new ObjectID(_id)
            }, function (err, article) {
                //console.log(article.content);
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null, article);
            });
        });
    });
};

Article.update = function (_id, title, content, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            // TODO 2016年02月04日09:57:30 这边进行更新的时候如何在后来的扩展中可以查看文章的历史版本?
            collection.update({_id: new ObjectID(_id)}, {
                $set: {
                    title: title,
                    content: content
                }
            }, function (err) {
                mongodbInstance.close();
                if (err) return callback(err);
                return callback(null);
            });
        });
    });
};

Article.remove = function (_id, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            collection.remove({_id: new ObjectID(_id)}, {w: 1}, function (err) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null);
            });
        });

    })


};

Article.search = function (keyword, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            var pattern = new RegExp(keyword, 'i');// i修饰符用于执行对大小写不敏感的匹配
            collection.find({
                title: pattern // TODO 2016年02月06日20:02:10 现在是只匹配标题,怎么查询文章的内容和作者呢?
            }, {
                name: 1,
                time: 1,
                title: 1
            }).sort({
                time: -1 // TODO 2016年02月06日20:02:52 这边的-1 是什么意思?
            }).toArray(function (err, articles) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null, articles);
            });
        });
    });
};

module.exports = Article;