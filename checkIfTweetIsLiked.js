function checkIfTweetIsLiked( tweets , userId ) {
    //Module to check if the requested tweets were liked by the requesting user, so the frontend can display the correct information.
    return tweets.map( tweet => {
        let updatedTweet = tweet.toObject()
        if ( tweet.stats.likes.includes(userId) ) updatedTweet.like = true
        else updatedTweet.like = false
        return updatedTweet
    })

}



module.exports = checkIfTweetIsLiked