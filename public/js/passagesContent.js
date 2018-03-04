$(document).ready(function() {
	$('.new').hide();
	$('.passages-title').click(function() {
		var id = $(this).children()[1];
		//console.log($(id).text());
		url = $('.user').text() + '?options=passages&id=' + $(id).text();
		window.location.href = url;
	});
	$('#publish').click(function() { 
		$('.passages-title').hide();
		$('.new').show();
	});
	$('#submit').click(submit = async function() {
		$(this).unbind('click');
		let data = {};
		let date = new Date();
		data['time'] = date.toLocaleDateString() + date.toLocaleTimeString();
		data['title'] = document.getElementById('new-title').value;
		data['content'] = document.getElementById('new-content').value;
		data['username'] = $('#user').text();
		let url = $('.user').text() + '?options=passages';
		let res = await $.ajax(url, {
			type : 'POST',
			dataType : 'json',
			data : data
		});
		if(res.state == 'success') {
			alert('submit succeessfully!');
			$('#submit').click(submit);
			window.location.href = '/';
		} else {
			alert('connecting err');
		}
	});
});