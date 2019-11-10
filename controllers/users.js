const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
    if (request.body.password === undefined || request.body.password.length < 3) {
        return response.status(400).json({ error: 'password is required and must have at least 3 characters' })
    }
    try {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(request.body.password, saltRounds)

        const user = new User({
            name: request.body.name,
            username: request.body.username,
            password: passwordHash
        })

        const savedUser = await user.save()
        response.status(201).json(savedUser)
    } catch (exception) {
        next(exception)
    }
})

usersRouter.put('/:id', async (request, response, next) => {
    const user = {
        name: request.body.name,
        username: request.body.username,
        password: request.body.password
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(request.params.id, user, { new: true })
        response.json(updatedUser.toJSON())
    } catch(exception) {
        next(exception)
    }
})

usersRouter.delete('/:id', async (request, response, next) => {
    const id = request.params.id
    try {
        await User.findByIdAndRemove(id)
        response.status(204).end()
    } catch (exception) {
        next(exception)
    }
})

module.exports = usersRouter