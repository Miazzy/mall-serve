var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var goods = require('./routes/goods');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 登录拦截
app.use(function(req, res, next) {
	if (req.cookies.userId) {
		next()
	} else {
		if (req.originalUrl === '/users/login' || req.originalUrl === '/users/logout' || req.originalUrl.indexOf('/goods/list') > -1) {
			next()
		} else {
			res.json({
				status: '10001',
				msg: '请登录后操作...',
				result: ''
			})
		}
	}
})

app.use('/', index);
app.use('/users', users);
app.use('/goods', goods);

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
app.use(function(err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.render('error');
});
module.exports = app;