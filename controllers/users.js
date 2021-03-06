const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const config = require('../utils/config')
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, likes: 1 })
    response.json(users)
})

usersRouter.get('/:id', async (request, response, next) => {
    try {
        const user = await User.findById(request.params.id)
            .populate('blogs', { title: 1, likes: 1 })
        response.json(user)
    } catch (exception) {
        next(exception)
    }
})

usersRouter.post('/', async (request, response, next) => {
    if (request.body.password === undefined || request.body.password.length < 3) {
        return response.status(400).json({ error: 'password is required and must have at least 3 characters' })
    }
    try {
        const passwordHash = await bcrypt.hash(request.body.password, config.BCRYPT_SALT_ROUNDS)

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