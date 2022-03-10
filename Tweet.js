const mongoose = require("mongoose")

const tweetSchema = {
		content : String,
		authorUsername : String,
		authorId : String
}
const Tweet = mongoose.model("Tweet" , tweetSchema)
module.exports = Tweet
