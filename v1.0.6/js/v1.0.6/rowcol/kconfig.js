export var space_char = '_';
export var mybad_char = '@';
export var break_chars = ['.', ',', '?', '!'];
export var back_char = '#';
export var clear_char = '$';
export var option_char = '%';

export var key_chars = ['@', 'e', 't', 'a', 'o', 'i', 'n', 's', 'r', 'h', 'd', 'l', 'u', 'c', 'm', 'f', 'y', 'w', 'g',
    'p', 'b', 'v', 'k', 'x', 'q', 'j', 'z', '#', '.', '\'', '_', '$', '%'];
export var main_chars = ['e', 't', 'a', 'o', 'i', 'n', 's', 'r', 'h', 'd', 'l', 'u', 'c', 'm', 'f', 'y', 'w', 'g',
    'p', 'b', 'v', 'k', 'x', 'q', 'j', 'z'];

export var emoji_main_chars = [`😀`, `😃`, `😄`, `😁`, `😆`, `😅`, `🤣`, `😂`,
    `🙂`, `🙃`, `😕`, `😊`, `😇`, `😍`, `😟`, `🙁`,
    `😘`, `😗`, `🤖`, `😚`, `😙`, `😋`, `😛`, `😜`,
    `😝`, `🤑`, `🤗`, `🤔`, `🤐`, `🤩`, `😮`, `😯`,
    `😐`, `😑`, `😶`, `😏`, `😒`, `🙄`, `😬`, `😳`,
    `🤥`, `😌`, `🥺`, `😪`, `🤤`, `😴`, `😷`, `🤒`,
    `🤕`, `🤢`, `🤧`, `😵`, `😦`, `😢`, `😱`, `😣`,
    `🤠`, `😎`, `🤓`, `😖`, `😤`, `🥶`];

export var emoji_target_layout = [['@', `😀`, `😃`, `😄`, `😁`, `😆`, `😅`, `🤣`],
    [`🙂`, `🙃`, `😕`, `😊`, `😇`, `😍`, `😟`, `🙁`],
    [`😘`, `😗`, `🤖`, `😚`, `😙`, `😋`, `😛`, `😜`],
    [`😝`, `🤑`, `🤗`, `🤔`, `🤐`, `🤩`, `😮`, `😯`],
    [`😐`, `😑`, `😶`, `😏`, `😒`, `🙄`, `😬`, `😳`],
    [`🤥`, `😌`, `🥺`, `😪`, `🤤`, `😴`, `😷`, `🤒`],
    [`🤕`, `🤢`, `🤧`, `😵`, `😦`, `😢`, `😱`, `😣`],
    ['#', `🤠`, `😎`, `🤓`, `😖`, `😤`, `🥶`, `😂`]];

// convert emojis to unicode for server
var conversion_dict = {};
var letter_index = 0;
var num_index = 0;
for (var index in emoji_main_chars) {
    var emoji_char = emoji_main_chars[index];

    conversion_dict[emoji_char] = num_index.toString().concat(main_chars[letter_index]);

    letter_index += 1;
    if (letter_index >= 26) {
        letter_index = 0;
        num_index += 1;
    }
}
export var emoji_conversion_dict = conversion_dict;

export var num_words = 7;

var num_items = num_words + key_chars.length;
var closest_square = Math.ceil(Math.sqrt(num_items));

var alpha_target_layout = [];
var order_array = [];

var order_num = "";
for (var row_num = 0; row_num < closest_square + 1; row_num++) {
    var order_array_row = [];
    for (var col_num = 0; col_num < closest_square; col_num++) {
        order_array_row.push(order_num);
    }
    order_array.push(order_array_row);
}
var row_index = 1;
var col_index = 0;
for (order_num in key_chars) {
    order_array[row_index][col_index] = key_chars[order_num];
    if (row_index === closest_square) {
        row_index = 2 + col_index;
        col_index = closest_square - 1;
    } else if (col_index === 0) {
        col_index = row_index;
        row_index = 1;
    } else {
        row_index += 1;
        col_index -= 1;
    }
}

export var row_lengths = [];
for (row_num in order_array) {
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


// COMMUNICATION BOARD PARAMETERS

export var comm_num_columns = 9;
export var comm_num_rows = 7;
var num_comm_items = 60;

export var comm_main_chars = [];
for (var num = 10; num <= num_comm_items + 10; num++) {
    comm_main_chars.push(num.toString());
}
comm_main_chars.push('.', 'Options', '$');
export var comm_key_chars = comm_main_chars.concat(['@']);

export var comm_target_layout = [];
var closest_square = Math.ceil(Math.sqrt(comm_main_chars.length + 2));
var col_ind = 0;
var cur_row = [];
var comm_layout_keys = comm_main_chars.concat(['@']);
for (var key_ind in comm_layout_keys) {
    cur_row.push(comm_layout_keys[key_ind]);
    col_ind++;

    if (col_ind > closest_square || key_ind >= comm_layout_keys.length - 1) {
        col_ind = 0;
        comm_target_layout.push(cur_row.slice());
        cur_row = [];
    }
}

export var comm_row_lengths = [];
for (var row_ind in comm_target_layout) {
    comm_row_lengths.push(comm_target_layout[row_ind].length);
}


// convert nums to comm phrases
export var comm_phrase_lookup = ["i", "it", "who", "what", "where", "again", "now", "this", "something_different", "me",
    "mine", "don't", "is", "do", "okay", "all_gone", "finished", "bad", "you", "drink", "eat", "want", "give", "go",
    "big", "little", "good", "have", "get", "like", "see", "make", "put", "away", "less", "more", "say", "stop", "take",
    "turn", "help", "here", "there", "hard", "soft", "work", "break", "feel", "happy", "sad", "in", "on", "easy",
    "bumpy", "play", "read", "sick", "mad", "scared", "excited", "with"];


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