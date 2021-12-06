const jwt = require('jsonwebtoken')

const verify = (req, res, next) =>{
    jwt.verify(
        req.headers.authorization,
        process.env.TOKEN_SECRET,
        (err, payload)=>{
            if (err) {
                return res.status(401).send(err)
            }
            req.user = payload
            // console.log("payload is"+payload)
            next()
    } )
}



module.exports = {
    verify
}