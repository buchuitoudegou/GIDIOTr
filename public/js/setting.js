$(document).ready(function() {
	$('#sub').click(ajaxHandler);
	function checkTel() {
		var reg = /^[1-9][0-9]{10}$/
		var tel = document.getElementById('tel_').value;
		var val = reg.test(tel);
		if(tel != '' && val == false) {
			$('#failbox').show().text('tel. can only contain 11 digital \
				content and can not begin with 0').fadeOut(4000);
			return false;
		}
		else {
			return true;
		}
	}
	function checkEmail() {
		var reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
		var email = document.getElementById('email_').value;
		var val = reg.test(email);
		if(email != '' && val == false) {
			email = false;
			$('#failbox').show().text('email address NOT valid.').fadeOut(4000);
			return false;
		}
		else {
			email = true;
			return true;
		}
	}
	function checkPassword() {
		var reg = /^[\w|\-]{6,12}$/;
		var password = document.getElementById('password_').value;
		var val = reg.test(password);
		if(password != '' && val == false) {
			password = false;
			$('#failbox').show().text('password can only contain numbers, "-" or alphabet.').fadeOut(4000);
			return false;
		}
		else {
			password = true;
			return true;
		}
	}
	function checkPasswordRepeat() {
		var str = document.getElementById('password_repeat').value;
		var str1 = document.getElementById('password_').value;
		//console.log(str == str1);
		if(str != str1) {
			password_repeat = false;
			$('#failbox').show().text('password_repeat NOT match').fadeOut(4000);
			return false;
		}
		else {
			password_repeat = true;
			return true;
		}
	}
	async function ajaxHandler() {
		if(!checkPassword())
			return;
		else if(!checkTel())
			return;
		else if(!checkEmail())
			return;
		else if(!checkPasswordRepeat())
			return;
		var username = $('#user').text();
		var password = document.getElementById('password_').value;
		var tel = document.getElementById('tel_').value;
		var email = document.getElementById('email_').value;
		var user_info = {
			data : 'setting',
			username : username,
			password : password,
			tel : tel,
			email : email 
		}
		var url = '/' + $('#user').text();
		try {
			let res = await $.ajax(url, {
				type : 'POST',
				dataType : 'json',
				data : user_info 
			});
			//alert(res.reason);
			if(res.state == 'success' && res.reason == 'none') {
				alert('user info changed successfully');
				window.location.href = '/' + $('#user').text();
			}
			else {
				switch(res.reason) {
					case 'tel' : alert('tel has been registed.');break;
					case 'email' : alert('email has been registed.');break;
					default : alert('unknown mistake.');break;
				}
			}
		}
		catch(err) {
			alert('cannot connect to the server.');
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