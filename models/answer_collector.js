var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var BaseModel = require("./base_model");
var ObjectId  = Schema.ObjectId;

var AnswerCollectorSchema = new Schema({
	collector_id: { type:ObjectId },
	answer_id : { type: ObjectId },
	create_time : {type : Date, default: Date.now()}
});

AnswerCollectorSchema.plugin(BaseModel);
mongoose.model('AnswerCollector', AnswerCollectorSchema);