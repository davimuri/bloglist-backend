const jwt = require('jsonwebtoken')
const config = require('./config')

const getToken = (userId, username) => {
    const userForToken = {
        username: username,
        id: userId,
    }

    const token = jwt.sign(userForToken, config.SECRET)

    return token
}

module.exports = {
    getToken
}