const mongoose = require("mongoose")
mongoose.connect(process.env.DATA_BASE_URL)


const tweetSchema = {
		content : String,
		authorUsername : String,
		authorId : String,
		replie : { 
			type : Boolean,
			default : false
		},
		date : {
			type : Date,
			default : Date.now()
		},
		replieFrom : String,
		stats :{
			likes: [String],
			replies : [String],
			reTweets : [String]
		}
}
const Tweet = mongoose.model("Tweet" , tweetSchema)
module.exports = Tweet
