const dbHandler = require('./db_handler')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const usersHelper = require('./users_helper')
const usersTestData = require('./users_test_data')

const api = supertest(app)

beforeAll(async () => await dbHandler.connect())

beforeEach(async () => {
    const users = usersTestData.initialUsers
        .map(u => new User(u))
    const promiseArray = users.map(u => u.save())
    await Promise.all(promiseArray)
})

afterEach(async () => await dbHandler.clean())

afterAll(async () => await dbHandler.close())

test('a valid user can be added ', async () => {
    const usersAtStart = await usersHelper.usersInDbAsJSON()

    const user = {
        name: 'David',
        username: 'davimuri',
        password: 'pass123'
    }

    const result = await api
        .post('/api/users')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const createdUser = result.body
    expect(createdUser.id).not.toBeNull()
    const actualUser = { ...user }
    delete actualUser.id
    expect(actualUser).toEqual(user)

    const usersAtEnd = await usersHelper.usersInDbAsJSON()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(user.username)
})


test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await usersHelper.usersInDbAsJSON()

    const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
    }

    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await usersHelper.usersInDbAsJSON()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
})

test('user without username gets 400 response', async () => {
    const user = {
        name: 'David',
        username: '',
        password: 'pass123'
    }

    const result = await api
        .post('/api/users')
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` is required')
})

test('user with username of 2 characters gets 400 response', async () => {
    const user = {
        name: 'David',
        username: 'da',
        password: 'pass123'
    }

    const result = await api
        .post('/api/users')
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` (`da`) is shorter than the minimum allowed length (3)')
})

test('user without password gets 400 response', async () => {
    const user = {
        name: 'David',
        username: 'davimuri',
        password: ''
    }

    const result = await api
        .post('/api/users')
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password is required and must have at least 3 characters')
})

test('user with password of 2 characters gets 400 response', async () => {
    const user = {
        name: 'David',
        username: 'davimuri',
        password: 'pa'
    }

    const result = await api
        .post('/api/users')
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password is required and must have at least 3 characters')
})
