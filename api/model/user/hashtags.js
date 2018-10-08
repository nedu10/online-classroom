const mongoose = require("mongoose")

const Schema = mongoose.Schema

const hashtagSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-profile',
        required: [true, 'user_id is required']
    },
    hashtag_name: {
        type: String,
        required: [true, 'hashtag name is required']
    },
    hashtag_description: String,
    hashtag_followers: {
        type: Array
    },
    hashtag_likes: {
        type: Array
    },
    hashtag_department: {
        type: String,
        required: [true, 'hashtag department is required']
    },
    hashtag_comments: {
        type: Array
    },
    
})

const hashtagModel = mongoose.model('Hashtags', hashtagSchema)

module.exports = hashtagModel