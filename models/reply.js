var mongoose = require('mongoose');
var Schema 	 = mongoose.Schema;
var BaseModel= require('./base_model');
var ObjectId = Schema.ObjectId;

var ReplySchema = new Schema({
 	content: { type: String },
  	article_id: { type: ObjectId},
  	author_id: { type: ObjectId },
  	create_at: { type: Date, default: Date.now },
  	update_at: { type: Date, default: Date.now },
  	likes: [Schema.Types.ObjectId],
  	dislikes: [Schema.Types.ObjectId],
    deleted: {type: Boolean, default: false}
});

ReplySchema.plugin(BaseModel);
mongoose.model('Reply', ReplySchema);