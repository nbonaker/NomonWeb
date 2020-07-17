export var space_char = '_';
export var mybad_char = '@';
export var break_chars = ['.', ',', '?', '!'];
export var back_char = '#';
export var clear_char = '$';

export var key_chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
                   'u', 'v', 'w', 'x', 'y', 'z', '.', ',', '!', '?', '\'', '#', '$', '@', '_'];
export var main_chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
                   'u', 'v', 'w', 'x', 'y', 'z', '\''];
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


export var alpha_target_layout = [['a', 'b', 'c', 'd', 'e'],
                 ['f', 'g', 'h', 'i', 'j'],
                 ['k', 'l', 'm', 'n', 'o'],
                 ['p', 'q', 'r', 's', 't'],
                 ['u', 'v', 'w', 'x', 'y'],
                 ['z', "\'", 'BREAKUNIT', 'BACKUNIT', 'UNDOUNIT']];

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


export var pause_length = 1000;

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