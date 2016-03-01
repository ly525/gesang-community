var User = require('./index').User;
var user = new User();
user.nickname = 'zhangsan';
user.save(function (err, user) {
    console.log(user.score);
});