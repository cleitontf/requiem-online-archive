// Автозаполнение полей авторизации
$(document).on('focus', 'input.uid, input.upassword',
	function() { 
		var handler = $(this); 
		
		if (handler.val() == 'Логин' || handler.val() == 'Login' || handler.val() == 'Пароль' || handler.val() == 'Password')
			handler.val(''); 
	}
);

// Active nav link
$(function() {
	var path = window.location.pathname.replace(/\/$/, '') || '/';
	$('.main_body_content_info_links a').each(function() {
		var href = $(this).attr('href').replace(/\/$/, '') || '/';
		if (path === href || (href !== '/' && path.indexOf(href) === 0))
			$(this).closest('.main_body_content_info_links').addClass('nav_active');
	});
});

// Проверка полей регистрации
function check_signup_input(input) {
	$.post('/ajax/signup/check', { input: input, value: $('#'+input).val() },
		function(data) {
			var obj = eval(data);
			
			$('#label_'+input).html("<img class='ajax_msg_img' src='template/images/"+obj.icon+".png' /> <span class='text_"+obj.icon+"'>"+obj.msg+"</span>");
		},
	"json");
}

// Рекаптча
function reload() {
	$('img.captcha').attr('src', '/captcha/'+getRandomArbitary(0, 25));
}

function getRandomArbitary(min, max) {
	return parseInt(Math.random() * (max - min) + min);
}

// Проверка полей восстановления пароля
function check_recover_input(input) {
	$.post('/ajax/recover/check', { input: input, value: $('#'+input).val() },
		function(data) {
			var obj = eval(data);
			
			$('#label_'+input).html("<img class='ajax_msg_img' src='template/images/"+obj.icon+".png' /> <span class='text_"+obj.icon+"'>"+obj.msg+"</span>");
		},
	"json");
}