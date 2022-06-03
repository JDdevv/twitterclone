function checkIfTweetIsLiked( tweets , userId ) {
    return tweets.map( tweet => {
        let updatedTweet = tweet.toObject()
        console.log( tweet)
        if ( tweet.likes.includes(userId) ) updatedTweet.like = true
        else updatedTweet.like = false
        return updatedTweet
    })

}



module.exports = checkIfTweetIsLiked