import * as widgets from './widgets.js';
import * as infoscreen from './info_screens.js';
import * as kconfig from './kconfig.js';
import * as config from './config.js';
import * as bc from './broderclocks.js';
import * as tm from './tutorial.js';
import * as sm from './study_manager.js';
import * as lm from './lm.js';
import * as bs from './beam_search.js'
import * as webswitch from "../webcam_switch/webcam_switch.js";
import * as webswitchlight from "../webcam_switch/webcam_switch_light.js";

import {makeCorsRequest} from "../cors_request.js";

function log_add_exp(a_1, a_2){
    var b = Math.max(a_1, a_2);
    var sum =  b + Math.log(Math.exp(a_1 - b)+Math.exp(a_2-b));
    return sum;
}

function emoji_count(str){
    return Array.from(str.split(/[\ufe00-\ufe0f]/).join("")).length;
}

class Keyboard{
    constructor(user_id, first_load, emoji, partial_session, prev_data){
        console.log(prev_data);
        this.user_id = user_id;
        this.prev_data = prev_data;
        this.emoji_keyboard = emoji;

        this.n_pred = 0;

        this.keygrid_canvas = new widgets.KeyboardCanvas("key_grid", 1);
        this.clockface_canvas = new widgets.KeyboardCanvas("clock_face", 2);
        this.clockhand_canvas = new widgets.KeyboardCanvas("clock_hand", 3);
        this.output_canvas = new widgets.OutputCanvas("output", this.keygrid_canvas.screen_height / 2 + this.keygrid_canvas.topbar_height);
        this.webcam_canvas = new webswitch.WebcamCanvas("webcam_canvas", 1);


        this.webcam_info_complete=false;
        this.in_webcam_info_screen = false;
        this.in_webcam_calibration = false;
        this.ws = null;

        if (this.user_id){
            this.webcam_type = this.prev_data.webcam_type;
            this.study_manager = new sm.studyManager(this, user_id, first_load, partial_session, prev_data);
            this.webcam_enabled = true;
            this.delay_webcam_info = true;
            this.init_webcam_switch();
        } else {
            this.webcam_enabled = false;
            this.delay_webcam_info = false;
            document.getElementById("webcam_div").style.display="none";
        }
        this.in_session = false;

        this.run_on_focus = false;

        window.addEventListener('keydown', function (e) {
            e.preventDefault();
            if (e.keyCode === 32) {
                this.on_press();
            }
        }.bind(this), false);
        // document.onkeypress = function() {this.on_press();}.bind(this);
        document.onmousedown = function() {
            this.increment_info_screen();}.bind(this);
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
        this.beamSearch = new bs.beamSearch(this);

        this.start_tutorial = first_load;
        this.in_info_screen = first_load;

        this.in_tutorial = false;
        this.in_finished_screen = false;
        this.init_ui();
    }
    init_webcam_switch(){
        this.webcam_enabled = document.getElementById("checkbox_webcam").checked;
        if (!this.webcam_enabled){
            this.webcam_canvas.draw_grey();
            if (this.ws != null) {
                var stream = document.getElementById('video').srcObject;
                stream.getTracks().forEach(function(track) {
                  track.stop();
                });
                // this.ws.face_finder.mycamvas = null;
                // this.ws.face_finder = null;
                this.ws = null;
            }
        }else {
            document.getElementById("checkbox_webcam").disabled = true;
            setTimeout(function(){document.getElementById("checkbox_webcam").disabled = false}, 1500);
            if (this.webcam_type === "face") {
                this.ws = new webswitch.WebcamSwitch(this);
                if (!this.webcam_info_complete && !this.delay_webcam_info) {
                    this.in_webcam_info_screen = true;
                    this.webcam_info_complete = true;
                    this.init_webcam_info_screen();
                }
                this.ws.face_x_calibration = 0.55 - this.prev_data["webcam_reset"];
                this.ws.triger_x_calibration = 0.93 - this.prev_data["webcam_trigger"];
            } else {
                this.ws = new webswitchlight.WebcamSwitch(this);

                this.ws.video_canvas.style.visibility = "hidden";

                if (!this.webcam_info_complete && !this.delay_webcam_info) {
                    this.in_webcam_info_screen = true;
                    this.webcam_info_complete = true;
                    this.init_webcam_info_screen();
                }
                this.ws.reset_pos = this.prev_data["webcam_reset"];
                this.ws.trigger_pos = this.prev_data["webcam_trigger"];
                this.ws.bottom_offset = this.prev_data["webcam_bottom"];
            }
        }
    }
    update_webcam_calibration(){
        function get_data(keyboard) {
            $.ajax({
                method: "GET",
                url: "../php/send_login.php",
                data: {"user_id": keyboard.user_id}
            }).done(function (data) {
                var result = $.parseJSON(data);
                result = result[0];

                var webcam_reset = JSON.parse(result.webcam_reset);
                if (webcam_reset !== null) {
                    console.log("Retrieved Webcam Reset!");
                }
                keyboard.prev_data["webcam_reset"]= webcam_reset;

                var webcam_trigger = JSON.parse(result.webcam_trigger);
                if (webcam_trigger !== null) {
                    console.log("Retrieved Webcam Trigger!");
                }
                keyboard.prev_data["webcam_trigger"]= webcam_trigger;

                var webcam_bottom = JSON.parse(result.webcam_bottom);
                if (webcam_trigger !== null) {
                    console.log("Retrieved Webcam Bottom!");
                }
                keyboard.prev_data["webcam_bottom"]= webcam_bottom;

                document.getElementById("checkbox_webcam").checked = true;
                keyboard.init_webcam_switch();
            });
        }
        this.in_webcam_calibration = false;
        get_data(this);
    }
    continue_init(){
        this.init_words();

        console.log(this.words_on);


        this.bc_init = false;
        this.previous_undo_text = '';
        this.previous_winner = 0;

        if (!this.emoji_keyboard) {
            this.gen_word_prior(false);
        }
        //
        this.bc = new bc.BroderClocks(this);
        this.full_init=true;
        this.bc.init_follow_up(this.word_score_prior);

        this.histogram.update(this.bc.clock_inf.kde.dens_li);

    }
    init_ui(){
        this.speed_slider = document.getElementById("speed_slider");
        this.speed_slider_output = document.getElementById("speed_slider_value");
        this.speed_slider_output.innerHTML = this.rotate_index;
        this.speed_slider.value = this.rotate_index;

        this.speed_slider.oninput = function() {
            this.speed_slider_output.innerHTML = this.speed_slider.value;
            this.change_speed(this.speed_slider.value);
        }.bind(this);

        this.recalibrate_button = document.getElementById("recalibrate_button");
        this.recalibrate_button.onclick = function () {
            this.in_webcam_calibration = true;
            this.run_on_focus = true;
            if (this.webcam_enabled) {
                document.getElementById("checkbox_webcam").checked = false;
                this.init_webcam_switch();
            }

            if (this.in_session){
                this.study_manager.session_pause_start_time = Math.round(Date.now() / 1000);
            }

            var url;
            if (this.webcam_type === "face") {
                url = "webcam_setup.html".concat('?user_id=', this.user_id.toString());
            } else {
                url = "webcam_setup_light.html".concat('?user_id=', this.user_id.toString());
            }
            var new_win = window.open(url, '_blank');
            new_win.focus();
        }.bind(this);

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

        this.checkbox_webcam = document.getElementById("checkbox_webcam");
        this.checkbox_webcam.onchange = function () {
            this.init_webcam_switch();
        }.bind(this);

        if (this.emoji_keyboard) {
            this.keygrid = new widgets.KeyGrid(this.keygrid_canvas, kconfig.emoji_target_layout);
            this.clockgrid = new widgets.ClockGrid(this, this.clockface_canvas, this.clockhand_canvas, this.keygrid,
                kconfig.emoji_target_layout, kconfig.emoji_key_chars, kconfig.emoji_main_chars, this.n_pred);
        } else {
            this.keygrid = new widgets.KeyGrid(this.keygrid_canvas, kconfig.alpha_target_layout);
            this.clockgrid = new widgets.ClockGrid(this, this.clockface_canvas, this.clockhand_canvas, this.keygrid,
                kconfig.alpha_target_layout, kconfig.key_chars, kconfig.main_chars, this.n_pred);
        }
        this.textbox = new widgets.Textbox(this.output_canvas);

        this.histogram = new widgets.Histogram(this.output_canvas);

        if (this.in_info_screen){
            this.init_info_screen();
        }

        this.continue_init();

    }
    init_webcam_info_screen(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.info_canvas.calculate_size(0);
        this.info_screen = new infoscreen.WebcamInfoScreen(this.info_canvas);

        if (this.in_session){
            this.study_manager.session_pause_start_time = Math.round(Date.now() / 1000);
        }
    }
    init_info_screen(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.info_canvas.calculate_size(0);
        this.info_screen = new infoscreen.InfoScreen(this, this.info_canvas);

        this.session_button.className = "btn unclickable";
        this.change_user_button.className = "btn unclickable";
        this.tutorial_button.className = "btn unclickable";
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
        } else if (this.in_webcam_info_screen){
            this.destroy_info_screen();
        }
    }
    destroy_info_screen(){
        if (this.in_info_screen || this.in_webcam_info_screen || this.in_tutorial) {
            this.info_canvas.ctx.clearRect(0, 0, this.info_canvas.screen_width, this.info_canvas.screen_height);

            this.in_info_screen = false;
            this.in_webcam_info_screen = false;

            if (this.delay_webcam_info){
                this.delay_webcam_info = false;
                this.webcam_info_complete = false;
                document.getElementById("checkbox_webcam").checked = true;
                this.init_webcam_switch();
            } else if (this.start_tutorial){
                this.init_tutorial();
            } else if (this.in_session){
                this.study_manager.session_pause_time += Math.round(Date.now() / 1000) - this.study_manager.session_pause_start_time;
                this.study_manager.session_pause_start_time = Infinity;
                if (!this.webcam_info_complete) {
                    this.init_webcam_switch();
                }
            } else {
                this.session_button.className = "btn clickable";
                this.change_user_button.className = "btn clickable";
                this.tutorial_button.className = "btn clickable";
            }
        }
    }
    init_tutorial(){
        this.session_button.className = "btn unclickable";
        this.change_user_button.className = "btn unclickable";
        this.info_button.className = "btn unclickable";
        this.tutorial_button.className = "btn clickable";
        this.tutorial_button.value = "Abort Retrain";

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
        this.lm_prefix = "";
        this.textbox.draw_text("");
        this.lm.update_cache(this.left_context, this.lm_prefix);

        this.session_button.className = "btn clickable";
        this.change_user_button.className = "btn clickable";
        this.info_button.className = "btn clickable";
        this.tutorial_button.value = "Retrain";
    }
    highlight_emoji(){
        console.log("CUR TARGET: ", this.cur_emoji_target);

        var indicies = widgets.indexOf_2d(kconfig.emoji_target_layout, this.cur_emoji_target);
        if (indicies !== false) {
            this.keygrid.highlight_square(indicies[0], indicies[1])
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
        this.speed_slider_output.innerHTML = speed_index;
        this.speed_slider.value = speed_index;
    }
    on_press(){
        if (document.hasFocus()) {
            this.play_audio();
            if (!this.in_info_screen && !this.in_webcam_info_screen && !this.in_finished_screen) {
                var time_in = Date.now() / 1000;

                this.bc.select(time_in);
                if (this.in_session) {
                    this.allow_slider_input = false;
                    this.pre_phrase_rotate_index = this.rotate_index;
                }
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
        setTimeout(this.unhighlight_winner.bind(this), kconfig.pause_length);
    }
    unhighlight_winner(){
        this.winner_clock.winner = false;
        this.winner_clock.draw_face();
    }
    on_word_load(){
        this.fetched_words = true;

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

        }

    }
    init_locs(){
        var key_chars;

        key_chars = kconfig.key_chars;

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
        this.words_li = [];
        this.word_freq_li = [];
        this.key_freq_li = this.beamSearch.key_probs;

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
        this.words_li = [];
        this.word_freq_li = [];
        this.key_freq_li = this.beamSearch.key_probs;

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
                    if (this.emoji_keyboard){
                        prob = Math.log(1/60);
                    } else {
                        prob = this.key_freq_li[key];
                    }

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
    draw_typed(conditionals){
        var text_versions = [];
        var i;
        for (i in conditionals){
            text_versions.push(conditionals[i][0]);
        }
        var text_output = text_versions[0];
        for (i=1; i<text_versions.length; i+=1){
            var cur_line = "";
            for (var char_ind in text_versions[i]){
                var cur_char = text_versions[i].charAt(char_ind);
                if (cur_char === text_versions[0].charAt(char_ind)){
                    cur_line = cur_line.concat(" ");
                } else {
                    if (cur_char === " "){
                        cur_char = "_";
                    }
                    cur_line = cur_line.concat(cur_char);
                }
            }
            text_output = text_output.concat("\n", cur_line);

        }
        this.textbox.draw_text(text_output);
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
        if ((index - this.n_pred) % (this.n_pred + 1) == 0){
            new_char = this.clockgrid.clocks[index].text;
            new_char = new_char.replace("Undo", kconfig.mybad_char);
            new_char = new_char.replace("Backspace", kconfig.back_char);
            new_char = new_char.replace("Clear", kconfig.clear_char);
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
                this.typed = ""
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
        }
        else{
            var key = this.index_to_wk[index];
            var pred = this.index_to_wk[index] % kconfig.n_pred;
            new_word = this.clockgrid.clocks[index].text;
            if (!this.emoji_keyboard && new_word.charAt(new_word.length - 1) !== "_"){
                new_word = new_word.concat("_");
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

        if (this.in_webcam_calibration){
            this.update_webcam_calibration();
        }
    }
    animate(){
        if (this.full_init) {
            var time_in = Date.now()/1000;
            this.bc.clock_inf.clock_util.increment(this.words_on);
            if (this.webcam_enabled) {
                if (this.webcam_type === "face") {
                    if (this.ws.skip_update === 0) {
                        this.ws.detect_face();
                        this.ws.skip_update = true;
                    }
                    this.ws.skip_update = (this.ws.skip_update + 1) % 2;
                } else {
                    this.ws.grab_stream();
                    this.ws.draw_switch();
                }
            }

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
        this.webcam_canvas.calculate_size();

        this.keygrid_canvas.calculate_size();
        this.keygrid.generate_layout();
        this.keygrid.draw_layout();

        this.clockface_canvas.calculate_size();
        this.clockhand_canvas.calculate_size();
        this.clockgrid.clocks = [];
        this.clockgrid.generate_layout();
        for (var clock_ind in this.clockgrid.clocks){
            var clock = this.clockgrid.clocks[clock_ind];
            if (clock != null){
                clock.draw_face();
            }
        }

        this.clockgrid.undo_label.draw_text();


        this.output_canvas.calculate_size(this.keygrid_canvas.screen_height / 2 + this.keygrid_canvas.topbar_height);
        this.histogram.calculate_size();
        this.histogram.draw_box();
        this.histogram.draw_histogram();
        this.textbox.calculate_size();

        if (this.in_info_screen){
            this.info_canvas.calculate_size(0);
            var info_screen_num = this.info_screen.screen_num - 1;
            if (this.in_session){
                this.info_screen = new infoscreen.SessionInfoScreen(this.info_canvas, info_screen_num);
            } else {
                this.info_screen = new infoscreen.InfoScreen(this, this.info_canvas, info_screen_num);
            }
        }
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

            var webcam_type = result.webcam_type;
            if (webcam_type !== null) {
                console.log("Retrieved Webcam Type!");
            }
            prev_data["webcam_type"]= webcam_type;

            var webcam_reset = JSON.parse(result.webcam_reset);
            if (webcam_reset !== null) {
                console.log("Retrieved Webcam Reset!");
            }
            prev_data["webcam_reset"]= webcam_reset;

            var webcam_trigger = JSON.parse(result.webcam_trigger);
            if (webcam_trigger !== null) {
                console.log("Retrieved Webcam Trigger!");
            }
            prev_data["webcam_trigger"]= webcam_trigger;

            var webcam_bottom = JSON.parse(result.webcam_bottom);
            if (webcam_bottom !== null) {
                console.log("Retrieved Webcam Bottom!");
            }
            prev_data["webcam_bottom"]= webcam_bottom;
        }

        let keyboard = new Keyboard(user_id, first_load, emoji, partial_session, prev_data);
        setInterval(keyboard.animate.bind(keyboard), config.ideal_wait_s*1000);
    });
}

if (user_id) {
    send_login();
} else {
    let keyboard = new Keyboard(user_id, false, emoji, false, null);
    setInterval(keyboard.animate.bind(keyboard), config.ideal_wait_s*1000);
}