$(document).ready(function() {
	getPassageList();
	var lastOptions = 'getPassageList';
	async function getPassageList() {
		$('#main-container').html('the passage you like');
		let postUrl = '/' + $('#user').text();
		let data = {
			data : 'mylikePassage'
		};
		$.ajax(postUrl, {
			data : data,
			method : 'POST',
			dataType : 'JSON'
		}).done(function(responsePassage) {
			if(responsePassage.state == 'success') {
				for(var i = responsePassage.list.length - 1; i >=0; i --) {
					var str = '<p class = "passagelist"><span class = "title">' + responsePassage['list'][i].title + 
							'</span><span class = "author name">' + responsePassage['list'][i].author +
							'</span><span class = "time">' + responsePassage['list'][i].time +
							'</span><span class = "id">' + responsePassage['list'][i].id + 
							'</span></p>'
					$('#main-container').append(str);
				}
			}
			$('.title').click(viewPassage);
			$('.name').click(loadUserPage);
		});
	}
	async function viewPassage() {
		var title = $(this).text();
		var author = $(this).siblings('.author').text();
		var id = $(this).siblings('.id').text();
		var time = $(this).siblings('.time').text();
		let url = '/' + $('#user').text(); 
		let data = {
			data : 'viewpassage',
			title : title,
			author : author,
			id : id
		};
		let res = await $.ajax(url, {
			dataType : 'json',
			method : 'POST',
			data : data
		});
		if(res.state == 'success') {
			//console.log(res);
			$('#main-container').html('');
			var head = '<div><header>' + title + '</header>';
			var author = '<p><span id = "author" class = "name">' + author + '</span>';
			var time = '<span>' + time + '</span><span id = "passageid">' + res.id + '</span></p>';
			var content = '<p class = "content">' + res.content + '</p>';
			var comment = '<h2>comment: </h2>';
			for(var i in res.comment) {
				comment += '<div class = "comment-block">'
				comment += '<p class = "name">' + res.comment[i]['commentUser'] + '</p>';
				comment += '<p>' + res.comment[i]['commentContent'] + '</p>';
				comment += '<p>' + res.comment[i]['time'] + '</p></div>';
			}
			var myComment = '<textarea></textarea><button id = "submitComment">submit my comment</button>';
			var returntolist = '<button class = "returntolist">return</button>';
			var like = '<button id = "like"';
			var flag = true;
			for(var i in res.like) {
				if(res.like[i] == $('#user').text())
					flag = false;
			}
			if(flag)
				like += 'class = "like">' + res.like.length + '</button></div>';
			else like += 'class = "liked">' + res.like.length + '</button></div>';
			$('#main-container').html(head + author + time + content + comment + myComment + returntolist +like);
			$('#submitComment').click(submitComment);
			$('#like').click(likeit);
			$('.name').click(loadUserPage);
			if(lastOptions == 'getPassageList')
				$('.returntolist').click(getPassageList);
			else if(lastOptions == 'loadUserPage') {
				$('.returntolist').text($('#author').text());
				$('.returntolist').click(loadUserPage);
			}
		}
	}
	var likeit = async function() {
		if($(this).attr('class') == 'liked')
			return;
		let num = Number($(this).text());
		var date = new Date();
		var passageid = $('#passageid').text();
		var time = date.toLocaleDateString() + date.toLocaleTimeString();
		var commentAuthor = $('#author').text();
		var username = $('#user').text();
		let url = '/' + $('#user').text();
		num += 1;
		$(this).text(num);
		$(this).attr('class', 'liked')
		data = {
			data : 'like',
			author : commentAuthor,
			id : passageid,
			username : username
		}
		let res = await $.ajax(url, {
			dataType : 'json',
			method : 'POST',
			data : data
		});
	}
	var submitComment = async function() {
		var date = new Date();
		var passageid = $('#passageid').text();
		var commentContent = document.getElementsByTagName('textarea')[0].value;
		//console.log(commentContent);
		var time = date.toLocaleDateString() + date.toLocaleTimeString();
		var commentAuthor = $('#author').text();
		var username = $('#user').text();
		var url = '/' + username;
		let data = {
			data : 'comment',
			commentContent : commentContent,
			commentAuthor : commentAuthor,
			time : time,
			id : passageid
		};
		let res = await $.ajax(url, {
			dataType : 'json',
			method : 'POST',
			data : data
		});
		if(res.state == 'success') {
			document.getElementsByTagName('textarea')[0].value = '';
		}
	}
	$('#follow').click(loadFollower = async function() {
		//console.log('aa');
		$('#main-container').html('');
		$('.followNow').unbind('click');
		let url = '/' + $('#user').text(); 
		let data = {
			data : 'follows'
		};
		let res = await $.ajax(url, {
			dataType : 'json',
			method : 'POST',
			data : data
		});
		if(res.state == 'success') {
			var header = "<p><span class = 'follows-button'>my follows</span> \
			<span id = 'load-recommend-follower' class = 'follows-button'>recommend follow</span></p>";
			$('#main-container').append(header);
			$('#load-recommend-follower').click(loadRecommendFollow);
			console.log(res);
			for(var i in res.list) {
				var str = "<div class = 'follower' " + "id='" + res.list[i]['username'] + 
						"'><img src = 'logo.gif' /><br><p><span class = 'visitUser name'>";
				str += res.list[i]['username'] + "</span><br>";
				str += '<span>follow ' + res.list[i]['follows'].length + '|</span>';
				str += '<span>fans ' + res.list[i]['fans'].length + '|</span>';
				str += '<span>blog ' + res.list[i]['passageNum'] + '</span>\
				<button class = "cancel">cancel follow</button><p></div>';
				$('#main-container').append(str);
			}
		}
		$('.cancel').click(cancelFollow);
		$('.name').click(loadUserPage);
	});
	async function loadRecommendFollow() {
		$('.cancel').unbind('click');
		$('#load-recommend-follower').unbind('click');
		$('#main-container').html('');
		var header = "<p><span id = 'load-my-follower' class = 'follows-button'>my follows</span> \
		<span id = 'load-recommend-follower' class = 'follows-button'>recommend follow</span></p>";
		$('#main-container').append(header);
		$('#load-my-follower').click(loadFollower);
		let url = '/' + $('#user').text(); 
		let data = {
			data : 'all'
		};
		let res = await $.ajax(url, {
			dataType : 'json',
			method : 'POST',
			data : data
		});
		if(res.state == 'success') {
			for(var i in res.list) {
				var str = "<div class = 'follower' " + "id='" + res.list[i]['username'] + 
						"'><img src = 'logo.gif' /><br><p><span class = 'visitUser name'>";
				str += res.list[i]['username'] + "</span><br>";
				str += '<span>follow ' + res.list[i]['follows'].length + '|</span>';
				str += '<span>fans ' + res.list[i]['fans'].length + '|</span>';
				str += '<span>blog ' + res.list[i]['passageNum'] + '</span>\
				<button class = "followNow">follow</button><p></div>';
				$('#main-container').append(str);
				//$(str).attr('id', res.list[i]['username']);
			}
		}
		$('.followNow').click(followNow);
		$('.name').click(loadUserPage);
	}
	async function cancelFollow() {
		let username = $(this).parent('p').parent('.follower').attr('id');
		let url = '/' + $('#user').text();
		let res = await $.ajax(url, {
			dataType : 'json',
			method : 'POST',
			data : {
				username : username,
				data : 'cancelfollow'
			}
		});
		if(res.state == 'success') {
			$(this).parent('p').parent('.follower').remove();
		}
	}
	async function followNow() {
		let username = $(this).parent('p').parent('.follower').attr('id');
		let url = '/' + $('#user').text();
		//let curUser = $('#user').text();
		let res = await $.ajax(url, {
			dataType : 'json',
			method : 'POST',
			data : {
				username : username,
				data : 'addfollow'
			}
		});
		$(this).parent('p').parent('.follower').remove();
	}
	$('#fans').click(loadFans = async function() {
		$('#main-container').html('');
		$('.followNow').unbind('click');
		$('.cancel').unbind('click');
		var header = '<div class = "fans-header">fans</div>';
		$('#main-container').append(header);
		let url = '/' + $('#user').text(); 
		let data = {
			data : 'fans'
		};
		let res = await $.ajax(url, {
			dataType : 'json',
			method : 'POST',
			data : data
		});
		if(res.state == 'success') {
			for(var i in res.list) {
				var flag = false;
				var str = "<div class = 'follower fans' " + "id='" + res.list[i]['username'] + 
						"'><img src = 'logo.gif' /><br><p>";
				str += '<span class = "name">' + res.list[i]['username'] + "</span><br>";
				str += '<span>follow ' + res.list[i]['follows'].length + '|</span>';
				str += '<span>fans ' + res.list[i]['fans'].length + '|</span>';
				str += '<span>blog ' + res.list[i]['passageNum'];
				for(var j in res.list[i]['fans']) {
					if(res.list[i]['fans'][j] == $('#user').text()) {
						flag = true;
						break;
					}
				}
				if(!flag) 
					str += '</span><button class = "followNow">follow</button><p></div>'
				else 
					str += '</span><button class = "cancel">cancel follow</button><p></div>'
				$('#main-container').append(str);
			}
			$('.followNow').click(followNow);
			$('.cancel').click(cancelFollow);
			$('.name').click(loadUserPage);
		}
	});
	$('#logout').click(async function() {
		let url = '/' + $('#user').text(); 
		let data = {
			data : 'logOut'
		};
		let res = await $.ajax(url, {
			dataType : 'json',
			method : 'POST',
			data : data
		});
		if(res.state == 'success')
			window.location.href = '/';
	});
	var loadUserPage = async function() {
		lastOptions = 'loadUserPage';
		$('#main-container').html('');
		let visitUser = $(this).text();
		if(visitUser == $('#user').text()) {
			console.log(visitUser);
			window.location.href = '/' + visitUser + '?options=passages';
		}
		else {
			let url = '/' + $('#user').text();
			data = {
				data : 'visit',
				username : visitUser
			}
			let res = await $.ajax(url, {
				dataType : 'JSON',
				method : 'POST',
				data : data
			});
			//console.log(res);
			if(res.state == 'success') {
				var header = '<div id = "author-info"><img src = "logo.gif" /><br><p id = "visit-user">' + res.user.username
							+ '</p><p>follows | fans | blog</p>' + '<p>' + res.user.follows.length + '|' 
							+ res.user.fans.length + '|' + res.user.passageNum + '</p></div>';
				var passageList = '';
				for(var i in res.passages.list) {
					passageList += '<p class = "passagelist"><span class = "title">' + res.passages['list'][i]
									+ '</span><span class = "author">' + visitUser 
									+ '</span><span class = "time">'  + res.passages['time'][i] + '</span>'
									+ '<span class = "id">' + res.passages['id'][i] + '</span></p>';
				}
				$('#main-container').append(header + passageList);
				$('.title').click(viewPassage);
			}
		}
	}
});