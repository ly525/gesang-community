var utility = require('utility');
console.log('https://www.someline.com/cn/avatar/' + utility.md5('liuyanshi@aliyun.com'.toLowerCase()) + '/48');
console.log('https://www.someline.com/cn/avatar/' + utility.sha1('1006096345@qq.com'.toLowerCase()) + '/48');

