"use strict";
var async = require("async")
	, bcrypt  = require('bcrypt-nodejs')
	, util = require('util')
	, fs = require('fs');

var Index = function( mongo ) {
	var self = this;
	if( typeof mongo === 'undefined' ) { console.log( 'Index( undefined )!'); }
	var EndUserMongo = require("../libs/EndUserMongo").EndUserMongo;
	self._endUsers = new EndUserMongo( {mongo:mongo} );
};

exports.initIndex = function( mongo ){
	return new Index( mongo );
};

Index.prototype.home = function( req, res ) {
	if(req.session.endUserLoggedIn) {
		res.locals.endUser = req.session.endUser;
		res.render('index/user-home');
	}
	else {
		res.render('index/home');
	}	
};

Index.prototype.login = function( req, res, next ){		
	res.locals.title = 'Login';
	res.locals.error = req.flash('error');
	res.render('index/login',  { title: "Title of your view", pageName: "home" });	
};

Index.prototype.loginPost = function( req, res, next ){	
	var user = req.body['user'];

	function loginSuccess(result){
		result.pwd = null;
		req.session.endUser = result;
		req.session.endUserLoggedIn = true;
		if (user.remember) { req.session.cookie.maxAge = 2628000000; }
		else { req.session.cookie.maxAge = 24*60*60*1000; }
		res.redirect('/');
	}

	var username = user.username;
	var password = user.password;

	if(username == null | username == '') { req.flash('error', 'Fill in all the fields.') }
	else {
		this._endUsers.authenticate(username, password, function(err, result){
			if (err !== null || !result) {
				req.session.endUser = {endUserLoggedIn:false};
				req.flash('error', err.message);
				res.redirect('/login');
			} else {
				loginSuccess(result);	
			}
		});
	}
};

Index.prototype.logout = function( req, res ) {
	req.session.endUser = null;
	req.session.endUserLoggedIn = false;
	res.locals.endUser = null;
  res.locals.endUserLoggedIn = false;
	res.redirect('/login');
};

Index.prototype.signup = function( req, res, next ){
	res.locals.error = req.flash('error');
	res.render('index/signup',  { title: "Title of your view", pageName: "home" });	
};

Index.prototype.signupPost = function( req, res, next ){
	function signupSuccess(result){
		result.pwd = null;
		req.session.endUser = result;
		req.session.endUserLoggedIn = true;
		if (user.remember) { req.session.cookie.maxAge = 2628000000; }
		else { req.session.cookie.maxAge = 24*60*60*1000; }
		res.redirect('/');
	}

	var _this = this;
	var user = req.body.user;

	if( user.confirm_password ){
		var newUser = {
			username: user.username,
			email: user.email,
			pwd: bcrypt.hashSync(user.password, bcrypt.genSaltSync(10)),
			signup: new Date()
		};
		
		_this._endUsers.findUsers({$or:[{username:newUser.username}, {email:newUser.email}]}, function(err, result){
			if(err !==null || (result && result.length > 0)) {
				req.flash('error', 'The username or email you entered already exists');
				res.redirect('/signup');
			}
			else {
				_this._endUsers.addUser(newUser, function(insertionErr, insertedUser){
					if(insertionErr || insertedUser == null) {
						req.flash('error', insertionErr.message);
						res.redirect('/signup')
					} else {
						signupSuccess(insertedUser);
					}
				});
			}
		});
	} else {
		res.redirect('/signup');
	}
};