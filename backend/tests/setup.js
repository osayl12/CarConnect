const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Tests never touch Atlas or need any secrets — an in-memory MongoDB spins
// up fresh for the whole test run, and each test starts with empty
// collections. Keeps CI (.github/workflows/ci.yml) secret-free.
let mongod;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-not-for-production';
  process.env.JWT_EXPIRES_IN = '1h';

  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
