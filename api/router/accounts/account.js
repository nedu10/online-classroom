const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Account = require('../../model/account')
const checkAuth = require('../../middleware/createAuth')

const router = express.Router();

//route to get all account
router.get('/', (req, res, next) => {
    Account.find()
    .select("_id name email phone_no school")
    .exec()
    .then(result => {
        res.status(200).json({
            status: 'Success',
            message: 'GET request was successful',
            data: result
        })
    })
    .catch(err => {
        res.status(200).json({
            status: 'Failed',
            message: 'Error in fetching information',
            error: err
        })
    })
    
})

router.post('/signup', (req, res, next) => {
    Account.find({email: req.body.email})
    .then(result1 => {
        if( result1.length > 0){
            return res.status(401).json({
                message: 'email already exist'
            })
        }
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if(err){
                return res.status(401).json({
                    message: "password was not properly saved",
                    error: err
                })
            } else {
                const account = new Account({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    email: req.body.email,
                    phone_no: req.body.phone_no,
                    school: req.body.school,
                    created_hashtags: [],
                    following_hashtags: [],
                    all_hashtags: [],
                    password: hash
                })
                account.save()
                .then((result) => {
                    res.status(201).json({
                        status: "success",
                        message: 'Account Successfully Created',
                        account: result
                    })
                })
            }
        })
        
    })
    .catch( err => {
        res.status(500).json({
            message: 'error in creating teacher account',
            error : err
        })
    })
})

router.post("/login", (req, res, next) => {
    Account.findOne({email: req.body.email})
    .exec()
    .then(result => {
        if(!result){
            return res.status(401).json({
                message: 'Auth failed account does not exist'
            })
        } else {
            bcrypt.compare(req.body.password, result.password, (err, result2) => {
                if(err){
                    return res.status(401).json({
                        message: "Auth failed"
                    })
                }
                if(result2) {
                    const token = jwt.sign({ //remember jwt.io to decode the encoded data
                        id: result._id,
                        email: result.email,
                        name: result.name,
                        phone_no: result.phone_no,
                        school: result.school
                        
                    },
                    "secret",
                    {expiresIn: "12h"})
                    
                    return res.status(202).json({
                        status: 'Success',
                        message: 'successfully logged in',
                        token: token
                    })
                }
                res.status(401).json({
                    message: "Auth failed again"
                })
            })
        }
      
    })
    .catch(err => {
        res.status(200).json({
            message: 'logged in successfully'
        })
    })
    
})


module.exports = router;