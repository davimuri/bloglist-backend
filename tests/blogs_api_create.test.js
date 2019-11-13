const dbHandler = require('./db_handler')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const authentication = require('../utils/authentication')
const blogsTestData = require('./blogs_for_test')
const blogsHelper = require('./blogs_helper')
const usersTestData = require('./users_test_data')
const usersHelper = require('./users_helper')

const api = supertest(app)

beforeAll(async () => await dbHandler.connect())

beforeEach(async () => {
    const users = usersTestData.initialUsers.map(u => new User(u))
    const promiseArray1 = users.map(u => u.save())
    await Promise.all(promiseArray1)

    const usersInDb = await usersHelper.usersInDb()
    const userBlogCreator = usersInDb[0]
    const blogs = blogsTestData.initialBlogs.map(b =>
        new Blog({ ...b, user: userBlogCreator.id })
    )
    const promiseArray2 = blogs.map(b => b.save())
    await Promise.all(promiseArray2)

    const savedBlogs = await blogsHelper.blogsInDb()
    const userBlogs = userBlogCreator.blogs
    userBlogCreator.blogs = userBlogs.concat(savedBlogs.map(b => b._id))
    await userBlogCreator.save()
})

afterEach(async () => await dbHandler.clean())

afterAll(async () => await dbHandler.close())

test('a valid blog can be added', async () => {

    const usersInDb = await usersHelper.usersInDb()
    const userBlogCreator = usersInDb[0]
    const token = authentication.getToken(userBlogCreator._id, userBlogCreator.username)

    const result = await api
        .post('/api/blogs')
        .set('Authorization', 'bearer '.concat(token))
        .send(blogsTestData.validBlogToCreate)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const createdBlog = result.body
    expect(createdBlog.id).not.toBeNull()
    expect(createdBlog.user.toString()).toBe(userBlogCreator._id.toString())
    const actualBlog = { ...createdBlog }
    delete actualBlog.id
    delete actualBlog.user
    expect(actualBlog).toEqual(blogsTestData.validBlogToCreate)

    const blogsInDb = await blogsHelper.blogsInDb()
    expect(blogsInDb.length).toBe(blogsTestData.initialBlogs.length + 1)
    const blogUrls = blogsInDb.map(b => b.url)
    expect(blogUrls).toContain(blogsTestData.validBlogToCreate.url)
})

test('blog without likes defaults to zero', async () => {
    const usersInDb = await usersHelper.usersInDb()
    const userBlogCreator = usersInDb[0]
    const token = authentication.getToken(userBlogCreator._id, userBlogCreator.username)

    const expectedBlog = {
        title: 'Agile Developer',
        author: 'Venkat Subramaniam',
        url: 'http://blog.agiledeveloper.com/'
    }
    const result = await api
        .post('/api/blogs')
        .set('Authorization', 'bearer '.concat(token))
        .send(expectedBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    expect(result.body.likes).toBe(0)
})

test('blog without title gets 400 response', async () => {
    const usersInDb = await usersHelper.usersInDb()
    const userBlogCreator = usersInDb[0]
    const token = authentication.getToken(userBlogCreator._id, userBlogCreator.username)

    const expectedBlog = {
        author: 'Venkat Subramaniam',
        url: 'http://blog.agiledeveloper.com/'
    }
    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer '.concat(token))
        .send(expectedBlog)
        .expect(400)
})

test('blog without url gets 400 response', async () => {
    const usersInDb = await usersHelper.usersInDb()
    const userBlogCreator = usersInDb[0]
    const token = authentication.getToken(userBlogCreator._id, userBlogCreator.username)

    const expectedBlog = {
        title: 'Agile Developer',
        author: 'Venkat Subramaniam'
    }
    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer '.concat(token))
        .send(expectedBlog)
        .expect(400)
})

test('Not authorized user tries to create blog', async () => {
    const token = authentication.getToken('wrongid', 'wrongusername')

    const result = await api
        .post('/api/blogs')
        .set('Authorization', 'bearer '.concat(token))
        .send(blogsTestData.validBlogToCreate)
        .expect(401)

    expect(result.body.error).toBe('token missing or invalid')
})
