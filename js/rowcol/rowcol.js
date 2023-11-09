import * as widgets from './widgets.js';
import * as kconfig from './kconfig.js';
import * as config from './config.js';
import * as lm from './lm.js';
import {makeCorsRequest} from "../cors_request.js";
import * as infoscreen from './info_screens.js';

function log_add_exp(a_1, a_2){
    var b = Math.max(a_1, a_2);
    var sum =  b + Math.log(Math.exp(a_1 - b)+Math.exp(a_2-b));
    return sum;
}

class Keyboard{
    constructor(user_id, first_load, emoji, partial_session, prev_data){
        console.log(prev_data);
        this.user_id = user_id;
        this.prev_data = prev_data;

        this.emoji_keyboard = emoji;

        this.keygrid_canvas = new widgets.KeyboardCanvas("key_grid", 1);
        this.output_canvas = new widgets.OutputCanvas("output", this.keygrid_canvas.screen_height / 2 + this.keygrid_canvas.topbar_height);

        this.run_on_focus = false;

        window.addEventListener('keydown', function (e) {
            if (e.keyCode === 32) {
                e.preventDefault();
                this.on_press();
            }
        }.bind(this), false);
        // document.onkeypress = function() {this.on_press();}.bind(this);
        document.onmousedown = function() {this.increment_info_screen();}.bind(this);
        window.addEventListener("resize", this.displayWindowSize.bind(this));

        this.left_context = "";
        this.lm_prefix = "";

        this.init_locs();
        
        this.allow_slider_input = true;
        if (this.prev_data && this.prev_data.scan_delay !== null) {
            this.scan_delay_index = this.prev_data.scan_delay;
        }else{
            this.scan_delay_index = config.default_scan_delay_index;
        }
        this.pre_phrase_scan_delay_index = this.scan_delay_index;
        this.scan_delay = config.scan_delay_li[this.scan_delay_index];

        if (this.prev_data && this.prev_data.extra_delay !== null) {
            this.extra_delay_index = this.prev_data.extra_delay;
        }else{
            this.extra_delay_index = config.default_extra_delay_index;
        }
        this.pre_phrase_extra_delay_index = this.extra_delay_index;
        this.extra_delay = config.extra_delay_li[this.extra_delay_index];

        this.row_scan = -1;
        this.col_scan = -1;
        this.col_scan_count = 0;
        this.next_scan_time = Infinity;
        this.prev_scan_time = Infinity;

        this.rel_click_times = [];
        this.abs_click_times = [];
        this.click_scan_positions = [];

        this.typed = "";
        this.typed_versions = [""];
        this.btyped = "";
        this.ctyped = [];
        this.context = "";
        this.old_context_li = [""];
        this.last_add_li = [0];
        this.skip_hist = false;

        this.full_init=true;
        this.fetched_words = false;
        this.lm = new lm.LanguageModel(this);

        this.in_info_screen = first_load;
        this.in_finished_screen = false;
        this.init_ui();
    }
    init_ui(){
        this.speed_slider = document.getElementById("speed_slider");
        this.speed_slider_output = document.getElementById("speed_slider_value");
        this.speed_slider_output.innerHTML = this.scan_delay_index;
        this.speed_slider.value = this.scan_delay_index;

        this.speed_slider.oninput = function() {
            this.speed_slider_output.innerHTML = this.speed_slider.value;
            this.change_scan_delay(this.speed_slider.value);
        }.bind(this);

        this.extra_delay_slider = document.getElementById("extra_delay_slider");
        this.extra_delay_slider_output = document.getElementById("extra_delay_slider_value");
        this.extra_delay_slider_output.innerHTML = this.extra_delay_index;
        this.extra_delay_slider.value = this.extra_delay_index;

        this.extra_delay_slider.oninput = function() {
            this.extra_delay_slider_output.innerHTML = this.extra_delay_slider.value;
            this.change_extra_delay(this.extra_delay_slider.value);
        }.bind(this);

        this.change_user_button = document.getElementById("send_button");
        if (this.user_id) {
            this.change_user_button.onclick = function () {
                if (!this.in_session && !this.in_info_screen) {
                    var login_url = "../index.php";
                    window.open(login_url, '_self');
                }
            }.bind(this);
        } else {
            this.change_user_button.value = "Nomon Keyboard";
            this.change_user_button.onclick = function () {
                var keyboard_url = "./keyboard.html?emoji=".concat(this.emoji_keyboard.toString());
                window.open(keyboard_url, '_self');
            }.bind(this);
        }

        this.session_button = document.getElementById("session_button");

        if (this.emoji_keyboard) {
            this.session_button.value = "ABC";
        } else {
            this.session_button.value = `😃😮😒`;
        }

        this.session_button.onclick = function () {
            var keyboard_url = "rowcol.html?emoji=".concat((this.emoji_keyboard === false).toString());
            window.open(keyboard_url, '_self');
        }.bind(this);

        document.getElementById("info_label").innerHTML =`<b>Welcome to the Row Column Scanner! Press ? for help.</b>`;


        this.info_button = document.getElementById("help_button");
        this.info_button.onclick = function () {
            if (this.in_info_screen) {
                this.destroy_info_screen();
            } else {
                this.in_info_screen = true;
                if (this.in_session) {
                    this.init_session_info_screen();
                } else {
                    this.init_info_screen();
                }
            }
        }.bind(this);

        this.audio = new Audio('../audio/bell.wav');
        this.audio_checkbox = document.getElementById("checkbox_sound");
        if (this.prev_data && this.prev_data.sound !== null){
            this.audio_checkbox.checked = this.prev_data.sound;
        }else {
            this.audio_checkbox.checked = true;
        }

        if (this.emoji_keyboard) {
            this.keygrid = new widgets.KeyGrid(this.keygrid_canvas, kconfig.emoji_target_layout);
        } else {
            this.keygrid = new widgets.KeyGrid(this.keygrid_canvas, kconfig.target_layout);
        }
        this.textbox = new widgets.Textbox(this.output_canvas);

        if (this.in_info_screen){
            this.init_info_screen();
        }

        if (this.emoji_keyboard){
            this.update_scan_time(false);
            this.keygrid.draw_layout(this.row_scan, this.col_scan);
        }
    }
    init_info_screen(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.info_canvas.calculate_size(0);
        this.info_screen = new infoscreen.InfoScreen(this, this.info_canvas);
        this.change_user_button.className = "btn unclickable";
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
        if (this.in_info_screen) {
            this.info_canvas.ctx.clearRect(0, 0, this.info_canvas.screen_width, this.info_canvas.screen_height);

            this.in_info_screen = false;

            this.session_button.className = "btn clickable";
            this.change_user_button.className = "btn clickable";

        }
    }
    change_scan_delay(index){
        var speed_index;
        if (this.in_session){
            if (this.allow_slider_input){
                var sign_change = Math.sign(Math.floor(index) - this.pre_phrase_scan_delay_index);
                speed_index = Math.min(Math.max(0, this.pre_phrase_scan_delay_index + sign_change), 20);
                // # period (as stored in config.py)
                this.scan_delay_index = speed_index;
                this.scan_delay = config.scan_delay_li[this.scan_delay_index];
            } else {
                speed_index = this.pre_phrase_scan_delay_index;
            }
        } else {
            speed_index = Math.floor(index);
            // # period (as stored in config.py)
            this.scan_delay_index = speed_index;
            this.scan_delay = config.scan_delay_li[this.scan_delay_index];
        }
        this.speed_slider_output.innerHTML = speed_index;
        this.speed_slider.value = speed_index;
    }
    change_extra_delay(index){
        var speed_index;
        if (this.in_session){
            if (this.allow_slider_input){
                var sign_change = Math.sign(Math.floor(index) - this.pre_phrase_extra_delay_index);
                speed_index = Math.min(Math.max(0, this.pre_phrase_extra_delay_index + sign_change), 20);
                // # period (as stored in config.py)
                this.extra_delay_index = speed_index;
                this.extra_delay = config.extra_delay_li[this.extra_delay_index];
            } else {
                speed_index = this.pre_phrase_extra_delay_index;
            }
        } else {
            speed_index = Math.floor(index);
            // # period (as stored in config.py)
            this.extra_delay_index = speed_index;
            this.extra_delay = config.extra_delay_li[this.extra_delay_index];
        }
        this.extra_delay_slider_output.innerHTML = speed_index;
        this.extra_delay_slider.value = speed_index;

    }
    on_press(){
        if (document.hasFocus()) {
            this.play_audio();
            if ((this.fetched_words || this.emoji_keyboard) && !this.in_info_screen && !this.in_finished_screen) {
                this.update_scan_time(true);
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
    }
    highlight_winner(clock_index){
        this.winner_clock = this.clockgrid.clocks[clock_index];
        this.winner_clock.winner = true;
        this.winner_clock.draw_face();
        setTimeout(this.unhighlight_winner.bind(this), kconfig.pause_length);
    }
    unhighlight_winner(){
        this.winner_clock.winner = false;
        this.winner_clock.draw_face();
    }
    on_word_load(update_scan=true){
        this.fetched_words = true;

        if (!this.full_init) {
            this.keygrid.update_words(this.lm.word_predictions);
        }
        else{
            this.keygrid.update_words(this.lm.word_predictions);
            var results = [this.words_on, this.words_off, this.word_score_prior, this.is_undo, this.is_equalize, this.skip_hist];
        }
        this.update_scan_time(false);

        this.keygrid.draw_layout(this.row_scan, this.col_scan);
        this.keygrid.update_words(this.lm.word_predictions, this.row_scan, this.col_scan);
    }
    init_locs(){
        var key_chars = kconfig.key_chars;
        this.N_rows = key_chars.length;
        this.N_keys_row = [];
        this.N_keys = 0;
        this.N_alpha_keys = 0;
        var row;
        var col;
        for (row = 0; row < this.N_rows; row++){
            var n_keys = key_chars[row].length;
            for (col = 0; col < n_keys; col++){
                if (!(key_chars[row] instanceof Array)){
                    if (kconfig.main_chars.includes(key_chars[row][col]) && (key_chars[row].length == 1)){
                        this.N_alpha_keys = this.N_alpha_keys + 1;
                    }
                    else if ((key_chars[row] == kconfig.space_char) && (key_chars[row].length == 1)){
                        this.N_alpha_keys = this.N_alpha_keys + 1;
                    }
                    else if (key_chars[row] == kconfig.break_chars[1] && (
                            key_chars[row].length == 1)) {
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
                // predictive words
                this.clock_centers.push([0, 0]);
                this.clock_centers.push([0, 0]);
                this.clock_centers.push([0, 0]);
                // win diffs
                this.win_diffs.push(config.win_diff_base);
                this.win_diffs.push(config.win_diff_base);
                this.win_diffs.push(config.win_diff_base);
                // word position
                this.word_locs.push([0, 0]);
                this.word_locs.push([0, 0]);
                this.word_locs.push([0, 0]);
                // indices
                this.index_to_wk.push(word);
                this.index_to_wk.push(word + 1);
                this.index_to_wk.push(word + 2);
                index += 3;
                word += 3;

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
            for (pred = 0; pred < kconfig.n_pred; pred++){
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
            for (pred =0; pred < kconfig.n_pred; pred++) {
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
            for (pred = 0; pred < kconfig.n_pred; pred++){
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
            for (pred =0; pred < kconfig.n_pred; pred++) {
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
                    prob = this.key_freq_li[key];

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
    draw_typed(text){
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

        previous_text = previous_text.replace(" .", ". ");
        previous_text = previous_text.replace(" ,", ", ");
        previous_text = previous_text.replace(" ?", "? ");
        previous_text = previous_text.replace(" !", "! ");

        var index = this.previous_winner;
        if ( [kconfig.mybad_char, 'Undo'].includes(text)){
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
            if (new_text.length > 0 && new_text.charAt(new_text.length - 1) == " "){
                    new_text = new_text.slice(0, new_text.length - 1);
            }
            input_text = previous_text.concat(new_text);

            input_text = input_text.replace(" .", "._");
            input_text = input_text.replace(" ,", ",_");
            input_text = input_text.replace(" ?", "?_");
            input_text = input_text.replace(" !", "!_");

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

        // this.previous_undo_text = undo_text;
        // this.clockgrid.undo_label.text = undo_text;
        // this.clockgrid.undo_label.draw_text();
    }
    make_choice(text){
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
        // this.previous_winner = index;
        // this.highlight_winner(index);

        text = text.replace("Undo", kconfig.mybad_char);
        text = text.replace("Backspace", kconfig.back_char);
        text = text.replace("Clear", kconfig.clear_char);

        var i;

        // # if selected an emoji
        if (kconfig.emoji_main_chars.includes(text)){
            this.old_context_li.push(this.context);
            this.context.concat(text);
            this.last_add_li.push(text.length);
            this.typed = this.typed.concat(text);
            console.log("EMOJI");
            selection = text;

        // # if selected a key
        } else if (text.length === 1){
            new_char = text;

            selection = new_char;


            // # special characters
            if (new_char == kconfig.space_char || new_char == ' '){
                new_char = '_'
                this.old_context_li.push(this.context);
                this.typed = this.typed.concat(new_char);
                this.context = "";
                this.last_add_li.push(1);
            }
            else if (new_char == kconfig.mybad_char || new_char == kconfig.yourbad_char){
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
            }
            else if (new_char == kconfig.back_char){
                is_backspace = true;
                // # if delete the last character that turn
                this.old_context_li.push(this.context);

                var lt = this.typed.length;
                if (lt > 0){
                    this.btyped = this.btyped.concat(this.typed.charAt(this.typed.length-1));
                    this.last_add_li.push(-1);
                    this.typed = this.typed.slice(0, this.typed.length-1);
                    lt -= 1;
                    if (lt == 0) {
                        this.context = "";
                    }
                    else if (this.context.length > 0)
                        this.context = this.context.slice(0, this.context.length - 1);
                    // else if (!this.typed[-1].match(/[a-z]/i)) {
                    //     this.context = "";
                    // }
                    // else{
                    //     i = -1;
                    //     while ((i >= -lt) && (this.typed[i].match(/[a-z]/i))){
                    //         i -= 1;
                    //         this.context = this.typed.splice(i + 1, lt);
                    //     }
                    // }
                }
                new_char = '';
            }
            else if (new_char == kconfig.clear_char) {
                new_char = '_';
                this.old_context_li.push(this.context);
                this.context = "";
                this.ctyped.push(this.typed);
                this.typed = "";
                this.last_add_li.push(-2);

                this.clear_text = true;
            }
            else if (kconfig.main_chars.includes(new_char)) {
                this.old_context_li.push(this.context);
                this.context.concat(new_char);
                this.last_add_li.push(1);
                this.typed = this.typed.concat(new_char);
            }
            else if (kconfig.break_chars.includes(new_char)) {
                this.old_context_li.push(this.context);
                this.context = "";
                this.last_add_li.push(1);
                this.typed = this.typed.concat(new_char);
                // if " " + new_char in self.typed:
                //     self.last_add_li.concat(2);
                //     self.typed = self.typed.replace(" " + new_char, new_char + " ");
            }
            else{
                this.old_context_li.push(this.context);
                this.typed = this.typed.concat(new_char);
                this.last_add_li.push(1);
            }
        } else {
            if (text.charAt(text.length-1) !== "_") {
                new_word = text.concat("_");
            } else {
                new_word = text;
            }
            selection = new_word;
            var context_length = this.lm_prefix.length;

            // if (context_length > 0){
            //     this.typed = this.typed.slice(context_length, this.typed.length);
            // }
            this.typed = this.left_context.concat(new_word);
            // this.typed = this.typed.concat(new_word);
            this.last_add_li.push(new_word.length - this.lm_prefix.length);
            this.old_context_li.push(this.context);
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

        this.draw_typed(selection);

        this.is_undo = is_undo;
        this.is_equalize = is_equalize;

        if (this.in_session){
            this.study_manager.save_selection_data(selection);
        }
        // # update the word prior

        if (this.emoji_keyboard) {
            this.fetched_words = true;
            this.update_scan_time(false);


            this.keygrid.draw_layout(this.row_scan, this.col_scan);
        } else {
            this.fetched_words = false;
            this.skip_hist = false;
            this.lm.update_cache(this.left_context, this.lm_prefix, selection);
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
    update_scan_time(press){
        var time_in = Date.now()/1000;

        if (press) {
            this.abs_click_times.push(time_in);
            this.rel_click_times.push(time_in - this.prev_scan_time);
            this.click_scan_positions.push([this.row_scan, this.col_scan]);

            if (this.col_scan == -1) { // in row scan
                this.col_scan = kconfig.num_cols;
                this.next_scan_time = time_in;
            } else { // in col scan
                var selected_text;
                if (this.emoji_keyboard){
                    selected_text = kconfig.emoji_target_layout[this.row_scan][this.col_scan];
                } else if (this.row_scan == 0) {
                    selected_text = this.lm.word_predictions[this.col_scan];
                } else{
                    selected_text = kconfig.target_layout[this.row_scan][this.col_scan];
                }

                this.col_scan = -1;
                this.row_scan = kconfig.num_rows-1;
                this.next_scan_time = Infinity;

                this.make_choice(selected_text);
            }

        } else {
            this.prev_scan_time = this.next_scan_time;

            if (this.col_scan == -1) { // in row scan
                this.col_scan_count = 0;
                this.row_scan += 1;
                if (this.row_scan >= kconfig.num_rows) {
                    if (this.lm.word_predictions[0] === "" && !this.emoji_keyboard){  // skip first row if no word predictions
                        this.row_scan = 1;
                    } else {
                        this.row_scan = 0;
                    }
                }

                if (this.row_scan == 0 && !this.emoji_keyboard) { // first row
                    this.next_scan_time = time_in + this.scan_delay + this.extra_delay;
                } else {
                    this.next_scan_time = time_in + this.scan_delay;
                }
            } else { // in col scan
                this.col_scan += 1;
                if (this.row_scan == 0 && !this.emoji_keyboard) {
                    var num_words = 0;
                    for (var word_index in this.lm.word_predictions){
                        if (this.lm.word_predictions[word_index] != ""){
                            num_words += 1;
                        }
                    }
                    if (this.col_scan >= num_words) {
                        this.col_scan = 0;
                        this.col_scan_count += 1;
                    }
                } else {
                    if (this.emoji_keyboard) {
                        if (this.col_scan >= 8) {
                            this.col_scan = 0;
                            this.col_scan_count += 1;
                        }
                    }else {
                        if (this.col_scan >= kconfig.row_lengths[this.row_scan]) {
                            this.col_scan = 0;
                            this.col_scan_count += 1;
                        }
                    }
                }

                if (this.col_scan == 0) { // first row
                    this.next_scan_time = time_in + this.scan_delay + this.extra_delay;
                } else {
                    this.next_scan_time = time_in + this.scan_delay;
                }
            }


            if (this.col_scan_count > config.scan_abort_count){
                this.row_scan = 0;
                this.col_scan = -1;
                this.col_scan_count = 0;
            }
        }

        console.log(this.row_scan, this.col_scan, press, this.next_scan_time);
    }
    animate(){
        if (this.full_init) {
            var time_in = Date.now()/1000;
            if (time_in >= this.next_scan_time){
                this.update_scan_time(false);
                this.keygrid.draw_layout(this.row_scan, this.col_scan);
                if (!this.emoji_keyboard) {
                    this.keygrid.update_words(this.lm.word_predictions, this.row_scan, this.col_scan);
                }
            }

        }
        if (!document.hasFocus() && !this.run_on_focus){
            this.run_on_focus = true;
            if (this.in_session){
                this.study_manager.session_pause_start_time = Math.round(Date.now() / 1000);
            }
        }
    }
    play_audio() {
        if (this.audio_checkbox.checked){
            this.audio.play();
        }
    }
    displayWindowSize(){

        this.keygrid_canvas.calculate_size();
        this.keygrid.generate_layout();
        this.keygrid.draw_layout();
        if (!this.emoji_keyboard) {
            this.keygrid.update_words(this.lm.word_predictions);
        }

        this.output_canvas.calculate_size(this.keygrid_canvas.screen_height / 2 + this.keygrid_canvas.topbar_height);
        this.textbox.calculate_size();


        if (this.in_info_screen){
            this.info_canvas.calculate_size(0);
            var info_screen_num = this.info_screen.screen_num - 1;
            this.info_screen = new infoscreen.InfoScreen(this, this.info_canvas, info_screen_num);
        }
    }
}

const params = new URLSearchParams(document.location.search);
const emoji = params.get("emoji") === 'true';


let keyboard = new Keyboard(null, false, emoji, false, null);
setInterval(keyboard.animate.bind(keyboard), config.ideal_wait_s*1000);


