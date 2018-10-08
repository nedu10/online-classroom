const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')

const Hashtag = require('../../model/user/hashtags')
const Post = require('../../model/user/post')
const checkAuth = require('../../middleware/createAuth')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/post-images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    }
})

const postImage = multer({
    storage: storage
}).single('post_image')

const router = express.Router()

//get all post
router.get('/', (req, res, next) => {
    Post.find()
    .select('_id hashtag_id user_id hashtag_name post_department post_title post_body post_image')
    .exec()
    .then(response => {
        res.status(200).json({
            status: "Success",
            data: response
        })
    })
    .catch(err => {
        res.status(500).json({
            status:"Failed",
            message: "cannot find all post",
            error: err
        })
    })
})

//get all post for a particular department
router.get('/department/:post_department', (req, res, next) => {
    Post.find({post_department: req.params.post_department})
    .select('_id hashtag_id user_id hashtag_name post_department post_title post_body post_image')
    .exec()
    .then(response => {
        res.status(200).json({
            status: "Success",
            data: response
        })
    })
    .catch(err => {
        res.status(500).json({
            status:"Failed",
            message: "cannot find all department post",
            error: err
        })
    })
})

//All post for a particular hashtag
router.get('/:user_id/hashtag/:hashtag_id', checkAuth, (req, res, next) => {
    if(req.params.user_id !== req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: "requested user is not the authenticated user"
        })
    } 
    Post.find({hashtag_id: req.params.hashtag_id})
    .select('_id hashtag_id user_id hashtag_name post_department post_title post_body post_likes post_comments post_image ')
    .exec()
    .then(response => {
        res.status(200).json({
            status: "Success",
            data: response
        })
    })
    .catch(err => {
        res.status(500).json({
            status:"Failed",
            message: "cannot find all hashtag post",
            error: err
        })
    })
})

//get single post
router.get('/:user_id/:post_id', checkAuth, (req, res, next) => {
    if(req.params.user_id !== req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: "requested user is not the authenticated user"
        })
    } 
    Post.findOne({_id: req.params.post_id})
    .select('_id hashtag_id user_id hashtag_name post_department post_title post_body post_likes post_comments post_image ')
    .exec()
    .then(response => {
        if(!response){
            return  res.status(200).json({
                status: "Failed",
                message: 'Post does not exist'
            })
        }
        res.status(200).json({
            status: "Success",
            data: response
        })
    })
    .catch(err => {
        res.status(500).json({
            status:"Failed",
            message: "cannot find Post",
            error: err
        })
    })
})

//testing the where and in mongoose object
router.post('/:user_id', checkAuth, (req, res, next) => {
    if(req.params.user_id !== req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: "requested user is not the authenticated user"
        })
    } 
    Post.find({hashtag_id: {$in: req.body.hashtag_list}})
    .exec()
    .then(response => {
        res.status(200).json({
            status: 'Success',
            data: response
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            status: 'Failed',
            error: err
        })
    })
})  


//create a new post
router.post('/:user_id/:hashtag_id', checkAuth, postImage, (req, res, next) => {
    if(req.params.user_id !== req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: "requested user is not the authenticated user"
        })
    } 

    Hashtag.findOne({_id: req.params.hashtag_id})
    .exec()
    .then(response => {
        if(!response){
            return res.status(401).json({
                status: "Failed",
                message: "Post hashtag does not exist"
            })
        }
        if(!req.file){
            var postImageData = {
                image_name: '',
                image_originalname: '',
                image_path: ''
            }
        }
        else {
            var postImageData = {
                image_name: req.file.filename,
                image_originalname: req.file.originalname,
                image_path: `http://localhost:3000/api/images/post-images/${req.file.filename}`
            }
        }

        const post = new Post({
            _id: new mongoose.Types.ObjectId(),
            hashtag_id: req.params.hashtag_id,
            user_id: req.headers.isAuthenticated.id,
            hashtag_name: req.body.hashtag_name,
            post_title: req.body.post_title,
            post_body: req.body.post_body,
            post_department: req.body.post_department,
            post_like: [],
            post_comment: [],
            post_image: postImageData
        })
        post.save()
        .then(response2 => {
            res.status(200).json({
                status: 'Success',
                result: response2
            })
        })
        .catch(err2 => {
            res.status(500).json({
                status: 'Failed',
                message: "Error in creating a post",
                error: err2
            })
        })
        
    })
    .catch(err => {
        console.log(err).json({
            status: "Failed",
            error: err
        })
    })
})

//update a post
router.put('/:user_id/:hashtag_id/:post_id', postImage, checkAuth, (req, res, next) => {
    if(req.params.user_id !== req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: "requested user is not the authenticated user"
        })
    } 
    if (!req.body.post_title && !req.body.post_body){
        return res.status(400).json({
            status: "Failed",
            message: "request parameter require post_title and post_body"
        })
    }
    if(!req.file){
        var postImageData = {
            image_name: '',
            image_originalname: '',
            image_path: ''
        }
    }
    else {
        var postImageData = {
            image_name: req.file.filename,
            image_originalname: req.file.originalname,
            image_path: `http://localhost:3000/api/images/post-images/${req.file.filename}`
        }
    }
    var postUpdate = {
        post_title: req.body.post_title,
        post_body: req.body.post_body,
        post_image: postImageData
    }
    Post.update({_id: req.params.post_id, user_id: req.headers.isAuthenticated.id}, {$set: postUpdate})
    .then(response => {
        res.status(202).json({
            status: "Success",
            data: response
        })
    })
    .catch( err => {
        res.status(500).json({
            status: 'Failed',
            error: err
        })
    })
})

//delete a post
router.delete('/:user_id/:hashtag_id/:post_id', checkAuth, (req, res, next) => {
    if(req.params.user_id != req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: 'requesting user is not  authenticated user'
        })
    }
    Post.findOneAndRemove({_id: req.params.post_id, user_id: req.headers.isAuthenticated.id})
    .then( response2 => {
        if(response2 == null){
            return res.status(401).json({
                status: "Failed",
                message: "Post does not exist"
            })
        }
        res.status(202).json({
            status: "Success",
            message: "Successfully deleted post"
        })
    })
    .catch(err1 => {
        console.log(err)
        res.status(500).json({
            status: "Failed",
            error: err
        })
    })
})

//comment on a post
router.put('/comment/:user_id/:hashtag_id/:post_id', checkAuth, (req, res, next) => {

    if(req.params.user_id != req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: 'requesting user is not  authenticated user'
        })
    }
    Post.findOne({_id: req.params.post_id})
    .exec()
    .then(response => {
        var oldPosts = response.post_comments
        var post = {
            comment_id: new mongoose.Types.ObjectId(),
            user_id: req.headers.isAuthenticated.id,
            user_name: req.headers.isAuthenticated.name,
            user_image: req.body.user_image,
            comment_body: req.body.comment_body
        }
        oldPosts.push(post)
        var newPosts = {post_comments: oldPosts}
        Post.update({_id: req.params.post_id}, {$set: newPosts})
        .then(response2 => {
            res.status(202).json({
                status: "Success",
                data: response2
            })
        })
    })
    .catch( err => {
        res.status(500).json({
            status: 'Failed',
            error: err
        })
    })
})

//delete a comment
router.put('/comment/:user_id/:hashtag_id/:post_id/:comment_id', checkAuth, (req, res, next) => {
    if(req.params.user_id != req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: 'requesting user is not  authenticated user'
        })
    }
    Post.findOne({_id: req.params.post_id})
    .exec()
    .then(response => {
        const oldPosts = response.post_comments
        var newPosts = oldPosts.filter(eachPost => {
            return ((eachPost.comment_id != req.params.comment_id))
        })
        var value = {post_comments: newPosts}
        Post.update({_id: req.params.post_id}, {$set: value})
        .then(response2 => {
            res.status(202).json({
                status: "Success",
                data: response2
            })
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            status: 'Failed',
            error: err
        })
    })
})

//like a post
router.put('/like/:user_id/:hashtag_id/:post_id', checkAuth, (req, res, next) => {
    if(req.params.user_id != req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: 'requesting user is not  authenticated user'
        })
    }
    Post.findOne({_id: req.params.post_id})
    .exec()
    .then(response => {
        var checkLikes = response.post_likes.filter(element => {
            return (element.user_id == req.headers.isAuthenticated.id)
        })
        if(checkLikes.length > 0){
            return res.status(401).json({
                status: "Failed",
                message: "You already like this post"
            })
        }
        var oldUsers = response.post_likes
        var user = {
            like_id: new mongoose.Types.ObjectId(),
            user_id: req.headers.isAuthenticated.id,
            user_name: req.headers.isAuthenticated.name,
            user_image: req.body.user_image
        }
        oldUsers.push(user)
        var newUsers = {post_likes: oldUsers}
        Post.update({_id: req.params.post_id}, {$set: newUsers})
        .then(response2 => {
            res.status(202).json({
                status: "Success",
                data: response2
            })
        })
    })
    .catch( err => {
        res.status(500).json({
            status: 'Failed',
            error: err
        })
    })
})


//remove a hashtag like
router.put('/like/:user_id/:hashtag_id/:post_id/:like_id', checkAuth, (req, res, next) => {
    if(req.params.user_id != req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: 'requesting user is not  authenticated user'
        })
    }
    Post.findOne({_id: req.params.post_id})
    .exec()
    .then(response => {
        const likes = response.post_likes
        var newLikes = likes.filter(eachLike => {
            return eachLike.like_id != req.params.like_id
        })
        var value = {post_likes: newLikes}
        Post.update({_id: req.params.post_id}, {$set: value})
        .then(response2 => {
            res.status(202).json({
                status: "Success",
                data: response2
            })
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            status: 'Failed',
            error: err
        })
    })
})


module.exports = router
