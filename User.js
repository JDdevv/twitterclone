const mongoose = require("mongoose")
const userConn = mongoose.createConnection(process.env.USER_DATA_BASE_URL)

const userSchema = {
    username : String,
    password : String,
    description : String,
    followers : [String],
    following : [String]
}
const User = userConn.model("User" , userSchema)

module.exports = User