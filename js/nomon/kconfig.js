export var space_char = '_';
export var mybad_char = '@';
export var break_chars = ['.', ',', '?', '!'];
export var back_char = '#';
export var clear_char = '$';


// TEXT KEYBOARD PARAMETERS
/**
 * A list of all characters and options available for selection on the text keyboard.
 * @type {Array<string>}
 */
export var key_chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
                   'u', 'v', 'w', 'x', 'y', 'z', '.', ',', '!', '?', '\'', '#', '$', '@', '_'];
/**
 * A list of all characters that can draw word predictions from the language model
 * @type {Array<string>}
 */
export var main_chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
                   'u', 'v', 'w', 'x', 'y', 'z', '\''];
/**
 * A 2D Array denoting where each character and option should appear on the keygrid for the text keyboard.
 * @type {string[][]}
 */
export var alpha_target_layout = [['a', 'b', 'c', 'd', 'e'],
                                    ['f', 'g', 'h', 'i', 'j'],
                                    ['k', 'l', 'm', 'n', 'o'],
                                    ['p', 'q', 'r', 's', 't'],
                                    ['u', 'v', 'w', 'x', 'y'],
                                    ['z', "\'", 'BREAKUNIT', 'BACKUNIT', 'UNDOUNIT']];

// EMOJI KEYBOARD PARAMETERS
/**
 * A list of all characters and options available for selection on the emoji keyboard.
 * @type {string[]}
 */
export var emoji_key_chars = [`😀`,`😃`,`😄`,`😁`,`😆`,`😅`,`🤣`,`😂`,
                                `🙂`,`🙃`,`😕`,`😊`,`😇`,`😍`,`😟`,`🙁`,
                                `😘`,`😗`,`🤖`,`😚`,`😙`,`😋`,`😛`,`😜`,
                                `😝`,`🤑`,`🤗`,`🤔`,`🤐`,`🤩`,`😮`,`😯`,
                                `😐`,`😑`,`😶`,`😏`,`😒`,`🙄`,`😬`,`😳`,
                                `🤥`,`😌`,`😔`,`😪`,`🤤`,`😴`,`😷`,`🤒`,
                                `🤕`,`🤢`,`🤧`,`😵`,`😦`,`😢`,`😱`,`😣`,
                                `🤠`,`😎`,`🤓`,`😖`,`😤`,`🥶`,'#', '$', '@'];
/**
 * A list of all characters on the emoji keyboard that output text.
 * @type {string[]}
 */
export var emoji_main_chars = [`😀`,`😃`,`😄`,`😁`,`😆`,`😅`,`🤣`,`😂`,
                                `🙂`,`🙃`,`😕`,`😊`,`😇`,`😍`,`😟`,`🙁`,
                                `😘`,`😗`,`🤖`,`😚`,`😙`,`😋`,`😛`,`😜`,
                                `😝`,`🤑`,`🤗`,`🤔`,`🤐`,`🤩`,`😮`,`😯`,
                                `😐`,`😑`,`😶`,`😏`,`😒`,`🙄`,`😬`,`😳`,
                                `🤥`,`😌`,`😔`,`😪`,`🤤`,`😴`,`😷`,`🤒`,
                                `🤕`,`🤢`,`🤧`,`😵`,`😦`,`😢`,`😱`,`😣`,
                                `🤠`,`😎`,`🤓`,`😖`,`😤`,`🥶`];

/**
 * A 2D Array denoting where each character and option should appear on the emoji keygrid.
 * @type {string[][]}
 */
export var emoji_target_layout = [  [`😀`,`😃`,`😄`,`😁`,`😆`,`😅`,`🤣`,`😂`],
                                    [`🙂`,`🙃`,`😕`,`😊`,`😇`,`😍`,`😟`,`🙁`],
                                    [`😘`,`😗`,`🤖`,`😚`,`😙`,`😋`,`😛`,`😜`],
                                    [`😝`,`🤑`,`🤗`,`🤔`,`🤐`,`🤩`,`😮`,`😯`],
                                    [`😐`,`😑`,`😶`,`😏`,`😒`,`🙄`,`😬`,`😳`],
                                    [`🤥`,`😌`,`😔`,`😪`,`🤤`,`😴`,`😷`,`🤒`],
                                    [`🤕`,`🤢`,`🤧`,`😵`,`😦`,`😢`,`😱`,`😣`],
                                    [`🤠`,`😎`,`🤓`,`😖`,`😤`,`🥶`,'BACKUNIT', 'UNDOUNIT']];

/**
 * The length of time to highlight the winning clock and screen after a selection.
 * @type {number}
 */
export var pause_length = 2000;

// ### Language model ###
/**
 * The maximum number of word predictions to display next to a single character.
 * @type {number}
 */
export var n_pred = 3;
/**
 * The maximum number of word predictions to include on the display in total.
 * @type {number}
 */
export var num_words = 17;

/**
 * Probability threshold for inclusion of word in the display.
 * @type {number}
 */
export var prob_thres = 0.008;
/**
 * Prior probability for the Undo option.
 * @type {number}
 */
export var undo_prob = 1.0 / 40;
/**
 * Prior probability for the Backspace and Clear options.
 * @type {number}
 */
export var back_prob = 1.0 / 40;
/**
 * remaining, non-special probability used to weight the priors from the language model.
 * @type {number}
 */
export var rem_prob = 1.0 - undo_prob - back_prob*2;