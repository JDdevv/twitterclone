const mongoose = require("mongoose")
mongoose.connect(process.env.DATA_BASE_URL)


const tweetSchema = {
		content : String,
		authorUsername : String,
		authorId : String,
		likes: [String]
}
const Tweet = mongoose.model("Tweet" , tweetSchema)
module.exports = Tweet
