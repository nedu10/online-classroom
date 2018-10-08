const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    hashtag_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hashtags',
        required: [true, 'hashtag_id is required']
    },
    hashtag_name: {
        type: String,
        required: [true, 'Hashtag name is required']
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-profile',
        required: [true, 'user_id is required']
    },
    post_title: {
        type: String,
        required: [true, 'post title is required']
    },
    post_body: {
        type: String,
        required: [true, 'post body is required']
    },
    post_department: {
        type: String,
        required: [true, 'post department is required']
    },
    post_likes: {
        type: Array
    },
    post_comments: {
        type: Array
    },
    post_image: {
        type: Object
    }
})

const postModel = mongoose.model('Post',postSchema)

module.exports = postModel
