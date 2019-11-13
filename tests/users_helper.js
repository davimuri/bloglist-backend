const User = require('../models/user')

const usersInDbAsJSON = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users
}

const findUserById = async (id) => {
    const user = await User.findById(id)
    return user.toJSON()
}

module.exports = {
    usersInDb, usersInDbAsJSON, findUserById
}