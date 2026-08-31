const dns = require('dns');
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not set. Add it to backend/.env (see .env.example).');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri);
  } catch (err) {
    // Some local DNS resolvers (corporate VPNs, Docker Desktop's 127.0.0.1
    // proxy, etc.) refuse SRV/TXT lookups even though normal A-record
    // lookups work fine. That breaks mongodb+srv:// connection strings with
    // a DNS error, not an auth/network error. Retry once against public
    // resolvers before giving up.
    const isDnsSrvIssue = uri.startsWith('mongodb+srv://') && /querySrv|ENOTFOUND|ECONNREFUSED/.test(err.message);
    if (!isDnsSrvIssue) throw err;

    console.warn('MongoDB SRV lookup failed via system DNS, retrying with public DNS (8.8.8.8, 1.1.1.1)...');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    await mongoose.connect(uri);
  }

  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = connectDB;
