var crypto = require('crypto');
var email_hash = crypto.createHash('sha1').update(JSON.stringify('libernlin@gmail.com')).digest('hex');
console.log(email_hash);
//https://www.someline.com/cn/user/profilephoto/origin/ecc44349d184cca09dae7e6c0f5a26dc5fc43565.jpg
//https://www.someline.com/cn/avatar/f1da9d8d1bfae9ee847c3e839bde4a9c3ce2e564/200
//https://www.someline.com/cn/avatar/5a68cbf9f0900dcc6f4d6bffb89166a9795c791c/48