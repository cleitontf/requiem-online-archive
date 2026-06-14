// Calculator - Static offline version
var SKILLS_DATA = (typeof SKILLS_DATA !== 'undefined') ? SKILLS_DATA : null;

var Calculator_box = {
	page_path: window.location.pathname,
	avatar_clas: 0,
	avatar_level: 1,
	level_selected: false,
	level_points_array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 109],
	left_points_skill: 0,
	left_points_dna: 55,
	total_points_dna: 55,
	skills_objects: [],
	build_id: 0,
	skills_array: [],
	strings: ['Loading...','Level ','No builds found.','','Passive','MP','Casting Time','Instant Cast','Skill Downtime','Range','Skill Level','Prerequisite Skill','Duration','sec','m','min','New Build','Compatible Weapon','Prerequisite Level','Saved builds are unavailable in this browser.'],

	weapon_map: {2:'Sword',4:'Axe',8:'Bludgeon',16:'2H Sword',32:'Dual Wield',512:'Knuckle',2048:'Crossbow',4096:'Launcher',16384:'Staff',32768:'Wand'},

	decode_weapons: function(mask) {
		if (!mask || mask === 262143) return [];
		var result = [];
		for (var v in this.weapon_map) {
			if (mask & parseInt(v)) result.push(this.weapon_map[v]);
		}
		return result;
	},

	load: function(clas, character) {
		character = character || [];
		var that = this;

		var doLoad = function(skillsData) {
			that.skills_objects = JSON.parse(JSON.stringify(skillsData)); // deep copy
			that.avatar_clas = clas;

			if (character.length != 0) {
				that.load_build(character);
			} else {
				var min_level = 1;
				switch(clas) {
					case 2: case 6: case 12: case 16: case 22: case 26: case 32: case 36:
						break;
					default:
						min_level = 50;
						break;
				}

				var select_level = $('select.char_level');
				select_level.empty();
				select_level.append($("<option value='-'>-</option>"));
				for (var i = min_level; i <= 90; i++)
					select_level.append($("<option value='" + i + "'>" + i + "</option>"));

				// Inicializa estado de dependência: skills sem requisito ficam visíveis (opacity 1),
				// skills com requisito ficam bloqueadas (opacity 0.3, active=0)
				for (var i = 0; i < that.skills_objects.length; i++) {
					var prefix = (that.skills_objects[i].id > 600000) ? 'dna' : 'skill';
					if (that.skills_objects[i].requirement === '') {
						that.skills_objects[i].active = 1;
						$('#' + prefix + '_' + that.skills_objects[i].id).css('opacity', 1);
					} else {
						that.skills_objects[i].active = 0;
						$('#' + prefix + '_' + that.skills_objects[i].id).css('opacity', 0.3);
					}
				}
				that.load_from_hash();
			}

			that.build_list();
			that.update_summary();
		};

		// Skills data is loaded statically via skills_data.js (works under file://)
		doLoad(SKILLS_DATA[clas] || []);
	},

	load_build: function(character) {
		this.avatar_level = parseInt(character['level']);
		this.build_id = parseInt(character['character_id']);

		if (character['skills'] == null) {
			this.select_level(this.avatar_level);
		} else {
			this.left_points_skill = parseInt(character['left_skills']);
			this.left_points_dna = parseInt(character['left_dna']);
			this.skills_array = character['skills'].split(',');
		}

		for (var s = 0; s < this.skills_objects.length; s++) {
			this.skills_array[s] = parseInt(this.skills_array[s]);

			if (this.skills_objects[s].requirement == '') {
				this.skills_objects[s].active = 1;
				$('#' + ((this.skills_objects[s].id > 600000) ? 'dna' : 'skill') + '_' + this.skills_objects[s].id).css('opacity', 1);
			}

			if (this.skills_array[s] == 0) continue;

			this.skills_objects[s].level = this.skills_array[s];

			$('#v' + this.skills_objects[s].id + ', #bv' + this.skills_objects[s].id).html(this.skills_array[s]);
			$('#' + this.skills_objects[s].id).attr('src', 'template/images/skills/' + this.skills_objects[s].icon + '.png');
			$('#' + ((this.skills_objects[s].id > 600000) ? 'dna' : 'skill') + '_' + this.skills_objects[s].id).css('opacity', 1);

			for (var sn = 0; sn < this.skills_objects.length; sn++) {
				var need_array = this.skills_objects[sn].requirement;
				if (need_array[0] == this.skills_objects[s].id) {
					this.skills_objects[sn].active = 1;
					$('#' + ((this.skills_objects[sn].id > 600000) ? 'dna' : 'skill') + '_' + this.skills_objects[sn].id).css('opacity', 1);
					if (need_array[0] != '')
						$('#' + need_array[1]).css({ 'backgroundImage': "url('template/images/SkillTreeWnd_arrow" + need_array[2] + ".png')", 'opacity': 1 });
				}
			}
		}

		this.skill_format();
	},

	select_level: function(level) {
		this.avatar_level = parseInt(level);
		this.level_selected = true;
		this.left_points_skill = this.level_points_array[this.avatar_level - 1] || 0;

		$('#char_level_hide').html(this.avatar_level);

		// Update select dropdown to show selected level
		$('select.char_level').val(String(this.avatar_level));

		// Reset all skills to 0
		for (var i = 0; i < this.skills_objects.length; i++) {
			this.skills_array[i] = 0;
			this.skills_objects[i].level = 0;
			// Reset icon to greyed version
			$('#' + this.skills_objects[i].id).attr('src', 'template/images/skills/' + this.skills_objects[i].icon + '_G.png');

			if (this.skills_objects[i].requirement == '') {
				this.skills_objects[i].active = 1;
				$('#skill_' + this.skills_objects[i].id + ', #dna_' + this.skills_objects[i].id).css('opacity', 1);
			} else {
				this.skills_objects[i].active = 0;
				$('#skill_' + this.skills_objects[i].id + ', #dna_' + this.skills_objects[i].id).css('opacity', 0.3);
			}
		}

		$('div.calculator_build_info_title_').html(this.strings[16]);
		this.skill_format();
	},

	build_storage_key: function() {
		return 'requiem_builds_' + this.avatar_clas;
	},

	storage_available: function() {
		try {
			var k = '__rq_test__';
			localStorage.setItem(k, '1');
			localStorage.removeItem(k);
			return true;
		} catch (e) {
			return false;
		}
	},

	load_builds: function() {
		if (!this.storage_available()) return [];
		try {
			var raw = localStorage.getItem(this.build_storage_key());
			return raw ? JSON.parse(raw) : [];
		} catch (e) {
			return [];
		}
	},

	escape_html: function(text) {
		return String(text).replace(/[&<>]/g, function(c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
		});
	},

	save_build: function() {
		if (!this.level_selected || !this.storage_available()) return;

		var name = window.prompt('Name this build:', '');
		if (!name) return;
		name = name.trim();
		if (!name) return;

		var builds = this.load_builds();
		builds.push({
			name: name,
			level: this.avatar_level,
			hash: this.avatar_level + '-' + this.skills_array.join(','),
			savedAt: Date.now()
		});
		localStorage.setItem(this.build_storage_key(), JSON.stringify(builds));
		this.build_list();
	},

	delete_build: function(index) {
		var builds = this.load_builds();
		builds.splice(index, 1);
		localStorage.setItem(this.build_storage_key(), JSON.stringify(builds));
		this.build_list();
	},

	load_saved_build: function(hash) {
		window.location.hash = '#' + hash;
		this.load_from_hash();
	},

	build_list: function() {
		var $items = $('#calc_build_list_items');
		if (!$items.length) return;

		if (!this.storage_available()) {
			$items.html("<div class='module_sheet_body_ module_action_msg'>" + this.strings[19] + "</div>");
			return;
		}

		var builds = this.load_builds();
		if (!builds.length) {
			$items.html("<div class='module_sheet_body_ module_action_msg'>" + this.strings[2] + "</div>");
			return;
		}

		var html = '';
		for (var i = 0; i < builds.length; i++) {
			var b = builds[i];
			html += '<div class="calculator_build_list_item">' +
				'<a class="calculator_build_list_name" href="#' + this.escape_html(b.hash) + '" onclick="Calculator_box.load_saved_build(\'' + b.hash + '\'); return false;">' + this.escape_html(b.name) + '</a>' +
				'<span class="calculator_build_list_level">Lvl ' + b.level + '</span>' +
				'<span class="calculator_build_list_delete" onclick="Calculator_box.delete_build(' + i + ')" title="Delete">&times;</span>' +
				'</div>';
		}
		$items.html(html);
	},

	reset: function() {
		window.location.href = this.page_path;
	},

	toggle_copy_menu: function(e) {
		e.stopPropagation();
		$('#calc_copy_menu').toggleClass('open');
	},

	close_copy_menu: function() {
		$('#calc_copy_menu').removeClass('open');
	},

	copy_link: function() {
		this._copy_text(window.location.href, '✓ Link copied!');
	},

	copy_summary: function() {
		var levelVal = this.level_selected ? this.avatar_level : '-';
		var total_skill = this.level_selected ? (this.level_points_array[this.avatar_level - 1] || 0) : 0;
		var used_skill = total_skill - this.left_points_skill;
		var used_dna = this.total_points_dna - this.left_points_dna;
		var className = $('.module_action_title_ h3').first().text();

		var text = className + ' Lv. ' + levelVal + '\n' +
			'Skills: ' + used_skill + '/' + total_skill + ' used\n' +
			'DNA: ' + used_dna + '/' + this.total_points_dna + ' used\n' +
			'Link: ' + window.location.href;

		this._copy_text(text, '✓ Summary copied!');
	},

	copy_export: function() {
		var skillLines = [];
		var dnaLines = [];

		for (var i = 0; i < this.skills_objects.length; i++) {
			var obj = this.skills_objects[i];
			if (obj.level <= 0) continue;
			var line = obj.name + ': ' + obj.level + '/' + obj.max_level;
			if (obj.id > 600000) dnaLines.push(line);
			else skillLines.push(line);
		}

		var text = '[Skills]\n' + (skillLines.length ? skillLines.join('\n') : '-') +
			'\n\n[DNA]\n' + (dnaLines.length ? dnaLines.join('\n') : '-');

		this._copy_text(text, '✓ Exported!');
	},

	_copy_text: function(text, message) {
		var that = this;
		this.close_copy_menu();
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text).then(function() {
				that._btn_feedback(message);
			}).catch(function() { that._copy_fallback(text, message); });
		} else {
			this._copy_fallback(text, message);
		}
	},

	_btn_feedback: function(message) {
		var btn = document.getElementById('calc_copy_btn');
		if (!btn) return;
		if (!this._copy_btn_original) this._copy_btn_original = btn.textContent;
		var original = this._copy_btn_original;

		if (this._copy_btn_timeout) clearTimeout(this._copy_btn_timeout);
		btn.textContent = message;
		this._copy_btn_timeout = setTimeout(function() { btn.textContent = original; }, 2000);
	},

	_copy_fallback: function(text, message) {
		var ta = document.createElement('textarea');
		ta.value = text;
		ta.style.cssText = 'position:fixed;opacity:0';
		document.body.appendChild(ta);
		ta.select();
		try { document.execCommand('copy'); this._btn_feedback(message); } catch(e) {}
		document.body.removeChild(ta);
	},

	load_from_hash: function() {
		var hash = window.location.hash;
		if (!hash || hash.length < 3) return;

		var clean = hash.substring(1);
		var dash = clean.indexOf('-');
		if (dash < 1) return;

		var level = parseInt(clean.substring(0, dash));
		var skills = clean.substring(dash + 1).split(',').map(Number);
		if (isNaN(level) || level < 1 || level > 90) return;

		this.select_level(level);

		for (var i = 0; i < this.skills_objects.length && i < skills.length; i++) {
			var amount = skills[i];
			if (!amount || amount <= 0) continue;

			this.skills_objects[i].level = amount;
			this.skills_array[i] = amount;

			var isDNA = this.skills_objects[i].id > 600000;
			if (isDNA) this.left_points_dna -= amount;
			else this.left_points_skill -= amount;

			var prefix = isDNA ? 'dna' : 'skill';
			var sid = this.skills_objects[i].id;

			$('#' + sid).attr('src', 'template/images/skills/' + this.skills_objects[i].icon + '.png');
			$('#v' + sid + ', #bv' + sid).html(amount);
			$('#' + prefix + '_' + sid).css('opacity', 1);

			for (var m = 0; m < this.skills_objects.length; m++) {
				var req = this.skills_objects[m].requirement;
				if (req && req[0] == sid) {
					this.skills_objects[m].active = 1;
					$('#skill_' + this.skills_objects[m].id + ', #dna_' + this.skills_objects[m].id).css('opacity', 1);
					if (req[1] && req[2] != 0)
						$('#' + req[1]).css({ 'backgroundImage': "url('template/images/SkillTreeWnd_arrow" + req[2] + ".png')", 'opacity': 1 });
				}
			}
		}

		// select_level() acima já reescreveu o hash com skills_array zerado;
		// re-sincroniza agora que skills_array reflete a build do hash original.
		this.skill_format();
	},

	skill_add: function(handler) {
		var skill_type = handler.attr('type');

		if ((skill_type == 0 ? this.left_points_skill : this.left_points_dna) > 0) {
			var skill_id = parseInt(handler.attr('id'));

			for (var l = 0; l < this.skills_objects.length; l++) {
				if (this.skills_objects[l].id == skill_id) {
					if (this.skills_objects[l].active == 1) {
						if (this.skills_objects[l].level < this.skills_objects[l].max_level) {
							var req_level = this.skills_objects[l].skill_levels[this.skills_objects[l].level] || 1;
							if (req_level <= this.avatar_level) {
								this.skills_objects[l].level += 1;
								(skill_type == 0 ? this.left_points_skill -= 1 : this.left_points_dna -= 1);
								this.skills_array[l] += 1;

								$('#v' + skill_id + ', #bv' + skill_id).html(this.skills_objects[l].level);
								$('#' + skill_id).attr('src', 'template/images/skills/' + this.skills_objects[l].icon + '.png');

								for (var m = 0; m < this.skills_objects.length; m++) {
									var need_array = this.skills_objects[m].requirement;
									if (need_array != undefined && need_array[0] == this.skills_objects[l].id) {
										this.skills_objects[m].active = 1;
										if (skill_type == 0) {
											$('#' + (((this.skills_objects[m].id) > 600000) ? 'dna' : 'skill') + '_' + this.skills_objects[m].id).css('opacity', 1);
											if (need_array[1] != undefined && need_array[2] != 0)
												$('#' + need_array[1]).css({ 'backgroundImage': "url('template/images/SkillTreeWnd_arrow" + need_array[2] + ".png')", 'opacity': 1 });
										}
									}
								}

								this.skill_show(handler);
								this.skill_format();
							}
						}
					} else {
						// Skill bloqueada: pisca o ícone do pré-requisito
						var req_id = Array.isArray(this.skills_objects[l].requirement) ? this.skills_objects[l].requirement[0] : null;
						if (req_id) {
							for (var n = 0; n < this.skills_objects.length; n++) {
								if (this.skills_objects[n].id == req_id && this.skills_objects[n].level == 0) {
									$('#skill_' + this.skills_objects[n].id).addClass('skill_show_border');
									(function(captured_id) {
										setTimeout(function() { $('#skill_' + captured_id).removeClass('skill_show_border'); }, 1000);
									})(this.skills_objects[n].id);
									break;
								}
							}
						}
					}
					break;
				}
			}
		}
	},

	skill_sub: function(handler) {
		var skill_type = handler.attr('type');
		var skill_id = parseInt(handler.attr('id'));

		for (var l = 0; l < this.skills_objects.length; l++) {
			if (this.skills_objects[l].id == skill_id) {
				if (this.skills_objects[l].max_level == 1) return;

				if (this.skills_objects[l].level > 0) {
					// Não permite remover se outra skill depende desta e já foi alocada
					if (skill_type == 0 && this.skills_objects[l].level == 1) {
						for (var m = 0; m < this.skills_objects.length; m++) {
							var need_array = this.skills_objects[m].requirement;
							if (Array.isArray(need_array) && need_array[0] == this.skills_objects[l].id && this.skills_objects[m].level > 0) {
								var dep_id = this.skills_objects[m].id;
								$('#skill_' + dep_id).addClass('skill_show_border');
								setTimeout(function() { $('#skill_' + dep_id).removeClass('skill_show_border'); }, 1000);
								return;
							}
						}
					}

					this.skills_objects[l].level -= 1;
					(skill_type == 0 ? this.left_points_skill += 1 : this.left_points_dna += 1);
					this.skills_array[l] -= 1;

					$('#v' + skill_id + ', #bv' + skill_id).html((this.skills_objects[l].level > 0 ? this.skills_objects[l].level : ''));

					this.skill_show(handler);
					this.skill_format();
				}

				if (this.skills_objects[l].level == 0) {
					$('#' + skill_id).attr('src', 'template/images/skills/' + this.skills_objects[l].icon + '_G.png');

					for (var m = 0; m < this.skills_objects.length; m++) {
						var need_array = this.skills_objects[m].requirement;
						if (Array.isArray(need_array) && need_array[0] == this.skills_objects[l].id) {
							this.skills_objects[m].active = (this.skills_objects[m].level > 0) ? 1 : 0;
							if (skill_type == 0) {
								$('#' + (((this.skills_objects[m].id) > 600000) ? 'dna' : 'skill') + '_' + this.skills_objects[m].id).css('opacity', 0.3);
								if (need_array[1] != undefined && need_array[2] != 0)
									$('#' + need_array[1]).css({ 'backgroundImage': "url('template/images/SkillTreeWnd_arrow" + need_array[2] + "D.png')", 'opacity': 0.3 });
							}
						}
					}
				}

				break;
			}
		}
	},

	skill_show: function(handler) {
		var skill_id = handler.attr('id');
		this.skill_type = handler.attr('type');

		for (var p = 0; p < this.skills_objects.length; p++) {
			if (this.skills_objects[p].id == skill_id) {
				var level = (this.skills_objects[p].level == 0) ? 1 : this.skills_objects[p].level;
				var tooltip_skill_content = this.skill_content_format(this.skills_objects[p], level, true);

				if (this.skills_objects[p].level % 10 != 0 && this.skills_objects[p].level < this.skills_objects[p].max_level)
					tooltip_skill_content += this.skill_content_format(this.skills_objects[p], (level + 1), false);

				ToolTip.show(handler, false, tooltip_skill_content);
				break;
			}
		}
	},

	skill_content_format: function(obj_skill, level, flag) {
		var skill_need_active = true;

		if (obj_skill.need_skill != '') {
			for (var i = 0; i < this.skills_objects.length; i++) {
				if (this.skills_objects[i].id == obj_skill.need_skill[0]) {
					if (this.skills_objects[i].level >= obj_skill.need_skill[2]) {
						skill_need_active = false;
						break;
					}
				}
			}
		}

		// Use colored icon if skill is leveled, greyed if not
		var iconSuffix = (obj_skill.level > 0) ? '' : '_G';
		var skill_content = "<tr><td class='tooltip_icon' rowspan='2'><img src='template/images/skills/" + obj_skill.icon + iconSuffix + ".png' /></td>";
		skill_content += "<td class='tooltip_name tooltip_skills_name'>" + obj_skill.name + "</td></tr>";
		skill_content += "<tr valign='top'><td class='tooltip_skills_name tooltip_skills_level'>" + this.strings[1] + level + "</td></tr>";

		if (obj_skill.max_level > 1) {
			((obj_skill.type == 7) ? skill_content += "<tr><td colspan='2'>" + this.strings[4] + "</td></tr>" : '');
			((obj_skill.type != 7 && obj_skill.mp && obj_skill.mp[(level - 1)] != 0) ? skill_content += "<tr><td colspan='2'>" + this.strings[5] + ": " + obj_skill.mp[(level - 1)] + "</td></tr>" : '');
		}

		((obj_skill.type != 7 && obj_skill.cast_time && obj_skill.cast_time[(level - 1)] !== undefined) ?
			skill_content += "<tr><td colspan='2'>" + this.strings[6] + ": " + ((obj_skill.cast_time[(level - 1)] == 0) ? this.strings[7] : this.format_stat(1, obj_skill.cast_time[(level - 1)])) + "</td></tr>" : '');
		((obj_skill.type != 7 && obj_skill.cool_time && obj_skill.cool_time[(level - 1)] > 0) ?
			skill_content += "<tr><td colspan='2'>" + this.strings[8] + ": " + this.format_stat(1, obj_skill.cool_time[(level - 1)]) + "</td></tr>" : '');

		if (obj_skill.weapons) {
			var weapon_list = this.decode_weapons(obj_skill.weapons);
			if (weapon_list.length > 0)
				skill_content += "<tr><td colspan='2'>" + this.strings[17] + ": " + weapon_list.join(' ') + "</td></tr>";
		}

		if (obj_skill.max_level > 1) {
			((obj_skill.range && obj_skill.range[(level - 1)] > 0) ?
				skill_content += "<tr><td colspan='2'>" + this.strings[9] + ": " + this.format_stat(2, obj_skill.range[(level - 1)]) + "</td></tr>" : '');

			if (obj_skill.skill_levels && obj_skill.skill_levels[(level - 1)] !== undefined) {
				var levelLabel = (obj_skill.type == 7) ? this.strings[18] : this.strings[10];
				skill_content += "<tr><td" + ((obj_skill.skill_levels[(level - 1)] > this.avatar_level) ? " class='tooltip_requirement'" : '') + " colspan='2'>" + levelLabel + ": " + obj_skill.skill_levels[(level - 1)] + "</td></tr>";
			}

			if (obj_skill.need_skill != '') {
				var showNeedSkill = (obj_skill.type == 7) ? true : skill_need_active;
				if (showNeedSkill) {
					skill_content += "<tr><td class='tooltip_requirement' colspan='2'>" + this.strings[11] + ":</td></tr><tr><td class='tooltip_requirement' colspan='2'>" + obj_skill.need_skill[1] + " " + this.strings[1] + obj_skill.need_skill[2] + "</td></tr>";
				}
			}
			((obj_skill.type != 7 && obj_skill.duration && obj_skill.duration[(level - 1)] != 0) ?
				skill_content += "<tr><td colspan='2'>" + this.strings[12] + ": " + this.format_stat(3, obj_skill.duration[(level - 1)]) + "</td></tr>" : '');
		}

		skill_content += "<tr class='tooltip_height'></tr>";

		var effect_text = obj_skill.effect && obj_skill.effect[1] && obj_skill.effect[1][(level - 1)];
		if (effect_text) {
			skill_content += "<tr><td class='tooltip_effect_text' colspan='2'>" + effect_text.replace(/\n/g, '<br>') + "</td></tr>";
		}

		if (flag && obj_skill.description) {
			skill_content += "<tr><td class='tooltip_effect_text' colspan='2'>" + obj_skill.description + "</td></tr>";
		}

		return skill_content;
	},

	format_stat: function(stat, value) {
		var stat_value_end = 0;
		if (stat == 1) {
			if (value % 600 == 0)
				stat_value_end = (value / 600).toFixed(1) + ' ' + this.strings[15];
			else
				stat_value_end = (value / 10).toFixed(1) + ' ' + this.strings[13];
		} else if (stat == 2) {
			stat_value_end = (value / 10).toFixed(1) + ' ' + this.strings[14];
		} else if (stat == 3) {
			if (value % 600 == 0)
				stat_value_end = (value / 600) + ' ' + this.strings[15];
			else
				stat_value_end = (value / 10) + ' ' + this.strings[13];
		}
		return stat_value_end;
	},

	skill_format: function() {
		$('#char_build').val(this.skills_array.join());
		if (this.avatar_level > 0)
			history.replaceState(null, '', this.page_path + '#' + this.avatar_level + '-' + this.skills_array.join(','));
		this.update_summary();
	},

	validate_skills: function() {
		var has_invalid = false;

		for (var i = 0; i < this.skills_objects.length; i++) {
			var obj = this.skills_objects[i];
			var prefix = (obj.id > 600000) ? 'dna' : 'skill';
			var invalid = false;

			if (obj.level > 0) {
				// Rank acima do máximo permitido
				if (obj.level > obj.max_level) invalid = true;

				// Pré-requisito de árvore não alocado
				if (Array.isArray(obj.requirement)) {
					for (var j = 0; j < this.skills_objects.length; j++) {
						if (this.skills_objects[j].id == obj.requirement[0] && this.skills_objects[j].level == 0) {
							invalid = true;
							break;
						}
					}
				}

				// Skill pré-requisito sem o nível mínimo exigido
				if (Array.isArray(obj.need_skill)) {
					for (var k = 0; k < this.skills_objects.length; k++) {
						if (this.skills_objects[k].id == obj.need_skill[0] && this.skills_objects[k].level < obj.need_skill[2]) {
							invalid = true;
							break;
						}
					}
				}

				// Rank exige nível de personagem maior que o selecionado
				if (obj.skill_levels && obj.skill_levels[obj.level - 1] > this.avatar_level) invalid = true;
			}

			$('#' + prefix + '_' + obj.id).toggleClass('skill_invalid', invalid);
			if (invalid) has_invalid = true;
		}

		return has_invalid;
	},

	update_summary: function() {
		var hasLevel = this.level_selected;

		var total_skill = hasLevel ? (this.level_points_array[this.avatar_level - 1] || 0) : 0;
		var used_skill = total_skill - this.left_points_skill;
		var used_dna = this.total_points_dna - this.left_points_dna;
		var has_invalid = this.validate_skills();

		$('#summary_class').text($('.module_action_title_ h3').first().text());
		$('#summary_level').text(hasLevel ? ('Lv. ' + this.avatar_level) : '-');
		$('#summary_skill_points').text(used_skill + ' / ' + total_skill);
		$('#summary_dna_points').text(used_dna + ' / ' + this.total_points_dna);

		var status, statusClass;
		if (this.left_points_skill < 0 || this.left_points_dna < 0) {
			status = 'Over cap';
			statusClass = 'summary_status_overcap';
		} else if (has_invalid) {
			status = 'Invalid';
			statusClass = 'summary_status_invalid';
		} else if (this.left_points_skill > 0 || this.left_points_dna > 0) {
			status = 'Incomplete';
			statusClass = 'summary_status_incomplete';
		} else {
			status = 'Valid';
			statusClass = 'summary_status_valid';
		}

		$('#summary_status')
			.text(status)
			.removeClass('summary_status_valid summary_status_overcap summary_status_incomplete summary_status_invalid')
			.addClass(statusClass);
	},
};

// Level selection
$(document).on('change', 'select.char_level', function() {
	Calculator_box.select_level($(this).val());
});

// Close the "Copy" dropdown when clicking outside of it
$(document).on('click', function(e) {
	if (!$(e.target).closest('#calc_copy_dropdown').length) {
		Calculator_box.close_copy_menu();
	}
});

// Skill tooltip on hover
$(document).on('mouseenter', 'img.skill', function() { Calculator_box.skill_show($(this)); });
$(document).on('mouseleave', 'img.skill', function() { ToolTip.hide(); });

// Left click: add skill point
$(document).on('click', 'img.skill', function() { Calculator_box.skill_add($(this)); });

// Right click: remove skill point
$(document).on('contextmenu', 'img.skill', function() { Calculator_box.skill_sub($(this)); return false; });

// Job selection hover
$(document).on('mouseenter', 'div.calculator_select_job', function() {
	var clas = $(this).attr('clas');
	$('div.calculator_select_job_' + clas).removeClass('display_none');
	$(this).addClass('calculator_select_job_selected');
});
$(document).on('mouseleave', 'div.calculator_select_job', function() {
	$('div.calculator_select_job_').addClass('display_none');
	$(this).removeClass('calculator_select_job_selected');
});

// Job name tooltip
$(document).on('mouseenter', 'img.calculator_jobs_img', function() { $('div.name_' + $(this).attr('clas')).html($(this).attr('title')); });
$(document).on('mouseleave', 'img.calculator_jobs_img', function() { $('div.name_' + $(this).attr('clas')).html(''); });
