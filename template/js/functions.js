// Active nav link
$(function() {
	var path = window.location.pathname.replace(/\/$/, '') || '/';
	$('.main_body_content_info_links a').each(function() {
		var href = $(this).attr('href').replace(/\/$/, '') || '/';
		if (path === href || (href !== '/' && path.indexOf(href) === 0))
			$(this).closest('.main_body_content_info_links').addClass('nav_active');
	});
});
