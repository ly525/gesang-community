// 创建一个数据库连接实例
var mongodbInstance = require('./db');

// 创建一个对象
function User(user) {

    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};
// 给对象添加方法,使得该类的所有实例都可以使用
User.prototype.save = function (callback) {
    console.log('User 实例的prototype方法 save()');
    // 创建实例
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    };
    // 打开与数据库的连接 
    mongodbInstance.open(function (err, db) {
        console.log('打开数据库连接,连接信息未' + db);

        if (err) {
            //mongodbInstance.close(); 这句话注释的原因是:既然打开过程中失败,自然是没有打开,所以也无须关闭了
            return callback(err);
        }

        // 读取users集合(也就是users表,如果没有users表就新建一个)
        db.collection('users', function (err, collection) {
            console.log('读取users集合的得到的信息' + collection);
            if (err) {
                mongodbInstance.close();
                return callback(err);
            }
            console.log('即将进行存储的用户信息' + user);
            // 没有错误,进行存储:将用户信息存储到users集合
            collection.insert(user, {
                safe: true
            }, function (err, user) {

                console.log('插入用户信息后读取的用户信息' + user);
                mongodbInstance.close();
                if (err) return callback(err); //错误,返回 err 信息
                callback(null, user[0]); //成功!err 为 null,并返回存储后的用户文档
            });


        });

    });

};


User.get = function (name, callback) {
    mongodbInstance.open(function (err, db) {
        if (err) return callback(err);
        // 读取user集合
        db.collection('users', function (err, collections) {
            if (err) {
                mongodbInstance.close();
                return callback(err);

            }

            collections.findOne({
                name: name
            }, function (err, user) {
                mongodbInstance.close();
                if (err) return callback(err);
                callback(null, user);
            });
        });
    });
};


module.exports = User;