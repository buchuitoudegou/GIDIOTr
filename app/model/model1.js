var mongoose = require('./db.js');
var fs = require('fs')
var Schema = mongoose.Schema;

var UserSchema = new Schema( {
	username : {type : String},
	password : {type : String},
	tel : {type : String},
	email : {type : String},
	follows : {type : Object},
	fans : {type : Object},
	passageNum : {type : Number},
	photosNum : {type : Number}
});

var PassageSchema = new Schema( {
	title : {type : String},
	content : {type : String},
	author : {type : String},
	id : {type : Number},
	like : {type : Object},
	comment : {type : Object},
	time : {type : String}
});

var MessageSchema = new Schema( {
	time : {type : String},
	username : {type : String},
	who : {type : String},
	what : {type : String},
	operation : {type : String}
});


var userModel = mongoose.model('User', UserSchema);
var passageModel = mongoose.model('Passage', PassageSchema);
var messageModel = mongoose.model('Message', MessageSchema);
exports.find = async function(item, data) {
	let condition = {};
	//console.log(item);
	switch(item) {
		case 'username' : condition = {username : data};break;
		case 'tel' : condition = {username : data};break;
		case 'email' : condition = {username : data};break;
	}
	let user = await userModel.find(condition);
	//console.log(user);
	if(user.length == 0)
		return false;
	else return user[0];
}
exports.add = async function(data) {
	fs.mkdirSync('../public/uploads/' + data.username);
	data['follows'] = []
	data['follows'].push(data['username'])
	data['follows'] = [];
	data['follows'].push(data.username);
	data['fans'] = [];
	data['fans'].push(data.username);
	data['passageNum'] = 0;
	data['photosNum'] = 0;
	let newUser = await userModel.create(data);
}
exports.findPassages = async function(username) {
	let condition = {author : username};
	let passageList = await passageModel.find(condition);
	let res = {
		list : [],
		id : [],
		time : [],
		username : username
	};
	//console.log(passageList);
	var count = 0;
	for(var i in passageList) {
		count ++;
		res['list'].push(passageList[i]['title']);
		res['id'].push(passageList[i]['id']);
		res['time'].push(passageList[i]['time']);
	}
	let curUser = await exports.find('username', username);
	res['passageNum'] = count;
	res['fans'] = curUser['fans'];
	res['follows'] = curUser['follows'];
	//console.log(res);
	return res;
}
exports.findPassage = async function(username, id) {
	let condition = {author : username, id : id};
	let passage = await passageModel.find(condition);
	let curUser = await exports.find('username', username);
	//console.log(username);
	let res = {
		id : id,
		title : passage[0].title,
		content : passage[0].content,
		passageNum : curUser.passageNum,
		fans : curUser.fans,
		follows : curUser.follows,
		comment : passage[0].comment,
		like : passage[0].like
	};
	//console.log(res);
	return res;
}
exports.addPassage = async function(username, newTitle, newContent, time) {
	let user = await userModel.find({username : username});
	let newId = user[0].passageNum + 1;
	let updates = {$set : {passageNum : newId}};
	await userModel.update({username : username}, updates);
	let newPassage = {
		title : newTitle,
		content : newContent,
		id : newId,
		time : time,
		author : username,
		like : [],
		comment : []
	};
	await passageModel.create(newPassage);
}
exports.findAllPassage = async function() {
	let passageList = await passageModel.find({});
	return passageList;
}
exports.findAllUser = async function() {
	let userList = await userModel.find({});
	return userList;
}
exports.Follows = async function(username, followsName, option) {
	let curUser = await userModel.find({username : username});
	let pUser = await userModel.find({username : followsName});
	//console.log(curUser);
	let followsList = curUser[0].follows;
	let fansList = pUser[0].fans;
	if(option == 'add') {
		followsList.push(followsName);
		fansList.push(username);
		let updates = {$set : {follows : followsList}};
		let pupdates = {$set : {fans : fansList}};
		await userModel.update({username : username}, updates);
		await userModel.update({username : followsName}, pupdates);
	} else {
		let index = 0;
		let pindex = 0;
		for(var i in followsList)
			if(followsList[i] == followsName) {
				index = i;
				break;
			}
		for(var i in fansList) {
			if(fansList[i] == username) {
				pindex = i;
				break;
			}
		}
		followsList.splice(index, 1);
		fansList.splice(pindex, 1);
		let updates = {$set : {follows : followsList}};
		let pupdates = {$set : {fans : fansList}};
		await userModel.update({username : username}, updates);
		await userModel.update({username : followsName}, pupdates);
	}
}
exports.addComment = async function(username, author, id, content, time) {
	let condition = {author : author, id : id};
	let curPassage = await passageModel.find(condition);
	let commentList = curPassage[0].comment;
	let newComment = {
		commentUser : username,
		commentContent : content,
		time : time
	};
	commentList.push(newComment);
	//console.log(commentList);
	let updates = {$set : {comment : commentList}};
	await passageModel.update(condition, updates);
	let newMessage = {
		time : time,
		username : author,
		who : username,
		what : curPassage[0].title,
		operation : 'comment'
	};
	await messageModel.create(newMessage);
}
exports.likePassage = async function(username, author, id) {
	let condition = {author : author, id : id};
	let date = new Date();
	let time = date.toLocaleDateString() + date.toLocaleTimeString();
	let curPassage = await passageModel.find(condition);
	let like = curPassage[0].like;
	like.push(username);
	//console.log(curPassage);
	let updates = {$set : {like : like}};
	await passageModel.update(condition, updates);
	let newMessage = {
		time : time,
		username : author,
		who : username,
		what : curPassage[0].title,
		operation : 'like'
	}
	//console.log(curPassage['title']);
	await messageModel.create(newMessage);
}
exports.addNewPhotos = async function(username, num) {
	var updates = {$set : {photosNum : num}};
	await userModel.update({username : username}, updates);
}
exports.updateInfo = async function(newInfo) {
	if(newInfo.tel != '') {
		var updates = {$set : {tel : newInfo.tel}};
		await userModel.update({username : newInfo.username}, updates);
	}
	if(newInfo.password != '') {
		var updates = {$set : {password : newInfo.password}};
		await userModel.update({username : newInfo.username}, updates);
	}
	if(newInfo.email != '') {
		var updates = {$set : {email : newInfo.email}};
		await userModel.update({username : newInfo.username}, updates);
	}
}
exports.findMyCommentMessage = async function(username) {
	let allMessage = await messageModel.find({});
	//console.log(allMessage);
	let list = []
	for(var i = 0; i < allMessage.length; ++ i) {
		if(allMessage[i].username == username) 
			list.push(allMessage[i]);
	}
	//console.log(list);
	return list;
}