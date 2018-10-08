const express = require('express')
const mongoose = require('mongoose')

const UserProfile = require('../../model/user/profile')
const Hashtag = require('../../model/user/hashtags')
const checkAuth = require('../../middleware/createAuth')

const router = express.Router()

//getting all hashtags
router.get('/', (req, res, next) => {
    Hashtag.find({})
    .select('_id user_id hashtag_name hashtag_department hashtag_description')
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

//getting all created hashtag
router.get('/created/', checkAuth, (req, res, next) => {
    Hashtag.find({user_id: req.headers.isAuthenticated.id})
    .select('_id user_id hashtag_name hashtag_department hashtag_description hashtag_likes hashtag_followers hashtag_comments')
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

//getting a single hashtag
router.get('/:hashtag_id', checkAuth, (req, res, next) => {
    Hashtag.find({_id: req.params.hashtag_id})
    .select('_id user_id hashtag_name hashtag_department hashtag_description hashtag_likes hashtag_followers hashtag_comments')
    .exec()
    .then(response => {
        if(response.length < 1){
            return res.status(400).json({
                status: "Failed",
                message: "Hashtag does not exist"
            })
        }
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

//creating a new hashtag
router.post('/', checkAuth, (req, res, next) => {
    UserProfile.findOne({user_id: req.headers.isAuthenticated.id})
    .exec()
    .then(response => {
        if(response){
            Hashtag.find({hashtag_department: req.body.hashtag_department, hashtag_name: req.body.hashtag_name})
            .exec()
            .then(response1 => {
                if(response1.length > 0){
                    return res.status(400).json({
                        status: 'Failed',
                        message: 'Hashtag already exist in this department'
                    })
                }
                const hashtag = new Hashtag({
                    _id: new mongoose.Types.ObjectId(),
                    user_id: req.headers.isAuthenticated.id,
                    hashtag_department: req.body.hashtag_department,
                    hashtag_name: req.body.hashtag_name,
                    hashtag_description: req.body.hashtag_description,
                    hashtag_followers: [],
                    hashtag_likes: [],
                    hashtag_comments: []
                })           
                hashtag.save()
                .then( response2 => {
                    const newHashtag = {
                        hashtag_id: response2._id,
                        hashtag_name: response2.hashtag_name,
                        hashtag_department: response2.hashtag_department
                    }
                    const createdHashtag = response.created_hashtags;
                    createdHashtag.push(newHashtag)
                    const allHashtag = response.all_hashtags;
                    allHashtag.push(newHashtag)
                    UserProfile.update({user_id: req.headers.isAuthenticated.id},{$set: {created_hashtags: createdHashtag, all_hashtags: allHashtag}})
                    .then(response3 => {
                        res.status(201).json({
                            response2: response2,
                        })
                    })
                })
            })
        }
        else {
            res.status(500).json({
                status: "Failed",
                message: "Unauthorized access require Authentication"
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            status: 'Failed',
            error: err
        })
    })
})

//following an already existing hashtag
router.put('/:hashtag_id', checkAuth, (req, res, next) => {
    UserProfile.findOne({user_id: req.headers.isAuthenticated.id})
    .exec()
    .then( response => {
        if(response){
            Hashtag.findOne({_id: req.params.hashtag_id})
            .exec()
            .then(response1 => {
                var filterResponse = response1.hashtag_followers.filter(element => {
                    return (element.user_id == req.headers.isAuthenticated.id)
                });
                if(filterResponse.length > 0){
                    return res.status(401).json({
                        status: "Failed",
                        message: "Already following Hashtag"
                    })
                }
                var oldFollowers = response1.hashtag_followers
                var follower = {
                    follow_id: new mongoose.Types.ObjectId(),
                    user_id: req.headers.isAuthenticated.id,
                    follower_name: req.body.name,
                    follower_image: req.body.user_image
                }
                oldFollowers.push(follower)
                var newFollowers = {hashtag_followers: oldFollowers}
                Hashtag.update({_id: req.params.hashtag_id, user_id: req.headers.isAuthenticated.id}, {$set: newFollowers})
                .then(response2 => {
                    const newHashtag = {
                        hashtag_id: req.params.hashtag_id,
                        hashtag_name: req.body.hashtag_name,
                        hashtag_department: req.body.hashtag_department
                    }
                    const followingHashtag = response.following_hashtags;
                    followingHashtag.push(newHashtag)
                    const allHashtag = response.all_hashtags;
                    allHashtag.push(newHashtag)
                    UserProfile.update({user_id: req.headers.isAuthenticated.id},{$set: {following_hashtags: followingHashtag, all_hashtags: allHashtag}})
                    .then( response3 => {
                        res.status(202).json({
                            status: "Success",
                            data: response2
                        })
                    })
                })
            })
            .catch(err1 => {
                console.log(err1)
                res.status(500).json({
                    status: "Failed",
                    message: "Hashtag does not exist"
                })
            })
        }
        else{
            res.status(500).json({
                status: "Failed",
                message: "Unauthorized access require authentication"
            })
        }
    })
    .catch( err => {
        res.status(500).json({
            status: 'Failed',
            error: err
        })
    })
})

//unfollow a hashtag
router.put('/:user_id/:hashtag_id/:follow_id/unfollow', checkAuth, (req, res, next) => {
    if(req.params.user_id != req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: 'requesting user is not  authenticated user'
        })
    }
    UserProfile.findOne({user_id: req.headers.isAuthenticated.id})
    .exec()
    .then( response => {
        Hashtag.findOne({_id: req.params.hashtag_id})
        .exec()
        .then(response1 => {
            const followers = response1.hashtag_followers
            var newFollowers = followers.filter(eachFollow => {
                return eachFollow.follow_id != req.params.follow_id
            })
            var value = {hashtag_followers: newFollowers}
            Hashtag.update({_id: req.params.hashtag_id}, {$set: value})
            .then(response2 => {
                var userFollowing = response.following_hashtags.filter(eachFollow => {
                    return eachFollow.hashtag_id != req.params.hashtag_id
                })
                var allUserHashtag = response.all_hashtags.filter(eachFollow => {
                    return eachFollow.hashtag_id != req.params.hashtag_id
                })
                UserProfile.update({user_id: req.headers.isAuthenticated.id},{$set: {following_hashtags: userFollowing, all_hashtags: allUserHashtag}})
                .then(response3 => {
                    res.status(202).json({
                        status: "Success",
                        data: response2
                    })
                })
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

//commenting on an already existing hashtag
router.put('/:hashtag_id/comment', checkAuth, (req, res, next) => {
    Hashtag.findOne({_id: req.params.hashtag_id})
    .exec()
    .then(response => {
        var oldUsers = response.hashtag_comments
        var user = {
            comment_id: new mongoose.Types.ObjectId(),
            user_id: req.headers.isAuthenticated.id,
            user_name: req.body.name,
            comment_body: req.body.comment_body,
            user_image: req.body.user_image
        }
        oldUsers.push(user)
        var newUsers = {hashtag_comments: oldUsers}
        Hashtag.update({_id: req.params.hashtag_id}, {$set: newUsers})
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
router.put('/:hashtag_id/:comment_id/delete-comment', checkAuth, (req, res, next) => {
    Hashtag.findOne({_id: req.params.hashtag_id})
    .exec()
    .then(response => {
        const comments = response.hashtag_comments
        var newComments = comments.filter(eachComment => {
            return ((eachComment.comment_id != req.params.comment_id))
        })
        var value = {hashtag_comments: newComments}
        Hashtag.update({_id: req.params.hashtag_id}, {$set: value})
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

//like an already existing hashtag
router.put('/:hashtag_id/like', checkAuth, (req, res, next) => {
    Hashtag.findOne({_id: req.params.hashtag_id})
    .exec()
    .then(response => {
        var checkLikes = response.hashtag_likes.filter(element => {
            return (element.user_id == req.headers.isAuthenticated.id)
        })
        if(checkLikes.length > 0){
            return res.status(401).json({
                status: "Failed",
                message: "You already like this hashtag"
            })
        }
        var oldUsers = response.hashtag_likes
        var user = {
            like_id: new mongoose.Types.ObjectId(),
            user_id: req.headers.isAuthenticated.id,
            user_name: req.body.name,
            user_image: req.body.user_image
        }
        oldUsers.push(user)
        var newUsers = {hashtag_likes: oldUsers}
        Hashtag.update({_id: req.params.hashtag_id}, {$set: newUsers})
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

//testing the where and in mongoose object
router.get('/testing/testing/testing/testing', (req, res, next) => {
    Hashtag.find({hashtag_department: {$in: ['Mechanical Engineering', 'physics']}})
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



//remove a hashtag like
router.put('/:hashtag_id/:like_id/unlike', checkAuth, (req, res, next) => {
    Hashtag.findOne({_id: req.params.hashtag_id})
    .exec()
    .then(response => {
        console.log(response.hashtag_likes)
        const likes = response.hashtag_likes
        var newLikes = likes.filter(eachLike => {
            return eachLike.like_id != req.params.like_id
        })
        var value = {hashtag_likes: newLikes}
        Hashtag.update({_id: req.params.hashtag_id}, {$set: value})
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


router.delete('/:user_id/:hashtag_id', checkAuth, (req, res, next) => {
    if(req.params.user_id != req.headers.isAuthenticated.id){
        return res.status(401).json({
            status: "Failed",
            message: 'requesting user is not  authenticated user'
        })
    }
    UserProfile.findOne({user_id: req.headers.isAuthenticated.id})
    .exec()
    .then( response => {
        Hashtag.findOneAndRemove({_id: req.params.hashtag_id, user_id: req.headers.isAuthenticated.id})
        .then( response2 => {
            if(response2 == null){
                return res.status(401).json({
                    status: "Failed",
                    message: "Hashtag does not exist"
                })
            }
            var userCreated = response.created_hashtags.filter(eachFollow => {
                return eachFollow.hashtag_id != req.params.hashtag_id
            })
            var allUserHashtag = response.all_hashtags.filter(eachFollow => {
                return eachFollow.hashtag_id != req.params.hashtag_id
            })
            UserProfile.update({user_id: req.headers.isAuthenticated.id},{$set: {created_hashtags: userCreated, all_hashtags: allUserHashtag}})
            .then(response3 => {
                res.status(202).json({
                    status: 'Success',
                    message: `successfully deleted ${response2.hashtag_name} hashtag`
                })
            })
        })
        .catch(err1 => {
            console.log(err1)
            res.status(401).json({
                status: "Failed",
                message: "Hashtag does not exist"
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