var Buns_box = {
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
};
