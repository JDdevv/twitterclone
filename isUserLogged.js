

const jwt = require('jsonwebtoken')

function isUserLogged( req, res, next) {
	const token = req.headers.authorization
	if (!token) {
		req.user = false
		return next()
	}
	jwt.verify(token , process.env.JWT_SECRET, ( err , decoded ) => {
		if ( err ) req.user= false
		if ( decoded ) req.user = decoded._id
		next()
	})

}
module.exports = isUserLogged
