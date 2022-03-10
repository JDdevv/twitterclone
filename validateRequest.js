const jwt = require("jsonwebtoken")
function validateRequest( req , res , next ) {
	const token = req.headers.authorization
	if ( !token ) return res.send("no token")
	jwt.verify( token , process.env.SECRET, ( err , decoded ) => {
		if ( err ) return res.sendStatus(403)
		if ( decoded ) {
			req.token = decoded
			next()
		}
	})
}
module.exports = validateRequest
