const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/twitterTweetsDB")
const docSchema = {
    count : [ String ]
}
const Doc = mongoose.model("Doc" , docSchema)
module.exports = Doc