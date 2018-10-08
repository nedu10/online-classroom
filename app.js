const express = require("express")
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')

//custom module
const accountRoute = require('./api/router/accounts/account')
const userProfile = require('./api/router/user/profile')
const userHashtag = require('./api/router/user/hashtags')
const userPost = require('./api/router/user/post')

const app = express()


//setting up DB
dbURL = 'mongodb://127.0.0.1:27017/online-classroom'  //locally installed mongodb

mongoose.connect(dbURL, {useNewUrlParser: true})
mongoose.Promise = global.Promise;


//==========================MIDDLEWARE===========================================//

//setting up cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin","*") //allow access to any frontend
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if(req.method === "OPTIONS"){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
})

//setting up middleware for morgan
app.use(morgan('dev'))

//setting up middleware for body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

//run static files
app.use('/api',express.static('public'))


//setting up route middleware
app.use('/api/account/',accountRoute)
app.use('/api/profile/', userProfile)
app.use('/api/hashtag/', userHashtag)
app.use('/api/post/', userPost)



//General error handling

//handling error for wrong url
app.use((req, res, next) => {
    const error = new Error('Page not found')
    error.status = 404
    next(error)
})
//catching all errors
app.use((err, req, res, next) => {
    res.status(err.status||500).json({
        error:{
            message: err.message
        }
    })
})

//=========================================END OF MIDDLEWARE=================================//
module.exports = app