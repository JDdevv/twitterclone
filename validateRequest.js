const jwt = require("jsonwebtoken")
function validateRequest( req , res , next ) {
	console.log(req.headers)
	const token = req.headers.authorization

	console.log(token)
	if ( !token ) return res.sendStatus(401)
	jwt.verify( token , process.env.JWT_SECRET, ( err , decoded ) => {
		if ( err ) return res.sendStatus(403)
		if ( decoded ) {
			req.user = decoded
			next()
		}
	})
}
module.exports = validateRequest
