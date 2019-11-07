const dbHandler = require('./db_handler')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const blogsTestData = require('./blogs_for_test')

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

test('blogs are returned as json', async () => {
    const result = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(result.body.length).toEqual(blogsTestData.initialBlogs.length)
})

test('blogs are returned with right id property', async () => {
    const result = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogs = result.body
    blogs.forEach(b => {
        expect(b.id).toBeDefined()
        expect(b._id).toBeUndefined()
    })
})
