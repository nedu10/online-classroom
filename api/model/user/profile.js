const mongoose = require("mongoose")

const Schema = mongoose.Schema

const profileSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'user_id field is required']
    },
    user: {
        type: Object,
        required: [true, 'userfield is required']
    },
    faculty: {
        type: String,
        required: [true, "Faculty field is required"]
    },
    department: {
        type: String,
        required: [true, 'Department field is required']
    },
    degree: String,
    description: String,
    created_hashtags: {
        type: Array
    },
    following_hashtags: {
        type: Array
    },
    all_hashtags: {
        type: Array
    },
    image_name: Object
})

const profileModel = mongoose.model('user-profile', profileSchema)

module.exports = profileModel