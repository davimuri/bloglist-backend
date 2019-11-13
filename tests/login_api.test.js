const bcrypt = require('bcrypt')
const dbHandler = require('./db_handler')
const supertest = require('supertest')
const app = require('../app')
const config = require('../utils/config')
const User = require('../models/user')
const usersTestData = require('./users_test_data')

const api = supertest(app)

beforeAll(async () => await dbHandler.connect())

beforeEach(async () => {
    const user = { ...usersTestData.initialUsers[0] }
    user.password = await bcrypt.hash(user.password, config.BCRYPT_SALT_ROUNDS)
    await (new User(user)).save()
})

afterEach(async () => await dbHandler.clean())

afterAll(async () => await dbHandler.close())

test('a valid user gets token', async () => {

    const loginInput = {
        username: usersTestData.initialUsers[0].username,
        password: usersTestData.initialUsers[0].password
    }

    const result = await api
        .post('/api/login')
        .send(loginInput)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const loginOutput = result.body
    expect(loginOutput.token).not.toBeNull()
    expect(loginOutput.username).toBe(usersTestData.initialUsers[0].username)
    expect(loginOutput.name).toBe(usersTestData.initialUsers[0].name)
})

test('not existing user can not login', async () => {

    const loginInput = {
        username: 'nonexistent',
        password: 'password324'
    }

    const result = await api
        .post('/api/login')
        .send(loginInput)
        .expect(401)
        .expect('Content-Type', /application\/json/)

    const loginOutput = result.body
    expect(loginOutput.error).toBe('invalid username or password')
})

test('valid username and wrong password can not login', async () => {

    const loginInput = {
        username: usersTestData.initialUsers[0].username,
        password: 'wrongpass324'
    }

    const result = await api
        .post('/api/login')
        .send(loginInput)
        .expect(401)
        .expect('Content-Type', /application\/json/)

    const loginOutput = result.body
    expect(loginOutput.error).toBe('invalid username or password')
})
