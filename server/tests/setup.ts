import { afterAll, afterEach, beforeAll } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterEach(async () => {
  // Чистим коллекции между тестами для изоляции
  const { collections } = mongoose.connection
  for (const key of Object.keys(collections)) {
    await collections[key]?.deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})
