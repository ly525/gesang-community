/**
 * 给所有的 Model 扩展功能
 * http://mongoosejs.com/docs/plugins.html
 */
var tools = require('../common/time');

module.exports = function (schema) {
  // 发表的时间
  schema.methods.create_at_ago = function () {
    return tools.formatDate(this.create_at, true);
  };

  // 最后一次编辑是的时间
  schema.methods.update_at_ago = function () {
    return tools.formatDate(this.update_at, true);
  };
};
