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

    // --- Zone pages: map marker tooltip + click-to-navigate ---

    // Build the tooltip markup from the marker's data-name/data-level
    $('.monsters_map_monsters[data-url]').each(function() {
        var $marker  = $(this);
        var $tooltip = $('<div class="map-tooltip"></div>');
        $('<span class="map-tooltip-name"></span>').text($marker.data('name')).appendTo($tooltip);
        $('<span class="map-tooltip-level"></span>').text($marker.data('level')).appendTo($tooltip);
        $marker.append($tooltip);
    });

    // Clicking a marker navigates to the monster's page
    $(document).on('click', '.monsters_map_monsters[data-url]', function() {
        window.location.href = $(this).data('url');
    });

});
