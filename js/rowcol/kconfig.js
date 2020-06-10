export var space_char = '_';
export var mybad_char = '@';
export var break_chars = ['.', ',', '?', '!'];
export var back_char = '#';
export var clear_char = '$';

export var key_chars = ['@', 'e', 't', 'a', 'o', 'i', 'n', 's', 'r', 'h', 'd', 'l', 'u', 'c', 'm', 'f', 'y', 'w', 'g',
    'p', 'b', 'v', 'k', 'x', 'q', 'j', 'z', '#', '.', ',', '!', '?', '\'', '_', '$'];
export var main_chars = ['e', 't', 'a', 'o', 'i', 'n', 's', 'r', 'h', 'd', 'l', 'u', 'c', 'm', 'f', 'y', 'w', 'g',
    'p', 'b', 'v', 'k', 'x', 'q', 'j', 'z'];

export var num_words = 7;

var num_items = num_words + key_chars.length;
var closest_square = Math.ceil(Math.sqrt(num_items));

var alpha_target_layout = [];
var order_array = [];

var order_num = "";
for (var row_num = 0; row_num < closest_square + 1; row_num++){
    var order_array_row = [];
    for (var col_num = 0; col_num < closest_square; col_num++){
        order_array_row.push(order_num);
    }
    order_array.push(order_array_row);
}
var row_index = 1;
var col_index = 0;
for (order_num in key_chars){
    order_array[row_index][col_index] = key_chars[order_num];
    if (row_index === closest_square){
        row_index = 2 + col_index;
        col_index = closest_square - 1;
    }
    else if (col_index === 0){
        col_index = row_index;
        row_index = 1;
    }
    else{
        row_index += 1;
        col_index -= 1;
    }
}

export var row_lengths = [];
for (row_num in order_array){
    if (row_num > 0) {
        var row_length = 0;
        for (col_num in order_array[row_num]) {
            if (order_array[row_num][col_num] != "") {
                row_length += 1;
            }
        }
    } else {
        row_length = num_words;
    }
    row_lengths.push(row_length);
}

console.log(row_lengths);

export var target_layout = order_array;

export var num_rows = target_layout.length;
export var num_cols = closest_square;

export var pause_length = 1000;


// ### Language model ###
// # probability threshold for inclusion of word in the display
export var prob_thres = 0.008;
// # undo prior prob
export var undo_prob = 1.0 / 40;
// # back prior prob
export var back_prob = 1.0 / 40;
// # remaining, non-special probability
export var rem_prob = 1.0 - undo_prob - back_prob;