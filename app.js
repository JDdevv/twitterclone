require("dotenv").config()
//APP CONFIG
const express = require("express")
const app = express()
const cors = require("cors")
const port = 5000
const validateRequest = require("./validateRequest.js")
const checkIfTweetIsLiked = require("./checkIfTweetIsLiked")
const jwt = require("jsonwebtoken")
app.use(express.json())
app.use(cors({
    allowedHeaders:["Content-Type","authorization"],
    origin: "*",
    methods:["PATCH","POST"],
}))

//MONGOOSE CONFIG

const Tweet = require("./Tweet.js")
const { restart } = require("nodemon")
const { send } = require("express/lib/response")
const { JsonWebTokenError } = require("jsonwebtoken")
const isUserLogged = require("./isUserLogged.js")
const User = require("./User.js")
const { default: mongoose } = require("mongoose")




//-------------------------- CREATE -------------------------------

app.get("/test" , ( req ,res ) => {
	res.json({data:"hello"})
})
// POST A TWEET
app.post("/tweet", validateRequest , ( req , res ) => {
	const { content } = req.body
	if ( !content ) return res.sendStatus(400)
	console.log(content)
	const newTweet = new Tweet( {
		content : content,
		authorUsername : req.user.username,
		authorId : req.user._id
	})
	newTweet.save( err => {
		console.log(err)
		if ( err ) return res.sendStatus(500)
		return res.sendStatus(201)
	})
})


//REPLIE A TWEET
app.post("/replies/:tweetId", validateRequest , ( req , res ) => {
	const { tweetId } = req.params
	//Replies are stored as another tweet, but with the replie field set to true
	//And the id of the replied tweet is stored in the replieFrom field so its easy to find the replies of that tweet
	//This way the only data about the replie stored in the original tweet is the id,
	// so we can now how many replies the tweet has by checking the lenth of the replies array
	Tweet.findOne({_id: tweetId } , ( err , tweet ) => {
		if ( err ) return res.sendStatus( 500 ) 
		if ( !tweet ) return res.sendStatus(404)
		const newTweet = new Tweet({
			authorId : req.user._id,
			authorUsername : req.user.username,
			content : req.body.content,
			replie: true ,
			//The id of the replied tweet
			replieFrom : tweetId
		})
		//Saving the replie tweet
		newTweet.save( err => {
			if ( err ) return res.sendStatus( 500 ) 
			else {
				tweet.stats.replies.push(newTweet._id)
				//Saving the original tweet
				tweet.save( err => {
					if ( err ) return res.send(err)
					return res.sendStatus(201)
				})
			}
		})
	})
})



// ---------------------- READ ---------------------------

// GET SPECIFIC TWEET
app.get("/tweets/:tweetId", isUserLogged, ( req , res ) => {	
	const { tweetId } = req.params
	Tweet.findOne( {_id:tweetId} , ( err , tweet ) => {
		if ( err ) return res.sendStatus(err)
		if ( !tweet ) return res.sendStatus(404)
		res.json(checkIfTweetIsLiked([tweet],req.user)[0])
	})
})




//GET TWEETS FROM SPECIFIC USER
app.get("/tweets/user/:userId", isUserLogged , ( req , res ) => {
	const {userId} = req.params
	if ( !userId ) return res.sendStatus(400)
	Tweet.find({authorId:req.params.userId}, ( err , tweets ) => {
		if ( err ) return res.sendStatus(505)
		return res.json(checkIfTweetIsLiked(tweets,req.user))
	})
})
//GET REPLIES
app.get("/replies/:tweetId", isUserLogged , ( req , res ) => {
	const {tweetId} = req.params
	Tweet.find({replieFrom: tweetId , replie:true} , ( err , replies ) => {
		if ( err ) return res.sendStatus( 500 )
		return res.json(checkIfTweetIsLiked(replies,req.user))
	})
})
//Get the feed
app.get("/feed",validateRequest , (req, res ) => {
	const userId = mongoose.Types.ObjectId(req.user._id)
	console.log(userId)
	User.findOne( {}, (err ,user)=> {
		console.log(err,user)
		res.sendStatus(200)
	})
 })
app.get("/stats/:tweetId" , ( req , res ) => {
	const { tweetId } = req.params
	Tweet.findOne({_id:tweetId} , ( err , tweet ) => {
		if ( err ) return res.sendStatus(500)
		if ( !tweet ) return res.sendStatus(404)
		return res.send(tweet.stats)
	})
})


// ---------------- UPDATE AND DELETE -----------------
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
	//Likes of a tweet are counted inserting the id of the user that liked it into the tweet likes array
	//This way the amount of likes is measured by length of the tweet likes array
	//And there is no need to store data about the likes in the users database
	const { tweetId } = req.params
	if ( !tweetId ) res.sendStatus(400)
	Tweet.findOne({_id:tweetId} , ( err , tweet ) => {
		if ( !tweet ) return res.sendStatus(404)
		if ( err ) return res.sendStatus( 500 ) 
		//If the tweet is liked by the requesting user, remove that user id from the likes of the tweet
		if ( tweet.stats.likes.includes( req.user._id ) ) {
			tweet.stats.likes.splice( tweet.stats.likes.indexOf(req.user.id),1)
			tweet.save( err => {
				if (err) return res.sendStatus(500)
				return res.sendStatus(200)
			})
		} 
		//If the tweet is not liked by the requesting user put that user id in likes array
		else {
			tweet.stats.likes.push(req.user._id)
			tweet.save( err  => {
				if ( err ) return res.sendStatus(500)
				return res.sendStatus(200)
			})
		}
	})
})

// Retweet a tweet
app.patch("/reTweets/:tweetId", validateRequest , ( req , res ) => {
	//Retweets are stored and counted the same way as the likes
	const {tweetId} = req.params
	const { user } = req
	Tweet.findOne({_id:tweetId} , ( err , tweet ) => {
		if ( err ) return res.sendStatus(500)
		if ( !tweet ) return res.sendStatus(500)
		//If the tweet is already retweeted by the requesting user, delete its user id from the retweets array
		if ( tweet.stats.reTweets.includes(user._id) ) {
			tweet.stats.reTweets.splice( tweet.stats.reTweets.indexOf(user._id))
			tweet.save( err => {
				if ( err ) return res.sendStatus(500)
				return res.sendStatus(200)
			})
		} 
		//If the tweet is not retweeted by the requesting user, insert its username in the retweets array
		else {
			tweet.stats.reTweets.push( user._id)
			tweet.save( err => {
				if ( err ) return res.sendStatus(500)
				return res.sendStatus(200)
			})
		}
	})
})

	
app.listen( port , () => console.log( "Server running on port: " + port.toString()))
	
