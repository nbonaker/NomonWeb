
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

function indexOf_2d(array, item){
    for (var row_index in array){
        var row = array[row_index]
        if (row.includes(item)){
            var col_index = array[row_index].indexOf(item);
            return [parseInt(row_index), col_index];
        }
    }
    return false;
}


export class beamSearch{
    constructor(parent){
        this.parent = parent;
        this.emoji_keyboard = false;
        this.beam_width = 20;
        this.prefixes = [""];
        this.cur_level = 0;
        this.observations = [];
        this.joints = [[["", 0]]];
        this.key_probs = [];
        this.most_probable_clocks = [];

        this.init_search()
    }
    increment_search(){
        this.cur_level = this.observations.length-1;
        if (this.observations.length > 0) {
            console.log("SEARCHING ", this.cur_level);
            this.calc_clock_probs();
            this.search_level(this.cur_level);
        }

    }
    on_word_load(){
        this.update_key_prior();
    }
    calc_clock_probs(){
        var obs_data = this.observations[this.cur_level];
        var cur_obs = Object.keys(obs_data).map(function(key) {
                        return [key, obs_data[key]];
                    });
        this.observations[this.cur_level] = log_normalize(cur_obs);


        var clock_cscore_levels = [this.observations[this.cur_level].slice()];

        var key_ind;
        var i;
        for (i=1; i <= Math.min(this.cur_level, 3); i+=1){
            var cumulative_scores = [];
            var prior_scores = clock_cscore_levels[i-1];
            for (key_ind in clock_cscore_levels[0]){
                cumulative_scores.push([prior_scores[key_ind][0], this.observations[this.cur_level-i][key_ind][1] + prior_scores[key_ind][1]])
            }
            clock_cscore_levels.push(cumulative_scores)
        }

        var cscore_max_diffs = [];
        var most_probable_clocks = ["."];
        for (var j in clock_cscore_levels){
            var cscores = log_normalize(clock_cscore_levels[j]);
            cscores.sort(function(first, second) {
              return second[1] - first[1];
            });
            // cscore_max_diffs.push([cscores[0][0], cscores[1][1] - cscores[0][1]]);

            for (key_ind=0; key_ind<3; key_ind +=1){
                var key = cscores[key_ind][0];
                if (!(most_probable_clocks.includes(key))){
                    most_probable_clocks.push(key);
                }
            }
            var period_prob = cscores[indexOf_2d(cscores, ".")[0]][1];
            if (cscores[1][1] - period_prob < Math.log(1/1000)) {
                console.log((parseInt(j) + 1).toString(), "Press, End :", cscores[1][1] - period_prob);
            }

            var undo_prob = cscores[indexOf_2d(cscores, "Undo")[0]][1];
            if (cscores[1][1] - undo_prob < Math.log(1/1000)) {
                console.log((parseInt(j) + 1).toString(), "Press, Undo :", cscores[1][1] - undo_prob);
            }
        }
        this.most_probable_clocks = most_probable_clocks;

        // console.log(clock_cscore_levels);

    }
    init_search(){
        this.joints = this.joints = [[["", 0]]];
        this.cur_level = 0;
        this.parent.lm.update_cache("", "");
    }
    search_level(level){
        var cur_obs = this.observations[level];  // get observation dist from press times
        var cur_joint = [];

        var i;
        var j;
        var cur_char;
        var token_joint_prob;

        if (level >= 0){

            var prev_joint = this.joints[level];  // get joint dist from previous level

            for (i in prev_joint){
                var prefix = prev_joint[i][0];
                var transition_probs = this.parent.lm.prefix_cache[prefix];  // get conditional dist for current level
                for (j in cur_obs){
                    cur_char = cur_obs[j][0];
                    token_joint_prob;

                    if ((prefix.charAt(prefix.length - 1) === " ") && (cur_char === " ")){
                        token_joint_prob = -Infinity;
                    } else {
                        if (level === 0){
                            token_joint_prob = cur_obs[j][1] + prev_joint[i][1];
                        } else {
                            token_joint_prob = cur_obs[j][1] + prev_joint[i][1] + transition_probs[cur_char];
                        }
                    }
                    cur_joint.push([prefix.concat(cur_char), token_joint_prob])
                }
            }

            cur_joint.sort(function(first, second) {
              return second[1] - first[1];
            });
            cur_joint = cur_joint.slice(0, this.beam_width);

            for (i in cur_joint){
                if (!this.prefixes.includes(cur_joint[i][0])){
                    this.prefixes.push(cur_joint[i][0]);
                    this.parent.lm.update_cache("", cur_joint[i][0]);
                }
            }

        }

        cur_joint = log_normalize(cur_joint);

        console.log(cur_joint);
        this.joints.push(cur_joint);

        this.parent.draw_typed(cur_joint);
    }
    update_key_prior(){
        var key_probs;

        if (this.observations.length > 0) {
            var joint = this.joints[this.cur_level + 1];
            var char_prob_dict = {};
            var normalizer = -Infinity;

            for (var i in joint){
                var prefix = joint[i][0];
                var prefix_prob = joint[i][1];
                var char_futures = this.parent.lm.prefix_cache[prefix];
                var chars = Object.keys(char_futures);
                for (var char_index in chars) {
                    var char = chars[char_index];
                    if (this.most_probable_clocks.includes(char)){
                        char_prob_dict[char] = 0;
                    }else if (char in char_prob_dict){
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
                    key_probs.push(Math.log(1 / 50) - normalizer + rem_prob);

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