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

});
