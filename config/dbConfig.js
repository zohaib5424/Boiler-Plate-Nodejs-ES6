// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// dotenv.config();

// mongoose.Promise = global.Promise;

// mongoose.connect(
//   `${process.env.DB_URL}`,
//   {
//     dbName: process.env.DB_NAME,
//     user: process.env.USERR,
//     pass: process.env.PASS,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   },
//   err => {
//     if (err) throw err;
//     console.log('Successfully connected');
//   }
// );

// const db = mongoose.connection;

// export default db;

// db.js
import mysql from 'mysql';

const connection = mysql.createConnection({
  host: 'your-database-host',
  user: 'your-database-username',
  password: 'your-database-password',
  database: 'your-database-name',
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// module.exports = connection;

const db = connection;

export default db;
