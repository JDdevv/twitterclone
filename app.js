require("dotenv").config()
//APP CONFIG
const express = require("express")
const app = express()
const cors = require("cors")
const port = 5000
const validateRequest = require("./validateRequest.js")
app.use(express.json())
app.use(cors({
	allowedHeaders : ["Content-Type","authroization"],
	origin : "*"
}))	

//MONGOOSE CONFIG
const Tweet = require("./Tweet.js")


//ROUTING
app.get("/" , ( req , res ) => {
	res.send("Hello World")
})


app.get("/tweets", ( req , res ) => {
	Tweet.find({}, ( tweets , err ) => {
		if ( err ) res.send("Sorry no tweets")
		else res.send(tweets)
	})
})


//CREATE TWEET
app.post("/tweet", validateRequest , ( req , res ) => {
	console.log(req.body)
	const { content } = req.body
	if ( !content ) return res.sendStatus(400)
	const newTweet = new Tweet( {
		content : content,
		authorUsername : req.user.username,
		authorId : req.user._id
	})
	newTweet.save( err => {
		if ( err ) return res.sendStatus(500)
		return res.sendStatus(201)
	})
})
// READ TWEETS

// GET SPECIFIC TWEET
app.get("/tweets/:tweetId", ( req , res ) => {
	const { tweetId } = req.params
	Tweet.findOne( {_id:tweetId} , ( err , tweet ) => {
		if ( err ) return res.send(500)
		if ( !tweet ) return res.send(404)
		res.json({tweet:tweet})
	})
})
//GET TWEETS FROM SPECIFIC USER
app.get("/tweets/user/:userId" , ( req , res ) => {
	Tweet.find({authorId:req.params.userId} , ( err , tweets ) => {
		if ( err )return res.send(err)
		return res.send(tweets)
	})
})
		
//Get info from user
app.get("/users/:userId" , ( req , res ) => {
	User.findOne({id:req.params.userId} , ( err , user ) => {
		if( err ) return res.send(err)
		return res.json({
			username:user.username,
			description:user.description
		})
	})
})



app.listen( port , () => console.log( "Server running on port: " + port.toString()))
	
