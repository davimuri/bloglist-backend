const Blog = require('../models/blog')

const nonExistingId = async () => {
    const blog = new Blog(    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
    })
    await blog.save()
    await blog.remove()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(b => b.toJSON())
}

const findBlogById = async (id) => {
    const blog = await Blog.findById(id)
    return blog.toJSON()
}

module.exports = {
    nonExistingId, blogsInDb, findBlogById
}