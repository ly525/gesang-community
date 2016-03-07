    ObjectID = require('mongodb').ObjectID;

function Comment(_id, comment) {
    this._id = _id;
    this.comment = comment;
};


// 存储一条评论信息
Comment.prototype.save = function (callback) {
    var _id = this._id;
    var comment = this.comment;
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        db.collection('articles', function (err, collection) {
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }

            collection.update({_id: new ObjectID(_id)}, {$push: {comments: comment}}, function (err) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null);
            });

        });
    });
};

module.exports = Comment;