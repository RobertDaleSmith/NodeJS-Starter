"use strict";
var async = require("async")
	, util = require('util')
	, fs = require('fs')
	;

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
	console.log('home');
	res.render( 'index/home', {
		pageId: 'home',
		subId:  '',
		title:  'Home'
	});
};

Index.prototype.login = function( req, res, next ){	
	var email = req.body('email');
	var password = req.body('password');
	if(email == null | email == '') { }
	else {
		this._endUsers.authenticate(email, password, function(err, user){
			if(err) {
				console.error(err.msg);
				throw err;
			}
			else {
				req.session.endUser = user;
				req.session.loggedIn = true;
			}
		});
	}
	res.render('index/login',  { title: "Title of your view", pageName: "home" });	
};

Index.prototype.loginPost = function( req, res, next ){
	res.locals.randomVar = "look mom it passed to render";
	
};

Index.prototype.signup = function( req, res, next ){
	res.locals.randomVar = "look mom it passed to render";
	res.render('signup',  { title: "Title of your view", pageName: "home" });	
};

Index.prototype.signupPost = function( req, res, next ){
	res.locals.randomVar = "look mom it passed to render";
	res.render('index',  { title: "Title of your view", pageName: "home" });	
};