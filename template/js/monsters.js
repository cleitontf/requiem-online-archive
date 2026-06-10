$(document).ready(function() {

    // --- Zone pages: map marker visibility ---

    // "Show all" checkbox toggles every map dot and syncs individual checkboxes
    $(document).on('change', '.monsters_all_monsters_checked', function() {
        var checked = $(this).is(':checked');
        $('.monster_checked').prop('checked', checked);
        $('.monsters_map_monsters').toggle(checked);
    });

    // Individual monster checkbox toggles its map dots
    $(document).on('change', '.monster_checked', function() {
        var id      = $(this).attr('id').replace('monster_', '');
        var checked = $(this).is(':checked');
        $('.monster_' + id + '_checked').toggle(checked);

        // Sync the "show all" checkbox state
        var total   = $('.monster_checked').length;
        var checked_count = $('.monster_checked:checked').length;
        $('.monsters_all_monsters_checked').prop('checked', total === checked_count);
    });

    // --- Individual monster pages: tab switching ---

    $(document).on('click', '.monsters_monster_title_', function() {
        var $tabs = $('.monsters_monster_title_');
        var idx   = $tabs.index($(this)); // 0 = spacer, 1 = Stats, 2 = Special Drop

        $tabs.removeClass('monsters_monster_title_active');
        $(this).addClass('monsters_monster_title_active');

        if (idx === 1) {
            // Stats tab: show stats_1 + stats_2, hide stats_3
            $('.monsters_monster_stats_1, .monsters_monster_stats_2').show();
            $('.monsters_monster_stats_3').hide();
        } else if (idx === 2) {
            // Special Drop tab: hide stats_1 + stats_2, show stats_3
            $('.monsters_monster_stats_1, .monsters_monster_stats_2').hide();
            $('.monsters_monster_stats_3').show();
        }
    });

    // On page load: hide stats_3 (Special Drop) so Stats tab is active by default
    $('.monsters_monster_stats_3').hide();

});
