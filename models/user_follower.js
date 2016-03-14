var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var UserFollowerSchema = new Schema({
    follower_id   : {type: ObjectId},
    be_follower_id: {type: ObjectId},
    create_time   : {type: Date, default: Date.now()}
});

UserFollowerSchema.plugin(BaseModel);
mongoose.model('UserFollower', UserFollowerSchema);