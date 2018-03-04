var fs = require('fs');
var usersFile = fs.readFileSync('../app/model/users.json');
var passageFile = fs.readFileSync('../app/model/passage.json');



var model = {
	find : function(item, data) {
		var usersFile = fs.readFileSync('../app/model/users.json');
		var passageFile = fs.readFileSync('../app/model/passage.json');
		var users = JSON.parse(usersFile);
		//console.log(users);
		for(var i in users)
			if(users[i][item] == data) {
				//console.log(users);
				return users[i];
			}
		return false;
	},
	findRecommendUser : function(username) {
		var usersFile = fs.readFileSync('../app/model/users.json');
		var passageFile = fs.readFileSync('../app/model/passage.json');
		let curUser = model.find('username', username);
		var users = JSON.parse(usersFile);
		var recommendList = [];
		for(var i in users) {
			var flag = true;
			for(var j in curUser['follows']) {
				if(curUser['follows'][j] == users[i]['username']) {
					flag = false;
					break;
				}
			}
			if(flag == true)
				recommendList.push(users[i]);
		}
		return recommendList;
	},
	add : function(data) {
		var usersFile = fs.readFileSync('../app/model/users.json');
		var passageFile = fs.readFileSync('../app/model/passage.json');
		var users = JSON.parse(usersFile);
		var passages = JSON.parse(passageFile);
		data['follows'] = [];
		data['follows'].push(data.username);
		data['fans'] = [];
		data['fans'].push(data.username);
		data['passageNum'] = 0;
		users.push(data);
		let passage = {};
		passage[data.username] = {};
		passages.push(passage);
		fs.writeFileSync('../app/model/users.json', JSON.stringify(users));
		fs.writeFileSync('../app/model/passage.json', JSON.stringify(passages));
	},
	findAllPassages : function(username) {
		let data;
		var usersFile = fs.readFileSync('../app/model/users.json');
		var passageFile = fs.readFileSync('../app/model/passage.json');
		var passages = JSON.parse(passageFile);
		for(var i in passages) {
			//console.log(passages[i]);
			for(var j in passages[i])
				if(j == username)
					data = passages[i][j];
		}
		let count = 0;
		let titles = {
			list : [],
			id : [],
			username : username
		};
		for(var i in data) {
			count ++;
			titles['list'].push(data[i]['title']);
			titles['id'].push(i);
		}
		let curUser = model.find('username', username);
		//console.log(users);
		titles['passageNum'] = count;
		titles['fansNum'] = curUser['fans'].length;
		titles['followsNum'] = curUser['follows'].length;
		return titles;
	},
	findPassage : function(username, id) {
		let data;
		var usersFile = fs.readFileSync('../app/model/users.json');
		var passageFile = fs.readFileSync('../app/model/passage.json');
		var passages = JSON.parse(passageFile);
		for(var i in passages) {
			//console.log(passages[i]);
			for(var j in passages[i])
				if(j == username)
					data = passages[i][j];
		}
		let passage = {
			title : "",
			username : username,
			content : "no such passage"
		}
		for(var i in data) {
			if(i == id) {
				passage['content'] = data[i]['content'];
				passage['title'] = data[i]['title'];
			}
		}
		let curUser = model.find('username', username);
		passage['passageNum'] = curUser['passageNum'];
		passage['fansNum'] = curUser['fans'].length;
		passage['followsNum'] = curUser['follows'].length;
		return passage;
	},
	addPassage : function(username, newTitle, newContent, time) {
		let newId;
		//console.log(users);
		var usersFile = fs.readFileSync('../app/model/users.json');
		var passageFile = fs.readFileSync('../app/model/passage.json');
		var timeOrderPassages = fs.readFileSync('../app/model/timeOrderPassages.json');
		var passageList = JSON.parse(timeOrderPassages);
		var users = JSON.parse(usersFile);
		var passages = JSON.parse(passageFile);
		for(var i in users) {
			console.log(users[i]['username']);
			if(users[i]['username'] == username) {
				newId = users[i]['passageNum'] + 1;
				users[i]['passageNum'] = newId;
			}
		}
		//console.log(users);
		for(var i in passages) {
			//console.log('username:',passages[i])
			//if(passages[i] == username) {
				//passages[i][newId]['title'] = newTitle;
				//passages[i][newId]['content'] = newContent;
			//}
			for(var j in passages[i]) {
				if(j == username) {
					passages[i][j][newId] = {};
					passages[i][j][newId]['title'] = newTitle;
					passages[i][j][newId]['content'] = newContent;
					passages[i][j][newId]['time'] = time;
				}
			}	
		}
		passageList.push({title:newTitle,author:username,time:time,id:newId});
		fs.writeFileSync('../app/model/timeOrderPassages.json', JSON.stringify(passageList));
		fs.writeFileSync('../app/model/users.json', JSON.stringify(users));
		fs.writeFileSync('../app/model/passage.json', JSON.stringify(passages));
	},
	addFollows : function(username, addFollow) {
		var usersFile = fs.readFileSync('../app/model/users.json');
		var passageFile = fs.readFileSync('../app/model/passage.json');
		var users = JSON.parse(usersFile);
		var passages = JSON.parse(passageFile);
		for(var i in users) {
			if(users[i]['username'] == username) {
				users[i]['follows'].push(addFollow);
			}
			if(users[i]['username'] == addFollow) {
				users[i]['fans'].push(username);
			}
		}
		fs.writeFileSync('../app/model/users.json', JSON.stringify(users));
	},
	cancelFollows : function(username, cancelFollow) {
		var usersFile = fs.readFileSync('../app/model/users.json');
		var users = JSON.parse(usersFile);
		console.log(cancelFollow);
		for(var i in users) {
			if(users[i]['username'] == username) {
				for(var j in users[i]['follows']) {
					//console.log(users[i]['follows'][j]);
					if(users[i]['follows'][j] == cancelFollow) {
						users[i]['follows'].splice(j, 1);
						//console.log(users[i]['follows']);
						break;
					}
				}
			}
			if(users[i]['username'] == cancelFollow) {
				for(var j in users[i]['fans']) {
					if(users[i]['fans'][j] == username) {
						users[i]['fans'].splice(j, 1);
						break;
					}
				}
			}
		}
		fs.writeFileSync('../app/model/users.json', JSON.stringify(users));
	},
	findFollowPassages : function(username) {
		var timeOrderPassages = fs.readFileSync('../app/model/timeOrderPassages.json');
		var passageList = JSON.parse(timeOrderPassages);
		let curUser = model.find('username', username);
		let list = [];
		for(var i in passageList) {
			var flag = false;
			for(var j in curUser['follows']) {
				if(passageList[i]['author'] == curUser['follows'][j])
					flag = true;
			}
			if(flag)
				list.push(passageList[i]);
		}
		return list;
	}
}

module.exports = model;