
import * as kconfig from './kconfig.js';


function log_normalize(arr){

    var normalizer = -Infinity;
    for (var i in arr){
        normalizer = log_add_exp(normalizer, arr[i][1]);
    }
    for (var j in arr){
        arr[j][1] = arr[j][1] - normalizer;
    }
    return arr;
}

function log_add_exp(a_1, a_2){
    var b = Math.max(a_1, a_2);
    var sum =  b + Math.log(Math.exp(a_1 - b)+Math.exp(a_2-b));
    return sum;
}


export class beamSearch{
    constructor(parent){
        this.parent = parent;
        this.emoji_keyboard = false;
        this.beam_width = 10;
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
                    var conditional_prob;

                    var cur_word_start = prefix.slice(0, prefix.length - 1).lastIndexOf(" ");
                    var cur_word = prefix.slice(cur_word_start + 1, prefix.length - 1);

                    if ((prefix.charAt(prefix.length - 1) === " ") && (cur_char === " ")){
                        conditional_prob = -Infinity;

                    } else {
                        conditional_prob = cur_prior[j][1] + prev_conditional[i][1] + transition_probs[cur_char];

                    }
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

        cur_conditional = log_normalize(cur_conditional);

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