var Article = require('../models').Article;
var markdown = require('markdown').markdown;
var EventProxy = require('eventproxy');
var User        = require('./user');
var Reply       = require('./reply');

exports.newAndSave = function (author_id, title, content, tags, is_draft, callback){
    var article         = new Article();
    article.author_id   = author_id;
    article.title       = title;
    article.content     = content
    article.tags        = tags;
    article.is_draft    = is_draft;
    article.save(callback);
};

//获取一个人的所有文章(传入参数 name)或获取所有人的文章(不传入参数)
exports.getAllArticlesByUserId = function (userId, callback) {
    Article.find({
        userId: userId
    }), (function (err, articles) {
        if (err) return callback(err);
        articles.forEach(function (article) {
            article.content = markdown.toHTML(article.content);
        });
        callback(null, articles); // 返回根据检索条件检索到的所有文章合集,以数组形式返回查询的结果
    });
};

// 一次获取10篇文章


//exports.getTwentyArticlesWithoutUserId = function (id, page, callback) {
//
//    var ep = new EventProxy();
//    ep.all('total', 'articles', function(total, articles){
//       return callback(null, total, articles);
//    });
//    Article.find({deleted:false}).skip((page - 1) * 20).limit(20).sort('-last_reply_at').exec(function(err, articles){
//        if(err) return callback(err);
//        ep.emit('articles', articles);
//    });
//    Article.count({}, function(err, total){
//        if(err) return callback(err);
//        ep.emit('total', total);
//    });
//
//};
//exports.getTwemtyArticleByUserId = function (id, page, callback) {
//    Article.find({}).skip((page - 1) * 10).limit(10).exec(callback);
//    mongodbInstance.open(function (err, db) {
//
//        // 根据count返回特定查询的文档数 total
//        collection.count(query, function (err, total) {
//            console.log('==输出total的总量:' + total);
//            // 根据query对象查询, 并且跳过前(page-1)*10个结果,并且返回之后的10个结果
//            collection.find(query, {
//                skip: (page - 1) * 10,
//                limit: 10
//            }).sort({
//                time: -1
//            }).toArray(function (err, articles) {
//                mongodbInstance.close();
//                if (err) return callback(err);
//                // 解析文章内容 markdown -> html
//                articles.forEach(function (article) {
//
//                    //article.content = markdown.toHTML(article.content);
//                    article.content = article.content.length > 300 ? article.content.substring(0, 200) + "..." : article.content;
//                });
//                callback(null, articles, total);
//            });
//        });
//    });
//};

exports.getFullArticleByArticleId = function(article_id, callback){
    var ep = new EventProxy();
    ep.all('article', 'author', 'replies', function(article, author, replies){
        article.author =  author;
        article.replies = replies;
        return callback(null, article);
    });

    Article.findOneAndUpdate({_id:article_id, deleted: false},{$inc:{visit_count:1}},function(err, article){
        if(!article) return callback('此文章不存在或者已经被删除' );
        article.content = markdown.toHTML(article.content);
        ep.emit('article', article);

        User.getUserById(article.author_id, function(err, author){
            if(!author) return callback( "文章的作者丢了");
            ep.emit('author', author);
        });
        // ep.done('replies')相当于是一个回调函数.用法参见: https://github.com/JacksonTian/eventproxy#神奇的done
        Reply.getRepliesByArticleId(article_id, function(err, replies){
            if(err) return callback(err);
            ep.emit('replies', replies);
        });
    });


};
// 根据作者,标题,发表时间获得一篇文章
exports.getArticleByArticleId = function (article_id, callback) {
    Article.findByIdAndUpdate(article_id, {
            $inc: {visit_count: 1}
        },
        function (err, article) {
            if (err) return callback(err);
            article.content = markdown.toHTML(article.content);
            //article.comments.forEach(function (comment) {
            //    comment.content = markdown.toHTML(comment.content);
            //});
            return callback(null, article);
        });

};


exports.getArchive = function (callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            collection.find({}, {
                author: 1,
                time: 1,
                title: 1
            }).sort({
                time: -1
            }).toArray(function (err, articles) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null, articles);
            });
        })
    });
};

exports.getTags = function (callback) {
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

exports.getTagsByUserName = function (author, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            collection.distinct('tags', {"author": author}, function (err, tags) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null, tags);
            });

        })
    });

};

exports.getTag = function (tag, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            //
            collection.find({
                tags: tag
            }, {
                author: 1,
                time: 1,
                title: 1
            }).sort({
                time: -1
            }).toArray(function (err, articles) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null, articles);
            });
        });
    });
};

exports.getArticleWithoutRendingByArticleId = function (article_id, callback) {
       Article.findOne({_id: article_id}, function (err, article) {
                if (err) return callback(err);
                callback(null, article);
        });
};

// exports.update = function (_id, title, content, callback) {
//             // TODO 2016年02月04日09:57:30 这边进行更新的时候如何在后来的扩展中可以查看文章的历史版本?
//         Article.update({_id:article_id})
//             }, {
//                 $set: {
//                     title: title,
//                     content: content
//                 }
//             }, function (err) {
//                 mongodbInstance.close();
//                 if (err) return callback(err);
//                 return callback(null);
//             });
//         });
//     });
// };

exports.remove = function (_id, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            // 获得被被删除的文章的信息,主要是获得该转载的文章的来源文章的ID
            collection.findOne({_id: new ObjectID(_id)}, function (err, article) {
                if (err) {
                    mongodbInstance.close();
                    return callback(err);
                }
                // 如果有reprint_from_article_id,说明这篇文章是转载来的,先保存下来,删除被转载的文章,之后再更新源文章
                var reprint_from_article_id = '';
                if (article.reprint_info.reprint_from_article_id) {
                    reprint_from_article_id = article.reprint_info.reprint_from_article_id;
                }
                if (reprint_from_article_id !== '') {

                    collection.update({_id: new ObjectID(reprint_from_article_id)}, {
                        $pull: {
                            "reprint_info.reprint_to_user": {name: article.author}
                        }
                    }, function (err) {

                        if (err) {
                            mongodbInstance.close();
                            return callback(err);
                        }

                    });
                }

                collection.remove({_id: new ObjectID(_id)}, {w: 1}, function (err) {
                    mongodbInstance.close();
                    if (err) return callback(err);
                    callback(null);
                });
            });


        });

    })


};

exports.search = function (keyword, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            var pattern = new RegExp(keyword, 'i'); // i修饰符用于执行对大小写不敏感的匹配
            collection.find({
                title: pattern // TODO 2016年02月06日20:02:10 现在是只匹配标题,怎么查询文章的内容和作者呢?
            }, {
                name: 1,
                time: 1,
                title: 1,
                content: 1 // 这边的属性是什么意思？？
            }).sort({
                time: -1 // TODO 2016年02月06日20:02:52 这边的-1 是什么意思?
            }).toArray(function (err, articles) {
                mongodbInstance.close();
                if (err) return callback(err);
                articles.forEach(function (article) {
                    //article.content = markdown.toHTML(article.content);
                    article.content = article.content.length > 150 ? article.content.substring(0, 100) + "..." : article.content;
                });
                callback(null, articles);
            });
        });
    });
};

