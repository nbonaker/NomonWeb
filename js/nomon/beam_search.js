
import * as kconfig from './kconfig.js';

var data = [
    {"\'": -16.034274470134434,
    "a": -3.597207452362034,
    "b": -39.83525196529167,
    "c": -78.79751544171324,
    "d": -6.563290148451326,
    "e": -27.26756738425251,
    "f": -79.78415431102339,
    "g": -20.32839528997044,
    "h": -1.9812128261141282,
    "i": -11.94993890261099,
    "j": -49.55009289728661,
    "k": -116.20576091972656,
    "l": -50.32744473371279,
    "m": -27.83563218779474,
    "n": -12.308716673269243,
    "o": -3.7466981901362932,
    "p": -2.149576738395905,
    "q": -6.324104968012494,
    "r": -17.661792288858287,
    "s": -35.96437664109662,
    "t": -61.231858024727465,
    "u": -93.46423643975093,
    "v": -99.74365641011183,
    "w": -66.30700567200547,
    "x": -43.19050879902268,
    "y": -33.5511605650578,
    "z": -22.688666833502502,
    " ": -2.579673996639804},
    
    {"\'": -75.14963067560805,
    "a": -14.100425193830478,
    "b": -121.97741060108353,
    "c": -17.661792288858294,
    "d": -54.109123834671905,
    "e": -1.9513146785592745,
    "f": -61.23185802472746,
    "g": -84.56081870218145,
    "h": -30.622325998554917,
    "i": -4.543421420498605,
    "j": -6.324104968012492,
    "k": -35.96437664109662,
    "l": -93.46423643975095,
    "m": -99.74365641011183,
    "n": -66.30700567200547,
    "o": -39.83525196529167,
    "p": -20.32839528997044,
    "q": -9.151721899374873,
    "r": -2.579673996639805,
    "s": -2.972523125297286,
    "t": -10.33026928534732,
    "u": -24.65291247678988,
    "v": -45.940452699625055,
    "w": -74.19288995385274,
    "x": -103.95275421715631,
    "y": -110.57625199411227,
    "z": -89.4796238490822,
    " ": -33.5511605650578},
    
    {"\'": -10.330269285347327,
    "a": -65.41006124535984,
    "b": -2.1495767383958935,
    "c": -36.622135887303386,
    "": -19.850024929092797,
    "e": -94.54056975172567,
    "f": -6.56329014845133,
    "g": -7.517352318048069,
    "h": -39.147594571530036,
    "i": -98.63742495058221,
    "j": -62.09890430381824,
    "k": -18.11026450218108,
    "l": -1.981212826114131,
    "m": -4.364032535169471,
    "n": -13.711749275617379,
    "o": -30.02436304745784,
    "p": -53.30187385069089,
    "q": -78.79751544171324,
    "r": -116.20576091972654,
    "s": -79.78415431102339,
    "t": -50.327444733712795,
    "u": -27.83563218779473,
    "v": -12.308716673269231,
    "w": -3.7466981901363,
    "x": -1.951314678559271,
    "y": -2.972523125297272,
    "z": -6.324104968012492,
    " ": -35.964376641096614},

    {"\'": -8.852740423826347,
    "a": -61.23185802472746,
    "b": -1.951314678559271,
    "c": -39.83525196529166,
    "d": -17.66179228885828,
    "e": -99.74365641011183,
    "f": -7.7864356460417525,
    "g": -6.324104968012492,
    "h": -35.96437664109662,
    "i": -93.46423643975093,
    "j": -66.30700567200546,
    "k": -20.328395289970445,
    "l": -2.2093730335056136,
    "m": -3.597207452362028,
    "": -11.949938902610995,
    "o": -27.2675673842525,
    "p": -49.55009289728662,
    "q": -74.19288995385274,
    "r": -121.97741060108353,
    "s": -84.56081870218146,
    "t": -54.10912383467192,
    "u": -30.622325998554913,
    "v": -14.100425193830489,
    "w": -4.543421420498618,
    "x": -1.8951933744653502,
    "y": -2.489979553975246,
    "z": -5.272998373719645,
    " ": -32.923299466405865},

    {"\'": -10.659148908450703,
    "a": -6.324104968012506,
    "b": -30.622325998554913,
    "c": -93.46423643975095,
    "d": -4.543421420498603,
    "e": -35.964376641096635,
    "f": -66.30700567200546,
    "g": -14.100425193830475,
    "h": -1.951314678559271,
    "i": -17.661792288858294,
    "j": -61.23185802472747,
    "k": -99.74365641011184,
    "l": -39.83525196529166,
    "m": -20.328395289970445,
    "n": -7.7864356460417525,
    "o": -2.2093730335056136,
    "p": -3.597207452362028,
    "q": -10.330269285347327,
    "r": -24.65291247678988,
    "s": -45.94045269962504,
    "t": -74.19288995385273,
    "u": -121.97741060108353,
    "v": -84.56081870218145,
    "w": -54.10912383467192,
    "x": -33.55116056505781,
    "y": -25.191079132777247,
    "z": -16.034274470134434,
    " ": -1.8951933744653502},
];

function log_add_exp(a_1, a_2){
    var b = Math.max(a_1, a_2);
    var sum =  b + Math.log(Math.exp(a_1 - b)+Math.exp(a_2-b));
    return sum;
}


export class beamSearch{
    constructor(parent){
        this.parent = parent;
        this.emoji_keyboard = false;
        this.beam_width = 5;
        this.prefixes = [""];
        this.cur_level = 0;
        this.priors_data = [];
        this.key_probs = [];

        this.init_search()
    }
    increment_search(){
        this.cur_level = this.priors_data.length-1;
        if (this.priors_data.length > 0) {

            console.log("SEARCHING ", this.cur_level);
            this.search_level(this.cur_level);

        }

    }
    on_word_load(){
        this.update_key_prior();
    }
    init_search(){
        this.conditionals = [];
        this.cur_level = 0;

        this.parent.lm.update_cache("", "");
    }
    search_level(level){
        var prior_data = this.priors_data[level];
        var cur_conditional = [];
        var cur_prior = Object.keys(prior_data).map(function(key) {
                        return [key, prior_data[key]];
                    });
        if (level > 0){
            var prev_conditional = this.conditionals[level-1];
            var i;
            var j;
            for (i in prev_conditional){
                var prefix = prev_conditional[i][0];
                var transition_probs = this.parent.lm.prefix_cache[prefix];
                for (j in cur_prior){
                    var cur_char = cur_prior[j][0];
                    var conditional_prob = cur_prior[j][1] + prev_conditional[i][1] + transition_probs[cur_char];
                    cur_conditional.push([prefix.concat(cur_char), conditional_prob])
                }
            }

            cur_conditional.sort(function(first, second) {
              return second[1] - first[1];
            });
            cur_conditional = cur_conditional.slice(0, this.beam_width);

            for (i in cur_conditional){
                if (!this.prefixes.includes(cur_conditional[i][0])){
                    this.prefixes.push(cur_conditional[i][0]);
                    this.parent.lm.update_cache("", cur_conditional[i][0]);
                }
            }

        } else {
            cur_prior.sort(function(first, second) {
              return second[1] - first[1];
            });
            cur_conditional = cur_prior.slice(0, this.beam_width);

            for (i in cur_conditional){
                if (!this.prefixes.includes(cur_conditional[i][0])){
                    this.prefixes.push(cur_conditional[i][0]);
                    this.parent.lm.update_cache("", cur_conditional[i][0]);
                }
            }
        }

        console.log(cur_conditional);
        this.conditionals.push(cur_conditional);

        this.parent.draw_typed(cur_conditional);
    }
    update_key_prior(){
        var key_probs;

        if (this.priors_data.length > 0) {
            var conditional = this.conditionals[this.cur_level];
            var char_prob_dict = {};
            var normalizer = -Infinity;

            for (var i in conditional){
                var prefix = conditional[i][0];
                var prefix_prob = conditional[i][1];
                var char_futures = this.parent.lm.prefix_cache[prefix];
                var chars = Object.keys(char_futures);
                for (var char_index in chars){
                    var char = chars[char_index];
                    if (char in char_prob_dict){
                        char_prob_dict[char] = log_add_exp(char_prob_dict[char], prefix_prob + char_futures[char])
                    } else {
                        char_prob_dict[char] = prefix_prob + char_futures[char];
                    }
                    normalizer = log_add_exp(normalizer, prefix_prob + char_futures[char])
                }
            }

            var key_probs = [];
            var back_prob = Math.log(kconfig.back_prob);
            var undo_prob = Math.log(kconfig.undo_prob);
            var break_prob = Math.log(1 / (kconfig.key_chars.length));
            var rem_prob = Math.log(kconfig.rem_prob - kconfig.break_chars.length / kconfig.key_chars.length - kconfig.back_prob);

            for (var char_ind in kconfig.key_chars) {
                var char = kconfig.key_chars[char_ind];
                if (char in char_prob_dict) {
                    key_probs.push(char_prob_dict[char] - normalizer + rem_prob);
                } else if (char == kconfig.space_char) {
                    key_probs.push(Math.log(1 / 26) - normalizer + rem_prob);
                } else if (kconfig.break_chars.includes(char)) {
                    key_probs.push(break_prob);
                } else if (char == kconfig.mybad_char) {
                    key_probs.push(undo_prob);
                } else if (char == kconfig.back_char || char == kconfig.clear_char) {
                    key_probs.push(back_prob);
                }
            }

            var sanity_check = -Infinity;
            for (var key_ind in key_probs) {
                sanity_check = log_add_exp(sanity_check, key_probs[key_ind]);
            }
        } else {
            key_probs = this.parent.lm.key_probs;
        }
       this.key_probs = key_probs;
        this.parent.on_word_load();
    }
}

// let bs = new beamSearch();
// bs.search(data);