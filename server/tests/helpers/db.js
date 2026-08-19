const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

async function connectTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

async function clearTestDB() {
  const collections = mongoose.connection.collections;
  const cleanups = Object.values(collections).map((collection) =>
    collection.deleteMany({}),
  );
  await Promise.all(cleanups);
}

async function closeTestDB() {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = {
  connectTestDB,
  clearTestDB,
  closeTestDB,
};
