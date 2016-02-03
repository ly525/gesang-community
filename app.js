//如果只写模块名：则Node会依次在内置模块、全局模块和当前模块下查找hello.js，你很可能会得到一个错误：
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');

/*
1. express 也提供了会话中间件,默认情况下是把用户信息存储在内存中
2. 但我们既然已经有了 MongoDB,不妨把会话信息存储在数据库中,便于持久维护。
3. 为了使用这一功能,我们需要借助 express-session 和 connect-mongo 这两个第三方中间件
 */
var session = require('express-session');
var MongoStore = require('connect-mongo')(session); //TODO 2016年01月31日22:35:29 这边后面跟着的(session)不理解是做什么的?
// require 引入一个javascript文件(routes/index.js作为一个模块,通过require引入)
var routes = require('./routes/index');
var users = require('./routes/users');
var library = require('./routes/library');
var article = require('./routes/article');
var errorHandler = require('./routes/error');
// 引入数据库配置文件
var settings = require('./settings');
var mongodbSettings = settings.mongodbSettings;
var flash = require('connect-flash');

// 执行express函数也就是express();将express()执行结果返回赋值给app变量
var app = express();

// view engine setup
//设置 views 文件夹为存放视图文件的目录, 即存放模板文件的地方,__dirname 为全局变量,存储当前正在执行的脚本所在的目录,也就是app.js所在的目录。
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
// uncomment after placing your favicon in /public
//设置/public/favicon.ico为favicon图标
//TODO 发现这边设置favicon和在<head></head>中是否冲突,而且貌似head中的生效
//app.use(favicon(path.join(__dirname, 'public', 'img/favicon.ico')));
app.use(logger('dev'));
//加载解析json的中间件
app.use(bodyParser.json());
//加载解析urlencoded请求体的中间件。
app.use(bodyParser.urlencoded({
    extended: false
}));
//加载解析cookie的中间件
app.use(cookieParser());
app.use(multer({
    //dest 是上传的文件所在的目录,rename 函数用来修改上传后的文件名,这里设置为保持原来的文件名
    dest: './public/uploadFiles',
    rename: function (fieldName, fileName) {
        return fileName;
    }
}));
//设置public文件夹为存放静态文件的目录
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: mongodbSettings.cookieSecret,
    key: mongodbSettings.db, //cookie name
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30
    }, //30days.前面的1000表示1000毫秒也就是1秒
    store: new MongoStore({
        db: mongodbSettings.db,
        host: mongodbSettings.host,
        port: mongodbSettings.port
    })

}));

app.use('/', routes);
app.use('/users', users);
app.use('/library', library);
app.use('/', article);
errorHandler(app);



app.listen(3000);
module.exports = app;