require("dotenv").config()
//APP CONFIG
const express = require("express")
const app = express()
const cors = require("cors")
const port = 5000
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const validateRequest = require("./validateRequest.js")
app.use(express.json())
app.use(cors({
	allowedHeaders : ["Content-Type","authroization"],
	origin : "*"
}))	

//MONGOOSE CONFIG
const mongoose = require("mongoose")
const url = "mongodb://localhost:27017/twitter"
mongoose.connect(url)
const User = require("./User.js")
const Tweet = require("./Tweet.js")


//ROUTING
app.get("/" , ( req , res ) => {
	res.send("Hello World")
})
//CREATE AND READ TWEETS
app.get("/tweets", ( req , res ) => {
	Tweet.find({}, ( tweets , err ) => {
		if ( err ) res.send("Sorry no tweets")
		else res.send(tweets)
	})
})
app.post("/tweet", validateRequest , ( req , res ) => {
	const { content } = req.body
	if ( !content ) return res.send("missing data")
	const newTweet = new Tweet( {
		content : content,
		authorUsername : req.token.username,
		authorId : req.token._id
	})
	newTweet.save( err => {
		if ( err ) return res.send(err)
		return res.sendStatus(200)
	})
})
//GET TWEETS FROM SPECIFIC USER
app.get("/tweets/:userId" , ( req , res ) => {
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
	
