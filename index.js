import createError from 'http-errors';
import express from 'express';
import request from 'request';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import expressSanitizer from 'express-sanitizer';
import userroutes from './routes/userRoutes.js';
import db from './config/dbConfig.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(expressSanitizer());
app.use(cookieParser());
app.use('/api/user', userroutes);

// Testing
app.get('/api', (req, res, next) => {
  return res.status(200).json({
    status: 'success',
    message: 'Welcome 😂😂👈👈',
  });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  return res.status(404).json({
    status: 'failed',
    error: createError(404),
  });
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
