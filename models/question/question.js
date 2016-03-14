var markdown  = require('markdown').markdown;
var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;
var BaseModel = require("./../base_model");

var ArticleSchema = new Schema({
    author_id      : {type: ObjectId},
    title          : {type: String},
    content        : {type: String},
    tags           : [],
    top            : {type: Boolean, default: false}, // 置顶帖
    good           : {type: Boolean, default: false}, // 精华帖
    lock           : {type: Boolean, default: false}, // 被锁定主题
    answer_count   : {type: Number, default: 0},
    visit_count    : {type: Number, default: 0},
    article_count  : {type: Number, default: 0},
    create_at      : {type: Date, default: Date.now},
    update_at      : {type: Date, default: Date.now},
    last_reply     : {type: ObjectId},
    last_reply_at  : {type: Date, default: Date.now},
    content_is_html: {type: Boolean},
    category       : {type: String},
    deleted        : {type: Boolean, default: false},
    is_draft       : {type: Boolean, default: false}
});


ArticleSchema.plugin(BaseModel);
mongoose.model('Article', ArticleSchema);
