var Buns_box = {
	// Статы
	span_ab_array: ['hp', 'mp', 'reghp', 'regmp', 'stats', 'exp', 'lant', 'drop'],
	
	stats: [0, 0, 0, 0, 0, 0, 0, 0],
	
	cash: [0, 0, 0, 0, 0],
	
	// Плюшки пета
	pet_ability: [
		[101, 0, 5, 10, ""],
		[116, 0, 6, 10, ""],
		[117, 0, 7, 10, ""],
		[998, 0, 2, 5, ""],
		[999, 0, 3, 5, ""],
		[123, 0, 1, 10, ""],
		[998, 0, 2, 5, ""],
		[999, 0, 3, 5, ""],	
		[122, 0, 0, 10, ""],
		[128, 0, 4, 10, ""]
	],
	
	// Плюшки гильдии
	union_ability: [
		['blessing', 0, 5, 10, ""],
		['smart', 0, 6, 10, ""],
		['skill', 0, 7, 10, ""],
		['power', 0, 4, 5, ""],
		['patience', 0, 0, 5, ""],
		['sharpen', 0, 1, 5, ""],
		['recovery', 0, 2, 10, ""],
		['concentration', 0, 3, 10, ""],
	],
	
	// Плюшки шопа
	cash_ability: [
		['Character_HP_Max', 0, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 40], ""],
		['Character_MP_Max', 0, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 40], ""],
		['Character_HP_Recovery', 0, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100], ""],
		['Character_MP_Recovery', 0, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100], ""],
		['Character_Stat_All', 0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20], ""],
		['Character_Exp_01', 0, 0, ""],
		['Monster_Money_01', 0, 0, ""],
		['Item_Drop_01', 0, 0, ""],
	],
	
	// Загрузка строк плюх в боковой панели
	load_default: function() {
		this.cash_ability[0][3] = 'HP|Increases maximum HP by +{0}%';
		this.cash_ability[1][3] = 'MP|Increases maximum MP by +{0}%';
		this.cash_ability[2][3] = 'HP Recovery|Increases HP recovery rate by +{0}%';
		this.cash_ability[3][3] = 'MP Recovery|Increases MP recovery rate by +{0}%';
		this.cash_ability[4][3] = 'Stats|Increases all stats by +{0}';
		this.cash_ability[5][3] = 'EXP|Increases EXP gained by +{0}%';
		this.cash_ability[6][3] = 'Lant|Increases Lant dropped by +{0}%';
		this.cash_ability[7][3] = 'Item Drop|Increases item drop rate by +{0}%';
	},
	
	// Загрузка строк плюшек
	load_s: function() {
		this.pet_ability[0][4] = 'EXP|Increases EXP gained';
		this.pet_ability[1][4] = 'Lant|Increases Lant dropped';
		this.pet_ability[2][4] = 'Item Drop|Increases item drop rate';
		this.pet_ability[3][4] = 'HP Recovery|Increases HP recovery rate';
		this.pet_ability[4][4] = 'MP Recovery|Increases MP recovery rate';
		this.pet_ability[5][4] = 'MP|Increases maximum MP';
		this.pet_ability[6][4] = 'HP Recovery|Increases HP recovery rate';
		this.pet_ability[7][4] = 'MP Recovery|Increases MP recovery rate';
		this.pet_ability[8][4] = 'HP|Increases maximum HP';
		this.pet_ability[9][4] = 'Stats|Increases all stats';

		this.union_ability[0][4] = 'EXP|Increases EXP gained';
		this.union_ability[1][4] = 'Lant|Increases Lant dropped';
		this.union_ability[2][4] = 'Item Drop|Increases item drop rate';
		this.union_ability[3][4] = 'Stats|Increases all stats';
		this.union_ability[4][4] = 'HP|Increases maximum HP';
		this.union_ability[5][4] = 'MP|Increases maximum MP';
		this.union_ability[6][4] = 'HP Recovery|Increases HP recovery rate';
		this.union_ability[7][4] = 'MP Recovery|Increases MP recovery rate';
	},
	
	// Загрузка всех плюх
	load: function(data) {
		var buns_link = data.split(',');
		
		var last_bun = 0; // id последней активной плюхи
		
		// Проставляем плюхи пета
		for (var i=0; i < this.pet_ability.length; i++)
		{
			if (buns_link[i] == 1) // Eсли плюха активна
			{
				this.pet_ability[i][1] = 1;
				this.stats[this.pet_ability[i][2]] += this.pet_ability[i][3];
				$('#pet_'+i).css("backgroundImage", "url('template/images/items/P_Function_"+this.pet_ability[i][0]+".png')");
				last_bun = i;
			}
		}
		
		if (last_bun > 0)
			$('#pet_0').attr('flag', 0);
		
		$('#pet_'+last_bun+', #pet_'+(last_bun+1)).attr('flag', 1);
		
		// Проставляем плюхи гильдии
		for (var i=0; i < this.union_ability.length; i++)
		{
			if (buns_link[i+10] == 1)
			{
				this.union_ability[i][1] = 1;
				this.stats[this.union_ability[i][2]] += this.union_ability[i][3];
				$('#guild_'+i).css("backgroundImage", "url('template/images/items/Guild_union_"+this.union_ability[i][0]+".png')");
			}
		}
		
		// Проставляем плюхи шопа
		for (var i=0; i < this.cash.length; i++)
		{
			var bun_cash_id = parseInt(buns_link[i+18]);
			
			this.cash_ability[i][1] = bun_cash_id;
			this.stats[i] += this.cash_ability[i][2][bun_cash_id];
			$('span.buns_cash_'+i+'_val').html(this.cash_ability[i][2][bun_cash_id]);
			$('#cash_'+i+'_'+bun_cash_id).addClass('ability_item_mall_stat_select');
		}
		
		// Вписываем статы в ячейки
		for (var i=0; i < this.span_ab_array.length; i++)
			$('#'+this.span_ab_array[i]+'_ab').val(this.stats[i]);
	},
	
	
	// Добавляем или убираем плюшку пета и гильдии
	active_ability: function(handler, type, action) {
		// Разрешено ли прокачивать плюху пету
		if (type == 0)
			if (handler.attr('flag') == 0)
				return false;
		
		var ability_id = handler.attr('id'); // pet_id плюхи
		
		var type_ability; // Какой массив используем пета или гильдии
		var img_ability; // Картинки плюх
		
		if (type == 0) // Если плюхи питомца
		{
			ability_id = ability_id.substr(4);
			type_ability = this.pet_ability;
			img_ability = 'P_Function_';
		}
		else // Если плюхи гильдии
		{
			ability_id = ability_id.substr(6);
			type_ability = this.union_ability;
			img_ability = 'Guild_union_';
		}
		
		ability_id = parseInt(ability_id); // id плюхи
		
		if (type_ability[ability_id][1] == ((action == 0) ? 0 : 1))
		{
			handler.css("backgroundImage", "url('template/images/items/"+img_ability+type_ability[ability_id][0]+((action == 0) ? '' : '_G')+".png')"); // Активируем картинку плюхи
			
			if (action == 0) // Добавляем плюху
			{
				type_ability[ability_id][1]++;
				this.stats[type_ability[ability_id][2]] += type_ability[ability_id][3];
				
				if (type == 0) {
					if (ability_id > 0)
						$('#pet_'+(ability_id-1)).attr('flag', 0);
					
					$('#pet_'+(ability_id+1)).attr('flag', 1);
				}
			}
			else // Убираем плюху
			{
				type_ability[ability_id][1]--;
				this.stats[type_ability[ability_id][2]] -= type_ability[ability_id][3];
				
				if (type == 0) {
					if (ability_id <= 9)
						$('#pet_'+(ability_id+1)).attr('flag', 0);
					
					if (ability_id > 0)
						$('#pet_'+(ability_id-1)).attr('flag', 1);
				}
			}
		}
		
		this.update_stats();
	},
	
	
	// Выбор шопной плюшки из меню
	active_cash: function(handler) {
		var buns_val = handler.attr('id').split('_');
		
		for (var i=0; i < this.cash_ability[buns_val[1]][2].length; i++)
			$('#cash_'+buns_val[1]+'_'+i).removeClass('ability_item_mall_stat_select');
		
		handler.addClass('ability_item_mall_stat_select');
		
		// Удаляем текущий стат шопа
		var now_bun_id = this.cash_ability[buns_val[1]][1];
		this.stats[buns_val[1]] -= this.cash_ability[buns_val[1]][2][now_bun_id];
		
		// Вписываем текущий стат шопа
		this.cash_ability[buns_val[1]][1] = parseInt(buns_val[2]);
		this.cash[buns_val[1]] = this.cash_ability[buns_val[1]][2][buns_val[2]];
		this.stats[buns_val[1]] += this.cash[buns_val[1]];
		
		$('span.buns_cash_'+buns_val[1]+'_val').html(this.cash[buns_val[1]]);
		
		this.update_stats();
	},
	
	// Обновляем линк статов
	update_stats: function() {
		for (var i=0; i < this.span_ab_array.length; i++)
			$('#'+this.span_ab_array[i]+'_ab').val(this.stats[i]);

		for (var m=0; m < this.stats.length; m++)
			$('span.buns_mall_'+m+'_val').html(this.stats[m]);
	},
	
	// Тултип плюх
	buns_show: function(handler) {
		var param = handler.attr('id').split('_');
		var bun_type;
		var reward_img;
		var obj_item;
		
		if (param[0] == 'pet')
		{
			bun_type = this.pet_ability[param[1]];
			reward_img = 'P_Function_';
			obj_item = this.pet_ability[param[1]][4].split('|');
		}
		else if (param[0] == 'guild')
		{
			bun_type = this.union_ability[param[1]];
			reward_img = 'Guild_union_';
			obj_item = this.union_ability[param[1]][4].split('|');
		}
		else if (param[0] == 'cash')
		{
			bun_type = this.cash_ability[param[1]];
			reward_img = 'Cash_';
			obj_item = this.cash_ability[param[1]][3].split('|');
			
			var cash_value = $('span.buns_cash_'+param[1]+'_val').html();
		}
		else if (param[0] == 'mall')
		{
			bun_type = this.cash_ability[param[1]];
			reward_img = 'Cash_';
			obj_item = this.cash_ability[param[1]][3].split('|');
			
			var cash_value = $('span.buns_mall_'+param[1]+'_val').html();
		}
		
		var tooltip_bun_content = "<tr valign='top'><td class='tooltip_icon'><img src='template/images/items/"+reward_img+bun_type[0]+".png' /></td>";
			tooltip_bun_content += "<td class='tooltip_name' style='color: #f8f6c5;'>"+jQuery.validator.format(obj_item[0]+' +{0}%', ((cash_value != undefined) ? cash_value : bun_type[3]))+"</td></tr>";
			tooltip_bun_content += "<tr class='tooltip_height'></tr><tr><td class='tooltip_effect_text' colspan='2'>"+((cash_value != undefined) ? jQuery.validator.format(obj_item[1], cash_value) : obj_item[1])+"</td></tr>";
		
		ToolTip.show(handler, false, tooltip_bun_content);
	},
};

// Добавляем плюшки пета и гильдии
$(document).on('click', 'div.pet_slot_select', function() { Buns_box.active_ability($(this), 0, 0); });
$(document).on('click', 'div.guild_slot_select', function() { Buns_box.active_ability($(this), 1, 0); });

// Убираем плюшки пета и гильдии
$(document).on('contextmenu', 'div.pet_slot_select', function() { Buns_box.active_ability($(this), 0, 1); return false; });
$(document).on('contextmenu', 'div.guild_slot_select', function() { Buns_box.active_ability($(this), 1, 1); return false; });

// Выбираем плюшку из меню шопа
$(document).on('click', 'span.ability_item_mall_stat', function() { Buns_box.active_cash($(this)); });

// Тултип плюх/чести
$(document).on('mouseenter', 'div.bun_show', function() { Buns_box.buns_show($(this));});
$(document).on('mouseleave', 'div.bun_show', function() { ToolTip.hide(); });