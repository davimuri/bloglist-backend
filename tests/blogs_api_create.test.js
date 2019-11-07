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

test('a valid blog can be added ', async () => {
    const result = await api
        .post('/api/blogs')
        .send(blogsTestData.validBlogToCreate)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const createdBlog = result.body
    expect(createdBlog.id).not.toBeNull()
    const actualBlog = { ...createdBlog }
    delete actualBlog.id
    expect(actualBlog).toEqual(blogsTestData.validBlogToCreate)

    const blogsInDb = await blogsHelper.blogsInDb()
    expect(blogsInDb.length).toBe(blogsTestData.initialBlogs.length + 1)
    const blogUrls = blogsInDb.map(b => b.url)
    expect(blogUrls).toContain(blogsTestData.validBlogToCreate.url)
})

test('blog without likes defaults to zero', async () => {
    const expectedBlog = {
        title: 'Agile Developer',
        author: 'Venkat Subramaniam',
        url: 'http://blog.agiledeveloper.com/'
    }
    const result = await api
        .post('/api/blogs')
        .send(expectedBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    expect(result.body.likes).toBe(0)
})

test('blog without title gets 400 response', async () => {
    const expectedBlog = {
        author: 'Venkat Subramaniam',
        url: 'http://blog.agiledeveloper.com/'
    }
    await api
        .post('/api/blogs')
        .send(expectedBlog)
        .expect(400)
})

test('blog without url gets 400 response', async () => {
    const expectedBlog = {
        title: 'Agile Developer',
        author: 'Venkat Subramaniam'
    }
    await api
        .post('/api/blogs')
        .send(expectedBlog)
        .expect(400)
})