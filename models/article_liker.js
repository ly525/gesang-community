var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var BaseModel = require("./base_model");
var ObjectId  = Schema.ObjectId;

var ArticleLikerSchema = new Schema({
    liker_id   : {type: ObjectId},
    article_id : {type: ObjectId},
    create_time: {type: Date, default: Date.now()}
});

ArticleLikerSchema.plugin(BaseModel);
mongoose.model('ArticleLiker', ArticleLikerSchema);