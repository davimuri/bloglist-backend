const dbHandler = require('./db_handler')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const blogsTestData = require('./blogs_for_test')
const blogsHelper = require('./blogs_helper')

const api = supertest(app)

beforeAll(async () => await dbHandler.connect())

beforeEach(async () => {
    const blogs = blogsTestData.initialBlogs
        .map(b => new Blog(b))
    const promiseArray = blogs.map(b => b.save())
    await Promise.all(promiseArray)
})

afterEach(async () => await dbHandler.clean())

afterAll(async () => await dbHandler.close())

test('update likes of an existent blog', async () => {
    const blogsAtStart = await blogsHelper.blogsInDb()
    const likesAtStart = blogsAtStart[0].likes
    blogsAtStart[0].likes = likesAtStart + 1

    const result = await api
        .put(`/api/blogs/${blogsAtStart[0].id}`)
        .send(blogsAtStart[0])
        .expect(200)

    expect(result.body.id).toBe(blogsAtStart[0].id)
    expect(result.body.likes).toBe(likesAtStart + 1)
    expect(result.body.author).toBe(blogsAtStart[0].author)

    const blogAtEnd = await blogsHelper.findBlogById(blogsAtStart[0].id)
    expect(blogAtEnd.likes).toBe(blogsAtStart[0].likes)
    expect(blogAtEnd.author).toBe(blogsAtStart[0].author)
})