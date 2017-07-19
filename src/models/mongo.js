const mongoose = require('mongoose')

import { MESSAGE } from "../utils"

const Schema = mongoose.Schema

const ChatSchema = new Schema ({
  _id: String,
  integrations: [
    {
      _id: String,
      spaceName: String
    }
  ],
  token: {
    access_token: String,
    refresh_token: String,
    expires_in: Number
  }

})

const Chat = module.exports = mongoose.model('Chat', ChatSchema)

module.exports.getChatById = (id, callback) => {
  Chat.findById(id, callback)
}

module.exports.getChatsBySpaceId = (spaceId, callback) => {
  Chat.find({
    "integrations": {
      "$elemMatch": {
        "_id": spaceId
      }
    }
  }, {
    "integrations.$._id": spaceId
  }, callback)
}

module.exports.integrateSpaceInChat = (id, space, callback) => {
  Chat.getChatById(id, (err, chat) => {
    if (!err) {
      const { integrations } = chat
      if (integrations.filter(item => item._id === space._id).length === 0){
        integrations.push(space);
        Chat.findByIdAndUpdate(id, { $set: chat}, { new: true }, callback);
      }
      else {
        callback({message: MESSAGE.SPACE_ALREADY_EXIST})
      }
    }
  })
}

module.exports.updateToken = (id, token, callback) => {
  Chat.getChatById(id, (err, chat) => {
    if (!err) {
      chat.token = token
      Chat.findByIdAndUpdate(id, {$set: chat}, {new: true}, callback);
    }
  })
}
