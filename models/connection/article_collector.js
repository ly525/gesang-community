var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var BaseModel = require("./../base_model");
var ObjectId  = Schema.ObjectId;

var ArticleCollectorSchema = new Schema({
    collector_id: {type: ObjectId},
    article_id  : {type: ObjectId},
    create_time : {type: Date, default: Date.now()}
});

ArticleCollectorSchema.plugin(BaseModel);
mongoose.model('ArticleCollector', ArticleCollectorSchema);