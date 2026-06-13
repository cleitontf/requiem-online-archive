// Static class/subclass index for the global search (all 24 calculator builds).
var CLASSES_DATA = [
	{"name":"Defender","slug":"defender"},
	{"name":"Commander","slug":"commander"},
	{"name":"Protector","slug":"protector"},
	{"name":"Templar","slug":"templar"},
	{"name":"Tempest","slug":"tempest"},
	{"name":"Radiant","slug":"radiant"},
	{"name":"Warrior","slug":"warrior"},
	{"name":"Warlord","slug":"warlord"},
	{"name":"Berserker","slug":"berserker"},
	{"name":"Shaman","slug":"shaman"},
	{"name":"Forsaker","slug":"forsaker"},
	{"name":"Mystic","slug":"mystic"},
	{"name":"Rogue","slug":"rogue"},
	{"name":"Assassin","slug":"assassin"},
	{"name":"Shadow Runner","slug":"shadowrunner"},
	{"name":"Soul Hunter","slug":"soulhunter"},
	{"name":"Defiler","slug":"defiler"},
	{"name":"Dominator","slug":"dominator"},
	{"name":"Hunter","slug":"hunter"},
	{"name":"Ranger","slug":"ranger"},
	{"name":"Avenger","slug":"avenger"},
	{"name":"Battle Magician","slug":"battle-magician"},
	{"name":"Elementalist","slug":"elementalist"},
	{"name":"Druid","slug":"druid"}
];

var Search_box = {
	LIMIT: 8,

	// QUESTS_DATA "location" -> zone page id (monsters/<id>), for the
	// "Quests in this zone" box on the open-world zone pages.
	ZONE_QUESTS: {
		'Tarba': '1',
		'Parnesse': '2',
		'S.Hammerin': '3',
		'N.Hammerin': '4',
		'Numaren': '5',
		'K.Crescent': '6'
	},

	init: function() {
		var that = this;

		$(document).on('input', '#global_search_input', function() {
			that.run($(this).val());
		});

		$(document).on('focus', '#global_search_input', function() {
			if ($(this).val().trim().length >= 2) $('#global_search_results').addClass('open');
		});

		$(document).on('click', function(e) {
			if (!$(e.target).closest('.search_box').length)
				$('#global_search_results').removeClass('open');
		});

		that.render_zone_quests();
	},

	escape_html: function(text) {
		return String(text).replace(/[&<>]/g, function(c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
		});
	},

	run: function(query) {
		query = query.trim().toLowerCase();
		var $results = $('#global_search_results');

		if (query.length < 2) {
			$results.removeClass('open').empty();
			return;
		}

		var html = this.group('Quests', this.search_quests(query)) +
			this.group('Monsters', this.search_monsters(query)) +
			this.group('Classes &amp; Subclasses', this.search_classes(query));

		$results.html(html || '<div class="search_result_empty">No results found.</div>').addClass('open');
	},

	group: function(title, items) {
		if (!items.length) return '';
		var html = '<div class="search_result_group"><div class="search_result_group_title">' + title + '</div>';
		for (var i = 0; i < items.length; i++)
			html += '<a class="search_result_item" href="' + items[i].url + '">' + items[i].label + '</a>';
		return html + '</div>';
	},

	search_quests: function(query) {
		var out = [];
		if (typeof QUESTS_DATA === 'undefined') return out;
		for (var i = 0; i < QUESTS_DATA.length && out.length < this.LIMIT; i++) {
			var q = QUESTS_DATA[i];
			if (q.name.toLowerCase().indexOf(query) === -1) continue;
			out.push({
				url: 'quests/' + q.id,
				label: this.escape_html(q.name) + ' <span class="search_result_meta">Lvl ' + q.level + ' &middot; ' + this.escape_html(q.location) + '</span>'
			});
		}
		return out;
	},

	search_monsters: function(query) {
		var out = [];
		if (typeof MONSTERS_DATA === 'undefined') return out;
		for (var i = 0; i < MONSTERS_DATA.length && out.length < this.LIMIT; i++) {
			var m = MONSTERS_DATA[i];
			if (m.name.toLowerCase().indexOf(query) === -1) continue;
			var place = m.dungeon_name || m.zone_name || '';
			out.push({
				url: 'monsters/' + m.id,
				label: this.escape_html(m.name) + ' <span class="search_result_meta">Lvl ' + m.level + (place ? ' &middot; ' + this.escape_html(place) : '') + '</span>'
			});
		}
		return out;
	},

	search_classes: function(query) {
		var out = [];
		for (var i = 0; i < CLASSES_DATA.length && out.length < this.LIMIT; i++) {
			var c = CLASSES_DATA[i];
			if (c.name.toLowerCase().indexOf(query) === -1) continue;
			out.push({ url: 'calculator/' + c.slug, label: this.escape_html(c.name) });
		}
		return out;
	},

	// Fills #zone_quests_list (data-zone="<1-6>") with quests whose
	// QUESTS_DATA "location" maps to that zone page.
	render_zone_quests: function() {
		var $box = $('#zone_quests_list');
		if (!$box.length || typeof QUESTS_DATA === 'undefined') return;

		var zoneId = $box.data('zone');
		var location = null;
		for (var loc in this.ZONE_QUESTS) {
			if (this.ZONE_QUESTS[loc] == zoneId) { location = loc; break; }
		}
		if (!location) return;

		var matches = [];
		for (var i = 0; i < QUESTS_DATA.length; i++)
			if (QUESTS_DATA[i].location === location) matches.push(QUESTS_DATA[i]);

		if (!matches.length) {
			$box.closest('.module_list').remove();
			return;
		}

		matches.sort(function(a, b) { return a.level - b.level; });

		var html = '';
		for (var j = 0; j < matches.length; j++) {
			var q = matches[j];
			html += '<div class="about_preserved_item"><a class="about_link" href="quests/' + q.id + '">' + this.escape_html(q.name) + '</a> <span class="search_result_meta">Lvl ' + q.level + ' &middot; ' + this.escape_html(q.type) + '</span></div>';
		}

		$box.html(html);
	}
};

$(document).ready(function() {
	Search_box.init();
});
