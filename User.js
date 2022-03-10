const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/twitter")

const userSchema = {
    username : String,
    password : String,
    description : String
}
const User = mongoose.model("User" , userSchema)

module.exports = User