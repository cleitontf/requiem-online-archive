var Character = {
	avatar_name: '', // Имя персонажа
	avatar_race: 0, // Профессия персонажа
	avatar_race_name: 0, // Название профы персонажа
	avatar_level: 1, // Уровень персонажа
	min_level: 1, // Максимальные уровень персонажа
	max_level: 1, // Максимальные уровень персонажа
	avatar_sex: 0, // Пол персонажа
	
	// Выбираем профессию
	select_race: function(race) {
		if (race >= 1 && race <= 38)
		{
			this.avatar_race = race;
			
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
					this.min_level = 1;
					break;
				default:
					this.min_level = 50;
					break;
			}
			
			this.avatar_level = this.min_level;
			
			$('#character_level').empty();
			for (var i=this.min_level; i <= this.max_level; i++)
			{
				$('#character_level').append($("<option value='"+i+"'>"+i+"</option>"));
			}
			
			this.avatar_race_name = $.trim($('#r_'+this.avatar_race).text());
			
			$('div.personal_character_add').css('height', ($('div').is('.character_error') ? 125 : 110));
			$('div.character_level_div, div.character_sex_div, div.character_name_div, div.character_create').removeClass('display_none');
		}
	},
	
	// Выбираем уровень
	select_level: function(level) {
		if (level >= 1 && level <= this.max_level)
		{
			this.avatar_level = level;
		}
	},
	
	// Выбираем пол
	select_sex: function(sex) {
		if (sex == 1 || sex == 2)
		{
			this.avatar_sex = sex;
		}
	},
	
	// Устанавливаем максимальный уровень
	set_max_level: function(level) {
		this.max_level = level;
	},
	
	// Удаляем персонажа
	delete_character: function(handler) {
		var id = handler.attr('id');
		
		var char_objs;
		$.post('/ajax/character/delete', { id: id }, function(data) { char_objs = eval(data); }, "json")
		.always(function() {
			if (char_objs.code == 1)
			{
				$('#character_'+id).remove();
				$('div.personal_character_add').removeClass('display_none');
			}
			
			location.reload();
		});
	},
	
	// Выбираем персонажа
	select_character: function(handler) {
		var character = handler.attr('id').split('_');
		
		$.post('/ajax/character/select', { id: character[1] });
	},
};

// Выбираем клас
$(document).on('change', '#character_race', function() { Character.select_race(parseInt($(this).val())); });

// Выбираем уровень
$(document).on('change', '#character_level', function() { Character.select_level(parseInt($(this).val())); });

// Выбираем пол
$(document).on('change', '#character_sex', function() { Character.select_sex(parseInt($(this).val())); });

// Удаляем персонажа
$(document).on('click', 'div.personal_character_delete', function() { Character.delete_character($(this)); return false; });

// Выделяем персонажа
$(document).on('click', 'div.personal_character_select', function() { Character.select_character($(this)); });