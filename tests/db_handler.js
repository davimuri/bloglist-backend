const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const mongod = new MongoMemoryServer()

/**
 * Connect to the in-memory database.
 */
const connect = async () => {
    const uri = await mongod.getConnectionString()

    const mongooseOpts = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000
    }

    mongoose.connection.once('open', () => {
        console.log(`MongoDB successfully connected to ${uri}`)
    })

    await mongoose.connect(uri, mongooseOpts)

}

/**
 * Drop database, close the connection and stop mongod.
 */
const close = async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongod.stop()
}

/**
 * Remove all the data for all db collections.
 */
const clean = async () => {
    const collections = mongoose.connection.collections

    for (const key in collections) {
        const collection = collections[key]
        await collection.deleteMany()
    }
}

module.exports = {
    connect,
    close,
    clean
}