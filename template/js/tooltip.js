var ToolTip = {
	// Показываем тултип
	show: function(handler, type, content) {
		type = type || false;
		
		$('table.tooltip_sheet').html(content);
		$('#tooltip_div').show().css({ top: (handler.offset().top)+'px', left: (handler.offset().left+((type) ? 15 : 50))+'px' });
	},
	
	show_item: function(handler, content) {
		$('table.tooltip_sheet').html(content);
		$('#tooltip_div').show().css({ top: (handler.offset().top+15)+'px', left: handler.offset().left+'px' });
	},
	
	// Прячем тултип
	hide: function() {
		$('#tooltip_div').hide();
	},
};