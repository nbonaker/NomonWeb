import * as widgets from './widgets.js';
import * as infoscreen from './info_screens.js';
import * as kconfig from './kconfig.js';
import * as config from './config.js';
import * as bc from './broderclocks.js';
import * as tm from './tutorial.js';
import * as sm from './study_manager.js';
import * as lm from './lm.js';
import * as rcom from '../rowcol_options_manager.js';

import {makeCorsRequest} from "../cors_request.js";

function log_add_exp(a_1, a_2){
    var b = Math.max(a_1, a_2);
    var sum =  b + Math.log(Math.exp(a_1 - b)+Math.exp(a_2-b));
    return sum;
}

function emoji_count(str){
    return Array.from(str.split(/[\ufe00-\ufe0f]/).join("")).length;
}

class rowcolButton{
    constructor(button, value) {
        this.value = value;
        this.button = button;
    }
    darkhighlight(){
        this.button.className = "btn darkhighlighted";
    }
    highlight(){
        this.button.className = "btn highlighted";
    }
    unhighlight(){
        this.button.className = "btn unhighlighted";
    }
    select(){
        this.button.onclick();
    }
}


class Keyboard{
    constructor(user_id, first_load, partial_session, prev_data){
        console.log(prev_data);
        this.user_id = user_id;
        this.prev_data = prev_data;

        this.emoji_keyboard = true;

        this.n_pred = 0;

        this.keygrid_canvas = new widgets.KeyboardCanvas("key_grid", 1);
        this.clockface_canvas = new widgets.KeyboardCanvas("clock_face", 2);
        this.clockhand_canvas = new widgets.KeyboardCanvas("clock_hand", 3);
        this.output_canvas = new widgets.OutputCanvas("output", this.keygrid_canvas.screen_height / 2 + this.keygrid_canvas.topbar_height);

        if (this.user_id){
            this.study_manager = new sm.studyManager(this, user_id, first_load, partial_session, prev_data);
        }
        this.phrase_arr = [];
        this.emojis_selected = 0;
        this.in_session = false;

        this.run_on_focus = false;

        window.addEventListener('keydown', function (e) {
            if (e.keyCode === 32) {
                e.preventDefault();
                this.on_press();
            }
        }.bind(this), false);
        // document.onkeypress = function() {this.on_press();}.bind(this);
        window.addEventListener("resize", this.displayWindowSize.bind(this));

        this.left_context = "";
        this.lm_prefix = "";

        this.init_locs();
        if (this.prev_data && this.prev_data.rotate_index !== null) {
            this.rotate_index = this.prev_data.rotate_index;
        }else{
            this.rotate_index = config.default_rotate_ind;
        }
        this.time_rotate = config.period_li[this.rotate_index];
        this.pre_phrase_rotate_index = this.rotate_index;
        this.allow_slider_input = true;
        document.getElementById("speed_text").innerText = this.rotate_index.toString();

        this.typed = "";
        this.btyped = "";
        this.ctyped = [];
        this.context = "";
        this.old_context_li = [""];
        this.last_add_li = [0];
        this.skip_hist = false;
        this.last_selection;

        this.full_init=false;
        this.fetched_words = false;
        this.lm = new lm.LanguageModel(this);

        this.start_tutorial = first_load;
        this.in_info_screen = false;

        this.in_tutorial = first_load;
        this.in_finished_screen = false;
        this.init_ui();
    }
    continue_init(){
        this.init_words();

        console.log(this.words_on);

        this.bc_init = false;
        this.previous_undo_text = '';
        this.previous_winner = 0;

        //
        this.bc = new bc.BroderClocks(this);
        this.full_init=true;
        this.bc.init_follow_up(this.word_score_prior);

        this.histogram.update(this.bc.clock_inf.kde.dens_li);

    }
    init_ui(){
        this.speed_inc = document.getElementById("inc_speed_button");
        this.speed_dec = document.getElementById("dec_speed_button");

        this.speed_inc.onclick = function(){
            this.change_speed(Math.min(20, this.rotate_index + 1));
            this.destroy_options_rcom();
        }.bind(this);

        this.speed_dec.onclick = function(){
            this.change_speed(Math.max(0, this.rotate_index - 1));
            this.destroy_options_rcom();
        }.bind(this);

        this.abort_options_button = document.getElementById("abort_options_button");
        this.abort_options_button.onclick = function(){
            this.destroy_options_rcom();
        }.bind(this);


        this.tutorial_button = document.getElementById("tutorial_button");
        this.tutorial_button.onclick = function(){
            if (!this.in_session) {
                if (this.in_tutorial){
                    this.end_tutorial();
                } else {
                    this.init_tutorial();
                }
            }
            this.destroy_options_rcom();
        }.bind(this);

        this.change_user_button = document.getElementById("send_button");
        if (this.user_id) {
            this.change_user_button.onclick = function () {
                if (!this.in_tutorial && !this.in_session) {
                    var login_url = "../index.php";
                    window.open(login_url, '_self');
                }
                this.destroy_options_rcom();
            }.bind(this);
        } else {
            this.change_user_button.value = "RCS Keyboard";
            this.change_user_button.onclick = function () {
                var keyboard_url = "../rowcol/index.html?emoji=".concat(this.emoji_keyboard.toString());
                window.open(keyboard_url, '_self');
            }.bind(this);
        }

        this.session_button = document.getElementById("session_button");
        if (this.user_id) {
            this.session_button.onclick = function () {
                if (!this.in_tutorial) {
                    this.study_manager.request_session_data();
                }
                this.destroy_options_rcom();
            }.bind(this);
            this.session_time_label = document.getElementById("session_timer");
        } else {
            if (this.emoji_keyboard) {
                this.session_button.value = "ABC            ";
            } else {
                this.session_button.value = `😃😮😒          `;
            }

            this.session_button.onclick = function () {
                var keyboard_url = "commboard.html?emoji=".concat((this.emoji_keyboard === false).toString());
                window.open(keyboard_url, '_self');
            }.bind(this);
            document.getElementById("info_label").innerHTML =`<b>Welcome to the Nomon Keyboard! Press Retrain for help.</b>`;
        }

        this.learn_checkbox = document.getElementById("checkbox_learn");
        if (this.prev_data && this.prev_data.learn !== null){
            this.learn_checkbox.checked = this.prev_data.learn;
        }else {
            this.learn_checkbox.checked = true;
        }

        this.pause_checkbox = document.getElementById("checkbox_pause");
        if (this.prev_data && this.prev_data.pause !== null){
            this.pause_checkbox.checked = this.prev_data.pause;
        }else {
            this.pause_checkbox.checked = true;
        }

        this.audio = new Audio('../audio/bell.wav');
        this.audio_checkbox = document.getElementById("checkbox_sound");
        if (this.prev_data && this.prev_data.sound !== null){
            this.audio_checkbox.checked = this.prev_data.sound;
        }else {
            this.audio_checkbox.checked = true;
        }

        this.keygrid = new widgets.KeyGrid(this.keygrid_canvas, kconfig.comm_target_layout);
        this.clockgrid = new widgets.ClockGrid(this, this.clockface_canvas, this.clockhand_canvas, this.keygrid,
            kconfig.comm_target_layout, kconfig.comm_key_chars, kconfig.comm_main_chars, this.n_pred);
        this.textbox = new widgets.Textbox(this.output_canvas);

        this.histogram = new widgets.Histogram(this.output_canvas);

        this.continue_init();

        if (this.in_tutorial){
            this.init_tutorial();
        }

    }
    init_info_screen(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.info_canvas.calculate_size(0);
        // this.info_screen = new infoscreen.InfoScreen(this, this.info_canvas);
        this.info_canvas.grey();

    }
    init_session_info_screen(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.info_canvas.calculate_size(0);
        this.info_screen = new infoscreen.SessionInfoScreen(this.info_canvas);

        if (this.in_session){
            this.study_manager.session_pause_start_time = Math.round(Date.now() / 1000);
        }
    }
    increment_info_screen(){
        if (this.in_info_screen){
            if (this.info_screen.screen_num <= this.info_screen.num_screens){
                this.info_screen.increment_screen();
            } else {
                this.destroy_info_screen();
            }
        }
    }
    destroy_info_screen(){
        if (this.in_info_screen || this.in_tutorial) {
            this.info_canvas.ctx.clearRect(0, 0, this.info_canvas.screen_width, this.info_canvas.screen_height);

            this.in_info_screen = false;

            if (this.in_session) {
                if (this.study_manager.session_pause_start_time !== Infinity) {
                    this.study_manager.session_pause_time += Math.round(Date.now() / 1000) - this.study_manager.session_pause_start_time;
                }
                this.study_manager.session_pause_start_time = Infinity;

            } else {

            }
        }
    }
    init_tutorial(){

        this.tutorial_button.value = "Abort Retrain  ";

        this.left_context = "";
        this.typed = "";
        this.lm_prefix = "";
        this.textbox.draw_text("");

        this.tutorial_manager = new tm.tutorialManager(this, this.bc);
        this.in_tutorial = true;
        this.start_tutorial = false;
    }
    end_tutorial(){
        this.destroy_info_screen();
        this.in_tutorial = false;
        this.tutorial_manager = null;

        this.left_context = "";
        this.typed = "";
        this.typed_versions = [];
        this.lm_prefix = "";
        this.btyped = "";
        this.ctyped = [];
        this.context = "";
        this.old_context_li = [""];
        this.last_add_li = [0];
        this.textbox.draw_text("");
        this.lm.update_cache(this.left_context, this.lm_prefix);

        this.tutorial_button.value = "Retrain           ";
    }
    init_options_rcom(){
        var options_array = [
            [new rowcolButton(this.speed_dec, "1"), new rowcolButton(this.speed_inc, "2"), new rowcolButton(this.abort_options_button, "3")],
            [new rowcolButton(this.tutorial_button, "4"), new rowcolButton(this.change_user_button, "5"), new rowcolButton(this.session_button, "6")]
            ];

        if (this.in_tutorial) {
            this.RCOM = new rcom.OptionsManager(options_array, 2, this.tutorial_manager, false);
        } else {
            this.RCOM = new rcom.OptionsManager(options_array, 2, null, false);
        }
        this.RCOM_interval = setInterval(this.RCOM.animate.bind(this.RCOM), 0.05*1000);
        this.in_info_screen = true;
        this.init_info_screen();
    }
    destroy_options_rcom(){
        clearInterval(this.RCOM_interval);
        this.RCOM = null;
        if (!this.in_tutorial) {
            this.destroy_info_screen();
        }

        this.speed_inc.className = "btn unhighlighted";
        this.speed_dec.className = "btn unhighlighted";
        this.abort_options_button.className = "btn unhighlighted";
        this.tutorial_button.className = "btn unhighlighted";
        this.change_user_button.className = "btn unhighlighted";
        this.session_button.className = "btn unhighlighted";

    }
    draw_phrase(){
        this.typed_versions = [''];
        this.typed = "";
        this.study_manager.cur_phrase = "";
        this.phrase_arr = [];
        this.emojis_selected = 0;

        for (var i = 0; i<5; i++) {
            var comm_index = Math.floor(Math.random() * kconfig.comm_phrase_lookup.length);
            var comm_word = kconfig.comm_phrase_lookup[comm_index].concat(" ");
            this.study_manager.cur_phrase = this.study_manager.cur_phrase.concat(comm_word);
            this.phrase_arr.push(comm_index);
        }

        this.cur_emoji_target = (this.phrase_arr[this.emojis_selected] + 10).toString();

        this.keygrid.draw_layout();
        this.highlight_emoji();

        this.textbox.draw_text(this.study_manager.cur_phrase.concat('\n'));
        this.study_manager.phrase_num = this.study_manager.phrase_num + 1;
    }
    highlight_emoji(){
        console.log("CUR TARGET: ", this.cur_emoji_target);

        var indicies = widgets.indexOf_2d(kconfig.comm_target_layout, this.cur_emoji_target.toString());
        console.log(indicies);
        if (indicies !== false) {
            this.keygrid.highlight_square(indicies[0], indicies[1]);
        }

    }
    change_speed(index){
        var speed_index;
        if (this.in_session){
            if (this.allow_slider_input){
                var sign_change = Math.sign(Math.floor(index) - this.pre_phrase_rotate_index);
                speed_index = Math.min(Math.max(0, this.pre_phrase_rotate_index + sign_change), 20);
                this.rotate_index = speed_index;
                this.time_rotate = config.period_li[this.rotate_index];
                this.bc.time_rotate = this.time_rotate;
                this.bc.clock_inf.clock_util.change_period(this.time_rotate);

                // # update the histogram
                this.histogram.update(this.bc.clock_inf.kde.dens_li);
            } else {
                speed_index = this.pre_phrase_rotate_index;
            }
        } else {
            speed_index = Math.floor(index);

            this.rotate_index = speed_index;
            this.time_rotate = config.period_li[this.rotate_index];
            this.bc.time_rotate = this.time_rotate;
            this.bc.clock_inf.clock_util.change_period(this.time_rotate);

            // # update the histogram
            this.histogram.update(this.bc.clock_inf.kde.dens_li);
        }
        document.getElementById("speed_text").textContent = speed_index.toString();
    }
    on_press(){
        if (document.hasFocus()) {
            this.play_audio();
            if (!this.in_info_screen && !this.in_finished_screen) {
                var time_in = Date.now() / 1000;

                if (this.in_tutorial) {
                    console.log("cur_hour", this.bc.clock_inf.clock_util.cur_hours[this.tutorial_manager.target_clock]);
                    this.tutorial_manager.on_press(time_in);

                } else {
                    this.bc.select(time_in);
                    if (this.in_session) {
                        this.allow_slider_input = false;
                        this.pre_phrase_rotate_index = this.rotate_index;
                    }
                }
            }
            if (this.in_info_screen && this.info_screen){
                this.increment_info_screen();
            }
            if (this.RCOM){
                this.RCOM.update_scan_time(true);
            }
        }
    }
    start_pause(){
        this.keygrid.in_pause = true;
        this.keygrid.draw_layout();
        setTimeout(this.end_pause.bind(this), kconfig.pause_length);
        this.clockgrid.undo_label.draw_text();
    }
    end_pause(){
        this.keygrid.in_pause = false;
        this.keygrid.draw_layout();
        this.clockgrid.undo_label.draw_text();
        if(this.emoji_keyboard && this.in_session){
            this.highlight_emoji();
        }
    }
    highlight_winner(clock_index){
        this.winner_clock = this.clockgrid.clocks[clock_index];
        this.winner_clock.winner = true;
        this.winner_clock.draw_face();
        if (this.in_tutorial && this.tutorial_manager.target_num === 1){
            setTimeout(this.unhighlight_winner.bind(this), 8000);
        } else {
            setTimeout(this.unhighlight_winner.bind(this), kconfig.pause_length);
        }
    }
    unhighlight_winner(){
        this.winner_clock.winner = false;
        this.winner_clock.draw_face();
    }
    on_word_load(){
        this.fetched_words = true;
        this.clockgrid.update_word_clocks(this.lm.word_predictions);

        if (!this.full_init) {
            this.continue_init();
        }
        else{
            this.draw_words();
            this.clockface_canvas.clear();
            this.clockgrid.undo_label.draw_text();
            this.gen_word_prior(false);
            var results = [this.words_on, this.words_off, this.word_score_prior, this.is_undo, this.is_equalize, this.skip_hist];
            this.bc.continue_select(results);

            if (this.in_tutorial){
                this.tutorial_manager.update_target();
            }
        }

        if (this.in_session && this.last_selection != null){
            this.study_manager.save_selection_data(this.last_selection);
        }
    }
    init_locs(){
        var key_chars;

        key_chars = kconfig.comm_key_chars;

        this.N_rows = key_chars.length;
        this.N_keys_row = [];
        this.N_keys = 0;
        this.N_alpha_keys = 0;
        var row;
        var col;
        for (row = 0; row < this.N_rows; row++){

            var n_keys = 1;

            for (col = 0; col < n_keys; col++){
                if (!(key_chars[row] instanceof Array)){
                    if (kconfig.main_chars.includes(key_chars[row][col]) && (key_chars[row].length == 1)){
                        this.N_alpha_keys = this.N_alpha_keys + 1;
                    }
                    else if ((key_chars[row] == kconfig.space_char) && (key_chars[row].length == 1)){
                        this.N_alpha_keys = this.N_alpha_keys + 1;
                    }
                    else if (key_chars[row] == kconfig.break_chars[1] && (key_chars[row].length == 1)) {
                        this.N_alpha_keys = this.N_alpha_keys + 1;
                    }
                }
            }

            this.N_keys_row.push(n_keys);
            this.N_keys += n_keys;
        }

        // var word_clock_offset = 7 * kconfig.clock_rad;
        // var rect_offset = word_clock_offset - kconfig.clock_rad;
        // var word_offset = 8.5 * kconfig.clock_rad;
        // var rect_end = rect_offset + kconfig.word_w;

        this.clock_centers = [];
        this.win_diffs = [];
        this.word_locs = [];
        this.char_locs = [];
        this.rect_locs = [];
        this.keys_li = [];
        this.keys_ref = [];
        var index = 0;
        var word = 0;
        var key = 0;

        this.w_canvas = 0;
        this.index_to_wk = [];
        for (row = 0; row < this.N_rows; row++){
            this.w_canvas = Math.max([this.w_canvas, this.N_keys_row[row] * (6 * kconfig.clock_rad + kconfig.word_w)]);
            for (col = 0; col < this.N_keys_row[row]; col ++){

                for (var i=0; i< this.n_pred; i++){
                    // predictive words
                    this.clock_centers.push([0, 0]);
                    // win diffs
                    this.win_diffs.push(config.win_diff_base);
                    // word position
                    this.word_locs.push([0, 0]);
                    // indices
                    this.index_to_wk.push(word);
                }

                index += this.n_pred;
                word += this.n_pred;

                // key character
                // reference to index of key character
                var key_char = key_chars[row][col];
                this.keys_li.push(key_chars[row][col]);
                this.keys_ref.push(index);
                this.index_to_wk.push(key);
                // key character position
                this.char_locs.push([0, 0]);
                //  clock position for key character
                this.clock_centers.push([0, 0]);
                //  win diffs
                if ((key_char == kconfig.mybad_char) || (key_char == kconfig.yourbad_char) || (
                        key_char == kconfig.back_char)){
                    this.win_diffs.push(config.win_diff_high);
                }
                else{
                    this.win_diffs.push(config.win_diff_base);
                }
                index += 1;
                key += 1;
            }
        }
    }
    init_words(){
        this.words_li = this.lm.word_predictions;
        this.word_freq_li = this.lm.word_prediction_probs;
        this.key_freq_li = this.lm.key_probs;

        this.word_id = [];
        this.word_pair = [];
        var word = 0;
        var index = 0;
        var windex = 0;
        this.words_on = [];
        this.words_off = [];
        this.word_list = [];

        // this.words_li = this.words.sort();

        var len_con = this.context.length;
        var key;
        var pred;
        var word_str;
        for (key = 0; key < this.N_alpha_keys; key++){
            for (pred = 0; pred < this.n_pred; pred++){
                word_str = this.words_li[key][pred];
                var len_word = word_str.length;

                this.word_pair.push([key, pred]);
                if (word_str == '') {
                    this.words_off.push(index);
                }
                else{
                    this.words_on.push(index);
                }
                windex += 1;
                word += 1;
                index += 1;
            }
            this.words_on.push(index);
            this.word_pair.push([key,]);
            index += 1;
        }
        for (key = this.N_alpha_keys; key < this.N_keys; key++){
            for (pred =0; pred < this.n_pred; pred++) {
                word_str = this.words_li[key][pred];
                this.word_pair.push([key, pred]);
                this.words_off.push(index);
                index += 1;
            }
            this.words_on.push(index);
            this.word_pair.push([key,]);
            index += 1;
        }
        this.typed_versions = [''];
    }
    draw_words() {
        this.words_li = this.lm.word_predictions;
        this.word_freq_li = this.lm.word_prediction_probs;
        this.key_freq_li = this.lm.key_probs;

        this.word_id = [];
        this.word_pair = [];
        var word = 0;
        var index = 0;
        var windex = 0;
        this.words_on = [];
        this.words_off = [];
        this.word_list = [];

        var len_con = this.context.length;
        var key;
        var pred;
        var word_str;
        for (key = 0; key < this.N_alpha_keys; key++){
            for (pred = 0; pred < this.n_pred; pred++){
                word_str = this.words_li[key][pred];
                var len_word = word_str.length;

                this.word_pair.push([key, pred]);
                if (word_str == '') {
                    this.words_off.push(index);
                }
                else{
                    this.words_on.push(index);
                }
                windex += 1;
                word += 1;
                index += 1;
            }
            this.words_on.push(index);
            this.word_pair.push([key,]);
            index += 1;
        }
        for (key = this.N_alpha_keys; key < this.N_keys; key++){
            for (pred =0; pred < this.n_pred; pred++) {
                word_str = this.words_li[key][pred];
                this.word_pair.push([key, pred]);
                this.words_off.push(index);
                index += 1;
            }
            this.words_on.push(index);
            this.word_pair.push([key,]);
            index += 1;
        }
    }
    gen_word_prior(undo){
        this.word_score_prior = [];
        var N_on = this.words_on.length;

        var index;
        var i;
        var key;
        var pred;
        var prob;
        var pair;

        if (!undo) {
            for (i in this.words_on) {
                index = this.words_on[i];
                pair = this.word_pair[index];
                //  word case
                if (pair.length == 2) {
                    key = pair[0];
                    pred = pair[1];
                    prob = this.word_freq_li[key][pred] + Math.log(kconfig.rem_prob);
                    this.word_score_prior.push(prob);
                } else {
                    key = pair[0];
                    prob = Math.log(1/60);


                    // prob = prob + Math.log(kconfig.rem_prob);
                    // if (this.keys_li[key] == kconfig.mybad_char) {
                    //     prob = Math.log(kconfig.undo_prob);
                    // }
                    // if (this.keys_li[key] == kconfig.back_char) {
                    //     prob = Math.log(kconfig.back_prob);
                    // }
                    // if (this.keys_li[key] == kconfig.clear_char) {
                    //     prob = Math.log(kconfig.undo_prob);
                    // }

                    this.word_score_prior.push(prob);
                }
            }
        } else {
            for (i in this.words_on) {
                index = this.words_on[i];
                pair = this.word_pair[index];
                if (pair.length == 1) {
                    key = pair[0]
                    if (this.keys_li[key] == kconfig.mybad_char || this.keys_li[key] == kconfig.yourbad_char) {
                        prob = kconfig.undo_prob;
                        this.word_score_prior.push(Math.log(prob));
                    } else {
                        this.word_score_prior.push(-Infinity);
                    }
                } else {
                    this.word_score_prior.append(-Infinity);
                }
            }
        }
    }
    draw_typed(){
        var new_text = '';
        var redraw_words = false;

        var is_delete = false;
        var is_undo = false;

        var previous_text = this.textbox.text;
        previous_text = previous_text.replace("|", "");

        if (this.in_session) {
            previous_text = previous_text.slice(this.study_manager.cur_phrase.length + 1, previous_text.length);
        }
        if (previous_text.length > 0 && previous_text.charAt(previous_text.length - 1) == "_") {
            previous_text = previous_text.slice(0, previous_text.length - 1).concat(" ");
        }

        var last_add;
        var undo_text;
        if (this.last_add_li.length > 1) {
            last_add = this.last_add_li[this.last_add_li.length - 1];
            if (last_add > 0) {
                new_text = this.typed.slice(this.typed.length -last_add, this.typed.length);
                undo_text = new_text;
            } else if (last_add == -1) {
                new_text = '';
                is_delete = true;
                undo_text = kconfig.back_char;
            }
        } else {
            new_text = '';
            undo_text = new_text;
        }

        var index = this.previous_winner;
        if ( [kconfig.mybad_char, 'Undo'].includes(this.clockgrid.clocks[index].text)){
            is_undo = true;
            is_delete = false;
        }
        if (this.typed_versions[this.typed_versions.length - 1] == '' && this.typed_versions.length > 1) {
            undo_text = 'Clear';
        }

        var input_text;
        if (this.clear_text) {
            this.typed_versions.push('');
            input_text = "";
            this.lm_prefix = "";
            if (this.in_session) {
                this.textbox.draw_text(this.study_manager.cur_phrase.concat('\n'));
            } else {
                this.textbox.draw_text("");
            }
            this.clear_text = false;
            undo_text = 'Clear';
        }
        else if (is_delete){
            if (this.typed_versions[this.typed_versions.length -1 ] != ''){
                if (this.emoji_keyboard){
                    var emoji_length = 2;
                    this.typed_versions.push(previous_text.slice(0, previous_text.length - emoji_length));
                } else {
                    this.typed_versions.push(previous_text.slice(0, previous_text.length - 1));
                }
                new_text = this.typed_versions[this.typed_versions.length - 1];
                if (new_text.length > 0 && new_text.charAt(new_text.length - 1) == " "){
                    new_text = new_text.slice(0, new_text.length-1).concat("_");
                }

                input_text = new_text;
                if (this.in_session) {
                    new_text = this.study_manager.cur_phrase.concat('\n', new_text);
                }
                this.textbox.draw_text(new_text);
            }
            else {
                input_text = "";
                if (this.in_session) {
                    input_text = this.study_manager.cur_phrase.concat('\n', input_text);
                }
            }
        }
        else if (is_undo){
            if (this.typed_versions.length > 1){
                this.typed_versions.pop();

                new_text = this.typed_versions[this.typed_versions.length -1];
                if (new_text.length > 0 && new_text.charAt(new_text.length - 1) == " "){
                    new_text = new_text.slice(0, new_text.length - 1);
                }
                input_text = new_text;
                if (this.in_session) {
                    new_text = this.study_manager.cur_phrase.concat('\n', new_text);
                }
                this.textbox.draw_text(new_text);
            }
            else {
                input_text = "";
            }
        }
        else{
            this.typed_versions.push(previous_text.concat(new_text));

            input_text = previous_text.concat(new_text);

            if (this.in_session) {
                input_text = this.study_manager.cur_phrase.concat('\n', input_text);
            }
            this.textbox.draw_text(input_text);
        }
        if (undo_text == kconfig.mybad_char){
            undo_text = "Undo";
        }
        else if (undo_text == kconfig.back_char) {
            undo_text = "Backspace";
        }
        else if (undo_text == kconfig.clear_char) {
            undo_text = "Clear";
        }

        this.previous_undo_text = undo_text;
        this.clockgrid.undo_label.text = undo_text;
        this.clockgrid.undo_label.draw_text();
    }
    make_choice(index){
        var is_undo = false;
        var is_equalize = false;
        var is_backspace = false;

        var new_char = null;
        var new_word = null;
        var selection = null;

        // // # now pause (if desired)
        // if self.pause_set == 1:
        //     self.on_pause()
        //     self.mainWidget.pause_timer.start(kconfig.pause_length)

        // # highlight winner
        this.previous_winner = index;
        // this.highlight_winner(index);

        var i;
        // # if selected a key
        new_char = this.clockgrid.clocks[index].text;
        new_char = new_char.replace("Undo", kconfig.mybad_char);
        new_char = new_char.replace("Backspace", kconfig.back_char);
        new_char = new_char.replace("Clear", kconfig.clear_char);
        selection = new_char;

        console.log(selection);
        // # special characters
        if (new_char == kconfig.mybad_char || new_char == kconfig.yourbad_char){
            // # if added characters that turn
            if (this.last_add_li.length > 1){
                var last_add = this.last_add_li.pop();
                this.context = this.old_context_li.pop();
                if (last_add > 0){
                    this.typed = this.typed.slice(0, this.typed.length - last_add);
                }
                else if (last_add == -1){
                    var letter = this.btyped.charAt(this.btyped.length - 1);

                    this.btyped = this.btyped.slice(0, this.btyped.length-1);
                    this.typed = this.typed.concat(letter);
                }
                else if (last_add == -2){
                    var prev_typed = this.ctyped.pop();
                    this.typed = prev_typed;
                }
            }
            if (new_char == kconfig.yourbad_char) {
                is_equalize = true;
            }
            new_char = '';
            is_undo = true;
            this.emojis_selected -= 1;
        }
        else if (new_char == kconfig.clear_char) {
            new_char = '_';
            this.old_context_li.push(this.context);
            this.context = "";
            this.ctyped.push(this.typed);
            this.typed = "";
            this.last_add_li.push(-2);

            this.clear_text = true;
            this.emojis_selected = 0;
        }
        else if (new_char == "."){
            this.old_context_li.push(this.context);
            this.typed = this.typed.concat(new_char);
            this.last_add_li.push(new_char.length);

            this.context = "";
        }
        else if (new_char == "options"){
            this.init_options_rcom();
        }
        else{
            new_char = kconfig.comm_phrase_lookup[parseInt(new_char)-10].concat(" ");
            this.old_context_li.push(this.context);
            this.typed = this.typed.concat(new_char);
            this.last_add_li.push(new_char.length);
            this.emojis_selected += 1;

            this.context = "";
        }
        // # update the screen
        if (this.context != ""){
            this.left_context = this.typed.split(0,this.typed.length-this.context.length);
        }
        else{
            this.left_context = this.typed;
        }

        // this.draw_words();
        this.update_context();

        this.draw_typed();

        if (this.pause_checkbox.checked) {
            this.start_pause();
        }
        this.highlight_winner(index);

        this.is_undo = is_undo;
        this.is_equalize = is_equalize;

        // # update the word prior

        this.fetched_words = false;
        this.skip_hist = false;

        this.last_selection = selection;


        this.on_word_load();
        if (this.in_session) {
            if (this.typed.length > 2 && this.typed.slice(-2) === ".."){
                this.study_manager.phrase_complete();
                // this.init_options_rcom()
            }else if (this.emojis_selected < this.phrase_arr.length) {
                this.cur_emoji_target = this.phrase_arr[this.emojis_selected] + 10;
                this.highlight_emoji();
            } else if (this.emojis_selected < this.phrase_arr.length + 2){
                this.cur_emoji_target = ".";
                this.highlight_emoji();
            }
        }

        // return [this.words_on, this.words_off, this.word_score_prior, is_undo, is_equalize];
    }
    update_context(){
        var space_index = Math.max(this.typed.lastIndexOf(" "), this.typed.lastIndexOf("_"));
        var break_index = -1;
        for (var break_char_index in kconfig.break_chars){
            var break_char = kconfig.break_chars[break_char_index];
            break_index = Math.max(this.typed.lastIndexOf(break_char), break_index);
        }
        var context_index = Math.max(break_index, space_index);
        this.left_context = this.typed.slice(0, context_index+1);
        this.lm_prefix = this.typed.slice(context_index+1, this.typed.length);
        this.left_context = this.left_context.replace("_", " ");
    }
    execute_on_focus(){
        if (this.study_manager && this.study_manager.in_survey){

            if (this.study_manager.survey_complete){
                this.study_manager.in_survey = false;
                this.study_manager.launch_next_software();
            } else {
                this.study_manager.check_survey_complete();
            }
        }
        if (this.in_session && this.study_manager.session_pause_start_time !== Infinity){
            this.study_manager.session_pause_time += Math.round(Date.now() / 1000) - this.study_manager.session_pause_start_time;
            this.study_manager.session_pause_start_time = Infinity;
        }
        this.run_on_focus = false;

    }
    animate(){
        if (this.full_init) {
            var time_in = Date.now()/1000;
            this.bc.clock_inf.clock_util.increment(this.words_on);

            if (this.in_session){
                this.study_manager.update_session_timer(time_in);
            }
        }
        if (this.run_on_focus && document.hasFocus()){
            this.execute_on_focus();
        }
        if (!document.hasFocus() && !this.run_on_focus){
            this.run_on_focus = true;
            if (this.in_session){
                this.study_manager.session_pause_start_time = Math.round(Date.now() / 1000);
            }
        }
    }
    play_audio(){
        if (this.audio_checkbox.checked){
            this.audio.play();
        }
    }
    displayWindowSize(){

        this.keygrid_canvas.calculate_size();
        this.keygrid.generate_layout();
        this.keygrid.draw_layout();

        this.clockface_canvas.calculate_size();
        this.clockhand_canvas.calculate_size();
        this.clockgrid.clocks = [];
        this.clockgrid.generate_layout();
        this.clockgrid.update_word_clocks(this.words_li);
        for (var clock_ind in this.clockgrid.clocks){
            var clock = this.clockgrid.clocks[clock_ind];
            if (clock != null){
                clock.draw_face();
            }
        }

        this.clockgrid.undo_label.draw_text();

        if(this.emoji_keyboard && this.in_session){
            this.highlight_emoji();
        }

        this.output_canvas.calculate_size(this.keygrid_canvas.screen_height / 2 + this.keygrid_canvas.topbar_height);
        this.histogram.calculate_size();
        this.histogram.draw_box();
        this.histogram.draw_histogram();
        this.textbox.calculate_size();

        // if (this.in_info_screen){
        //     this.info_canvas.calculate_size(0);
        //     var info_screen_num = this.info_screen.screen_num - 1;
        //     if (this.in_session){
        //         this.info_screen = new infoscreen.SessionInfoScreen(this.info_canvas, info_screen_num);
        //     } else {
        //         this.info_screen = new infoscreen.InfoScreen(this, this.info_canvas, info_screen_num);
        //     }
        // }
        if (this.in_tutorial){
            this.tutorial_manager.change_focus();

        }
    }
}

const params = new URLSearchParams(document.location.search);
const user_id = params.get("user_id");
const first_load = (params.get("first_load") === 'true' || params.get("first_load") === null);
const partial_session = params.get("partial_session") === 'true';
const emoji = params.get("emoji") === 'true';
console.log("User ID: ", user_id, " First Load: ", first_load, " Partial Session: ", partial_session, " Emoji: ", emoji);

function send_login() {
    $.ajax({
        method: "GET",
        url: "../php/send_login.php",
        data: {"user_id": user_id}
    }).done(function (data) {
        var result = $.parseJSON(data);
        var click_dist;
        var prev_data;
        if (result.length > 0) {
            var prev_data = {};
            result = result[0];
            var click_dist = JSON.parse(result.click_dist);
            if (click_dist !== null) {
                console.log("Retrieved Click Dist!");
            }
            prev_data["click_dist"]= click_dist;

            var y_li = JSON.parse(result.y_li);
            if (y_li !== null) {
                console.log("Retrieved y_li!");
            }
            prev_data["y_li"]= y_li;

            var Z = JSON.parse(result.Z);
            if (Z !== null) {
                console.log("Retrieved Z!");
            }
            prev_data["Z"]= Z;

            var ksigma = JSON.parse(result.ksigma);
            if (ksigma !== null) {
                console.log("Retrieved ksigma!");
            }
            prev_data["ksigma"]= ksigma;

            var ksigma0 = JSON.parse(result.ksigma0);
            if (ksigma0 !== null) {
                console.log("Retrieved ksigma0!");
            }
            prev_data["ksigma0"]= ksigma0;

            var rotate_index = JSON.parse(result.rotate_index);
            if (rotate_index !== null) {
                console.log("Retrieved Rotation Index!");
            }
            prev_data["rotate_index"]= rotate_index;

            var learn = JSON.parse(result.learn);
            if (learn !== null) {
                console.log("Retrieved Learn Checkbox!");
            }
            prev_data["learn"]= learn;

            var pause = JSON.parse(result.pause);
            if (pause !== null) {
                console.log("Retrieved Pause Checkbox!");
            }
            prev_data["pause"]= pause;

            var sound = JSON.parse(result.sound);
            if (sound !== null) {
                console.log("Retrieved Sound Checkbox!");
            }
            prev_data["sound"]= sound;

        }

        let keyboard = new Keyboard(user_id, first_load, partial_session, prev_data);
        setInterval(keyboard.animate.bind(keyboard), config.ideal_wait_s*1000);
    });
}

if (user_id) {
    send_login();
} else {
    let keyboard = new Keyboard(user_id, true, false, null);
    setInterval(keyboard.animate.bind(keyboard), config.ideal_wait_s*1000);
}