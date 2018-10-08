const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')

const userProfile = require('../../model/user/profile') 
const checkAuth = require('../../middleware/createAuth')

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/profile-images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    }
})

const profileImage = multer({
    storage: storage
}).single('profile_image')

router.get('/', (req,res, next) => {
    userProfile.find()
    .select("_id user_id user faculty department degree description image_name")
    .exec()
    .then( response => {
        res.status(200).json({
            status: "success",
            message: "GET request was successful",
            data: response,
            count: response.length
        })
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    })
})

router.get('/:user_id', checkAuth, (req,res, next) => {
    userProfile.findOne({user_id: req.params.user_id})
    .select("_id user_id user faculty department degree description created_hashtags following_hashtags all_hashtags image_name")
    .exec()
    .then( response => {
        res.status(200).json({
            status: "success",
            message: "GET request was successful",
            data: response
        })
    })
    .catch( err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

router.post('/', checkAuth, profileImage, (req,res,next) => {
    userProfile.find({user_id: req.headers.isAuthenticated.id})
    .exec()
    .then(response1 => {
         
        if(response1.length > 0) {
            return res.status(400).json({
                status: 'Failed',
                message: 'cannot make such request'
            })
        }

        const user_profile = new userProfile({
            _id: new mongoose.Types.ObjectId(),
            user_id: req.headers.isAuthenticated.id,
            user: req.headers.isAuthenticated,
            faculty: req.body.faculty,
            department: req.body.department,
            degree: req.body.degree,
            description: req.body.description,
            created_hashtags: [],
            all_hashtags: [],
            following_hashtags: [],
            image_name: {
                name: req.file.filename,
                originalname: req.file.originalname,
                path: `http://localhost:3000/api/images/profile-images/${req.file.filename}`
            }
        })
    
        return user_profile.save()
    })
    .then(response => {
        res.status(201).json({
            status: "Success",
            message: "Profile Successfully Created",
            data: {
                id: response.id,
                user_id: response.user_id,
                user: response.user,
                faculty: response.faculty,
                department: response.department,
                degree: response.degree,
                description: response.description,
                profile_image: {
                    name: req.file.filename,
                    originalname: req.file.originalname,
                    path: `http://localhost:3000/api/images/profile-images/${req.file.filename}`
                }
            }
        })
    })
    .catch( err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

router.patch('/:user_id', (req, res, next) => {

    if(req.body._id || req.body.user_id){
        return res.status(400).json({
            status: 'Failed',
            message: 'cannot edit such a field'
        })
    }
    userProfile.update({user_id: req.params.user_id},{$set: req.body})
    .exec()
    .then(response => {
        return response
    })
    .then(response1 => {
        console.log(response1)
        res.status(202).json({
            response: response1
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})



module.exports = router