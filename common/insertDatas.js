var Article = require('../proxy/index').Article;

for (var i = 0; i < 30; i++) {
    (function (j) {
        var author_id = "56e59dbf77967a8f55f596a1";
        var title     = "文章标题测试" + j;
        var content   = "图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间图灵书讯——计算机不懂人类的时间";
        var tags      = ["tag1", "tag2", "tag3"];
        var is_draft  = false;
        Article.newAndSave(author_id, title, content, tags, is_draft, function (err, article) {
            console.log("***********************" + article._id);

        });
    })(i)
}