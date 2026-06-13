// Active nav link
$(function() {
	var base = $('base').attr('href') || '/';
	var path = window.location.pathname;
	if (path.indexOf(base) === 0) path = path.slice(base.length);
	path = path.replace(/\/$/, '');

	$('.main_body_content_info_links a').each(function() {
		var href = $(this).attr('href').replace(/^\.\/?$/, '').replace(/\/$/, '');
		if (path === href || (href !== '' && path.indexOf(href + '/') === 0))
			$(this).closest('.main_body_content_info_links').addClass('nav_active');
	});
});
