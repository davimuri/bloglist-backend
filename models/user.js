const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        minlength: 3,
        required: true,
        unique: true
    },
    password:  {
        type: String,
        required: true
    }
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.password
    }
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)