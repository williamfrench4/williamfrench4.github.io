  function will_status () { // we wrap everything in a function so our globals and function names don't pollute the document's namespace


  var
   abed_str                    = 'abed',
   visiting_lauren_str         = 'visiting_Lauren',
   bottom_row_margin           =    0, // spacing between bottom day row and bottom edge of status canvas -- 0 for no gap
   current_window_height,
   current_window_width,
   date_length                 =   28, // 'Mon Jan 17 17:05:37 EST 2011'.length,
   debug_mode                  = true,
   document_body,
   hour_labels_count           =   25,
   inter_row_margin            =    0, // spacing between        day rows                                 -- 0 for no gap
   math_round                  = Math.round,
   milliseconds_in_a_day       = 24 * 60 * 60 * 1000,
   min_day_label_spacing       =    5,
   min_hour_label_spacing      =   10,
   now_date,
   offline_str                 = 'offline',
   old_window_height,
   old_window_width,
   online_str                  = 'online',
   padded_dash_str             = ' -- ',
   padded_ellipsis_length      =    7, // ' . . . '.length,
   px_str                      = 'px',
   row_heights,
   row_tops,
   status_canvas_height,
   status_canvas_height,
   status_canvas_margin_bottom =   40,
   status_canvas_margin_left   =   70,
   status_canvas_margin_right  =   70,
   status_canvas_margin_top    =   40,
   status_canvas_width,
   status_canvas_width,
   status_days_covered,
   status_days_skipped,
   status_display_div,
   status_log_data,
   status_period_str           = 'status_period',
   top_row_margin              =    0, // spacing between top    day row and top    edge of status canvas -- 0 for no gap
   unknown_str                 = 'unknown',
   url_parameters,
   window_size_method;

  function get_url_parameters () {
    //gets the url variables and return them as an associative array.
    var
     dummy = [],
     parameter_counter,
     parameters = window.location.href.slice (window.location.href.indexOf ('?') + 1).split ('&');
    parameters.each (function (parameter) {
      parameter_split = parameter.split ('=');
      dummy [parameter_split [0]] = parameter_split [1];
    });
    return dummy;
  }


  function start_of_day_on (the_date) {
    // Return a Date object set to midnight at the beginning of the day that the given Date object falls on.
    var dummy = new Date (the_date);
    dummy.setHours        (0);
    dummy.setMinutes      (0);
    dummy.setSeconds      (0);
    dummy.setMilliseconds (0);
    return dummy;
  }


  function days_between (earlier_date, later_date) {
    //Return the number of days between two Date objects.
    return (later_date.getTime () - earlier_date.getTime ()) / milliseconds_in_a_day;
  }


  function time_of_day_as_a_fraction (the_date) {
    // Return a floating-point number where 0 is midnight at the beginning of the day and 1 would be midnight at the beginning of the next day (but is never reached).
    return the_date.getHours () / 24 + the_date.getMinutes () / (24 * 60) + the_date.getSeconds () / (24 * 60 * 60) + the_date.getMilliseconds () / (24 * 60 * 60 * 1000);
  }

  function human_readable_elapsed_time (elapsed_time_in_milliseconds) {
    var elapsed_time_days    = Math.floor (elapsed_time_in_milliseconds / (1000 * 60 * 60 * 24));
    var elapsed_time_hours   = Math.floor (elapsed_time_in_milliseconds / (1000 * 60 * 60) - elapsed_time_days * 24);
    var elapsed_time_minutes = Math.floor (elapsed_time_in_milliseconds / (1000 * 60)      - elapsed_time_days * 24 * 60 - elapsed_time_hours * 60);
    var elapsed_time_seconds = Math.floor (elapsed_time_in_milliseconds / (1000)           - elapsed_time_days * 24 * 60 * 60 - elapsed_time_hours * 60 * 60 - elapsed_time_minutes * 60);
    var dummy = '';
    if (elapsed_time_days                          ) {
      dummy += (elapsed_time_days    + ' day'   );
      if (elapsed_time_days > 1) { dummy += 's'; }
    }
    if (elapsed_time_hours                         ) {
      if (elapsed_time_days) { dummy += ' '; }
      dummy += (elapsed_time_hours   + ' hour'  );
      if (elapsed_time_hours > 1) { dummy += 's'; }
    }
    if (!elapsed_time_days ) {
      if (elapsed_time_minutes) {
        if (elapsed_time_hours) { dummy += ' '; }
        dummy += (elapsed_time_minutes + ' minute');
        if (elapsed_time_minutes > 1) { dummy += 's'; }
      }
      if (elapsed_time_seconds && !elapsed_time_hours) {
        if (elapsed_time_minutes) { dummy += ' '; }
        dummy += (elapsed_time_seconds + ' second');
        if (elapsed_time_seconds > 1) { dummy += 's'; }
      }
    }
    return dummy;
  }

  function render_block (left, top, right, height, class_name, parent_element) {
    // alert (left + ' ' + top + ' ' + right + ' ' + height);
    var
     block = document.createElement ('div'),
     block_style = block.style;
    block.addClassName (class_name);
    block_style.left   =          left  + px_str;
    block_style.top    = top            + px_str;
    block_style.width  = (right - left) + px_str;
    block_style.height = height         + px_str;
    parent_element.appendChild (block);
    return block;
  }


  function render_status_block (left, top, right, height, suffix, parent_element, title) {
    var block = render_block (left, top, right, height, status_period_str, parent_element);
    block.addClassName (status_period_str + '_' + suffix);
    block.title = title;
    return block;
  }


  function render_centered_string (x, y, text) {
    var
     text_span = document.createElement ('span'),
     text_span_style = text_span.style;
    status_display_div.appendChild (text_span);
    text_span_style.position = 'absolute';
    text_span_style.height = 'auto';
    text_span_style.width  = 'auto';
    text_span.innerHTML = text;
    //alert (text + ' ' + text_span.clientWidth + ' ' + text_span.clientHeight);
    text_span_style.left = (x - math_round (text_span.clientWidth  / 2)) + px_str;
    text_span_style.top  = (y - math_round (text_span.clientHeight / 2)) + px_str;
    return text_span;
  }


  function determine_window_size () {
    if (navigator.userAgent.match(/(Android)/)) {
    current_window_width  = 980;
    current_window_height = 440;
    } else if (typeof (window.innerWidth) == 'number') {
      //Non-IE
      window_size_method = 1;
      current_window_width  = window.innerWidth;
      current_window_height = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
      //IE 6+ in 'standards compliant mode'
      window_size_method = 2;
      current_window_width  = document.documentElement.clientWidth;
      current_window_height = document.documentElement.clientHeight;
    } else if (document_body && (document_body.clientWidth || document_body.clientHeight)) {
      //IE 4 compatible
      window_size_method = 3;
      current_window_width  = document_body.clientWidth;
      current_window_height = document_body.clientHeight;
    }
  }


  function build_status_display_transport_callback (transport) { // currently this is dead code, since the data is being read from the page rather than using AJAX
    status_log_data = transport.responseText;
    build_status_display_if_not_clean ();
  }


  function build_status_display_if_not_clean () { // "clean" means that the status display exists and is the correct size
    determine_window_size ();
    if (current_window_width != old_window_width || current_window_height != old_window_height) {
      old_window_width  = current_window_width;
      old_window_height = current_window_height;
      build_status_display ();
    }
  }


  function build_status_display () {
    //alert (status_log_data);
    now_date = Date ();
    if (status_display_div) status_display_div.remove ();
    status_display_div              = document.createElement ('div');
    Element.extend (status_display_div);
    status_display_div.addClassName ('status_display');
    status_display_div.style.width  = current_window_width;
    status_display_div.style.height = current_window_height;
    document_body.appendChild (status_display_div);
    determine_row_tops_and_heights ();
    draw_status_canvas ();
    draw_rules_and_labels ();
    if (debug_mode) {
      new Ajax.Request('http://williamfrench4.com/~wfrench/wwwlive/will_status/will_status_debug.php?width=' +
       current_window_width + '&height=' + current_window_height + '&method=' + window_size_method, {});
    }
  }


  function determine_row_tops_and_heights () {
    var
     average_row_height,
     day_counter,
     total_of_row_margins;
    status_canvas_height            = current_window_height - status_canvas_margin_top  - status_canvas_margin_bottom;
    status_canvas_width             = current_window_width  - status_canvas_margin_left - status_canvas_margin_right;
    row_heights                     = new Array ();
    row_tops                        = new Array ();
    row_tops [0]                    = top_row_margin;
    total_of_row_margins            = top_row_margin + inter_row_margin * (status_days_covered - 1) + bottom_row_margin;
    average_row_height              = (status_canvas_height - total_of_row_margins) / status_days_covered;
    for (day_counter = 1; day_counter < status_days_covered; ++day_counter) {
      row_tops    [day_counter    ] = top_row_margin + math_round ((average_row_height + inter_row_margin) * day_counter);
      row_heights [day_counter - 1] = row_tops [day_counter] - row_tops [day_counter - 1] - inter_row_margin;
    }
    row_heights   [status_days_covered - 1] = status_canvas_height - row_tops [status_days_covered - 1] - bottom_row_margin;
    //alert (row_tops);
  }


  function draw_status_canvas () {
    var
     arrow_bottom_y,
     arrow_factor,
     arrow_factor_base,
     arrow_top_y,
     arrow_width,
     current_row,
     current_status_str,
     current_x                          =  0,
     days_ago,
     half_arrow_height,
     ideal_arrow_bottom_y,
     ideal_arrow_point_y,
     ideal_arrow_top_y,
     is_last_status_record,
     last_row_rendered                  = -1,
     line_width,
     line_y,
     previous_status_record             = '',
     previous_status_record_date,
     previous_status_str                = unknown_str,
     remaining_row_width,
     row_height,
     row_top,
     start_of_day_on_now_date,
     start_of_day_on_status_record_date,
     status_block_title,
     status_canvas_div                  = document.createElement ('div'),
     status_canvas_div_style,
     status_record,
     status_record_counter,
     status_record_date,
     status_record_date,
     status_record_label,
     status_record_length,
     status_records_length,
     status_records                     = status_log_data.split ('\n'),
     status_record_status,
     status_record_status_split;
    status_canvas_div_style         = status_canvas_div.style;
    start_of_day_on_now_date        = start_of_day_on (now_date);
    Element.extend (status_canvas_div);
    status_canvas_div.addClassName ('status_canvas');
    status_canvas_div_style.width   = status_canvas_width       + px_str;
    status_canvas_div_style.height  = status_canvas_height      + px_str;
    status_canvas_div_style.left    = status_canvas_margin_left + px_str;
    status_canvas_div_style.top     = status_canvas_margin_top  + px_str;
    status_display_div.appendChild (status_canvas_div);
    status_records_length = status_records.length;
    //alert (status_records_length);
    status_records [status_record_counter] = status_records [status_record_counter - 1]; //Each status record causes the previous period to be rendered, so we need an extra one with the current date/time in order for the last (current) period to be rendered.  We will change the date later.
    ++status_record_counter;
    for (status_record_counter = 0; status_record_counter < status_records_length; ++status_record_counter) {
      status_record = status_records [status_record_counter];
      is_last_status_record = status_record_counter == status_records_length - 1;
      if (is_last_status_record) { //This is the extra record we added to the end; we will change the date now and skip a lot of code that checks for errors (which were already checked for on the last pass through the loop) and calculates values for the next period (which we obviously won't be rendering).
        status_record_date = new Date ();
      } else {
        status_record_length = status_record.length;
        if (!status_record_length) continue;
        status_record_label = 'Status record ' + status_record_counter;
        if ( status_record_length < date_length)  { alert (status_record_label +     ' is too short: ' + status_record); continue; }
        status_record_date = new Date (status_record.substr (status_record_length - date_length));
        if (status_record_date == 'Invalid Date') { alert (status_record_label + ' has invalid date: ' + status_record); continue; }
        if (status_record_date > now_date)        { alert (status_record_label +  ' has future date: ' + status_record); continue; }
        status_record_status = status_record.substr (0, status_record_length - date_length - padded_ellipsis_length).strip ();
        status_record_status_split = status_record_status.split (' ');
        current_status_str  = status_record_status_split [0];
        if (current_status_str == offline_str + ':') {
          if      (status_record_status_split.length == 2 && status_record_status_split [1] == abed_str           ) current_status_str =            abed_str; // 'offline: abed'
          else if (status_record_status_split.length == 2 && status_record_status_split [1] == visiting_lauren_str) current_status_str = visiting_lauren_str;
          else                                                                                                      current_status_str =         offline_str;
        } else if (current_status_str != online_str) {
          if (current_status_str != 'p') {
            alert (status_record_label + ' has unrecognized type: ' + status_record);
          }
          continue;
        }
      }
      //alert(current_status_str);
      start_of_day_on_status_record_date = start_of_day_on (status_record_date);
      days_ago = math_round (days_between (start_of_day_on_status_record_date, start_of_day_on_now_date)); //BUG: we use Math.round to paper over time changes (standard <-> daylight savings). This probably isn't best practice, but I'm not sure what is
      if (days_ago >= status_days_skipped && days_ago < (status_days_covered + status_days_skipped)) { //BUG: this fails to render the last block if status_days_skipped is set
        current_row = status_days_covered + status_days_skipped - days_ago - 1;
        status_block_title = previous_status_record + '\n' + human_readable_elapsed_time (status_record_date.getTime () - previous_status_record_date.getTime ());
        if (is_last_status_record) { status_block_title += ' and counting';      }
        else                       { status_block_title += '\n' + status_record; }
        while (last_row_rendered < current_row) { // if this period doesn't render on one line (because it contains at least one local midnight) this loop will render the first part(s)
          if (last_row_rendered != -1) { // if it's -1, this part of the period is before the beginning of the timespan we are rendering and can be skipped)
            row_top    = row_tops    [last_row_rendered];
            row_height = row_heights [last_row_rendered];
            render_status_block (current_x, row_top, status_canvas_width   , row_height, previous_status_str, status_canvas_div, status_block_title);
          }
          ++last_row_rendered;
          current_x = 0;
        }
        var new_x = Math.floor (status_canvas_width * time_of_day_as_a_fraction (status_record_date));
        row_top    = row_tops    [current_row];
        row_height = row_heights [current_row];
        render_status_block     (current_x, row_top, new_x                 , row_height, previous_status_str, status_canvas_div, status_block_title);
        current_x = new_x;
        last_row_rendered = current_row;
        if (is_last_status_record) { // render arrow
          ideal_arrow_top_y    = row_top + row_height     / 4;
          ideal_arrow_bottom_y = row_top + row_height * 3 / 4;
          ideal_arrow_point_y  = row_top + row_height     / 2;
          arrow_top_y          = math_round (ideal_arrow_top_y   );      
          arrow_bottom_y       = math_round (ideal_arrow_bottom_y);
          arrow_width          = arrow_bottom_y - arrow_top_y;
          remaining_row_width  = status_canvas_width - current_x;
          // console.log (row_top, row_height, arrow_top_y, arrow_bottom_y);
          if (arrow_width > remaining_row_width) arrow_width = remaining_row_width;
          half_arrow_height = ideal_arrow_bottom_y - ideal_arrow_point_y;
          for (line_y = arrow_top_y; line_y <= arrow_bottom_y; ++line_y) {
            if (line_y > ideal_arrow_point_y) arrow_factor_base = line_y - ideal_arrow_point_y;
            else                              arrow_factor_base = ideal_arrow_point_y - line_y;
            arrow_factor = 1 - (arrow_factor_base / half_arrow_height);
            // console.log (line_y, ideal_arrow_point_y, half_arrow_height, arrow_factor);
            line_width = math_round (arrow_width * arrow_factor);
            render_status_block (current_x, line_y , current_x + line_width, 1         , previous_status_str, status_canvas_div, status_block_title);
          }
        }
      }
      previous_status_record      = status_record;
      previous_status_record_date = status_record_date;
      previous_status_str = current_status_str;
    }
  }


  function draw_rules_and_labels () {
    var
     bottom_hour_label,
     bottom_hour_labels   = new Array (),
     bottom_hour_label_y  = status_canvas_margin_top + status_canvas_height + math_round (status_canvas_margin_bottom / 2),
     bottom_of_top_hour_label,
     day_counter,
     hour_counter,
     hour_width           = status_canvas_width / 24,
     label_height,
     label_str,
     label_stride,
     label_to_remove,
     label_width,
     label_x,
     label_x_times_two,
     label_y,
     left_day_label,
     left_day_labels      = new Array (),
     left_day_label_x     = math_round (status_canvas_margin_left / 2),
     max_day_label_height = 0,
     max_hour_label_width = 0,
     max_row_height       = 0,
     midnight_a_x         = status_canvas_margin_left - 0.5, //a two-pixel-wide line with the left pixel at status_canvas_margin_left - 1 and the right pixel at status_canvas_margin_left
     right_day_label,
     right_day_labels     = new Array (),
     right_day_label_x    = status_canvas_margin_left + status_canvas_width + math_round (status_canvas_margin_right / 2),
     row_height,
     rule,
     rule_width,
     rule_width_class,
     rule_x,
     rule_y,
     top_hour_label,
     top_hour_labels      = new Array (),
     top_hour_label_y     = math_round (status_canvas_margin_top / 2);
//    alert (hour_width);
    for (hour_counter = 0; hour_counter < hour_labels_count; ++hour_counter) { // draw and label the hour lines between (and including) the two midnights
      label_x_times_two = math_round ((midnight_a_x + (hour_width * hour_counter)) * 2); // round to the nearest half-pixel for center position of rule
      if (label_x_times_two % 2) { label_x = label_x_times_two / 2 - .5; rule_width = 2; rule_width_class = 'double_width_rule'; }
      else                       { label_x = label_x_times_two / 2     ; rule_width = 1; rule_width_class = 'single_width_rule'; }
      label_str = hour_counter + ':00';
      //console.log (label_x + ' ' + label_str);
      bottom_hour_label = bottom_hour_labels [hour_counter] = render_centered_string (label_x, bottom_hour_label_y, label_str);
      top_hour_label    =    top_hour_labels [hour_counter] = render_centered_string (label_x,    top_hour_label_y, label_str);
      bottom_of_top_hour_label = top_hour_label.offsetTop + top_hour_label.clientHeight;
      label_width = top_hour_label.clientWidth;
      if (label_width > max_hour_label_width) max_hour_label_width = label_width;
      rule = render_block (label_x, bottom_of_top_hour_label, label_x + rule_width, bottom_hour_label.offsetTop - bottom_of_top_hour_label, 'hour_rule', status_display_div);
      rule.addClassName (rule_width_class);
    }
    for (label_stride = 1; label_stride < hour_labels_count; ++label_stride) {
      if (max_hour_label_width + min_hour_label_spacing < hour_width * label_stride) break;
    }
    if (label_stride > 1) {
      for (hour_counter = 0; hour_counter < hour_labels_count; ++hour_counter) {
        if (hour_counter % label_stride) {
          top_hour_labels    [hour_counter].hide ();
          bottom_hour_labels [hour_counter].hide ();
        }
      }
    }
    var row_date = new Date (now_date);
    row_date.setTime (row_date.getTime () - (status_days_covered + status_days_skipped) * milliseconds_in_a_day);
    for (day_counter = 0; day_counter < status_days_covered; ++day_counter) { // label the days
      row_height = row_heights [day_counter];
      if (row_height > max_row_height) max_row_height = row_height;
      label_y = status_canvas_margin_top + row_tops [day_counter] + math_round (row_height / 2);
      row_date.setTime (row_date.getTime () + milliseconds_in_a_day);
      label_str = (row_date.getMonth () + 1) + '/' + row_date.getDate ();
      left_day_label  =  left_day_labels [day_counter] = render_centered_string ( left_day_label_x, label_y, label_str);
      right_day_label = right_day_labels [day_counter] = render_centered_string (right_day_label_x, label_y, label_str);
      label_height = right_day_label.clientHeight;
      if (label_height > max_day_label_height) max_day_label_height = label_height;
      rule_y = status_canvas_margin_top + row_tops [day_counter] - 1;
      rule = render_block (0, rule_y, current_window_width, 2, 'day_rule', status_display_div);
      rule.addClassName ('double_width_rule');
    }
    for (label_stride = 1; label_stride < status_days_covered; ++label_stride) {
      if (max_day_label_height + min_day_label_spacing < max_row_height * label_stride) break;
    }
    if (label_stride > 1) {
      for (day_counter = 0; day_counter < status_days_covered; ++day_counter) {
        if (day_counter % label_stride) {
          label_to_remove = status_days_covered - 1 - day_counter; // we want the last day (today) to have a label, so instead of removing the label from day n, we remove the label from the day that is n days ago
          left_day_labels  [label_to_remove].hide ();
          right_day_labels [label_to_remove].hide ();
        }
      }
    }
  }


  function initialize () {

    url_parameters = get_url_parameters ();
    status_days_covered = parseInt (url_parameters.days_covered);
    status_days_skipped = parseInt (url_parameters.days_skipped);
    
    document_body = document.body;
    status_log_data = $ ('status_log_data').textContent;
    build_status_display_if_not_clean ();
  }


  Event.observe (window, "dom:loaded", initialize);
  Event.observe (window, "resize"    , build_status_display_if_not_clean);
};

will_status ();
