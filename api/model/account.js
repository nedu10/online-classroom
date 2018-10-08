const mongoose =  require('mongoose')

const schema = mongoose.Schema

const accountSchema = new schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: [true, 'name field is required']
    },
    email: {
        type: String, 
        required: [true, 'email field is required'],
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/       
    },
    phone_no: { 
        type: Number
    },
    school: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'password field is required']
    }

})

const account = mongoose.model('account',accountSchema)

module.exports = account;