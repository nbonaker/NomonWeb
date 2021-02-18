export var space_char = '_';
export var mybad_char = '@';
export var break_chars = ['.', ',', '?', '!'];
export var back_char = '#';
export var clear_char = '$';


// TEXT KEYBOARD PARAMETERS
export var key_chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
                   'u', 'v', 'w', 'x', 'y', 'z', '.', ',', '!', '?', '\'', '#', '$', '@', '_'];
export var main_chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
                   'u', 'v', 'w', 'x', 'y', 'z', '\''];

export var alpha_target_layout = [['a', 'b', 'c', 'd', 'e'],
                 ['f', 'g', 'h', 'i', 'j'],
                 ['k', 'l', 'm', 'n', 'o'],
                 ['p', 'q', 'r', 's', 't'],
                 ['u', 'v', 'w', 'x', 'y'],
                 ['z', "\'", 'BREAKUNIT', 'BACKUNIT', 'UNDOUNIT']];


// EMOJI KEYBOARD PARAMETERS
export var emoji_main_chars = [`😀`,`😃`,`😄`,`😁`,`😆`,`😅`,`🤣`,`😂`,
                                `🙂`,`🙃`,`😕`,`😊`,`😇`,`😍`,`😟`,`🙁`,
                                `😘`,`😗`,`🤖`,`😚`,`😙`,`😋`,`😛`,`😜`,
                                `😝`,`🤑`,`🤗`,`🤔`,`🤐`,`🤩`,`😮`,`😯`,
                                `😐`,`😑`,`😶`,`😏`,`😒`,`🙄`,`😬`,`😳`,
                                `🤥`,`😌`,`😔`,`😪`,`🤤`,`😴`,`😷`,`🤒`,
                                `🤕`,`🤢`,`🤧`,`😵`,`😦`,`😢`,`😱`,`😣`,
                                `🤠`,`😎`,`🤓`,`😖`,`😤`,`🥶`];

export var emoji_key_chars = [`😀`,`😃`,`😄`,`😁`,`😆`,`😅`,`🤣`,`😂`,
                                `🙂`,`🙃`,`😕`,`😊`,`😇`,`😍`,`😟`,`🙁`,
                                `😘`,`😗`,`🤖`,`😚`,`😙`,`😋`,`😛`,`😜`,
                                `😝`,`🤑`,`🤗`,`🤔`,`🤐`,`🤩`,`😮`,`😯`,
                                `😐`,`😑`,`😶`,`😏`,`😒`,`🙄`,`😬`,`😳`,
                                `🤥`,`😌`,`😔`,`😪`,`🤤`,`😴`,`😷`,`🤒`,
                                `🤕`,`🤢`,`🤧`,`😵`,`😦`,`😢`,`😱`,`😣`,
                                `🤠`,`😎`,`🤓`,`😖`,`😤`,`🥶`,'#', '$', '@'];

export var emoji_target_layout = [  [`😀`,`😃`,`😄`,`😁`,`😆`,`😅`,`🤣`,`😂`],
                                    [`🙂`,`🙃`,`😕`,`😊`,`😇`,`😍`,`😟`,`🙁`],
                                    [`😘`,`😗`,`🤖`,`😚`,`😙`,`😋`,`😛`,`😜`],
                                    [`😝`,`🤑`,`🤗`,`🤔`,`🤐`,`🤩`,`😮`,`😯`],
                                    [`😐`,`😑`,`😶`,`😏`,`😒`,`🙄`,`😬`,`😳`],
                                    [`🤥`,`😌`,`😔`,`😪`,`🤤`,`😴`,`😷`,`🤒`],
                                    [`🤕`,`🤢`,`🤧`,`😵`,`😦`,`😢`,`😱`,`😣`],
                                    [`🤠`,`😎`,`🤓`,`😖`,`😤`,`🥶`,'BACKUNIT', 'UNDOUNIT']];
// convert emojis to unicode for server
var conversion_dict = {};
var letter_index = 0;
var num_index = 0;
for (var index in emoji_main_chars){
    var emoji_char = emoji_main_chars[index];

    conversion_dict[emoji_char] = num_index.toString().concat(main_chars[letter_index]);

    letter_index += 1;
    if (letter_index >= 26){
        letter_index = 0;
        num_index += 1;
    }
}
export var emoji_conversion_dict = conversion_dict;


// COMMUNICATION BOARD PARAMETERS

export var comm_num_columns = 9;
export var comm_num_rows = 7;
var num_comm_items = 61;

export var comm_main_chars = [];
for (var num = 10; num <= num_comm_items+10; num++ ){
    comm_main_chars.push(num.toString());
}
comm_main_chars.push('.', '$');
export var comm_key_chars = comm_main_chars.concat(['@']);

export var comm_target_layout = [];
var closest_square = Math.ceil(Math.sqrt(comm_main_chars.length+2));
var col_ind = 0;
var cur_row = [];
var comm_layout_keys = comm_main_chars.concat(['@']);
for (var key_ind in comm_layout_keys){
    cur_row.push(comm_layout_keys[key_ind]);
    col_ind ++;

    if (col_ind > closest_square || key_ind >= comm_layout_keys.length-1){
        col_ind = 0;
        comm_target_layout.push(cur_row.slice());
        cur_row = [];
    }
}
// convert nums to comm phrases
export var comm_phrase_lookup = ["i", "it", "who", "what", "where", "again", "now", "this", "something different", "me",
    "mine", "don't", "is", "do", "okay", "all gone", "finished", "bad", "you", "drink", "eat", "want", "give", "go",
    "big", "little", "good", "have", "get", "like", "see", "make", "put", "away", "less", "more", "say", "stop", "take",
    "turn", "help", "here", "there", "hard", "soft", "work", "break", "feel", "happy", "sad", "in", "on", "easy",
    "bumpy", "play", "read", "sick", "mad", "scared", "excited", "with", "quiet"] ;


export var pause_length = 1500;

export var n_pred = 3;
export var num_words = 17;


// ### Language model ###
// # probability threshold for inclusion of word in the display
export var prob_thres = 0.008;
// # undo prior prob
export var undo_prob = 1.0 / 40;
// # back prior prob
export var back_prob = 1.0 / 40;
// # remaining, non-special probability
export var rem_prob = 1.0 - undo_prob - back_prob;