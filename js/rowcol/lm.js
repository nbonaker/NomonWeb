import {makeCorsRequest} from "../cors_request.js";
import * as kconfig from './kconfig.js';


function log_add_exp(a_1, a_2){
    var b = Math.max(a_1, a_2);
    var sum =  b + Math.log(Math.exp(a_1 - b)+Math.exp(a_2-b));
    return sum;
}


export class LanguageModel{
    constructor(parent){
        this.parent=parent;
        this.word_predict_base_url = "https://nomonlm.csail.mit.edu/LM/word/predict?";
        this.word_predict_char_future_url = "https://nomonlm.csail.mit.edu/LM/word/predict/future?";
        this.word_predict_word_future_url = "https://nomonlm.csail.mit.edu/LM/word/predict/next/future?";

        this.word_predictions = [];
        this.word_prediction_probs = [];
        this.lm_prefix = "";
        this.left_context = "";
        this.word_cache = {};
        this.word_cache[kconfig.mybad_char] = [];
        this.word_update_complete = false;
        this.num_caches_compelte = 0;

        this.update_cache("", "");
    }
    construct_url(base, parameters){
        var url = base;
        for (var param_index in Object.keys(parameters)){
            var param = Object.keys(parameters)[param_index];
            url = url.concat(param, "=", parameters[param], "&");
        }
        url = url.concat("num=", kconfig.num_words.toString());
        return url;
    }
    update_cache(left, prefix, selection=null){
        if (!this.parent.emoji_keyboard) {
            this.lm_prefix = prefix;
            this.left_context = left;

            var lm_params = {"left": left, "prefix": prefix};
            var cache_type;
            var api_url;

            // if first init and no words fetched
            if (this.word_predictions.length == 0) {
                this.word_update_complete = false;
                //get base word predictions
                cache_type = "word_base";
                api_url = this.construct_url(this.word_predict_base_url, {"left": left, "prefix": prefix});
                makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);

            } else {
                var undo_word_predictions = this.word_predictions;
                var undo_word_prediction_probs = this.word_prediction_probs;
                var undo_key_probs = this.key_probs;

                var undo_cache_list = this.word_cache[kconfig.mybad_char];

                if (selection == kconfig.mybad_char && undo_cache_list.length > 0) {
                    console.log("pulling from undo cache...");
                    var undo_cache_values = undo_cache_list.pop();
                    this.word_predictions = undo_cache_values.words.words;
                    this.word_prediction_probs = undo_cache_values.words.probs;
                    this.key_probs = undo_cache_values.keys;

                    this.word_cache = {};
                    this.word_cache[kconfig.mybad_char] = undo_cache_list;
                    this.parent.on_word_load();
                } else if (selection in this.word_cache && selection != kconfig.mybad_char &&
                    "words" in this.word_cache[selection]) {
                    console.log("pulling from word cache...");
                    this.word_predictions = this.word_cache[selection].words.words;
                    this.word_prediction_probs = this.word_cache[selection].words.probs;

                    this.word_cache = {};
                    undo_cache_list.push({
                        "words": {
                            "words": undo_word_predictions,
                            "probs": undo_word_prediction_probs
                        }
                    });
                    this.word_cache[kconfig.mybad_char] = undo_cache_list;
                    this.parent.on_word_load(false);
                } else {
                    console.log("pulling from api...");
                    this.word_update_complete = false;

                    this.word_cache = {};
                    undo_cache_list.push({
                        "words": {
                            "words": undo_word_predictions,
                            "probs": undo_word_prediction_probs
                        }
                    });
                    this.word_cache[kconfig.mybad_char] = undo_cache_list;

                    //get base word predictions
                    cache_type = "word_base";
                    api_url = this.construct_url(this.word_predict_base_url, {"left": left, "prefix": prefix});
                    makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);

                }
            }

            cache_type = "word_future_char";
            api_url = this.construct_url(this.word_predict_char_future_url, {"left": left, "prefix": prefix});
            makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);

            cache_type = "word_future_word";
            api_url = this.construct_url(this.word_predict_word_future_url, {"left": left, "prefix": prefix});
            makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);
        }

    }
    on_cor_load_function(output, cache_type){
        var words_li;
        var future_words;
        var formatted_words;
        var chars_li;
        var future_chars;
        var formatted_chars;

        var future_index;
        var future_word;
        var future_char;

        console.log(cache_type);

        if (cache_type == 'word_base') {
            words_li = output.results;
            formatted_words = this.foramt_words(words_li, this.lm_prefix);
            this.word_predictions = formatted_words.words;
            this.word_prediction_probs = formatted_words.probs;
            this.word_update_complete = true;
        }
        else if (cache_type == 'word_future_char'){
            future_chars = output.futures;
            for (future_index in future_chars) {
                future_char = future_chars[future_index].next;
                words_li = future_chars[future_index].predictions.results;
                formatted_words = this.foramt_words(words_li, this.lm_prefix.concat(future_char));
                if (future_char in this.word_cache) {
                    this.word_cache[future_char].words = formatted_words;
                }
                else{
                    this.word_cache[future_char] = {'words': formatted_words};
                }
            }
            this.num_caches_compelte += 1;
        }
        else if (cache_type == 'word_future_word'){
            future_words = output.futures;
            for (future_index in future_words) {
                future_word = future_words[future_index].next.concat("_");
                words_li = future_words[future_index].predictions.results;
                formatted_words = this.foramt_words(words_li, "");
                if (future_word in this.word_cache) {
                    this.word_cache[future_word].words = formatted_words;
                }
                else{
                    this.word_cache[future_word] = {'words': formatted_words};
                }
            }
            this.num_caches_compelte += 1;
        }

        if (this.word_update_complete){
            this.parent.on_word_load();
            this.word_update_complete = false;
        }
    }
    foramt_words(words_li, temp_prefix){
        var word_predictions = [];
        var word_prediction_probs = [];

        var normalizer = -Infinity;
        var num_admitted_words = 0;

        for (var word_index in words_li) {
            var word = words_li[word_index].token;
            if (word.length == 1){
                word = word.concat("_");
            }
            var log_prob = words_li[word_index].logProb;
            word_predictions.push(word);
            word_prediction_probs.push(log_prob);
            normalizer = log_add_exp(normalizer, log_prob);
            num_admitted_words += 1;
        }
        for (var empty_word = words_li.length; empty_word < kconfig.num_words; empty_word += 1){
            word_predictions.push("");
            word_prediction_probs.push(-Infinity);
        }

        var sanity_check = -Infinity;
        for (word_index in words_li) {
            word_prediction_probs[word_index] =
                word_prediction_probs[word_index] - normalizer;
            sanity_check = log_add_exp(sanity_check, word_prediction_probs[word_index]);
        }
        return {"words":word_predictions, "probs":word_prediction_probs};
    }
}
//
// let lm = new LanguageModel();
//
// lm.update_cache("hello my ", "n");