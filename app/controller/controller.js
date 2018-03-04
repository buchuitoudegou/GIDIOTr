var express = require('express');
var model = require('../model/model');
var model1 = require('../model/model1');
var crypto = require('crypto');
var url = require('url');
const multer = require('multer');
const path = require('path');



var controller = {
	photoHandler: function(req, res) {
		res.send({
			err: null,
			filePath: 'uploads/' + path.basename(req.file.path)
		});
	},
	settingInfo : async function(request, response) {
		let curUser = await model1.find('username', request.session.username);
		response.render('setting', curUser);
		response.end();
	},
	settingNewInfo : async function(request, response) {
		var responseData = {
			state : 'success',
			reason : 'none'
		};
		for(var i in request.body) {
			//console.log(i, request.body[i]);
			if(request.body[i] == '' || i == 'password' || i == 'username' || i == 'data')
				continue;
			var dulplicated = await model1.find(i, request.body[i]);
			console.log(i);
			//console.log(dulplicated);
			if(dulplicated != false) {
				responseData.state = 'failed';
				responseData.reason = i;
				break;
			}
		}
		if(responseData.state  == 'success') {
			await model1.updateInfo(request.body);
		}
		response.send(responseData);
		response.end();
	},
	infoLoading : async function(request, response) {
		let curUser = await model1.find('username', request.session.username);
		response.render('info', curUser);
		response.end();
	},
	signup : function(request, response) {
		response.render('signup');
		response.end();
	},
	passageSubmit : async function(request, response) {
		await model1.addPassage(request.body.username, request.body.title, request.body.content, request.body.time);
		let data = {
			state : 'success',
		};
		response.send(data);
		response.end();
	},
	passagesLoading : async function(username, request, response) {
		if(!request.query.id) {
			let allPassages = await model1.findPassages(username);
			//console.log(allPassages);
			response.render('passagesContent', allPassages);
			response.end();
		} else {
			let passage = await model1.findPassage(username, request.query.id);
			//console.log(passage);
			response.render('passages', passage);
			response.end();
		}
	},
	findFriendUser : async function(username, request, response) {
		let curUser = await model1.find('username', username);
		//console.log(curUser);
		if(curUser) {
			let responseData = {
				state : 'success',
				username : username,
				list : []
			};
			for(var i in curUser[request.body.data]) {
				let resUser = await model1.find('username', curUser[request.body.data][i]);
				responseData.list.push(resUser);
			}
			response.send(responseData);
			response.end();
		} else {
			response.redirect('/');
			response.end();
		}
	},
	signupHandler : async function(request, response) {
		var responseData = {
			state : 'success',
			reason : 'none'
		};
		for(var i in request.body) {
			//console.log(i, request.body[i]);
			if(i === 'password')
				continue;
			var dulplicated = await model1.find(i, request.body[i]);
			//console.log(dulplicated);
			if(dulplicated != false) {
				responseData.state = 'failed';
				responseData.reason = i;
				//console.log(responseData);
				break;
			}
		}
		if(responseData.state  == 'success') {
			let i = await model1.add(request.body);
			console.log(i);
			request.session.username = request.body.username;
		}
		response.send(responseData);
		response.end();
	},
	photosLoading : async function(request, response) {
		let curUser = await model1.find('username', request.session.username);
		let data = {
			username : curUser.username,
			fans : curUser.fans,
			follows : curUser.follows,
			passageNum : curUser.passageNum,
			photosNum : curUser.photosNum
		}
		response.render('photo', data);
		response.end();
	},
	logIn : async function(request, response) {
		//console.log('log in');
		if(request.session.username) {
			response.redirect('/' + request.session.username);
			response.end()
		} else {
			response.render('login');
			response.end();
		}
	},

	loginHandler : async function(request, response) {
		var data = {
			state : 'success',
			reason: 'none'
		};
		//console.log(request.body.password);
		let userValid = await model1.find('username', request.body.username);
		if(userValid == false) {
			data.state = 'failed';
			data.reason = 'USER_ERR';
			response.send(data);
			response.end();
		} else {
			let passwordValid = userValid['password'] === request.body.password ? true : false;
			if(passwordValid == true) {
				request.session.username = request.body.username;
				response.send(data);
				response.end();		
				//console.log('response end');
			} else {
				data.state = 'failed';
				data.reason = 'PASSWORD_ERR';
				response.send(data);
				response.end();
			}
		}
	},
	userHome : async function(request, response) {
		let username = url.parse(request.url).pathname;
		username = username.substr(1);
		//console.log(username, request.session.username);
		var count = 0;
		for(var i in request.query)
			count ++;
		if(username === request.session.username && count == 0) {
			let curUser = await model1.find('username', request.session.username);
			//console.log(curUser);
			if(curUser)
				response.render('home', curUser);
			else 
				response.redirect('/');
			response.end();
		} else if(username === request.session.username) {
			//console.log('redirect');
			switch(request.query.options) {
				case 'passages' : controller.passagesLoading(username, request, response);break;
				case 'setting' : controller.settingInfo(request, response);break;
				case 'photos' : controller.photosLoading(request, response);break;
				case 'messages' : controller.messagesLoading(request, response);break;
				case 'info' : controller.infoLoading(request, response);break;
				case 'myliked' : controller.mylike(request, response);break;
				case 'commentme' : controller.commentmeMessage(request, response);break;
				default : response.redirect('/');response.end();break;
			}
		} else {
			response.redirect('/');
			response.end();
		}
	},
	findRecommendUser : async function(request, response) {
		let userList = {
			state : 'success',
			list : []
		};
		let allUser = await model1.findAllUser();
		let curUser = await model1.find('username', request.session.username);
		for(var i in allUser) {
			let flag = true;
			for(var j in curUser['follows']) {
				if(curUser['follows'][j] == allUser[i].username) {
					flag = false;
					break;
				}
			}
			if(flag)
				userList['list'].push(allUser[i]);
		}
		response.send(userList);
		response.end();
	},
	addFollows : async function(username, request, response) {
		await model1.Follows(username, request.body.username, 'add');
		response.send({state:'success'});
		response.end();
	},
	cancelFollows : async function(username, request, response) {
		model.cancelFollows(username, request.body.username, 'cancel');
		response.send({state:'success'});
		response.end();
	},
	findFollowPassages : async function(username, request, response) {
		let data = {
			state : 'success',
			list : []
		};
		let passageList = await model1.findAllPassage();
		let curUser = await model1.find('username', username);
		//console.log(curUser);
		for(var i in passageList) {
			for(j in curUser['follows'])
				if(curUser.follows[j] == passageList[i].author)
					data.list.push(passageList[i]);
		}
		//console.log(data);
		response.send(data);
		response.end();
	},
	visitUser : async function(request, response) {
		let res = {state : 'success'};
		res['user'] = await model1.find('username', request.body.username);
		res['passages'] = await model1.findPassages(request.body.username);
		response.send(res);
		response.end();
	},
	findMylikePassage : async function(request, response) {
		let data = {
			state : 'success',
			list : []
		};
		let passageList = await model1.findAllPassage();
		//let curUser = await model1.find('username', request.session.username);
		//console.log(curUser);
		for(var i in passageList) {
			for(var j in passageList[i]['like'])
				if(passageList[i]['like'][j] == request.session.username) {
					data.list.push(passageList[i]);
					break;
				}
		}
		console.log(data);
		response.send(data);
		response.end();
	},
	mylike : async function(request, response) {
		let curUser = await model1.find('username', request.session.username);
		response.render('mylike', curUser);
		response.end();
	},
	userHandler : async function(request, response) {
		let username = url.parse(request.url).pathname;
		username = username.substr(1);
		console.log(request.url);
		if(username === request.session.username && !request.body.data) {
			switch(request.query.options) {
				case 'passages' : controller.passageSubmit(request, response);break;
				default : break;
			}
		} else if(username === request.session.username) {
			//console.log(request.body.data);
			switch(request.body.data) {
				case 'follows': 
				case 'fans':controller.findFriendUser(username, request, response);break;
				case 'all':controller.findRecommendUser(request, response);break;
				case 'addfollow':controller.addFollows(username, request, response);break;
				case 'cancelfollow':controller.cancelFollows(username, request, response);break;
				case 'followPassage':controller.findFollowPassages(username, request, response);break;
				case 'logOut':controller.logOut(request, response);break;
				case 'viewpassage' : 
					//console.log(request.body);
					let passage = await model1.findPassage(request.body.author, request.body.id);
					passage['state'] = 'success';
					response.send(passage);
					response.end();
					break;
				case 'comment' : await model1.addComment(username, request.body.commentAuthor, request.body.id,
					request.body.commentContent, request.body.time);
					response.send({state : 'success'});
					response.end();
					break;
				case 'like' : await model1.likePassage(username, request.body.author, request.body.id);
					response.send({});
					response.end();
					break;
				case 'visit': controller.visitUser(request, response);break;
				case 'setting' : controller.settingNewInfo(request, response);break;
				case 'mylikePassage' : controller.findMylikePassage(request, response);break;
				case 'commentMessage' : controller.loadCommentMessage(request, response);break;
			}
		}
	},
	loadCommentMessage : async function(request, response) {
		let data = {state : 'success', list : []};
		data.list = await model1.findMyCommentMessage(request.session.username);
		response.send(data);
		response.end();
	},
	commentmeMessage : async function(request, response) {
		let curUser = await model1.find('username', request.session.username);
		response.render('commentme', curUser);
		response.end();
	},
	logOut : function(request, response) {
		request.session.destroy();
		response.send({state : 'success'});
		response.end();
	}
}

module.exports = controller;