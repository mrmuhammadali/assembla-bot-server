'use strict';

var _utils = require('../utils');

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ChatSchema = new Schema({
  _id: String,
  integrations: [{
    _id: String,
    spaceName: String
  }],
  token: {
    access_token: String,
    refresh_token: String,
    expires_in: String
  }

});

var Chat = module.exports = mongoose.model('Chat', ChatSchema);

module.exports.getChatById = function (id, callback) {
  Chat.findById(id, callback);
};

module.exports.getChatsBySpaceId = function (spaceId, callback) {
  Chat.find({
    "integrations": {
      "$elemMatch": {
        "_id": spaceId
      }
    }
  }, {
    "integrations.$._id": spaceId
  }, callback);
};

module.exports.integrateSpaceInChat = function (id, space, callback) {
  Chat.getChatById(id, function (err, chat) {
    if (!err) {
      var integrations = chat.integrations;

      if (integrations.filter(function (item) {
        return item._id === space._id;
      }).length === 0) {
        integrations.push(space);
        Chat.findByIdAndUpdate(id, { $set: chat }, { new: true }, callback);
      } else {
        callback({ message: _utils.MESSAGE.SPACE_ALREADY_EXIST });
      }
    }
  });
};

module.exports.updateToken = function (id, token, callback) {
  Chat.getChatById(id, function (err, chat) {
    if (!err) {
      chat.token = token;
      Chat.findByIdAndUpdate(id, { $set: chat }, { new: true }, callback);
    }
  });
};