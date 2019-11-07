require('dotenv').config()

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI

if (process.env.NODE_ENV === 'test') {
    // setup variables for test environment
}

module.exports = {
    MONGODB_URI,
    PORT
}
