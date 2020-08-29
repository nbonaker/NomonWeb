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

        this.char_predict_base_url = "https://nomonlm.csail.mit.edu/LM/character/predict?";
        this.word_likelihood_url = "https://nomonlm.csail.mit.edu/LM/sentence/likely?";
        this.word_predict_future_url = "https://nomonlm.csail.mit.edu/LM/word/predict/future?";


        this.word_predictions = [];
        this.word_prediction_probs = [];
        this.key_probs = [];
        this.lm_prefix = "";
        this.left_context = "";
        this.prefix_cache = {};
        this.word_cache = {};
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
            makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type, prefix);

            // cache_type = "word_future";
            // var word_prefix = prefix.slice(prefix.slice(0, prefix.length - 1).lastIndexOf(" ")+1, prefix.length);
            // api_url = this.construct_url(this.word_predict_future_url, {"prefix": word_prefix});
            // makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type, prefix);

        }
    }
    on_cor_load_function(output, cache_type, prefix){
        var words_li;
        var future_words;
        var formatted_words;
        var chars_li;
        var future_chars;
        var formatted_chars;

        var future_index;
        var future_word;
        var future_char;

        // console.log("Cache type: ", cache_type, " Prefix: ", prefix);

        if (cache_type === "char_base") {
            chars_li = output.results;
            formatted_chars = this.format_chars(chars_li);
            this.key_probs = formatted_chars[0];

            this.prefix_cache[prefix] = formatted_chars[1];
        } else if (cache_type === "word_likelihood"){
            words_li = output.results;
            for (var word_ind in words_li){
                var word = words_li[word_ind].token;
                var word_prob = words_li[word_ind].logProb;
                this.word_cache[word] = word_prob;
            }
        } else if (cache_type === "word_future"){
            var word_furures = output.futures;
            this.format_words(word_furures, prefix);

        }

        if (check_contains(this.parent.beamSearch.prefixes, this.prefix_cache)) {
                console.log("Finished!");
                this.parent.beamSearch.on_word_load();

            }
    }
    format_words(word_futures, prefix){
        for (var next_ind in word_futures){
            var next_char = word_futures[next_ind].next;
            var next_prefix = prefix + next_char;

            var predictions = word_futures[next_ind].predictions.results;

            if (predictions.length === 0){
                this.word_cache[next_prefix] = -Infinity
            } else {
                this.word_cache[next_prefix] = 0
            }
        }
    }
    format_chars(chars_li){
        var char_prob_dict = {};
        var normalizer = -Infinity;
        for (var index in chars_li){
            char_prob_dict[chars_li[index].token] = Math.max(chars_li[index].logProb, Math.log(0.01));
            normalizer = log_add_exp(normalizer, Math.log(1/26));
        }
        var break_prob = Math.log(1/(kconfig.key_chars.length));
        char_prob_dict["."] = break_prob;
        normalizer = log_add_exp(normalizer, break_prob);

        var key_probs = [];
        var back_prob = Math.log(kconfig.back_prob);
        var undo_prob = Math.log(kconfig.undo_prob);
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