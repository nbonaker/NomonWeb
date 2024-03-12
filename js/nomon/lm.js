import {makeCorsRequest} from "../cors_request.js";
import * as kconfig from './kconfig.js';
import {prob_thres} from "./kconfig.js";


/**
 * @private
 * @param a_1
 * @param a_2
 * @returns {number}
 */
function log_add_exp(a_1, a_2){
    var b = Math.max(a_1, a_2);
    var sum =  b + Math.log(Math.exp(a_1 - b)+Math.exp(a_2-b));
    return sum;
}

/**
 * Class to interact with the remote Language Model server. Builds and maintains a forward-looking cache of all word predictions and character probabilities that are possible after one future selection.
 * Formats the word predictions and character probabilities so that they are usable in Nomon's inference module.
 * @param {Keyboard} parent - The instance of the main Keyboard class.
 * @property {string} word_predict_base_url - The api address for querying word predictions for a given left context and prefix.
 * @property {string} word_predict_char_future_url - Used for forward caching. The api address for querying word predictions for a given left context and prefix, for each possible next character that could be added to the prefix.
 * @property {string} word_predict_word_future_url - Used for forward caching. The api address for querying word predictions for a given left context and prefix, for each possible next word prediction that could be added to the prefix.
 * @property {string} char_predict_base_url - The api address for querying character probabilities for a given left context and prefix.
 * @property {string} char_predict_char_future_url - Used for forward caching. The api address for querying character probabilities for a given left context and prefix, for each possible next character that could be added to the prefix.
 * @property {string} char_predict_word_future_url - Used for forward caching. The api address for querying character probabilities for a given left context and prefix, for each possible next word prediction that could be added to the prefix.
 * @property {string} lm_prefix - The prefix for the word currently being typed. For example: If the user has typed "I am using Nomo", the lm_prefix would be "Nomo".
 * @property {string} left_context - The left-context for the word currently being typed. For example: If the user has typed "I am using Nomo", the lm_prefix would be "I am using ".
 * @property {Object<Object<Object>>} word_cache - A nested Object maintaining a cache of all possible future word and character probabilities that are one selection away. First level keys are the letters a-z, punctuation, current word predictions, and corrective options:
 * @property {Object<Object>} word_cache.a
 * @property {Object<Object>} word_cache.b
 * @property {Object<Object>} word_cache.c - ...
 * @property {Object<Object>} word_cache.z
 * @property {Object<Object>} word_cache.word_1
 * @property {Object<Object>} word_cache.word_2 - ...
 * @property {Object<Object>} word_cache.word_n
 * @property {Object<Object>} word_cache.Undo - Each option contains an Object with its possible future word and character probabilities:
 * {"keys": Array[number], "word": {"word": Array[String], "probs": Array[number]}}
 * @property {Array<Array<string>>} word_predictions - 2D Array containing the word predictions for the currently typed left-contect and prefix. Of the form: [[word_a1, word_a2, word_a3], [word_b1, word_b2, word_b3], ...]
 * @property {Array<Array<number>>} word_prediction_probs - 2D Array containing the probabilities of the current word predictions.
 */
export class LanguageModel{

    constructor(parent) {
        this.parent = parent;
        this.word_predict_base_url = "https://nomontomcat.csail.mit.edu/LM/word/predict?";
        this.word_predict_char_future_url = "https://nomontomcat.csail.mit.edu/LM/word/predict/future?";
        this.word_predict_word_future_url = "https://nomontomcat.csail.mit.edu/LM/word/predict/next/future?";
        this.char_predict_base_url = "https://nomontomcat.csail.mit.edu/LM/character/predict?";
        this.char_predict_char_future_url = "https://nomontomcat.csail.mit.edu/LM/character/predict/future?";
        this.char_predict_word_future_url = "https://nomontomcat.csail.mit.edu/LM/character/predict/next/future?";

        this.word_predictions = [];
        this.word_prediction_probs = [];
        this.key_probs = [];
        this.lm_prefix = "";
        this.left_context = "";
        this.word_cache = {};
        this.word_cache[kconfig.mybad_char] = [];
        this.word_update_complete = false;
        this.char_update_complete = false;

        this.update_cache("", "");

    }

    /**
     * Helper function to add the parameters in an object to a URL string.
     * @param {String} base - The base URL.
     * @param {Object} parameters - An object with parameter keys and values to add to the base URL string.
     * @returns {String} - Returns a new URL string with the added parameters.
     */
    construct_url(base, parameters){
        var url = base;
        for (var param_index in Object.keys(parameters)){
            var param = Object.keys(parameters)[param_index];
            url = url.concat(param, "=", parameters[param], "&");
        }
        url = url.concat("num=25");
        return url;
    }

    /**
     * Update the future word cache given the newest selection in the keyboard. Creates Promises to complete when the API returns results.
     * @param {String} left - The current left context from the keyboard.
     * @param {String} prefix - The current prefix from the keyboard.
     * @param {String|null} selection - The currently selected option that triggered the cache update (null for cache init)
     */
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
                this.char_update_complete = false;
                //get base word predictions
                cache_type = "word_base";
                api_url = this.construct_url(this.word_predict_base_url, {"left": left, "prefix": prefix});
                makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);

                //get base char probs
                cache_type = "char_base";
                api_url = this.construct_url(this.char_predict_base_url, {"left": left.concat(prefix)});
                makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);
            } else {
                var undo_word_predictions = this.word_predictions;
                var undo_word_prediction_probs = this.word_prediction_probs;
                var undo_key_probs = this.key_probs;

                var undo_cache_list = this.word_cache[kconfig.mybad_char];

                if (selection == kconfig.mybad_char && undo_cache_list.length > 0) {
                    var undo_cache_values = undo_cache_list.pop();
                    this.word_predictions = undo_cache_values.words.words;
                    this.word_prediction_probs = undo_cache_values.words.probs;
                    this.key_probs = undo_cache_values.keys;

                    this.word_cache = {};
                    this.word_cache[kconfig.mybad_char] = undo_cache_list;
                    this.parent.on_word_load();
                } else if (selection in this.word_cache && selection != kconfig.mybad_char &&
                    "words" in this.word_cache[selection] && "keys" in this.word_cache[selection]) {
                    this.word_predictions = this.word_cache[selection].words.words;
                    this.word_prediction_probs = this.word_cache[selection].words.probs;
                    this.key_probs = this.word_cache[selection].keys;

                    this.word_cache = {};
                    undo_cache_list.push({
                        "words": {"words": undo_word_predictions, "probs": undo_word_prediction_probs},
                        "keys": undo_key_probs
                    });
                    this.word_cache[kconfig.mybad_char] = undo_cache_list;
                    this.parent.on_word_load();
                } else {
                    this.word_update_complete = false;
                    this.char_update_complete = false;

                    this.word_cache = {};
                    undo_cache_list.push({
                        "words": {"words": undo_word_predictions, "probs": undo_word_prediction_probs},
                        "keys": undo_key_probs
                    });
                    this.word_cache[kconfig.mybad_char] = undo_cache_list;

                    //get base word predictions
                    cache_type = "word_base";
                    api_url = this.construct_url(this.word_predict_base_url, {"left": left, "prefix": prefix});
                    makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);

                    //get base char probs
                    cache_type = "char_base";
                    api_url = this.construct_url(this.char_predict_base_url, {"left": left.concat(prefix)});
                    makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);
                }
            }

            cache_type = "word_future_char";
            api_url = this.construct_url(this.word_predict_char_future_url, {"left": left, "prefix": prefix});
            makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);

            cache_type = "word_future_word";
            api_url = this.construct_url(this.word_predict_word_future_url, {"left": left, "prefix": prefix});
            makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);

            cache_type = "char_future_char";
            api_url = this.construct_url(this.char_predict_char_future_url, {"left": left.concat(prefix)});
            makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);

            cache_type = "char_future_word";
            api_url = this.construct_url(this.char_predict_word_future_url, {"left": left, "prefix": prefix});
            makeCorsRequest(api_url, this.on_cor_load_function.bind(this), cache_type);
        }
    }

    /**
     * Runs when an API query Promise is completed. Adds the results to their corresponding place in the future word cache.
     * @param {JSON} output - The data returned from the API call.
     * @param {String} cache_type - The type of API query submitted: "word_base", "char_base", "word_future_char", "word_future_word", "char_future_char", or "char_future_word"
     */
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
        else if (cache_type == 'char_base'){
            chars_li = output.results;
            formatted_chars = this.format_chars(chars_li);
            this.key_probs = formatted_chars;
            this.char_update_complete = true;
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
        else if (cache_type == 'char_future_char'){
            future_chars = output.futures;
            for (future_index in future_chars) {
                future_char = future_chars[future_index].next;
                chars_li = future_chars[future_index].predictions.results;
                formatted_chars = this.format_chars(chars_li);
                if (future_char in this.word_cache) {
                    this.word_cache[future_char].keys = formatted_chars;
                }
                else{
                    this.word_cache[future_char] = {'keys': formatted_chars};
                }
            }
            this.num_caches_compelte += 1;
        }
        else if (cache_type == 'char_future_word'){
            future_words = output.futures;
            for (future_index in future_words) {
                future_word = future_words[future_index].next.concat("_");
                chars_li = future_words[future_index].predictions.results;
                formatted_chars = this.format_chars(chars_li);
                if (future_char in this.word_cache) {
                    this.word_cache[future_word].keys = formatted_chars;
                }
                else{
                    this.word_cache[future_word] = {'keys': formatted_chars};
                }
            }
            this.num_caches_compelte += 1;
        }

        if (this.word_update_complete && this.char_update_complete){
            this.parent.on_word_load();
            this.word_update_complete = false;
            this.char_update_complete = false;
        }
    }

    /**
     * Helper function. Formats the probabilities of the main characters into an Array useable by the Nomon inference module.
     * @param {Array<String>} chars_li -  An Array of the possible main characters (kconfig.main_chars).
     * @returns {Array<Number>} - The probabilities of the main characters from the language model.
     */
    format_chars(chars_li){
        var char_prob_dict = {};
        var normalizer = -Infinity;
        for (var index in chars_li){
            char_prob_dict[chars_li[index].token] = Math.max(chars_li[index].logProb, Math.log(0.01));
            normalizer = log_add_exp(normalizer, Math.max(chars_li[index].logProb, Math.log(0.01)));
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
                key_probs.push(char_prob_dict[char]-normalizer+rem_prob);
            }else if (char == kconfig.space_char) {
                key_probs.push(char_prob_dict[' ']-normalizer+rem_prob);
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
        return key_probs;
    }

    /**
     * Helper function. Formats the word predictions and probabilities into Arrays useable by the Nomon inference module.
     * @param {Array<String>} words_li - An array of word predictions from the language model.
     * @param {String} temp_prefix - The prefix to store the words and probabilities under in the word cache.
     * @returns {{probs: Array<number>, words: Array<String>}} - Returns a formatted Object with the word predictions and probabilities.
     */
    foramt_words(words_li, temp_prefix){
        var word_predictions = [];
        var word_prediction_probs = [];
        var char_index;
        var char;
        var char_words;
        var char_word_probs;
        var normalizer = -Infinity;
        var word_index;
        var num_admitted_words = 0;
        for (char_index in kconfig.main_chars) {
            char = kconfig.main_chars[char_index];
            char_words = [];
            char_word_probs = [];
            for (word_index in words_li) {
                var word = words_li[word_index].token;
                var log_prob = words_li[word_index].logProb;
                if (word.charAt(temp_prefix.length) == char && char_words.length < kconfig.n_pred &&
                    num_admitted_words < kconfig.num_words && log_prob > Math.log(kconfig.prob_thres)) {
                    if (word.length == 1){
                        word = word.concat("_");
                    }
                    char_words.push(word);
                    char_word_probs.push(log_prob);
                    normalizer = log_add_exp(normalizer, log_prob);
                    num_admitted_words += 1;
                }
            }

            for (var i = char_words.length; i < kconfig.n_pred; i++) {
                char_words.push("");
                char_word_probs.push(-Infinity);

            }
            word_predictions.push(char_words);
            word_prediction_probs.push(char_word_probs);
        }
        for (char_index = kconfig.main_chars.length; char_index < kconfig.key_chars.length; char_index++){
            char_words = [];
            char_word_probs = [];
            for (var index = 0; index < kconfig.n_pred; index++) {
                char_words.push("");
                char_word_probs.push(-Infinity);
            }
            word_predictions.push(char_words);
            word_prediction_probs.push(char_word_probs);
        }

        var sanity_check = -Infinity;
        for (var key_index=0; key_index < word_prediction_probs.length; key_index++) {
            for (word_index = 0; word_index < kconfig.n_pred; word_index++) {
                word_prediction_probs[key_index][word_index] =
                    word_prediction_probs[key_index][word_index] - normalizer;
                sanity_check = log_add_exp(sanity_check, word_prediction_probs[key_index][word_index]);
            }
        }
        return {"words":word_predictions, "probs":word_prediction_probs};
    }
}
//
// let lm = new LanguageModel();
//
// lm.update_cache("hello my ", "n");