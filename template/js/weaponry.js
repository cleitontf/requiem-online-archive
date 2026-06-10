var Weaponry_box = {
	avatar_race: 0, // Профессия персонажа
	avatar_race_name: 0, // Название профы персонажа
	avatar_level: 1, // Уровень персонажа
	max_level: 1, // Максимальные уровень персонажа
	avatar_sex: 0, // Пол персонажа
	item_slot: 0, // Слоты вещей 1-25
	item_status_slot: 0, // Текущий слот
	select_list: 0, // Текущий список
	select_list_count: 0, // Количество списков
	class_status_char: ['STR', 'DEX', 'CON', 'INT', 'MND', 'Move_Speed', 'Short_Damage', 'Short_Damage_Max', 'Long_Damage', 'Long_Damage_Max', 'Property_Damage', 'Property_Damage_Max', 'Critical_Rate', 'Skill_Critical_Rate', 'Critical_Damage', 'Skill_Critical_Damage', 'Hit_Rate', 'Attack_Speed', 'Casting_Speed', 'Melee_Defense', 'Range_Defense', 'Evasion_Rate', 'Block_Defense', 'Block_Rate', 'Resist_Water', 'Resist_Lighting', 'Resist_Fire', 'Resist_Wind', 'Resist_Curse', 'Resist_Holy', 'Water', 'Water_Max', 'Lighting', 'Lighting_Max', 'Fire', 'Fire_Max', 'Wind', 'Wind_Max', 'Curse', 'Curse_Max', 'Holy', 'Holy_Max', 'HP', 'MP', 'HP_Recovery', 'MP_Recovery'], // Статы
	filter_search_item: '', // Поиск предмета
	filter_search_xeon: '', // Поиск ксеона
	filter_grade_item: 0, // Качество предмета
	filter_grade_xeon: 0, // Качество ксеона
	
	// Базовые статы персонажа
	base_stats: [],
	
	// Cтаты всех предметов персонажа
	item_stats: [],
	
	// Список надетых сетов
	set_objects: [
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []],
		[0, 0, 0, []]
	],
	
	// Cтаты сетов
	set_stats: [],
	
	// Массив предметов из списка
	item_objects: [],
	
	// Массив ксеонов из списка
	xeon_objects: [],
	
	// Вещи на персонаже
	item_status: [
		'', // Правая рука
		'', // Левая рука
		'', // Панцирь
		'', // Штаны
		'', // Перчатки
		'', // Ботинки
		'', // Шлем
		'', // Плечи
		'', // Амулет
		'', // Пояс
		'', // Правая серьга
		'', // Левая серьга
		'', // Правый браслет
		'', // Левый браслет
		'', // Правое кольцо
		'', // Левое кольцо
		'', // Орнамент
		'', // Костюм
		''  // Патроны
	],
	
	strings: '', // i18n
	
	/////////////////////////////////////////////////////////////
	//						МЕНЮ                               //
	/////////////////////////////////////////////////////////////
	
	// Инициализация
	load: function(list_count) {
		var obj;
		var that = this;
		$.post('/ajax/weaponry/load', function(data) { obj = eval(data); }, "json")
		.always(function() {
			that.strings = obj.strings;
			that.max_level = obj.param[0];
			that.select_list_count = list_count;
			
			$('span.fitting_select_race, #character_race_hide').show();
		});
	},
	
	// Выбираем профессию
	select_race: function(race) {
		if (race >= 1 && race <= 38)
		{
			this.avatar_race = race;
			
			var min_level = 1;
			
			switch(race)
			{
				case 2:
				case 6:
				case 12:
				case 16:
				case 22:
				case 26:
				case 32:
				case 36:
					break;
				default:
					min_level = 50;
					break;
			}
			
			var avatar_level_obj = $('#avatar_level');
			
			while (min_level <= this.max_level)
			{
				avatar_level_obj.append($("<option value='"+min_level+"'>"+min_level+"</option>"));
				min_level++;
			}
			
			this.avatar_race_name = $.trim($('#r_'+this.avatar_race).text());
			
			$('span.fitting_select_race').html(this.strings[0]);
			$('span.fitting_select_level, #character_level_hide').show();
			$('#character_race_hide').html(this.avatar_race_name);
		}
	},
	
	// Выбираем уровень
	select_level: function(level) {
		if (level >= 1 && level <= this.max_level)
		{
			this.avatar_level = level;
			
			$('span.fitting_select_level').html(this.strings[1]);
			$('#character_level_hide').html(this.avatar_level);
			$('span.fitting_select_gender, #character_sex_hide').show();
		}
	},
	
	// Выбираем пол
	select_sex: function(sex) {
		if (sex == 1 || sex == 2)
		{
			this.avatar_sex = sex;
			
			$('span.fitting_select_gender').html(this.strings[2]);
			$('#character_sex_hide').html($('#g_'+this.avatar_sex).html());
			
			this.select_menu('', 1);
			
			var that = this;
			$.post('/ajax/weaponry/race', { c: this.avatar_race, l: this.avatar_level }, function(data) { that.base_stats = eval(data); }, "json")
			.always(function() {
				that.equip_items();
				
				$('#fitting_title_show').removeClass('module_action_title_').addClass('module_action_title');
				$('#fitting_sheet_show').show();
			});
		}
	},
	
	// Выбираем меню
	select_menu: function(handler, menu) {
		menu = menu || 99;
		
		var menu_id = (menu == 99) ? handler.attr('id').substr(10) : menu;
		
		// Определяем активное меню
		for (var i=0; i <= this.select_list_count; i++)
		{
			if (menu_id == i)
			{
				// Запоминаем активную вкладку
				this.select_list = i;
				
				$('#select_menu_'+i).removeClass('display_none');
				$('#menu_link_'+i).addClass('fitting_content_menu_link_select');
				$('#menu_line_'+i).addClass('update_line_select');
				
				// Убираем всё лишнее дабы не вызвать ошибок
				if (menu_id == 1)
				{
					var select_menu_string = "";
					
					for (var sm = 2; sm < this.select_list_count; sm++)
						select_menu_string += ((sm == 2) ? "" : ", ")+"#select_menu_"+sm;
					
					$(select_menu_string).html('');
				}
			}
			else
			{
				$('#select_menu_'+i).addClass('display_none');
				$('#menu_link_'+i).removeClass('fitting_content_menu_link_select');
				$('#menu_line_'+i).removeClass('update_line_select');
			}
		}
		
		// Выбранное меню
		var selected_list = $('#select_menu_'+this.select_list);
		
		if (this.select_list == 1) // Вещи
		{
			if (this.item_status_slot == 0)
				selected_list.html("<div class='fitting_message module_action_title_'>"+this.strings[4]+"</div>");
		}
		else if (this.select_list == 2) // Зачарование
		{
			// Если слот не пустой
			if (this.item_status[this.item_status_slot] != '')
			{
				// Проверяем усиливается ли предмет
				if (this.item_status[this.item_status_slot].enchant.enchant_max == 0)
					selected_list.html("<div class='fitting_message module_action_title_'>"+this.strings[5]+"</div>");
				else
					this.search_xeons(this.filter_search_xeon, this.filter_grade_xeon, 3, 0);
			}
			else
			{
				selected_list.html("<div class='fitting_message module_action_title_'>"+this.strings[6]+"</div>");
			}
		}
		else if (this.select_list == 3) // Модификация
		{
			// Если слот не пустой
			if (this.item_status[this.item_status_slot] != '')
			{
				var mod_item = this.item_status[this.item_status_slot].modification.stats;
				
				if (typeof(mod_item) != null && mod_item.length != 0)
				{
					var content = "<div class='fitting_mod_stat_title module_action_title_'>"+this.strings[40]+": <select class='fitting_value_rand_stat' onChange='Weaponry_box.modification_stat($(this).val());'>";
					
					for (var s=0; s <= 100; s+=10)
						content += "<option value='"+s+"'"+((s == this.item_status[this.item_status_slot].modification.percent) ? " selected" : "")+">"+s+"</option>";
					
					content += "</select> %</div><div class='module_sheet_captain'><div class='fitting_mod_name'>"+this.strings[7]+"</div><div class='fitting_mod_val'>"+this.strings[9]+"</div></div>";
					
					for (var m_s in mod_item)
					{
						if (!mod_item.hasOwnProperty(m_s))
							continue;
						
						content += "<div class='module_sheet_body_'><div class='fitting_mod_name'>"+mod_item[m_s][3]+":</div><div class='fitting_mod_val'><input class='fitting_mod_input' id='mod_"+m_s+"' type='text' maxlength='4' value='"+mod_item[m_s][1]+"' />(0-"+mod_item[m_s][2]+")"+this.stat_same_end(mod_item[m_s][0])+"</div></div><div class='list_separator'></div>";
					}
					
					selected_list.html(content);
				}
				else
				{
					selected_list.html("<div class='fitting_message module_action_title_'>"+this.strings[10]+"</div>");
				}
			}
			else
			{
				selected_list.html("<div class='fitting_message module_action_title_'>"+this.strings[11]+"</div>");
			}
		}
		else if (this.select_list == 4) // Усиление
		{
			// Если слот не пустой
			if (this.item_status[this.item_status_slot] != '')
			{
				if (this.item_status[this.item_status_slot].upgrade.max > 0)
				{
					var content = "<div class='module_sheet_captain'><div class='fitting_reinf_plus'>&nbsp;</div><div class='fitting_reinf_other'>"+this.strings[12]+"</div><div class='fitting_reinf_other_'>"+this.strings[13]+"</div><div class='fitting_reinf_other_'>"+this.strings[14]+"</div><div class='fitting_reinf_other_'>"+this.strings[15]+"</div><div class='fitting_reinf_last'>"+this.strings[16]+"</div></div>";

					for (var u=0; u <= this.item_status[this.item_status_slot].upgrade.max; u++)
					{
						content += "<div class='module_sheet_body_"+(u == this.item_status[this.item_status_slot].upgrade.plus ? ' module_sheet_body_select' : '')+"' onClick='Weaponry_box.plus_add($(this), "+u+");'><div class='fitting_reinf_plus'>"+u+"</div>";
						
						if (u != 0)
						{
							var upgrades = this.item_status[this.item_status_slot].upgrades;
							
							content += "<div class='fitting_reinf_other'>"+upgrades[u].success+"%</div><div class='fitting_reinf_other'>"+upgrades[u].failure+"%</div><div class='fitting_reinf_other'>"+upgrades[u].failure_count+"</div><div class='fitting_reinf_other'>"+upgrades[u].broken+"%</div><div>"+upgrades[u].money+"</div>";
						}
						
						content += "</div><div class='list_separator'></div>";
					}
					
					selected_list.html(content);
				}
				else
				{
					selected_list.html("<div class='fitting_message module_action_title_'>"+this.strings[17]+"</div>");
				}
			}
			else
			{
				selected_list.html("<div class='fitting_message module_action_title_'>"+this.strings[18]+"</div>");
			}
		}
	},
	
	// Кликаем на слот
	slot_select: function(handler) {
		// Промежуточный выбранный слот
		var none_item_status_slot = parseInt(handler.attr('slot_status'));
		
		// Если одета двуручка и тыкаем на щит, сразу выходим
		if (none_item_status_slot == 1)
		{
			if (this.item_status[0] != '')
			{
				if (this.item_status[0].hand == 2)
					return;
			}
		}
		
		// Разбираемся с рамками
		$('div.fitting_slot_border').removeClass('fitting_slot_border_hover');
		handler.addClass('fitting_slot_border_hover');
		
		// Запоминаем выбранный слот
		this.item_status_slot = none_item_status_slot;
		
		// Запоминаем индекс слота
		this.item_slot = parseInt(handler.attr('slot_id'));
		
		// Ищем вещи в слот
		this.search_items(this.filter_search_item, this.filter_grade_item, 1, 0);
		
		// Если слот не пустой
		if (this.item_status[this.item_status_slot] != '')
		{
			this.select_menu('', this.select_list);
		}
		// Выбираем вкладку Вещи
		else
		{
			this.select_menu('', 1);
		}
	},
	
	// Отображаем слоты у предмета
	enchant_slot: function(slot, type) {
		for (var e=0; e < this.item_status[slot].enchant.enchant_max; e++)
		{
			if (type)
			{
				$('#enchant_slot_'+slot+'_'+e).show();
			}
			else
			{
				$('#enchant_xeon_'+slot+'_'+e).attr('src', 'template/images/fitting/xeon_slot_shadow.png');
				$('#enchant_slot_'+slot+'_'+e).hide();
			}
		}
	},
	
	
	/////////////////////////////////////////////////////////////
	//						ПРЕДМЕТЫ                           //
	/////////////////////////////////////////////////////////////
	
	
	// Ищем вещи
	search_items: function(item_name, grade, order, limit) {
		this.filter_search_item = item_name;
		this.filter_grade_item = grade;
		
		var list = $('#select_menu_1');
		list.html("<div class='module_message'><img src='template/images/waiting.gif' /> "+this.strings[19]+"</div>");
		
		var objs;
		var that = this;
		$.post('/ajax/weaponry/items', { c: this.avatar_race, lv: this.avatar_level, s: this.item_slot, o: order, n: item_name, g: grade, l: limit }, function(data) { objs = eval(data); }, "json")
		.always(function() {
			var content = "";
			
			if (objs.flag == undefined)
			{
				that.item_objects = objs.items;
				
				content += that.filter(objs.name, true)+"<div class='module_sheet_captain'><div class='fitting_item_icon'>&nbsp;</div><div class='fitting_item_name'><a class='itemlist_header_left"+((objs.order == 2 || objs.order == 3) ? '_ordered' : '')+"' href='"+objs.url_site+"' onClick='Weaponry_box.search_items($(\"input.in_item_name\").val(), $(\"select.in_item_grade\").val(), "+((objs.order == 2) ? 3 : 2)+", 0); return false;'>"+that.strings[20]+((objs.order == 2 || objs.order == 3) ? '&#96'+((objs.order == 2) ? 5 : 6)+'0;' : '')+"</a></div><div class='fitting_item_level'><a class='itemlist_header_left"+((objs.order == 0 || objs.order == 1) ? '_ordered' : '')+"' href='"+objs.url_site+"' onClick='Weaponry_box.search_items($(\"input.in_item_name\").val(), $(\"select.in_item_grade\").val(), "+((objs.order == 0) ? 1 : 0)+", 0); return false;'>"+that.strings[21]+((objs.order == 0 || objs.order == 1) ? '&#96'+((objs.order) == 0 ? 5 : 6)+'0;' : '')+"</a></div></div>";
				
				if (that.item_objects.length == 0)
				{
					content += "<div class='module_sheet_body_ module_action_msg'>"+that.strings[22]+"</div>";
				}
				else
				{
					for (var i=0; i < that.item_objects.length; i++)
					{
						content += "<div class='module_sheet_body' style='color: #"+that.item_objects[i].grade+";'><div class='fitting_item_icon'><img class='itemlist_icon_image' src='template/images/items/"+that.item_objects[i].icon+".png' /></div><div class='fitting_item_name'><a class='itemlist_name_link' id='"+that.item_objects[i].id+"'><span id='i_e_"+that.item_objects[i].id+"'></span> "+that.item_objects[i].name+"</a></div><div class='fitting_item_level'>"+that.item_objects[i].level[0]+"</div></div><div class='list_separator'></div>";
					}
				}
				
				content += "<div class='pagination_list'>"+objs.pagination+"</div>";
			}
			else
			{
				content += "<div class='module_message'>"+that.strings[23]+"</div>";
				setTimeout(function() { that.search_items('', 0, 1, 0); }, 1000);
			}
			
			list.html(content);
		});
	},
	
	// Плюсим предмет
	plus_add: function(handler, plus) {
		// Выделяем строку плюса
		$('div.module_sheet_body_').removeClass('module_sheet_body_select');
		handler.addClass('module_sheet_body_select');
		
		// Записываем плюс в предмете
		this.item_status[this.item_status_slot].upgrade.plus = ((plus >= 0 && plus <= this.item_status[this.item_status_slot].upgrade.max) ? plus : this.item_status[this.item_status_slot].upgrade.max);
		
		// Плюсим статы в предмете
		this.stat_form(this.item_status[this.item_status_slot].upgrade.stats, 1, true, null, plus);
		
		// Костыль undefined статов при плюсовке
		for (var undef_stat_id in this.item_status[this.item_status_slot].stats)
		{
			if (!(this.item_status[this.item_status_slot].stats).hasOwnProperty(undef_stat_id))
				continue;
			
			if (this.item_status[this.item_status_slot].stats[undef_stat_id][6] == undefined)
			{
				this.item_status[this.item_status_slot].stats[undef_stat_id][6] = this.item_status[this.item_status_slot].undefined_stats[undef_stat_id];
			}
		}
		
		// Пересчитываем статы
		this.equip_stat_items();
		
		this.equip_items();
	},
	
	// Одеваем предмет
	equip_item: function(handler) {
		var id = parseInt(handler.attr('id'));
		
		if (this.item_status[this.item_status_slot] != '')
		{
			// Убираем слоты у предмета
			if (this.item_status[this.item_status_slot] != '')
				this.enchant_slot(this.item_status_slot, false);
			
			// Если снимаемый предмет сетовый
			if (this.item_status[this.item_status_slot].set.id != undefined)
				this.set_equip(this.item_status[this.item_status_slot].set.id, false);
		}
		
		for (var i=0; i < this.item_objects.length; i++)
		{
			// Ищем выбранный предмет
			if (this.item_objects[i].id == id)
			{
				// Если одет щит, не даём одеть двуручку
				if (this.item_status_slot == 0)
				{
					if (this.item_status[1] != '')
					{
						if (this.item_objects[i].hand == 2)
						{
							$('#weapon_slot_1').addClass('c_is_pe');
							setTimeout(function() { $('#weapon_slot_1').removeClass('c_is_pe'); }, 1000);
							return;
						}
					}
				}
				
				// Записываем предмет
				this.item_status[this.item_status_slot] = this.item_objects[i];
				
				// Если надеваемый предмет сетовый
				if (this.item_status[this.item_status_slot].set.id != undefined)
					this.set_equip(this.item_status[this.item_status_slot].set.id, true);
				
				// Правая рука
				if (this.item_status_slot == 0)
				{
					var two_hand = $('#slot_1');
					
					// Если двуручка, дублируем иконку в левую руку
					if (this.item_status[this.item_status_slot].hand == 2)
					{
						two_hand.attr('src', 'template/images/items/'+this.item_status[this.item_status_slot].icon+'.png').css('opacity',0.6);
					}
					// Если одноручка, возвращаем прозрачность и убираем дублёра
					else
					{
						if (this.item_status[1] == '')
							two_hand.attr('src', 'template/images/fitting/C_S_2.png').css('opacity', 1);
					}
				}
				
				// Ставим иконку предмета
				$('#slot_'+this.item_status_slot).attr('src', 'template/images/items/'+this.item_status[this.item_status_slot].icon+'.png');
				
				// Отображаем слоты у предмета
				this.enchant_slot(this.item_status_slot, true);				
				
				// Пересчитываем статы
				this.equip_stat_items();
				
				this.equip_items();
				
				break;
			}
		}
	},
	
	// Снимаем предмет
	remove_item: function(handler) {
		// Определяем выбранный слот
		var slot_status = parseInt(handler.attr('slot_status'));
		
		// Если надета двуручка и пытаемся снять дублёр, выходим
		if (slot_status == 1)
		{
			if (this.item_status[0] != '')
			{
				if (this.item_status[0].hand == 2)
					return false;
			}
		}
		
		// Если слот не пустой
		if (this.item_status[slot_status] != '')
		{
			// Убираем слоты у предмета
			this.enchant_slot(slot_status, false);
			
			// Если снимаемый предмет сетовый
			if (this.item_status[slot_status].set.id != undefined)
				this.set_equip(this.item_status[slot_status].set.id, false);
			
			// Убираем картинку предмета
			$('#slot_'+slot_status).attr('src', 'template/images/fitting/C_S_'+handler.attr('slot_id')+'.png');
			
			// Если была одета двуручка убираем дублёр
			if (this.item_status[slot_status].hand == 2)
				$('#slot_1').attr('src', 'template/images/fitting/C_S_2.png').css('opacity', 1);
			
			// Прячем тултип
			ToolTip.hide();
			
			// Переключаемся на вкладку вещей
			this.select_menu('', 1)
				
			// Чистим массив предмета
			this.item_status[slot_status] = '';
			
			// Возвращаем базовую скорость атаки
			this.base_stats.stats[17] = 200;
			
			// Пересчитываем статы
			this.equip_stat_items();
			
			this.equip_items();
		}
	},
	
	// Создаём тултип предмета
	item_show: function(handler, type) {
		// Предмет из списка
		if (type)
		{
			for (var x=0; x < this.item_objects.length; x++)
			{
				if (this.item_objects[x].id == parseInt(handler.attr('id')))
				{
					this.equip_stat_items(true);
					
					this.show_item(handler, type, this.item_objects[x]);
					
					break;
				}
			}
		}
		// Надетый Предмет
		else
		{
			var item_slot = this.item_status[handler.attr('slot_status')];
			
			if (item_slot != '')
				this.show_item(handler, type, item_slot);
		}
	},
	
	// Тултип предмета
	show_item: function(handler, type, obj_item) {
		var tooltip_item_content = "<tr valign='top'><td class='tooltip_icon' rowspan='2'><img src='template/images/items/"+obj_item.icon+".png' /></td>";
		tooltip_item_content += "<td class='tooltip_name' style='color: #"+obj_item.grade+";'>"+((obj_item.upgrade != undefined && obj_item.upgrade.plus > 0) ? '+'+obj_item.upgrade.plus : '')+" "+obj_item.name+"</td>";
		tooltip_item_content += "<td align='right' style='color: #"+obj_item.grade+";'>"+obj_item.grade_name+"</td></tr>";
		tooltip_item_content += "<tr valign='top'><td class='tooltip_white_text'>"+((obj_item.slot != undefined) ? obj_item.slot : '')+"</td>";
		tooltip_item_content += "<td class='tooltip_white_text' align='right'>"+obj_item.kind_name+"</td></tr>";
		((obj_item.description != '' && obj_item.description != '0') ? tooltip_item_content += "<tr><td class='tooltip_effect_text' colspan='3'>"+obj_item.description+"</td></tr>" : '');
		((obj_item.decompose != "") ? tooltip_item_content += "<tr><td class='tooltip_effect_text' colspan='3'>"+obj_item.decompose+"</td></tr>" : '');
		((obj_item.stats[6] != undefined && obj_item.stats[7] != undefined) ? tooltip_item_content += "<td class='tooltip_option_yellow_text' colspan='2'>"+this.strings[38]+" "+obj_item.stats[6][4]+" - "+obj_item.stats[7][4]+"</td>" : '');
		((obj_item.stats[46] != undefined) ? tooltip_item_content += "<td class='tooltip_option_yellow_text' align='right'>"+obj_item.stats[46][6]+" "+obj_item.stats[46][4]+"</td></tr>" : '');
		
		if (obj_item.kind == 80)
		{
			((obj_item.stats[47] != undefined) ? tooltip_item_content += "<tr><td class='tooltip_option_yellow_text' colspan='3'>"+obj_item.stats[47][6]+" +"+obj_item.stats[47][4]+"%</td></tr>" : '');
			((obj_item.stats[48] != undefined) ? tooltip_item_content += "<tr><td class='tooltip_option_yellow_text' colspan='3'>"+obj_item.stats[48][6]+" +"+obj_item.stats[48][4]+"%</td></tr>" : '');
		}
		else
		{
			((obj_item.stats[6] != undefined && (obj_item.stats[6][2] > 0 || obj_item.stats[6][5] > 0)) ? tooltip_item_content += "<tr><td class='tooltip_enchant_text' colspan='3'>"+obj_item.stats[6][6]+" +"+this.format_stat(6, (obj_item.stats[6][2]+obj_item.stats[6][5]))+"</td></tr>" : '');
			((obj_item.stats[7] != undefined && (obj_item.stats[7][2] > 0 || obj_item.stats[7][5] > 0)) ? tooltip_item_content += "<tr><td class='tooltip_enchant_text' colspan='3'>"+obj_item.stats[7][6]+" +"+this.format_stat(7, (obj_item.stats[7][2]+obj_item.stats[7][5]))+"</td></tr>" : '');
		}
		
		((obj_item.stats[6] != undefined && obj_item.stats[6][1] > 0) ? tooltip_item_content += "<tr><td class='tooltip_option_yellow_text' colspan='3'>"+this.strings[38]+" +"+this.format_stat(6, obj_item.stats[6][1])+" - +"+this.format_stat(7, obj_item.stats[7][1])+"</td></tr>" : '');
		((obj_item.stats[10] != undefined && obj_item.stats[11] != undefined) ? tooltip_item_content += "<tr><td class='tooltip_option_yellow_text' colspan='3'>"+this.strings[39]+" "+obj_item.stats[10][4]+" - "+obj_item.stats[11][4]+"</td></tr>" : '');
		((obj_item.stats[10] != undefined && obj_item.stats[10][2] > 0) ? tooltip_item_content += "<tr><td class='tooltip_enchant_text' colspan='3'>"+obj_item.stats[10][6]+" +"+this.format_stat(10, obj_item.stats[10][2])+"</td></tr>" : '');
		((obj_item.stats[11] != undefined && obj_item.stats[11][2] > 0) ? tooltip_item_content += "<tr><td class='tooltip_enchant_text' colspan='3'>"+obj_item.stats[11][6]+" +"+this.format_stat(11, obj_item.stats[11][2])+"</td></tr>" : '');
		((obj_item.stats[10] != undefined && obj_item.stats[10][1] > 0) ? tooltip_item_content += "<tr><td class='tooltip_option_yellow_text' colspan='3'>"+this.strings[39]+" +"+this.format_stat(10, obj_item.stats[10][1])+" - +"+this.format_stat(11, obj_item.stats[11][1])+"</td></tr>" : '');
		((obj_item.stats[19] != undefined && obj_item.stats[19][4] > 0) ? tooltip_item_content += "<tr><td class='tooltip_option_yellow_text' colspan='3'>"+obj_item.stats[19][6]+": "+obj_item.stats[19][4]+" "+((obj_item.stats[19][1] > 0) ? '(+'+this.format_stat(19, obj_item.stats[19][1])+')' : '')+" "+((obj_item.stats[19][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(19, obj_item.stats[19][2])+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[20] != undefined && obj_item.stats[20][4] > 0) ? tooltip_item_content += "<tr><td class='tooltip_option_yellow_text' colspan='3'>"+obj_item.stats[20][6]+": "+obj_item.stats[20][4]+" "+((obj_item.stats[20][1] > 0) ? '(+'+this.format_stat(20, obj_item.stats[20][1])+')' : '')+" "+((obj_item.stats[20][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(20, obj_item.stats[20][2])+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[22] != undefined && obj_item.stats[22][4] > 0) ? tooltip_item_content += "<tr><td class='tooltip_option_yellow_text' colspan='3'>"+obj_item.stats[22][6]+": "+obj_item.stats[22][4]+" "+((obj_item.stats[22][1] > 0) ? '(+'+obj_item.stats[22][1]+')' : '')+" "+((obj_item.stats[22][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[22][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[23] != undefined && obj_item.stats[23][4] > 0) ? tooltip_item_content += "<tr><td class='tooltip_option_yellow_text' colspan='3'>"+obj_item.stats[23][6]+": "+obj_item.stats[23][4]+"% "+((obj_item.stats[23][1] > 0) ? '(+'+this.format_stat(23, obj_item.stats[23][1])+'%)' : '')+" "+((obj_item.stats[23][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(23, obj_item.stats[23][2])+'%)</span>' : '')+"</td></tr>" : '');
		tooltip_item_content += "<tr class='tooltip_height'></tr>";
		((obj_item.stats[0] != undefined && obj_item.stats[0][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[0][6]+": "+obj_item.stats[0][4]+" "+((obj_item.stats[0][1] > 0) ? '(+'+obj_item.stats[0][1]+')' : '')+" "+((obj_item.stats[0][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[0][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[1] != undefined && obj_item.stats[1][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[1][6]+": "+obj_item.stats[1][4]+" "+((obj_item.stats[1][1] > 0) ? '(+'+obj_item.stats[1][1]+')' : '')+" "+((obj_item.stats[1][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[1][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[2] != undefined && obj_item.stats[2][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[2][6]+": "+obj_item.stats[2][4]+" "+((obj_item.stats[2][1] > 0) ? '(+'+obj_item.stats[2][1]+')' : '')+" "+((obj_item.stats[2][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[2][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[3] != undefined && obj_item.stats[3][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[3][6]+": "+obj_item.stats[3][4]+" "+((obj_item.stats[3][1] > 0) ? '(+'+obj_item.stats[3][1]+')' : '')+" "+((obj_item.stats[3][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[3][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[4] != undefined && obj_item.stats[4][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[4][6]+": "+obj_item.stats[4][4]+" "+((obj_item.stats[4][1] > 0) ? '(+'+obj_item.stats[4][1]+')' : '')+" "+((obj_item.stats[4][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[4][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[42] != undefined && obj_item.stats[42][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[42][6]+": "+obj_item.stats[42][4]+" "+((obj_item.stats[42][1] > 0) ? '(+'+obj_item.stats[42][1]+')' : '')+" "+((obj_item.stats[42][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[42][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[44] != undefined && obj_item.stats[44][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[44][6]+": "+obj_item.stats[44][4]+" "+((obj_item.stats[44][1] > 0) ? '(+'+obj_item.stats[44][1]+')' : '')+" "+((obj_item.stats[44][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[44][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[43] != undefined && obj_item.stats[43][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[43][6]+": "+obj_item.stats[43][4]+" "+((obj_item.stats[43][1] > 0) ? '(+'+obj_item.stats[43][1]+')' : '')+" "+((obj_item.stats[43][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[43][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[45] != undefined && obj_item.stats[45][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[45][6]+": "+obj_item.stats[45][4]+" "+((obj_item.stats[45][1] > 0) ? '(+'+obj_item.stats[45][1]+')' : '')+" "+((obj_item.stats[45][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[45][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[17] != undefined && obj_item.stats[17][4] != 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[17][6]+": "+obj_item.stats[17][4]+"%</td></tr>" : '');
		((obj_item.stats[18] != undefined && obj_item.stats[18][4] != 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[18][6]+": "+obj_item.stats[18][4]+"%</td></tr>" : '');
		((obj_item.stats[5] != undefined && obj_item.stats[5][4] != 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[5][6]+": +"+obj_item.stats[5][4]+"%</td></tr>" : '');
		((obj_item.stats[16] != undefined && obj_item.stats[16][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[16][6]+": "+obj_item.stats[16][4]+" "+((obj_item.stats[16][1] > 0) ? '(+'+obj_item.stats[16][1]+')' : '')+" "+((obj_item.stats[16][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[16][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[21] != undefined && obj_item.stats[21][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[21][6]+": "+obj_item.stats[21][4]+" "+((obj_item.stats[21][1] > 0) ? '(+'+obj_item.stats[21][1]+')' : '')+" "+((obj_item.stats[21][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[21][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[12] != undefined && obj_item.stats[12][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[12][6]+": "+obj_item.stats[12][4]+"% "+((obj_item.stats[12][1] > 0) ? '(+'+this.format_stat(12, obj_item.stats[12][1])+'%)' : '')+" "+((obj_item.stats[12][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(12, obj_item.stats[12][2])+'%)</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[13] != undefined && obj_item.stats[13][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[13][6]+": "+obj_item.stats[13][4]+"% "+((obj_item.stats[13][1] > 0) ? '(+'+this.format_stat(13, obj_item.stats[13][1])+'%)' : '')+" "+((obj_item.stats[13][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(13, obj_item.stats[13][2])+'%)</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[14] != undefined && obj_item.stats[14][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[14][6]+": "+obj_item.stats[14][4]+" "+((obj_item.stats[14][1] > 0) ? '(+'+obj_item.stats[14][1]+')' : '')+" "+((obj_item.stats[14][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[14][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[15] != undefined && obj_item.stats[15][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[15][6]+": "+obj_item.stats[15][4]+" "+((obj_item.stats[15][1] > 0) ? '(+'+obj_item.stats[15][1]+')' : '')+" "+((obj_item.stats[15][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[15][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[30] != undefined && obj_item.stats[30][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[30][6]+": "+obj_item.stats[30][4]+" "+((obj_item.stats[30][1] > 0) ? '(+'+obj_item.stats[30][1]+')' : '')+" "+((obj_item.stats[30][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[30][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[31] != undefined && obj_item.stats[31][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[31][6]+": "+obj_item.stats[31][4]+" "+((obj_item.stats[31][1] > 0) ? '(+'+obj_item.stats[31][1]+')' : '')+" "+((obj_item.stats[31][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[31][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[32] != undefined && obj_item.stats[32][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[32][6]+": "+obj_item.stats[32][4]+" "+((obj_item.stats[32][1] > 0) ? '(+'+obj_item.stats[32][1]+')' : '')+" "+((obj_item.stats[32][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[32][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[33] != undefined && obj_item.stats[33][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[33][6]+": "+obj_item.stats[33][4]+" "+((obj_item.stats[33][1] > 0) ? '(+'+obj_item.stats[33][1]+')' : '')+" "+((obj_item.stats[33][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[33][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[34] != undefined && obj_item.stats[34][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[34][6]+": "+obj_item.stats[34][4]+" "+((obj_item.stats[34][1] > 0) ? '(+'+obj_item.stats[34][1]+')' : '')+" "+((obj_item.stats[34][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[34][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[35] != undefined && obj_item.stats[35][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[35][6]+": "+obj_item.stats[35][4]+" "+((obj_item.stats[35][1] > 0) ? '(+'+obj_item.stats[35][1]+')' : '')+" "+((obj_item.stats[35][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[35][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[36] != undefined && obj_item.stats[36][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[36][6]+": "+obj_item.stats[36][4]+" "+((obj_item.stats[36][1] > 0) ? '(+'+obj_item.stats[36][1]+')' : '')+" "+((obj_item.stats[36][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[36][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[37] != undefined && obj_item.stats[37][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[37][6]+": "+obj_item.stats[37][4]+" "+((obj_item.stats[37][1] > 0) ? '(+'+obj_item.stats[37][1]+')' : '')+" "+((obj_item.stats[37][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[37][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[38] != undefined && obj_item.stats[38][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[38][6]+": "+obj_item.stats[38][4]+" "+((obj_item.stats[38][1] > 0) ? '(+'+obj_item.stats[38][1]+')' : '')+" "+((obj_item.stats[38][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[38][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[39] != undefined && obj_item.stats[39][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[39][6]+": "+obj_item.stats[39][4]+" "+((obj_item.stats[39][1] > 0) ? '(+'+obj_item.stats[39][1]+')' : '')+" "+((obj_item.stats[39][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[39][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[40] != undefined && obj_item.stats[40][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[40][6]+": "+obj_item.stats[40][4]+" "+((obj_item.stats[40][1] > 0) ? '(+'+obj_item.stats[40][1]+')' : '')+" "+((obj_item.stats[40][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[40][2]+')</span>' : '')+"</td></tr>" : '');			
		((obj_item.stats[41] != undefined && obj_item.stats[41][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[41][6]+": "+obj_item.stats[41][4]+" "+((obj_item.stats[41][1] > 0) ? '(+'+obj_item.stats[41][1]+')' : '')+" "+((obj_item.stats[41][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+obj_item.stats[41][2]+')</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[24] != undefined && obj_item.stats[24][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[24][6]+": "+obj_item.stats[24][4]+"% "+((obj_item.stats[24][1] > 0) ? '(+'+this.format_stat(24, obj_item.stats[24][1])+'%)' : '')+" "+((obj_item.stats[24][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(24, obj_item.stats[24][2])+'%)</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[25] != undefined && obj_item.stats[25][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[25][6]+": "+obj_item.stats[25][4]+"% "+((obj_item.stats[25][1] > 0) ? '(+'+this.format_stat(25, obj_item.stats[25][1])+'%)' : '')+" "+((obj_item.stats[25][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(25, obj_item.stats[25][2])+'%)</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[26] != undefined && obj_item.stats[26][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[26][6]+": "+obj_item.stats[26][4]+"% "+((obj_item.stats[26][1] > 0) ? '(+'+this.format_stat(26, obj_item.stats[26][1])+'%)' : '')+" "+((obj_item.stats[26][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(26, obj_item.stats[26][2])+'%)</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[27] != undefined && obj_item.stats[27][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[27][6]+": "+obj_item.stats[27][4]+"% "+((obj_item.stats[27][1] > 0) ? '(+'+this.format_stat(27, obj_item.stats[27][1])+'%)' : '')+" "+((obj_item.stats[27][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(27, obj_item.stats[27][2])+'%)</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[28] != undefined && obj_item.stats[28][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[28][6]+": "+obj_item.stats[28][4]+"% "+((obj_item.stats[28][1] > 0) ? '(+'+this.format_stat(28, obj_item.stats[28][1])+'%)' : '')+" "+((obj_item.stats[28][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(28, obj_item.stats[28][2])+'%)</span>' : '')+"</td></tr>" : '');
		((obj_item.stats[29] != undefined && obj_item.stats[29][4] > 0) ? tooltip_item_content += "<tr><td colspan='3'>"+obj_item.stats[29][6]+": "+obj_item.stats[29][4]+"% "+((obj_item.stats[29][1] > 0) ? '(+'+this.format_stat(29, obj_item.stats[29][1])+'%)' : '')+" "+((obj_item.stats[29][2] > 0) ? " <span class='tooltip_enchant_text'>(+"+this.format_stat(29, obj_item.stats[29][2])+'%)</span>' : '')+"</td></tr>" : '');
		((obj_item.enchant != undefined && obj_item.enchant.enchant_max > 0) ? tooltip_item_content += "<tr class='tooltip_height'></tr><tr><td class='tooltip_enchant_text' colspan='3'>"+obj_item.enchant.lang+" "+obj_item.enchant.enchanted+"/"+obj_item.enchant.enchant_max+"</td></tr>" : '');
		tooltip_item_content += "<tr class='tooltip_height'></tr>";
		((obj_item.skill.name != undefined) ? tooltip_item_content += "<tr valign='top'><td class='tooltip_icon' rowspan='2'><img src='template/images/skills/"+obj_item.skill.icon+".png' /></td><td class='tooltip_skill_name tooltip_white_text' colspan='2'>"+obj_item.skill.name+' Lv.'+obj_item.skill.level+"</td></tr><tr valign='top'><td class='tooltip_effect_text' colspan='2'>"+obj_item.skill.description+"</td></tr></tr>" : "");
		
		if (obj_item.set != undefined)
		{
			((obj_item.set.max_count > 0) ? tooltip_item_content += "<tr><td class='tooltip_set_name' colspan='3'>"+obj_item.set.name+' '+obj_item.set.count+'/'+obj_item.set.max_count+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[0] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= 1) ? '_active' : '')+"'><td class='tooltip_set_option'>1 Set</td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[0][2]+": "+this.format_stat(obj_item.set.stats[0][0], obj_item.set.stats[0][1])+this.stat_same_end(obj_item.set.stats[0][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[1] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= 2) ? '_active' : '')+"'><td class='tooltip_set_option'>2 Set</td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[1][2]+": "+this.format_stat(obj_item.set.stats[1][0], obj_item.set.stats[1][1])+this.stat_same_end(obj_item.set.stats[1][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[2] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= 3) ? '_active' : '')+"'><td class='tooltip_set_option'>3 Set</td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[2][2]+": "+this.format_stat(obj_item.set.stats[2][0], obj_item.set.stats[2][1])+this.stat_same_end(obj_item.set.stats[2][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[3] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= 4) ? '_active' : '')+"'><td class='tooltip_set_option'>4 Set</td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[3][2]+": "+this.format_stat(obj_item.set.stats[3][0], obj_item.set.stats[3][1])+this.stat_same_end(obj_item.set.stats[3][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[4] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= 5) ? '_active' : '')+"'><td class='tooltip_set_option'>5 Set</td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[4][2]+": "+this.format_stat(obj_item.set.stats[4][0], obj_item.set.stats[4][1])+this.stat_same_end(obj_item.set.stats[4][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[5] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= 6) ? '_active' : '')+"'><td class='tooltip_set_option'>6 Set</td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[5][2]+": "+this.format_stat(obj_item.set.stats[5][0], obj_item.set.stats[5][1])+this.stat_same_end(obj_item.set.stats[5][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[6] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= 7) ? '_active' : '')+"'><td class='tooltip_set_option'>7 Set</td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[6][2]+": "+this.format_stat(obj_item.set.stats[6][0], obj_item.set.stats[6][1])+this.stat_same_end(obj_item.set.stats[6][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[7] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= 8) ? '_active' : '')+"'><td class='tooltip_set_option'>8 Set</td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[7][2]+": "+this.format_stat(obj_item.set.stats[7][0], obj_item.set.stats[7][1])+this.stat_same_end(obj_item.set.stats[7][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[8] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= obj_item.set.max_count) ? '_active' : '')+"'><td class='tooltip_set_option'>Full set</td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[8][2]+": "+this.format_stat(obj_item.set.stats[8][0], obj_item.set.stats[8][1])+this.stat_same_end(obj_item.set.stats[8][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[9] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= obj_item.set.max_count) ? '_active' : '')+"'><td></td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[9][2]+": "+this.format_stat(obj_item.set.stats[9][0], obj_item.set.stats[9][1])+this.stat_same_end(obj_item.set.stats[9][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[10] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= obj_item.set.max_count) ? '_active' : '')+"'><td></td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[10][2]+": "+this.format_stat(obj_item.set.stats[10][0], obj_item.set.stats[10][1])+this.stat_same_end(obj_item.set.stats[10][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0 && obj_item.set.stats[11] != undefined) ? tooltip_item_content += "<tr class='tooltip_set_text"+((obj_item.set.count >= obj_item.set.max_count) ? '_active' : '')+"'><td></td><td class='tooltip_set_option_value' colspan='2'>"+obj_item.set.stats[11][2]+": "+this.format_stat(obj_item.set.stats[11][0], obj_item.set.stats[11][1])+this.stat_same_end(obj_item.set.stats[11][0])+"</td></tr>" : '');
			((obj_item.set.max_count > 0) ? tooltip_item_content += "<tr class='tooltip_height'></tr>" : '');
		}
		
		((obj_item.profession != undefined) ? tooltip_item_content += "<tr><td class='tooltip_white_text' colspan='3'>"+obj_item.profession+"</td></tr>" : '');
		((obj_item.level != undefined && obj_item.level[0] != 0) ? tooltip_item_content += "<tr><td class='tooltip_white_text' colspan='3'>"+obj_item.level[1]+" "+obj_item.level[0]+"</td></tr>" : '');
		((obj_item.durability != undefined && obj_item.durability[0] != 0) ? tooltip_item_content += "<tr><td class='tooltip_white_text' colspan='3'>"+obj_item.durability[1]+": "+obj_item.durability[0]+'/'+obj_item.durability[0]+'('+obj_item.durability[0]+")</td></tr>" : '');
		
		if (obj_item.battlefield != '' && obj_item.bf_buy != undefined && obj_item.bf_buy[0] != 0)
		{
			((obj_item.price_buy != undefined) ? tooltip_item_content += "<tr class='tooltip_height'></tr><tr><td class='tooltip_white_text' colspan='3'>"+obj_item.price_buy[1]+": "+obj_item.price_buy[0]+"</td></tr>" : '');
			
			tooltip_item_content += "<tr><td class='tooltip_white_text' colspan='3'>"+obj_item.battlefield+" "+obj_item.bf_buy[1]+": "+obj_item.bf_buy[0]+"</td></tr>";
		}
		
		tooltip_item_content += "<tr class='tooltip_height'></tr><tr><td class='tooltip_white_text' colspan='3'>"+obj_item.price_sell[1]+": "+obj_item.price_sell[0]+"</td></tr>";
		((obj_item.bf_sell != undefined && obj_item.bf_sell[0] != 0) ? tooltip_item_content += "<tr><td class='tooltip_white_text' colspan='3'>"+obj_item.battlefield+" "+obj_item.bf_sell[1]+": "+obj_item.bf_sell[0]+"</td></tr>" : '');
		
		if (type)
			ToolTip.show_item(handler, tooltip_item_content);
		else
			ToolTip.show(handler, type, tooltip_item_content);
	},
	
	
	/////////////////////////////////////////////////////////////
	//						СЕТЫ                               //
	/////////////////////////////////////////////////////////////
	
	
	// Одеваем/снимаем сет
	set_equip: function(obj_id, type) {
		var set_count = 0;
		
		// Считаем части сета
		for (var i=0; i < this.item_status.length-2; i++)
		{
			// Если предмет сетовый
			if (this.item_status[i].set != undefined)
			{
				// Если сет такой-же
				if (obj_id == this.item_status[i].set.id)
				{
					if (this.item_status[i].set.count >= set_count)
						set_count = this.item_status[i].set.count;
				}
			}
		}
		
		// Индекс сетового предмета
		var item_index = 0;
		
		// Одеваем/снимаем часть сета
		for (var i=0; i < this.item_status.length-2; i++)
		{
			// Если предмет сетовый
			if (this.item_status[i].set != undefined)
			{
				// Если сет такой-же
				if (obj_id == this.item_status[i].set.id)
				{
					item_index = i;
					
					this.item_status[i].set.count = (type) ? set_count+1 : set_count-1;
				}
			}
		}
		
		// Пустой слот
		var clear_slot = 0;
		
		// Ищем сет
		for (var s=0; s < this.set_objects.length; s++)
		{
			// Чистим пустые сеты
			if (this.set_objects[s][1] == 0)
				this.set_objects[s] = [0, 0, 0, 0];
			
			// Ищем пустой слот для сета
			if (this.set_objects[s][0] == 0)
				clear_slot = s;
			
			// Получаем значение коллекции сета
			if (this.set_objects[s][0] == obj_id)
			{
				this.set_objects[s][1] = this.item_status[item_index].set.count;
				
				// Считаем статы сета
				this.set_stats();
				
				return;
			}
		}
		
		// Если сет не был найден, добавляем
		this.set_objects[clear_slot] = [obj_id, 1, this.item_status[item_index].set.max_count, this.item_status[item_index].set.stats];
		
		// Считаем статы сета
		this.set_stats();
	},
	
	// Считаем статы сета
	set_stats: function() {
		// Чистим статы сетов	
		for (var i=0; i < 49; i++)
			this.set_stats[i] = 0;
		
		// Считаем
		for (var i=0; i < this.set_objects.length; i++)
		{
			if (this.set_objects[i][0] != 0)
			{
				for (var s in this.set_objects[i][3])
				{
					if (!(this.set_objects[i][3]).hasOwnProperty(s))
						continue;
					
					// Если сет не полный
					if (this.set_objects[i][1] < this.set_objects[i][2])
					{
						var set_index = parseInt(s)+1;
						
						if (set_index > this.set_objects[i][1])
							break;
					}
					
					this.set_stats[this.set_objects[i][3][s][0]] += this.set_objects[i][3][s][1];
				}
			}
		}
	},
	
	
	/////////////////////////////////////////////////////////////
	//						КСЕОНЫ                             //
	/////////////////////////////////////////////////////////////
	
	
	// Ищем ксеоны
	search_xeons: function(xeon_name, grade, order, limit) {
		this.filter_search_xeon = xeon_name;
		this.filter_grade_xeon = grade;
		
		var list = $('#select_menu_2');
		list.html("<div class='module_message'><img src='template/images/waiting.gif' /> "+this.strings[19]+"</div>");
		
		var that = this;
		var objs;
		// Формируем стат ксеона
		$.post('/ajax/weaponry/enchant', { s: this.item_status_slot, o: order, n: xeon_name, g: grade, l: limit }, function(data) { objs = eval(data); }, "json")
		.always(function() {
			var content = "";
			
			if (objs.flag == undefined)
			{
				// Записываем массив объектов ксеонов
				that.xeon_objects = objs.xeons;
				
				var xeons_line_width = that.item_status[that.item_status_slot].enchant.enchant_max * 44;
				
				content += "<div class='fitting_xeons_sheet' style='width: "+xeons_line_width+"px;'>";
				
				for (var i=0; i < that.item_status[that.item_status_slot].enchant.enchant_max; i++)
				{
					content += "<div class='fitting_xeon_border' xeon_status='"+i+"'><img id='xeon_"+i+"' class='fitting_xeon_img' src='template/images/"+((that.item_status[that.item_status_slot].xeons[i] == '') ? 'fitting/item_slot_shadow' : 'items/'+that.item_status[that.item_status_slot].xeons[i].icon)+".png' /></div>";
				}
				
				content += "</div>"+that.filter(objs.name, false)+"<div class='module_sheet_captain'><div class='fitting_xeon_icon'>&nbsp;</div><div class='fitting_xeon_name'><a class='xeonlist_header_left"+((objs.order == 0 || objs.order) == 1 ? '_ordered' : '')+"' href='"+objs.url_site+"' onClick='Weaponry_box.search_xeons($(\"input.in_xeon_name\").val(), $(\"select.in_xeon_grade\").val(), "+((objs.order == 0) ? 1 : 0)+", 0); return false;'>"+that.strings[24]+((objs.order == 0 || objs.order == 1) ? '&#96'+((objs.order == 0) ? 5 : 6)+'0;' : '')+"</a></div><div class='fitting_xeon_type'><a class='xeonlist_header_left"+((objs.order == 2 || objs.order) == 3 ? '_ordered' : '')+"' href='"+objs.url_site+"' onClick='Weaponry_box.search_xeons($(\"input.in_xeon_name\").val(), $(\"select.in_xeon_grade\").val(), "+((objs.order == 2) ? 3 : 2)+", 0); return false;'>"+that.strings[25]+((objs.order == 2 || objs.order == 3) ? '&#96'+((objs.order == 2) ? 5 : 6)+'0;' : '')+"</a></div></div>";
				
				if (that.xeon_objects.length == 0)
				{
					content += "<div class='module_sheet_body_ module_action_msg'>"+that.strings[22]+"</div>";
				}
				else
				{
					for (var x=0; x < that.xeon_objects.length; x++)
					{
						content += "<div class='module_sheet_body' style='color: #"+that.xeon_objects[x].grade+";'><div class='fitting_xeon_icon'><img class='itemlist_icon_image' src='template/images/items/"+that.xeon_objects[x].icon+".png' /></div><div class='fitting_xeon_name'><a class='xeonlist_name_link' id='"+that.xeon_objects[x].id+"'>"+that.xeon_objects[x].name+"</a></div></div><div class='list_separator'></div>";
					}
				}
				
				content += "<div class='pagination_list'>"+objs.pagination+"</div>";
			}
			else
			{
				content += "<div class='module_message'>"+that.strings[26]+"</div>";
				setTimeout(function() { that.search_xeons('', 0, 3, 0); }, 1000);
			}
			
			list.html(content);
			
			for (var i=0; i < 10; i++)
			{
				for (var s in that.xeon_objects[i].stats)
				{
					if (!(that.xeon_objects[i].stats).hasOwnProperty(s))
						continue;
					
					that.xeon_objects[i].stats[s][4] = that.format_stat(s, that.xeon_objects[i].stats[s][0]);
				}
			}
		});
	},
	
	// Вставляем ксеон в предмет
	add_xeon: function(handler) {
		for (var x=0; x < this.xeon_objects.length; x++)
		{
			// Ищем выбранную гамку
			if (this.xeon_objects[x].id == parseInt(handler.attr('id')))
			{
				var obj_xeon_stats = this.xeon_objects[x];	
				
				// Если втачиваемая гамка имеет баф
				if (obj_xeon_stats.skill.name != undefined)
				{
					for (var m=0; m < this.item_status[this.item_status_slot].enchant.enchant_max; m++)
					{
						if (this.item_status[this.item_status_slot].xeons[m] != '')
						{
							// Если нашли уже вточенную гамку с бафом
							if (this.item_status[this.item_status_slot].xeons[m].skill.name != undefined)
							{
								// Переписываем гамма-ксеон в предмете
								this.item_status[this.item_status_slot].xeons[m] = obj_xeon_stats;
								
								// Переписываем скилл в предмете
								this.item_status[this.item_status_slot].skill = obj_xeon_stats.skill;
								
								// Ставим иконку гамма-ксеона
								$('#xeon_'+m).attr('src', 'template/images/items/'+obj_xeon_stats.icon+'.png');
								
								// Ставим иконку гамма-ксеона на предмете
								$('#enchant_xeon_'+this.item_status_slot+'_'+m).attr('src', 'template/images/items/'+obj_xeon_stats.icon+'.png');
								
								return;
							}
						}
					}
				}
				
				// Втачиваем гамку в выбранный предмет
				for (var i=0; i < this.item_status[this.item_status_slot].enchant.enchant_max; i++)
				{
					// Если слот пустой, втачиваем
					if (this.item_status[this.item_status_slot].xeons[i] == '')
					{
						// Записываем гамма-ксеон в предмет
						this.item_status[this.item_status_slot].xeons[i] = obj_xeon_stats;
						
						// Добавляем скилл в предмет
						if (obj_xeon_stats.skill.name != undefined)
							this.item_status[this.item_status_slot].skill = obj_xeon_stats.skill;
						
						// Прибавляем усиление
						this.item_status[this.item_status_slot].enchant.enchanted += 1;
						
						// Ставим иконку гамма-ксеона
						$('#xeon_'+i).attr('src', 'template/images/items/'+obj_xeon_stats.icon+'.png');
						
						// Ставим иконку гамма-ксеона на предмете
						$('#enchant_xeon_'+this.item_status_slot+'_'+i).attr('src', 'template/images/items/'+obj_xeon_stats.icon+'.png');
						
						// Добавляем статы ксеона в предмет
						this.stat_form(obj_xeon_stats.stats, 2, true);
						
						// Пересчитываем статы
						this.equip_stat_items();
						
						this.equip_items();
						
						break;
					}
				}
				
				break;
			}
		}
	},
	
	// Убираем ксеон из предмета
	remove_xeon: function(handler) {
		// Определяем слот выбранной гамки
		var slot = parseInt(handler.attr('xeon_status'));
		
		// Убираем скилл из предмета
		if (this.item_status[this.item_status_slot].skill.name != undefined)
			this.item_status[this.item_status_slot].skill = [];
		
		// Убираем статы вточенной гамки из предмета
		this.stat_form(this.item_status[this.item_status_slot].xeons[slot].stats, 2, false);
		
		// Убираем гамма-ксеон из предмета
		this.item_status[this.item_status_slot].xeons[slot] = '';
		
		// Вычитаем усиление
		if (this.item_status[this.item_status_slot].enchant.enchanted > 0)
			this.item_status[this.item_status_slot].enchant.enchanted -= 1;
		
		// Убираем иконку гамма-ксеона
		$('#xeon_'+slot).attr('src', 'template/images/fitting/item_slot_shadow.png');
		
		// Убираем иконку гамма-ксеона на предмете
		$('#enchant_xeon_'+this.item_status_slot+'_'+slot).attr('src', 'template/images/fitting/xeon_slot_shadow.png');
		
		// Прячем тултип
		ToolTip.hide();
		
		// Пересчитываем статы
		this.equip_stat_items();
		
		this.equip_items();
	},
	
	// Создаём тултип ксеона
	xeon_show: function(handler, type, flag) {
		flag = flag || false;
		
		// Ксеон из списка
		if (type)
		{
			for (var x=0; x < this.xeon_objects.length; x++)
			{
				if (this.xeon_objects[x].id == parseInt(handler.attr('id')))
				{
					this.show_item(handler, type, this.xeon_objects[x]);
					
					break;
				}
			}
		}
		// Вточенный ксеон
		else
		{
			var item_xeon_slot;
			
			if (flag)
			{
				var xeon_info = handler.attr('id').split('_');
				item_xeon_slot = this.item_status[xeon_info[2]].xeons[xeon_info[3]];
			}
			else
			{
				item_xeon_slot = this.item_status[this.item_status_slot].xeons[handler.attr('xeon_status')];
			}
			
			if (item_xeon_slot != '')
				this.show_item(handler, type, item_xeon_slot);
		}
	},
	
	
	/////////////////////////////////////////////////////////////
	//						МОДИФИКАЦИЯ                        //
	/////////////////////////////////////////////////////////////
	
	
	// Модификация предмета
	modification_item: function(handler) {
		// ид рандомного стата
		var this_option = parseInt(handler.attr('id').substr(4));
		
		var max_value = this.item_status[this.item_status_slot].modification.stats[this_option][2];
		
		// Значение рандомного стата
		var this_value = parseInt(handler.val());
		
		// Записываем стат в модификацию
		this.item_status[this.item_status_slot].modification.stats[this_option][1] = ((this_value >= 0 && this_value <= max_value) ? this_value : max_value);
		
		// Записываем стат в предмет
		this.stat_form(this.item_status[this.item_status_slot].modification.stats, 3, true, this_option);
		
		// Пересчитываем статы
		this.equip_stat_items();
		
		this.equip_items();
	},
	
	// Модификация рандомных статов
	modification_stat: function(value) {
		value = parseInt(value);
		
		var new_value;
		for (var s in this.item_status[this.item_status_slot].modification.stats)
		{
			if (!this.item_status[this.item_status_slot].modification.stats.hasOwnProperty(s))
				continue;
			
			// Вычисляем процент от максимального значения рандомного стата
			new_value = Math.ceil(this.item_status[this.item_status_slot].modification.stats[s][2]/100*value);
			
			// Записывает значение рандомного стата в предмет
			this.item_status[this.item_status_slot].modification.stats[s][1] = new_value;
			
			// Записывает значение %
			this.item_status[this.item_status_slot].modification.percent = value;
			
			// Записываем стат в предмет
			this.stat_form(this.item_status[this.item_status_slot].modification.stats, 3, true, s);
			
			// Ставим значение стата в ячейку
			$('#mod_'+s).val(new_value);
		}
		
		// Пересчитываем статы
		this.equip_stat_items();
		
		this.equip_items();
	},
	
	
	/////////////////////////////////////////////////////////////
	//						СОХРАНЕНИЕ                         //
	/////////////////////////////////////////////////////////////
	
	
	// Сохраняем билд персонажа
	save_build: function() {
		var that = this;
		var json_obj;
		$.post('/fitinfo/iteminbank', { c: that.avatar_race, l: that.avatar_level, g: that.avatar_sex, cm: $('input.fitting_comment').val(), i: JSON.stringify(that.item_status) }, function(data) { json_obj = eval(data); }, "json")
		.always(function() {
			$('div.fitting_build_msg').html("<img class='ajax_msg_img' src='template/images/"+json_obj.code+".png' /> <span class='text_"+json_obj.code+"'>"+json_obj.msg+"</span>");
		});
	},
	
	// Загрузка билда персонажа
	build_load: function(bank, info) {
		var avatar_info = info.split(',');
		
		Weaponry_box.selectRace(parseInt(avatar_info[0]));
		Weaponry_box.selectLevel(parseInt(avatar_info[1]));
		Weaponry_box.selectSex(parseInt(avatar_info[2]));
		
		var that = this;
		var get_i;
		$.getJSON('/'+bank, function (data) { get_i = data; })
		.always(function() {
			// Пробуем загрузить персонажа
			if (get_i == undefined) {
			}
			else {
				that.item_status = eval(get_i);
				
				// Проставляем иконки
				for (var slot=0; slot < that.item_status.length; slot++) {
					if (that.item_status[slot] != '') {
						// Правая рука
						if (slot == 0) {
							// Если двуручка, дублируем иконку в левую руку
							if (that.item_status[slot].hand == 2) {
								$('#slot_1').attr('src', 'template/images/items/'+that.item_status[slot].icon+'.png').css('opacity',0.6);
							}
						}
						
						// Ставим иконку предмета
						$('#slot_'+slot).attr('src', 'template/images/items/'+that.item_status[slot].icon+'.png');
						
						// Отображаем слоты у предмета
						that.enchant_slot(slot, true);
						
						// Ставим иконки гамма-ксеонов в предмете
						for (var x=0; x < that.item_status[slot].enchant.enchanted; x++) {
							$('#enchant_xeon_'+slot+'_'+x).attr('src', 'template/images/items/'+that.item_status[slot].xeons[x].icon+'.png');
						}
					}
				}
				
				that.equip_items();
			}
		});
	},
	
	
	/////////////////////////////////////////////////////////////
	//						СТАТЫ                              //
	/////////////////////////////////////////////////////////////
	
	
	// Ищем нужный стат
	stat_form: function(obj_what, type, action, stat, plus) {
		stat = stat || null;
		plus = plus || null;
		
		if (stat != null)
		{
			this.setstat_form(obj_what, type, action, stat, plus);
		}
		else
		{
			for (var s in obj_what)
			{
				if (!obj_what.hasOwnProperty(s))
					continue;
			
				this.setstat_form(obj_what, type, action, s, plus);
			}
		}
	},
	
	// Добавляем статы в предмет при усилении, вставке и моде
	setstat_form: function(obj_what, type, action, find_stat, plus) {
		find_stat = parseInt(find_stat);
		
		var new_stat = this.item_status[this.item_status_slot].stats[find_stat];
		
		// Если такого стата нет в предмете
		if (new_stat == undefined)
			this.item_status[this.item_status_slot].stats[find_stat] = [0, 0, 0, 0, 0, 0];
		
		// Добавляем/вычитаем статы при усилении
		if (type == 1)
		{
			this.item_status[this.item_status_slot].stats[find_stat][type] = obj_what[find_stat] * plus;
			return;
		}
		// Добавляем/вычитаем статы при модификации
		else if (type == 3)
		{
			this.item_status[this.item_status_slot].stats[find_stat][type] = obj_what[find_stat][1];
			
			if (new_stat[6] == undefined)
				this.item_status[this.item_status_slot].stats[find_stat][6] = obj_what[find_stat][3];
			
			return;
		}
		// Добавляем/вычитаем статы ксеона
		else
		{
			if (action)
			{
				this.item_status[this.item_status_slot].stats[find_stat][type] += obj_what[find_stat][0];
			}
			else
			{
				this.item_status[this.item_status_slot].stats[find_stat][type] -= obj_what[find_stat][0];
			}
			
			if (new_stat[6] == undefined)
				this.item_status[this.item_status_slot].stats[find_stat][6] = obj_what[find_stat][6];
		}
	},
	
	// Считаем статы предмета
	equip_stat_items: function(flag)
	{
		flag = flag || false;
		
		// Для тултипа в списке предметов
		if (flag)
		{
			for (var i=0; i < this.item_objects.length; i++)
			{
				for (var s in this.item_objects[i].stats)
				{
					if (!(this.item_objects[i].stats).hasOwnProperty(s))
						continue;
					
					var work_stat = this.item_objects[i].stats[s];
					
					var format_stat = work_stat[0]+work_stat[2]+work_stat[3]+((s == 6 || s == 7 || s == 10 || s == 11) ? 0 : work_stat[1]);
					
					this.item_objects[i].stats[s][4] = this.format_stat(s, format_stat);
				}
			}
			
			return;
		}
		
		for (var s in this.item_status[this.item_status_slot].stats)
		{
			if (!(this.item_status[this.item_status_slot].stats).hasOwnProperty(s))
				continue;
			
			// Скорость передвижения
			if (s == 5)
				continue;
			
			// Выходим до формирования % атаки
			if (s > 46)
				break;
			
			var work_stat = this.item_status[this.item_status_slot].stats[s];
			
			// % атаки
			if (s == 6 || s == 7)
			{
				var index = parseInt(s)+41;
				
				if (this.item_status[this.item_status_slot].stats[index] != undefined) {
					this.item_status[this.item_status_slot].stats[s][5] = parseFloat(this.format_stat(s, (work_stat[0]+work_stat[2]) * this.item_status[this.item_status_slot].stats[index][2] / 10000));
				}
			}
			
			// Формируем результирующий стат	
			var format_stat = work_stat[0]+work_stat[2]+work_stat[3]+((s == 6 || s == 7 || s == 10 || s == 11) ? 0 : work_stat[1])+work_stat[5];
			
			this.item_status[this.item_status_slot].stats[s][4] = this.format_stat(s, format_stat);
		}
	},
	
	// Форматируем стат
	format_stat: function(stat, value) {
		var stat_value_end = 0;
		
		if (stat == 5 || stat == 17 || stat == 18 || stat == 46 || stat == 47 || stat == 48)
		{
			stat_value_end = (value/100).toFixed(1);
		}
		else if ((stat >= 6 && stat <= 11) || stat == 19 || stat == 20)
		{
			stat_value_end = value.toFixed(1);
		}
		else if (stat == 12 || stat == 13 || (stat >= 23 && stat <= 29))
		{
			stat_value_end = (value/100).toFixed(2);
		}
		else
		{
			stat_value_end = value;
		}
		
		return stat_value_end;
	},
	
	// Окончание стата в сетах и моде
	stat_same_end: function(stat_id) {
		var option_name = '';
		
		if (stat_id == 12 || stat_id == 13 || stat_id == 47 || stat_id == 48 || (stat_id >= 23 &&  stat_id <= 29))
		{
			option_end = '%';
		}
		else if (stat_id == 17)
		{
			option_end = ' '+this.strings[37];
		}
		else
		{
			option_end = '';
		}
		
		return option_end;
	},
	
	// Считаем всё
	equip_items: function() {
		// Чистим всё
		for (var i=0; i < 49; i++)
			this.item_stats[i] = 0;
		
		// Теперь можно записывать
		for (var i=0; i < this.item_status.length; i++)
		{
			if (this.item_status[i] != '')
			{
				for (var s in this.item_status[i].stats)
				{
					if (!(this.item_status[i].stats).hasOwnProperty(s))
						continue;
					
					if (s == 5) // Скорость передвижения
					{
						this.item_stats[s] += Math.round(this.item_status[i].stats[5][0] * this.base_stats.stats[5] / 100000) * 10;
					}
					else if (s == 6 || s == 7) // Дальняя/Ближняя физическая атака
					{
						var s_index = s;
						
						if (this.item_status[0].kind_name != undefined)
						{
							if (this.item_status[0].kind == 21 || this.item_status[0].kind == 22)
								s_index = parseInt(s)+2;
						}
						
						this.item_stats[s_index] += this.item_status[i].stats[s][0]+this.item_status[i].stats[s][1]+this.item_status[i].stats[s][2]+this.item_status[i].stats[s][3]+this.item_status[i].stats[s][5];
					}
					else if (s == 17 || s == 18) // Скорость атаки и скорость каста в перчатках
					{
						this.item_stats[s] += Math.round(this.item_status[i].stats[s][0] * this.base_stats.stats[s] / -100000) * -10;
					}
					else if (s == 46) // Скорость атаки от оружия
					{
						if (this.item_status[0] != '')
							this.base_stats.stats[17] = this.item_status[0].stats[s][0];
					}
					else
					{
						this.item_stats[s] += this.item_status[i].stats[s][0]+this.item_status[i].stats[s][1]+this.item_status[i].stats[s][2]+this.item_status[i].stats[s][3]+this.item_status[i].stats[s][5];
					}
				}
			}
		}
		
		// Прибавляем статы сетов к статам предметов
		if (this.set_stats[0] != undefined)
		{
			for (var i=0; i < 49; i++)
				this.item_stats[i] += this.set_stats[i];
		}
		
		var that = this;
		var obj;
		$.post('/ajax/weaponry/equip', { b: (this.base_stats.stats).join(), i: (this.item_stats).join() }, function (data) { obj = eval(data); }, "json")
		.always(function() {
			// Выводим статы
			for (var s=0; s < that.class_status_char.length; s++)
			{
				$('#'+that.class_status_char[s]).html(obj.base[s]);
				$('#Move_'+that.class_status_char[s]).html((obj.move[s] == 0) ? '' : '('+obj.move[s]+')');
			}
		});
	},
	
	// Фильтр предметов
	filter: function(filter_name, filter_type) {
		var content = "<div class='fitting_filter module_action_title_'>"+this.strings[27]+": "+this.strings[28]+" ";
		
		if (filter_type)
		{
			content += "<input class='in_item_name fitting_filter_val' type='text' value='"+filter_name+"' onChange='Weaponry_box.search_items($(this).val(), $(\"select.in_item_grade\").val(), 1, 0);' />";
		}
		else {
			content += "<input class='in_xeon_name fitting_filter_val' type='text' value='"+filter_name+"' onChange='Weaponry_box.search_xeons($(this).val(), $(\"select.in_xeon_grade\").val(), 3, 0);' />";
		}
		
		content += " "+this.strings[29]+" ";
		
		var grade_item;
		
		if (filter_type)
		{
			content += "<select class='in_item_grade fitting_filter_sel' onChange='Weaponry_box.search_items($(\"input.in_item_name\").val(), $(this).val(), 1, 0);'>";
			grade_item = this.filter_grade_item;
		}
		else
		{
			content += "<select class='in_xeon_grade fitting_filter_sel' onChange='Weaponry_box.search_xeons($(\"input.in_xeon_name\").val(), $(this).val(), 3, 0);'>";
			grade_item = this.filter_grade_xeon;
		}
		
		var grade_array = { 0: this.strings[36], 2: this.strings[30], 3: this.strings[31], 4: this.strings[32], 5: this.strings[33], 6: this.strings[34], 7: this.strings[35] };
		for (var s in grade_array)
		{
			if (!(grade_array).hasOwnProperty(s))
				continue;
		
			content += "<option value='"+s+"' "+((grade_item == s) ? 'selected' : '')+">"+grade_array[s]+"</option>";
		}
		
		content += "</select></div>";
		
		return content;
	},
};

// Выбираем клас
$(document).on('change', '#avatar_race', function() { Weaponry_box.select_race(parseInt($(this).val())); });

// Выбираем уровень
$(document).on('change', '#avatar_level', function() { Weaponry_box.select_level(parseInt($(this).val())); });

// Выбираем пол
$(document).on('change', '#avatar_sex', function() { Weaponry_box.select_sex(parseInt($(this).val())); });

// Выбираем слот
$(document).on('click', 'div.fitting_slot_selected', function() { Weaponry_box.slot_select($(this)); });

// Выбираем меню
$(document).on('click', 'div.fitting_content_menu_link', function() { Weaponry_box.select_menu($(this), 99); });

// Одеваем предмет
$(document).on('click', 'a.itemlist_name_link', function() { Weaponry_box.equip_item($(this)); });

// Снимаем предмет
$(document).on('contextmenu', 'div.fitting_slot_selected', function() { Weaponry_box.remove_item($(this)); return false; });

// Тултип надетого предмета
$(document).on('mouseenter', 'div.fitting_slot_border', function() { Weaponry_box.item_show($(this), false); });
$(document).on('mouseleave', 'div.fitting_slot_border', function() { ToolTip.hide(); });

// Тултип предмета
$(document).on('mouseenter', 'a.itemlist_name_link', function() { Weaponry_box.item_show($(this), true); });
$(document).on('mouseleave', 'a.itemlist_name_link', function() { ToolTip.hide(); });

// Втачиваем гамма-ксеон
$(document).on('click', 'a.xeonlist_name_link', function() { Weaponry_box.add_xeon($(this)); });

// Убираем гамма-ксеон
$(document).on('click', 'div.fitting_xeon_border', function() { Weaponry_box.remove_xeon($(this)); });
$(document).on('contextmenu', 'div.fitting_xeon_border', function() { Weaponry_box.remove_xeon($(this)); return false; });

// Тултип вточенного ксеона
$(document).on('mouseenter', 'div.fitting_xeon_border', function() { Weaponry_box.xeon_show($(this), false); });
$(document).on('mouseleave', 'div.fitting_xeon_border', function() { ToolTip.hide(); });

// Тултип ксеона
$(document).on('mouseenter', 'a.xeonlist_name_link', function() { Weaponry_box.xeon_show($(this), true); });
$(document).on('mouseleave', 'a.xeonlist_name_link', function() { ToolTip.hide(); });

// Тултип ксеона в предмете
$(document).on('mouseenter', 'img.fitting_slot_xeon_select_enchant', function() { Weaponry_box.xeon_show($(this), false, true); });
$(document).on('mouseleave', 'img.fitting_slot_xeon_select_enchant', function() { ToolTip.hide(); });

// Модифицируем предмет
$(document).on('change', 'input.fitting_mod_input', function() { Weaponry_box.modification_item($(this)); });