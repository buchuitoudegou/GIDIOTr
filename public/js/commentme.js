$(document).ready(function() {
	getMessageList();
	async function getMessageList() {
		$('#main-container').html('');
		let postUrl = '/' + $('#user').text();
		let data = {
			data : 'commentMessage'
		};
		let res = await $.ajax(postUrl, {
			dataType : 'JSON',
			method : 'POST',
			data : data
		});
		if(res.state == 'success') {
			var str = '<div class = "message">';
			for(var i = res.list.length - 1; i >= 0 ; -- i) {
				str += '<p>' + res.list[i].who + ' ' + res.list[i].operation + ' your '
						+ res.list[i].what + ' at ' + res.list[i].time + '</p>';
			}
			//console.log(str);
			$('#main-container').append(str);
		}
	}
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
});