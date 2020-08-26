import {makeCorsRequest} from "../cors_request.js";
import * as kconfig from './kconfig.js';


function log_add_exp(a_1, a_2){
    var b = Math.max(a_1, a_2);
    var sum =  b + Math.log(Math.exp(a_1 - b)+Math.exp(a_2-b));
    return sum;
}

function check_contains(arr, dict){
    for (var i in arr){
        var key = arr[i];
        if (!(key in dict)){
            return false;
        }
    }
    return true;
}


export class LanguageModel{
    constructor(parent) {
        this.parent = parent;
        this.word_predict_base_url = "https://nomonlm.csail.mit.edu/LM/word/predict?";
        this.word_predict_char_future_url = "https://nomonlm.csail.mit.edu/LM/word/predict/future?";
        this.word_predict_word_future_url = "https://nomonlm.csail.mit.edu/LM/word/predict/next/future?";
        this.char_predict_base_url = "https://nomonlm.csail.mit.edu/LM/character/predict?";
        this.char_predict_char_future_url = "https://nomonlm.csail.mit.edu/LM/character/predict/future?";
        this.char_predict_word_future_url = "https://nomonlm.csail.mit.edu/LM/character/predict/next/future?";

        this.word_predictions = [];
        this.word_prediction_probs = [];
        this.key_probs = [];
        this.lm_prefix = "";
        this.left_context = "";
        this.prefix_cache = {};
        this.word_update_complete = false;
        this.char_update_complete = false;
        this.num_caches_compelte = 0;

        this.update_cache("", "");

    }
    construct_url(base, parameters){
        var url = base;
        for (var param_index in Object.keys(parameters)){
            var param = Object.keys(parameters)[param_index];
            url = url.concat(param, "=", parameters[param], "&");
        }
        url = url.concat("num=25");
        return url;
    }
    update_cache(left, prefix, selection=null){
        if (!this.parent.emoji_keyboard) {
            this.lm_prefix = prefix;
            this.left_context = left;

            var lm_params = {"left": left, "prefix": prefix};
            var cache_type;
            var api_url;

            cache_type = "char_base";
            api_url = this.construct_url(this.char_predict_base_url, {"left": left.concat(prefix)});
            makeCorsRequest(api_url, this.on_cor_load_function.bind(this), prefix);
        }
    }
    on_cor_load_function(output, prefix){
        var words_li;
        var future_words;
        var formatted_words;
        var chars_li;
        var future_chars;
        var formatted_chars;

        var future_index;
        var future_word;
        var future_char;

        console.log("Retrieved: ", prefix);

        chars_li = output.results;
        formatted_chars = this.format_chars(chars_li);
        this.key_probs = formatted_chars[0];

        this.prefix_cache[prefix] = formatted_chars[1];

        if (check_contains(this.parent.beamSearch.prefixes, this.prefix_cache)){
            console.log("Finished!");
            this.parent.beamSearch.on_word_load();
            this.word_update_complete = false;
            this.char_update_complete = false;
        }
    }
    format_chars(chars_li){
        var char_prob_dict = {};
        var normalizer = -Infinity;
        for (var index in chars_li){
            char_prob_dict[chars_li[index].token] = Math.max(chars_li[index].logProb, Math.log(0.01));
            normalizer = log_add_exp(normalizer, Math.log(1/26));
        }

        var key_probs = [];
        var back_prob = Math.log(kconfig.back_prob);
        var undo_prob = Math.log(kconfig.undo_prob);
        var break_prob = Math.log(1/(kconfig.key_chars.length));
        var rem_prob = Math.log(kconfig.rem_prob-kconfig.break_chars.length/kconfig.key_chars.length - kconfig.back_prob);

        for (var char_ind in kconfig.key_chars){
            var char = kconfig.key_chars[char_ind];
            if (char in char_prob_dict){
                key_probs.push(Math.log(1/26)-normalizer+rem_prob);
            }else if (char == kconfig.space_char) {
                key_probs.push(Math.log(1/26)-normalizer+rem_prob);
            }else if (kconfig.break_chars.includes(char)){
                key_probs.push(break_prob);
            }else if (char == kconfig.mybad_char){
                key_probs.push(undo_prob);
            }else if (char == kconfig.back_char || char == kconfig.clear_char){
                key_probs.push(back_prob);
            }
        }

        var sanity_check = -Infinity;
        for (var key_ind in key_probs){
            sanity_check = log_add_exp(sanity_check, key_probs[key_ind]);
        }
        return [key_probs, char_prob_dict];
    }
}
//
// let lm = new LanguageModel();
//
// lm.update_cache("hello my ", "n");