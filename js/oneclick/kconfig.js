// TEXT KEYBOARD PARAMETERS
/**
 * A list of all characters and options available for selection on the text keyboard.
 * @type {Array<string>}
 */
export var key_chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
                   'u', 'v', 'w', 'x', 'y', 'z', '\''];
/**
 * A 2D Array denoting where each character and option should appear on the keygrid for the text keyboard.
 * @type {string[][]}
 */
// export var alpha_target_layout = [['a', 'b', 'c', 'd', 'e'],
//                                     ['f', 'g', 'h', 'i', 'j'],
//                                     ['k', 'l', 'm', 'n', 'o'],
//                                     ['p', 'q', 'r', 's', 't'],
//                                     ['u', 'v', 'w', 'x', 'y'],
//                                     ['z', "\'", '', '', '']];

export var alpha_target_layout = [['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
                                    ['j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r'],
                                    ['s', 't', 'u', 'v', 'w', 'x', 'y', 'z', '\'']];

/**
 * The length of time to highlight the winning clock and screen after a selection.
 * @type {number}
 */
export var pause_length = 2000;

export var num_words = 4;
