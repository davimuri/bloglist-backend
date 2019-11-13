const bcrypt = require('bcrypt')
const config = require('../utils/config')

const initialUsers = [
    {
        name: 'Root',
        username: 'root',
        password: 'root123',
        blogs: []
    }
]

const hashPasswords = async () => {
    const promises = initialUsers.map(u => bcrypt.hash(u.password, config.BCRYPT_SALT_ROUNDS))
    await Promise.all(promises)
}

const hashedPasswords = hashPasswords()

module.exports = {
    initialUsers,
    hashedPasswords
}