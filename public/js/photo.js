$(document).ready(function() {
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
	$('#click1').click(function() {
		$('.upload').trigger('click');
	});
	let num = Number($('#photosNum').text());
	let user = $('#user').text();
	for(var i = 1; i <= num; i += 3) {

		var str = '<li class = "pic-li"><img src = "uploads/' + user + '/' + user + i.toString() + '.jpg" class = "user-pic"/>';
		//console.log(i);

		if(i + 1 > num) {
			str += '</li>'
			$('.pic-con').append(str);
			break;
		}
		str += '<img src = "uploads/' + user + '/' + user + (i + 1).toString() + '.jpg" class = "user-pic"/>';
		if(i + 2 > num) {
			str += '</li>'
			$('.pic-con').append(str);
			break;
		}
		str += '<img src = "uploads/' + user + '/' + user + (i + 2).toString() + '.jpg" class = "user-pic"/></li>';
		//console.log(str);
		$('.pic-con').append(str);
	}
});
	async function upImg(obj) {
	var imgFile = obj.files[0];
	var formData = new FormData();
	formData.append('avatar', imgFile);
	console.log('sdfasfd');
	let res = await $.ajax('/photos', {
		method : 'POST',
		contentType: false,
    	processData: false,
		data : formData
	});
}