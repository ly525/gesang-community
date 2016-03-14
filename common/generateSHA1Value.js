var crypto     = require('crypto');
var email_hash = crypto.createHash('sha1').update(JSON.stringify('libernlin@gmail.com')).digest('hex');
console.log(email_hash);
