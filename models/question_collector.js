var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var BaseModel = require("./base_model");
var ObjectId  = Schema.ObjectId;

var QuestionCollectorSchema = new Schema({
	collector_id: { type:ObjectId },
	question_id : { type: ObjectId },
	create_time : {type : Date, default: Date.now()}
});

QuestionCollectorSchema.plugin(BaseModel);
mongoose.model('QuestionCollector', QuestionCollectorSchema);