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
    userBlogCreator.blogs = userBlogs.concat(savedBlogs.map(b => b.id))
    await userBlogCreator.save()
})

afterEach(async () => await dbHandler.clean())

afterAll(async () => await dbHandler.close())

test('delete an existent blog', async () => {
    const blogsAtStart = await blogsHelper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    const user = await User.findById(blogToDelete.user)
    const token = authentication.getToken(user._id, user.username)

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', 'bearer '.concat(token))
        .expect(204)

    const blogsAtEnd = await blogsHelper.blogsInDb()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1)

    const blogUrls = blogsAtEnd.map(b => b.url)
    expect(blogUrls).not.toContain(blogToDelete.url)

    const userAtEnd = await User.findById(blogToDelete.user)
    const blogIdsInUser = userAtEnd.blogs.map(blogId => blogId.toString())
    expect(blogIdsInUser).not.toContain(blogToDelete.id.toString())
})