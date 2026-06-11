var ToolTip = {
	// Показываем тултип
	show: function(handler, type, content) {
		type = type || false;

		$('table.tooltip_sheet').html(content);
		var $tooltip = $('#tooltip_div').show();
		var left = handler.offset().left+((type) ? 15 : 50);
		var top = handler.offset().top;
		this.position($tooltip, left, top);
	},

	show_item: function(handler, content) {
		$('table.tooltip_sheet').html(content);
		var $tooltip = $('#tooltip_div').show();
		this.position($tooltip, handler.offset().left, handler.offset().top+15);
	},

	// Posiciona o tooltip sem deixá-lo extrapolar a viewport
	position: function($tooltip, left, top) {
		var viewportRight = $(window).scrollLeft() + $(window).width();
		var viewportBottom = $(window).scrollTop() + $(window).height();

		if (left + $tooltip.outerWidth() > viewportRight)
			left = Math.max(0, viewportRight - $tooltip.outerWidth());
		if (top + $tooltip.outerHeight() > viewportBottom)
			top = Math.max(0, viewportBottom - $tooltip.outerHeight());

		$tooltip.css({ top: top+'px', left: left+'px' });
	},

	// Прячем тултип
	hide: function() {
		$('#tooltip_div').hide();
	},
};