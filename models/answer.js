var mongoose = require('mongoose');
var Schema 	 = mongoose.Schema;
var BaseModel= require('./base_model');
var ObjectId = Schema.ObjectId;

var AnswerSchema = new Schema({
 	content: { type: String },
  	question_id: { type: ObjectId},
  	author_id: { type: ObjectId },
  	reply_id: { type: ObjectId },
  	create_at: { type: Date, default: Date.now },
  	update_at: { type: Date, default: Date.now },
  	likes: [Schema.Types.ObjectId],
  	dislikes: [Schema.Types.ObjectId],
    deleted: {type: Boolean, default: false}
});

AnswerSchema.plugin(BaseModel);
mongoose.model('Answer', AnswerSchema);