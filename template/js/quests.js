var Quest_box = {
	item_stats: [], // Cтаты всех предметов награды
	strings: '', // i18n
	
	// Отрисовка наград квеста (предметы)
	reward_load: function(quest_id) {
		var rewards = (typeof QUEST_REWARDS_DATA !== 'undefined') ? QUEST_REWARDS_DATA[quest_id] : null;

		if (!rewards || !rewards.length)
			return;

		var item_html = function(item) {
			return "<div class='quest_quest_reward_item quest_quest_reward_item_float'><div class='quest_quest_reward_item_icon'><div class='quest_quest_reward_item_icon_' style='background-image: url(/template/images/items/"+item.icon+".png);'></div></div><div class='quest_quest_reward_item_name'>"+item.name+((item.amount > 1) ? ' &times;'+item.amount : '')+"</div></div>";
		};

		var auto_items = [], select_items = [];

		for (var i = 0; i < rewards.length; i++)
			(rewards[i].type == 'select' ? select_items : auto_items).push(rewards[i]);

		var content = '';

		for (var i = 0; i < auto_items.length; i++)
			content += item_html(auto_items[i]);

		if (select_items.length)
		{
			content += "<div class='quest_quest_reward_item_clear'></div><div class='quest_quest_rewards'>Choose one:</div>";

			for (var i = 0; i < select_items.length; i++)
				content += item_html(select_items[i]);
		}

		$('.quest_rewards').html(content);
	},
	
	// Тултип предмета
	item_show: function(handler) {
		for (var i in this.item_stats)
		{
			if (!(this.item_stats).hasOwnProperty(i))
				continue;
			
			if (this.item_stats[i]['id'] == handler.attr('id'))
			{
				for (var s in this.item_stats[i].stats)
				{
					if (!(this.item_stats[i].stats).hasOwnProperty(s))
						continue;
					
					var work_stat = this.item_stats[i].stats[s];
					
					var format_stat = work_stat[0]+work_stat[2]+work_stat[3]+((s == 6 || s == 7 || s == 10 || s == 11) ? 0 : work_stat[1])+work_stat[5];
					
					this.item_stats[i].stats[s][4] = Weaponry_box.format_stat(s, format_stat);
				}
				
				if (this.item_stats[i] != '')
					Weaponry_box.show_item(handler, false, this.item_stats[i]);
				
				break;
			}
		}
	},
	
	// Выбор локации, типа в квестах
	menu_select: function(handler, flag) {
		var id = handler.attr('id');
		var quest_ = 'type';
		
		if (flag)
			quest_ = 'location';
		
		$('img.quest_list_'+quest_+'_menu_select').attr('src', 'template/images/off.png');
		
		$('img.'+quest_+'_select_'+id).attr('src', 'template/images/on.png');
		
		$('#quest_'+quest_).val(id.substr(2));
	},
};

// Выбор локации, типа в квестах
$(document).on('click', 'li.loc_menu', function() { Quest_box.menu_select($(this), true); });
$(document).on('click', 'li.type_menu', function() { Quest_box.menu_select($(this), false); });

// Тултип предмета
$(document).on('mouseenter', 'div.quest_quest_reward_item_icon_', function() { Quest_box.item_show($(this)); });
$(document).on('mouseleave', 'div.quest_quest_reward_item_icon_', function() { ToolTip.hide(); });