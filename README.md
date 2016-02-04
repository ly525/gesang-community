
##项目相关
1. 启动方式: node app.js 或 supervisor app.js
2. 数据库信息

----
##学习过程
###对express-session 和 connect-mongo的解释
> 1. 对极客学院Wiki-PDF(Page30)添加更多注释
> 2. 一部分有来自CNode社区

1. connect-mongo和connect-redis都是为express-session写的扩展;
2. express-session是express中负责处理session的中间件,本来session是存储在内存中,现在需要将其持久化存储在数据库或redis或者memcache中
3. 存储在不同的持久化介质中就需要有对应不同的扩展,就像java-connector-mysql,java-connector-mongoDB,java-connector-Sql Server一样的.相当于是桥梁一样的角色
4. express-session的store实例有
>1. store.destory(sessionId, callback);销毁
 2. store.get(sessionId, callback); 取
 3. store.set(sessionId, session, callback);设置(也就是存储)
   - 不同的是connect-mongo把session存储在了MongoDB中.connect-redis把session存储在了redis中
   - 把session存储在持久化介质中可以让session更加稳定,持久化一些.默认express-session是把session存储在内存中的,后果是程序一旦崩溃,session就丢失了
5. TODO 2016年01月31日23:01:54 存储在内存中,在程序崩溃后session丢失会有什么后果,举例说明
   1. 猜测: 程序若是突然崩溃,那么用户立马就会掉线,用户刷新页面后需要重新登录,因此此时客户端发送到服务器端的cookie没有办法找到其唯一标识了,因此需要重新登录
   2. 猜测: 扇贝的Android客户端每过一段时间都会掉线,账户密码被要求重新输入进行登录是否是因为session失效的原因?
   3. 猜测: 比如浏览器在浏览淘宝时候,半小时内不操作,再次操作会要求输入密码重新登录是因为cookie失效还是session失效?(session和cookie的关系是什么?)
 
 
##应用场景
### `||` 
1.res.status(err.status || 500);
> 在`routes/error.js`中分别对404和500错误进行了处理,如果没有出现404错误直接出现500错误,那么err.status为undefined,则`res.status(err.status || 500)`为500

    ```javascript
    /*
    || 操作符号表示或者符号,当前面一个变量没有赋值,也就是undefined的时候,其值为false,采用后面一个值
    举例:
    var x = undefined || 12; //x = 12;
    var y = 12 || 13; // x= 13
    var z = 0 || 13;  // x=13;
    */
    // 具体场景:
    res.status(err.status || 500);
    ```

### python 启用一个目录作为静态文件服务器
>1. `python -m  SimpleHTTPServer` ->`Serving HTTP on 0.0.0.0 port 8000 ...`
>2. 例如在bootstrap文件的目录直接这样使用就可以了
> 这样就可以在每一个html文件中引入`http://localhost:8000/css/bootstrap.min.css`了,这样就可以避免相对路径的问题了

    
##QA
1. Page35 中的flash模块实现页面通知是什么机制和socket.io有关系么?
2. 登录注册成功之后,怎么执行之前未完成的动作?
3. session 怎么利用express-session以及connect-mongo两个中间件存储到数据库?
>1. 以及注册登录之后的session怎么存储到数据库中
>2. app.use(session{secret,key,cookie,store});以及req.session.user=user;是怎么把session存储到数据库中的!

##TODO
1. 安装Robomongo
>初次打开 Robomongo ,点击 Create 创建一个名为 blog (名字自定)的数据库链接(默认监听 localhost:27017),点击 Connect 就连接到数
据库了
2. 文件上传之后若是使用,其路径写的是/uploadFiles/xxx.jpg,那么添加了`static中间件`是否意味着在解析的时候是/public/uploadFiles/xxx.jpg?
 1. 添加文件拖拽上传和markdown的预览功能!

## Error
1. Error: collection name must be a String
```
// 错误写法:缺少了集合的名称
db.collection(function(err,articles){}
// 正确写法
db.collection('aricles',function(err,articles){}
```