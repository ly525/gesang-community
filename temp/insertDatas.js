var Article = require('../proxy').Article;

for (var i = 0; i < 30; i++) {
    (function (j){
        var author_id = "56ded939e6b2a49f7184901e";
        var title = "个人开发者需要哪些资质"+j;
        var content ="个人开发者需要哪些资质？【上传自己开发的应用】提供：身份证。上传方式有3种，请任选一种（仅支持JPEG/PNG格式），具体如下：" +
            "开发者本人手持身份证正面拍摄照片（本人入镜且需要露出正脸，身份证信息清晰可见）；查看示例图片" +
            "提供身份证正反面扫描件；查看示例图片" +
            "提供身份证正反面复印件并备注“仅供豌豆荚应用审核”签字确认后拍照上传。查看示例图片";
        var tags = ["tag1", "tag2", "tag3"];
        var is_draft =false;
        Article.newAndSave(author_id, title, content, tags, is_draft, function (err, article) {
            console.log("***********************"+ article._id);

        });
    })(i)
};