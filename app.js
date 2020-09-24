
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const fileUpload = require('express-fileupload');

const dbconn = require('./db/dbconn');


var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var bookRouter = require('./routes/book');
var tagRouter = require('./routes/tag');
var apiRouter = require('./routes/api');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(
    session({
        secret: process.env.SECRET,
        resave:false,
        saveUninitialized: false,
    })
);
// app.use((req, res, next) => {
//     if (req.cookies.sid && !req.session.user) {
//         res.clearCookie('sid');        
//     }
//     next();
// });

app.use((req, res, next) => {
    if (!req.session.user) {
        req.session.dbconn = dbconn.guestconn;
    }
    else if (req.session.user.class === 'admin' || req.session.user.class === 'god') {
        req.session.dbconn = dbconn.adminconn;
    }
    else if (req.session.user.class === 'user') {
        req.session.dbconn = dbconn.userconn;
    }
    else req.session.dbconn = dbconn.guestconn;
    // console.log(req.session.user);
    next();
});

// app.use((req, res, next) => {
//     console.log(req.session.user);
//     next();
// });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/fontawesome', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/css')));
// node_modules\@fortawesome\fontawesome-free\css\all.min.css
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/book', bookRouter);
app.use('/tag', tagRouter);
app.use('/api', apiRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
