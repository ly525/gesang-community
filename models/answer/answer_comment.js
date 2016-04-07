var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var BaseModel = require('./../base_model');
var ObjectId  = Schema.ObjectId;

var AnswerCommentSchema = new Schema({
    content    : {type: String},
    answer_id: {type: ObjectId},
    author_id  : {type: ObjectId},
    master_id   : {type: ObjectId,default: null},
    create_at  : {type: Date, default: Date.now},
    update_at  : {type: Date, default: Date.now},
    likes      : [Schema.Types.ObjectId],
    dislikes   : [Schema.Types.ObjectId],
    deleted    : {type: Boolean, default: false}
});

AnswerCommentSchema.plugin(BaseModel);
mongoose.model('AnswerComment', AnswerCommentSchema);