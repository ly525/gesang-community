var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var utility   = require('utility');
var BaseModel = require("./../base_model");

var UserSchema = new Schema({
    nickname  : {type: String},
    uniquename: {type: String},
    passhash  : {type: String},
    email     : {type: String},
    url       : {type: String},
    location  : {type: String},
    signature : {type: String, default: "据说还没写一个自我介绍!"},
    avatarUrl : {type: String},
    is_block  : {type: Boolean, default: false},

    score                : {type: Number, default: 0},
    article_count        : {type: Number, default: 0},
    reply_count          : {type: Number, default: 0},
    comment_count        : {type: Number, default: 0},
    follower_count       : {type: Number, default: 0},
    be_follower_count    : {type: Number, default: 0},
    collect_tag_count    : {type: Number, default: 0},
    collect_article_count: {type: Number, default: 0},
    like_article_count   : {type: Number, default: 0},
    create_at            : {type: Date, default: Date.now},
    update_at            : {type: Date, default: Date.now},
    is_star              : {type: Boolean},
    level                : {type: String},
    active               : {type: Boolean, default: false},
    receive_reply_mail   : {type: Boolean, default: false},
    receive_at_mail      : {type: Boolean, default: false},
    from_wp              : {type: Boolean},
    retrieve_time        : {type: Number},
    retrieve_key         : {type: String},
    accessToken          : {type: String}
});


UserSchema.plugin(BaseModel);

mongoose.model('User', UserSchema);

