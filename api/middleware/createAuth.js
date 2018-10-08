const jwt = require('jsonwebtoken')

module.exports = function(req, res, next){
    if(!(req.headers.authorization)){
        return res.status(400).json({
            status: "failed",
            message: "header is required for this request"
        })
    }
    const token = req.headers.authorization.split(" ")[1]
    
    try {
        const decode = jwt.verify(token, "secret")
        req.headers.isAuthenticated = decode;
        next()
    } catch (error) {
        res.status(401).json({
            message: "Auth failed",
            error: error
        })
    }
}