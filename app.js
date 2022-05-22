require("dotenv").config()
//APP CONFIG
const express = require("express")
const app = express()
const cors = require("cors")
const port = 5000
const validateRequest = require("./validateRequest.js")
app.use(express.json())
app.use(cors({
	allowedHeaders : ["Content-Type","Authorization"],
	origin : "*"
}))	


//MONGOOSE CONFIG

const Tweet = require("./Tweet.js")
const { restart } = require("nodemon")





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
	console.log(tweetId)
	if (!tweetId.match(/^[0-9a-fA-F]{24}$/)) return res.sendStatus(404)
	Tweet.findOne( {_id:tweetId} , ( err , tweet ) => {
		if ( err ) return res.sendStatus(err)
		if ( !tweet ) return res.sendStatus(404)
		res.json({tweet:tweet})
	})
})




//GET TWEETS FROM SPECIFIC USER
app.get("/tweets/user/:userId" , ( req , res ) => {
	const {userId} = req.params
	if ( !userId ) return res.sendStatus(400)
	Tweet.find({authorId:req.params.userId} , ( err , tweets ) => {
		if ( err )return res.sendStatus(500)
		return res.json({tweets:tweets})
	})
})
// DELETE TWEETS
app.delete("/tweets/delete/:tweetId", validateRequest , ( req , res ) => {
	const {tweetId} = req.params
	if ( !tweetId ) return res.sendStatus(400)
	Tweet.findOneAndDelete({_id:tweetId,authorId:req.user._id}, ( err , tweet ) => {
		if ( !tweet ) return res.sendStatus( 404 ) 
		if ( err ) return res.sendStatus( 500 )
		if ( tweet.replie ) {
			Tweet.findOne({_id : tweet.replieFrom} , ( err , tweet )=> {
				if ( err ) return res.send(err)
				tweet.replies.splice( tweet.replies.indexOf( tweetId ) , 1)
				tweet.save()
				console.log(21)
				res.sendStatus(200)
			})
		} else {
			res.send(200)
		}
	})
})		
// LIKE TWEETS
app.patch("/tweets/likes/:tweetId", validateRequest , ( req , res ) => {
	const { tweetId } = req.params
	if ( !tweetId ) res.sendStatus(400)
	Tweet.findOne({_id:tweetId} , ( err , tweet ) => {
		if ( !tweet ) return res.sendStatus(404)
		if ( err ) return res.sendStatus( 500 ) 
		if ( tweet.likes.includes( req.user._id ) ) {
			tweet.likes.splice( tweet.likes.indexOf(req.user.id),1)
			tweet.save( err => {
				if (err) return res.sendStatus(500)
				return res.sendStatus(200)
			})
		} else {
			tweet.likes.push(req.user._id)
			tweet.save( err  => {
				if ( err ) return res.sendStatus(500)
				return res.sendStatus(200)
			})
		}
	})
})
//GET REPLIES
app.get("/replies/:tweetId" , ( req , res ) => {
	const {tweetId} = req.params
	Tweet.find({replieFrom: tweetId , replie:true} , ( err , replies ) => {
		console.log(replies,tweetId)
		if ( err ) return res.sendStatus( 500 )
		return res.json({replies:replies})
	})
})
//REPLIE A TWEET
app.post("/replies/:tweetId", validateRequest , ( req , res ) => {
	const { tweetId } = req.params
	console.log(req.body)

	Tweet.findOne({_id: tweetId } , ( err , tweet ) => {
		if ( err ) return res.sendStatus( 500 ) 
		if ( !tweet ) return res.sendStatus(404)
		const newTweet = new Tweet({
			authorId : req.user._id,
			authorUsername : req.user.username,
			content : req.body.content,
			replie: true ,
			replieFrom : tweetId
		})
		newTweet.save( err => {
			if ( err ) return res.sendStatus( 500 ) 
			else {
				tweet.replies.push(newTweet._id)
				tweet.save( err => {
					if ( err ) return res.send(err)
					return res.sendStatus(201)
				})
			}
		})
	})
})
	
app.listen( port , () => console.log( "Server running on port: " + port.toString()))
	
