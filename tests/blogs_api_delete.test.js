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

test('delete an existent blog', async () => {
    const blogsAtStart = await blogsHelper.blogsInDb()
    await api
        .delete(`/api/blogs/${blogsAtStart[0].id}`)
        .expect(204)

    const blogsAtEnd = await blogsHelper.blogsInDb()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1)

    const blogUrls = blogsAtEnd.map(b => b.url)
    expect(blogUrls).not.toContain(blogsAtStart[0].url)
})