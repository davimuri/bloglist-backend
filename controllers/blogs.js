const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { name: 1, username: 1 })
    response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
    const user = await findUserByToken(request.token)
    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    try {

        const blog = new Blog({
            title: request.body.title,
            author: request.body.author,
            url: request.body.url,
            likes: request.body.likes || 0,
            user: user._id
        })

        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        const blogToReturn = {
            ...savedBlog.toJSON(),
            user: {
                id: user._id,
                username: user.username,
                name: user.name
            }
        }

        response.status(201).json(blogToReturn)
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
        response.json(updatedBlog.toJSON())
    } catch(exception) {
        next(exception)
    }
})

blogsRouter.patch('/:id/likes', async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id)
            .populate('user', { name: 1, username: 1 })
        blog.likes = blog.likes + 1
        blog.save()
        response.json(blog.toJSON())
    } catch(exception) {
        next(exception)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    const user = await findUserByToken(request.token)

    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const blogId = request.params.id
    try {
        const blog = await Blog.findById(blogId)
        const userIdStr = user._id.toString()
        if (blog.user.toString() === userIdStr) {
            await Blog.findByIdAndRemove(blogId)
            const index = user.blogs.findIndex(e => e.toString() === blogId)
            if (index >= 0) {
                user.blogs = user.blogs.slice(0, index)
                    .concat(user.blogs.slice(index+1, user.blogs.length))
                await user.save()
            }
            response.status(204).end()
        } else {
            return response.status(403).json({ error: 'user not authorized to delete blog' })
        }
    } catch (exception) {
        next(exception)
    }
})

const findUserByToken = async token => {
    try {
        const decodedToken = jwt.verify(token, config.SECRET)
        if (!token || !decodedToken.id) {
            return null
        }

        const user = await User.findById(decodedToken.id)
        return user

    } catch(exception) {
        console.error(exception)
        return null
    }
}

module.exports = blogsRouter