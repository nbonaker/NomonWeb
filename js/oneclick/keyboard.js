import * as widgets from './widgets.js';
import {setFont} from './widgets.js';
import * as infoscreen from './info_screens.js';
import * as kconfig from './kconfig.js';
import * as config from './config.js';
import * as bc from './broderclocks.js';
import * as bc_word from './broderclocks_word.js'
import * as lm from './lm.js';

import {makeCorsRequest} from "../cors_request.js";

/**
 * The main class that orchestrates the interactive aspects of the keyboard.
 * @param {number} user_id - The id of the current user. If no backend, then null.
 * @param {boolean} first_load - Whether it is the users first time. If no backend, then null.
 * @param {Array|null} prev_data - Prior calibration and preferences data for the user. If no backend, then null.
 */
class Keyboard{
    constructor(user_id, first_load, prev_data){
        console.log(prev_data);
        this.user_id = user_id;
        this.prev_data = prev_data;


        this.keygrid_canvas = new widgets.KeyboardCanvas("key_grid", 1);
        this.clockface_canvas = new widgets.KeyboardCanvas("clock_face", 2);
        this.clockhand_canvas = new widgets.KeyboardCanvas("clock_hand", 3);
        this.output_canvas = new widgets.OutputCanvas("output", this.keygrid_canvas.screen_height / 2 + this.keygrid_canvas.topbar_height, 1);

        this.clockface_canvas_word = new widgets.OutputCanvas("clock_face_word", this.keygrid_canvas.screen_height / 2 + this.keygrid_canvas.topbar_height, 2);
        this.clockhand_canvas_word = new widgets.OutputCanvas("clock_hand_word", this.keygrid_canvas.screen_height / 2 + this.keygrid_canvas.topbar_height, 3);

        this.run_on_focus = false;

        window.addEventListener('keydown', function (e) {
            e.preventDefault();
            if (e.key === " ") {
                this.on_press();
            } else if (e.key === "Enter") {
                this.on_enter();
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
        this.context = "";
        this.old_context_li = [""];
        this.skip_hist = false;
        this.last_selection;

        this.full_init=false;
        this.fetched_words = false;
        this.lm = new lm.LanguageModel(this);

        this.start_tutorial = first_load;
        this.in_info_screen = first_load;

        this.in_tutorial = false;
        this.in_finished_screen = false;
        this.in_word_selection = false;
        this.word_options = [];
        this.word_clock_start_times = []; // Track when each word clock started
        this.init_ui();
    }

    /**
     * Continues the construction process after the Promises from the language model have completed.
     */
    continue_init(){
        this.typed_versions = [];

        this.bc = new bc.BroderClocks(this);
        this.word_bc = new bc_word.BroderClocks(this);
        this.full_init=true;
        this.bc.init_follow_up();
        this.word_bc.init_follow_up();

        // this.histogram.update(this.bc.clock_inf.kde.dens_li);
    }

    /**
     * Initializes the UI aspects (KeyGrid, ClockGrid, Clocks, Labels, WordSelector, TextBox).
     */
    init_ui(){
        this.speed_slider = document.getElementById("speed_slider");
        this.speed_slider_output = document.getElementById("speed_slider_value");
        this.speed_slider_output.innerHTML = this.rotate_index;
        this.speed_slider.value = this.rotate_index;

        this.speed_slider.oninput = function() {
            this.speed_slider_output.innerHTML = this.speed_slider.value;
            this.change_speed(this.speed_slider.value);
        }.bind(this);

        // this.tutorial_button = document.getElementById("tutorial_button");
        // this.tutorial_button.onclick = function(){
        //     if (!this.in_session && !this.in_info_screen) {
        //         if (this.in_tutorial){
        //             this.end_tutorial();
        //             this.session_button.className = "btn clickable";
        //             this.change_user_button.className = "btn clickable";
        //             this.info_button.className = "btn clickable";
        //         } else {
        //             this.init_tutorial();
        //             this.session_button.className = "btn unclickable";
        //             this.change_user_button.className = "btn unclickable";
        //             this.info_button.className = "btn unclickable";
        //         }
        //
        //     }
        // }.bind(this);

        this.change_user_button = document.getElementById("send_button");
        if (this.user_id) {
            this.change_user_button.onclick = function () {
                if (!this.in_tutorial && !this.in_session && !this.in_info_screen) {
                    var login_url = "../index.php";
                    window.open(login_url, '_self');
                }
            }.bind(this);
        } else {
            this.change_user_button.value = "RCS Keyboard";
            this.change_user_button.onclick = function () {
                var keyboard_url = "./rowcol.html?emoji=".concat(this.emoji_keyboard.toString());
                window.open(keyboard_url, '_self');
            }.bind(this);
        }

        this.session_button = document.getElementById("session_button");
        if (this.user_id) {
            this.session_button.onclick = function () {
                if (!this.in_tutorial && !this.in_info_screen) {
                    this.study_manager.request_session_data();
                }
            }.bind(this);
            this.session_time_label = document.getElementById("session_timer");
        } else {
            document.getElementById("info_label").innerHTML =`<b>Welcome to the Nomon Keyboard! Press ? for help.</b>`;
        }

        // this.commboard_button = document.getElementById("commboard_button");
        // if (!this.user_id) {
        //     this.commboard_button.onclick = function () {
        //         var keyboard_url = "./login.html?";
        //         window.open(keyboard_url, '_self');
        //     }.bind(this);
        // }

        this.info_button = document.getElementById("help_button");
        this.info_button.onclick = function () {
            if (!this.in_tutorial) {
                if (this.in_info_screen) {
                    this.destroy_info_screen();
                } else {
                    this.in_info_screen = true;

                    this.init_info_screen();

                }
            }
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

        this.tts_checkbox = document.getElementById("checkbox_tts");
        if (this.prev_data && this.prev_data.tts !== null){
            this.tts_checkbox.checked = this.prev_data.tts;
        }else {
            this.tts_checkbox.checked = true;
        }

        this.font_dropdown = document.getElementById("font_dropdown");
        if (this.font_dropdown) {
            this.font_dropdown.onchange = function() {
                var current_url = new URL(window.location);
                current_url.searchParams.set('font', this.font_dropdown.value);
                window.location.href = current_url.toString();
            }.bind(this);
        }


        this.keygrid = new widgets.KeyGrid(this.keygrid_canvas, kconfig.alpha_target_layout);
        this.clockgrid = new widgets.ClockGrid(this, this.clockface_canvas, this.clockhand_canvas, this.keygrid, 
            kconfig.alpha_target_layout, kconfig.key_chars);
        this.textbox = new widgets.Textbox(this.output_canvas);

        this.wordgrid = new widgets.WordGrid(this.clockface_canvas_word, this.clockhand_canvas_word, this.output_canvas, kconfig.num_words+1);


        if (this.in_info_screen){
            this.init_info_screen();
        }
    }
    init_info_screen(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.info_canvas.calculate_size(0);
        this.info_screen = new infoscreen.InfoScreen(this, this.info_canvas);

        this.session_button.className = "btn unclickable";
        this.change_user_button.className = "btn unclickable";
        // this.tutorial_button.className = "btn unclickable";
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
        }
    }

    /**
     * Changes the speed of clock rotation. Triggered by moving the speed slider.
     * @param {number} index - The index (1-20) of the clock period list for the speed change.
     */
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
                // this.histogram.update(this.bc.clock_inf.kde.dens_li);
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
            // this.histogram.update(this.bc.clock_inf.kde.dens_li);
        }
        this.speed_slider_output.innerHTML = speed_index;
        this.speed_slider.value = speed_index;
    }

    /**
     * Triggers the inference process after a switch press event.
     */
    on_press(){
        if (document.hasFocus()) {
            this.play_audio();
            if (!this.in_info_screen && !this.in_finished_screen) {
                var time_in = Date.now() / 1000;

                if (this.in_tutorial) {
                    console.log("cur_hour", this.bc.clock_inf.clock_util.cur_hours[this.tutorial_manager.target_clock]);
                    this.tutorial_manager.on_press(time_in);
                }
                this.bc.select(time_in);
                this.lm.update_words(this.typed, this.bc.clock_inf.format_observations());
                if (this.in_session) {
                    this.allow_slider_input = false;
                    this.pre_phrase_rotate_index = this.rotate_index;
                }
            }
        }
    }

    on_enter(){
        if (document.hasFocus()) {
            this.play_audio();
            if (!this.in_info_screen && !this.in_finished_screen) {
                var time_in = Date.now() / 1000;
                var word_index = this.word_bc.select(time_in);

                if (word_index === kconfig.num_words) {
                    if (this.bc.clock_inf.observations.length == 0 && this.typed_versions.length > 0) {
                        this.typed = this.typed_versions.pop();
                        this.textbox.draw_text(this.typed);
                    }
                } else {
                    console.log("typed: ", this.typed);
                    this.update_text(this.typed.concat(this.lm.all_options[word_index].text).concat(" "));
                }
                this.bc.clock_inf.observations = [];
                this.lm.update_words(this.typed, []);
            }
        }
    }

    /**
     * Highlights the KeyGrid following a selection.
     */
    start_pause(){
        this.keygrid.in_pause = true;
        this.keygrid.draw_layout();
        setTimeout(this.end_pause.bind(this), kconfig.pause_length);
        this.clockgrid.undo_label.draw_text();
    }

    /**
     * Ends the highlight of the KeyGrid following a selection after the timeout.
     */
    end_pause(){
        this.keygrid.in_pause = false;
        this.keygrid.draw_layout();
        this.clockgrid.undo_label.draw_text();
    }

    /**
     * Highlights the selected clock following a selection.
     * @param {number} clock_index - The index of the selected clock.
     */
    highlight_winner(clock_index){
        this.winner_clock = this.clockgrid.clocks[clock_index];
        this.winner_clock.winner = true;
        this.winner_clock.draw_face();
        setTimeout(this.unhighlight_winner.bind(this), kconfig.pause_length);
    }
    /**
     * Ends the highlight of the previously selected clock after the timeout.
     */
    unhighlight_winner(){
        this.winner_clock.winner = false;
        this.winner_clock.draw_face();
    }

    /**
     * Triggers the process of redrawing the word clocks and labels after the Language Model updates.
     */
    on_word_load(){
        if (!this.full_init) {
            this.continue_init();
        }
        
        if (this.lm.full_word_update_complete) {
            this.textbox.draw_text(this.typed, this.lm.all_options[0].text, this.bc.clock_inf.observations.length);
        }
        this.wordgrid.update(this.lm.all_options);

        this.bc.continue_select();
    }
    init_locs(){
        var key_chars = kconfig.key_chars;
        this.N_rows = key_chars.length;
        this.N_keys_row = [];
        this.N_keys = 0;
        var row;
        var col;
        for (row = 0; row < this.N_rows; row++){

            var n_keys = key_chars[row].length;

            this.N_keys_row.push(n_keys);
            this.N_keys += n_keys;
        }

        // var word_clock_offset = 7 * kconfig.clock_rad;
        // var rect_offset = word_clock_offset - kconfig.clock_rad;
        // var word_offset = 8.5 * kconfig.clock_rad;
        // var rect_end = rect_offset + kconfig.word_w;

        this.clock_centers = [];
        this.char_locs = [];
        this.rect_locs = [];
        this.keys_li = [];
        this.keys_ref = [];
        var index = 0;
        var key = 0;

        this.index_to_wk = [];
        for (row = 0; row < this.N_rows; row++){
            for (col = 0; col < this.N_keys_row[row]; col ++){

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
                index += 1;
                key += 1;
            }
        }
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

    /**
     * Formats the word and character probabilities from the language model for use in the inference module. If the user selected undo, the prior is initialized as uniform.
     * @param {boolean} undo - Whether the previous round selected the undo option.
     */
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
    /**
     *
     */
    draw_typed(){
        if (this.in_session) {
            previous_text = previous_text.slice(this.study_manager.cur_phrase.length + 1, previous_text.length);
        }

        var undo_text;
        if (this.typed_versions.length > 1) {
            const last_typed = this.typed_versions[this.typed_versions.length - 1];
            if (this.typed.length == 0) {
                undo_text = "Clear";
            }
            else if (last_typed.length > this.typed.length) {
                undo_text = "Delete";
            }
            else if ([". ", ", ", "! ", "? "].includes(this.typed.slice(this.typed.length - 2, this.typed.length))) {
                undo_text = this.typed.charAt(this.typed.length - 2);
            } else {
                undo_text = this.typed.slice(last_typed.length, this.typed.length);
            }
        } else {
            undo_text = this.typed;
        }

        this.textbox.draw_text(this.typed);

        this.previous_undo_text = undo_text;
        this.clockgrid.undo_label.text = undo_text;
        this.clockgrid.undo_label.draw_text();
    }
    speak_sentence(sentence){
        if (sentence.length > 0) {
            let speakText = sentence.trim();
            
            const speech = new SpeechSynthesisUtterance(speakText);
            speech.lang = 'en-US';
            window.speechSynthesis.speak(speech);
        }
    }
    update_text(new_text){
        this.typed_versions.push(this.typed);
        this.typed = new_text;
        this.textbox.draw_text(this.typed);
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
            new_char = new_char.replace("TTS", kconfig.tts_char);
            selection = new_char;


            // # special characters
            if (new_char == kconfig.space_char || new_char == '_') {
                new_char = ' ';
                this.old_context_li.push(this.context);
                this.typed = this.typed.concat(new_char);
                this.context = "";
                this.last_add_li.push(1);
            }
            else if (new_char == kconfig.mybad_char || new_char == kconfig.yourbad_char){

                if (this.typed_versions.length > 0){
                    this.typed = this.typed_versions.pop();
                    this.draw_typed();
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
                    this.update_text(this.typed.slice(0, this.typed.length-1));
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
                new_char = ' ';
                this.old_context_li.push(this.context);
                this.context = "";
                this.ctyped.push(this.typed);
                this.last_add_li.push(-2);

                this.update_text('');

                this.clear_text = true;
            }
            else if (new_char == kconfig.tts_char) {
                this.speak_sentence(this.typed);
                new_char = '';
                this.last_add_li.push(0);
            }
            else if (kconfig.emoji_main_chars.includes(new_char)){
                console.log("EMOJI");
                this.old_context_li.push(this.context);
                this.context.concat(new_char);
                this.last_add_li.push(new_char.length);
                this.update_text(this.typed.concat(new_char));
            }
            else if (kconfig.main_chars.includes(new_char)) {
                this.old_context_li.push(this.context);
                this.context.concat(new_char);
                this.last_add_li.push(1);
                this.update_text(this.typed.concat(new_char));
            }
            else if (kconfig.break_chars.includes(new_char)) {
                if (this.tts_checkbox.checked && ['.', '?', '!'].includes(new_char)){
                    const sentence = this.typed.split(/[.?!]/).pop().trim();
                    this.speak_sentence(sentence);
                }
                this.old_context_li.push(this.context);
                this.context = "";
                this.last_add_li.push(1);
                this.update_text(this.typed.concat(new_char).replace(/ ([.!?,])/g, "$1 "));
                // if " " + new_char in self.typed:
                //     self.last_add_li.concat(2);
                //     self.typed = self.typed.replace(" " + new_char, new_char + " ");
            }
            else{
                this.old_context_li.push(this.context);
                this.update_text(this.typed.concat(new_char));
                this.last_add_li.push(1);
            }
        }
        else{
            var key = this.index_to_wk[index];
            var pred = this.index_to_wk[index] % kconfig.n_pred;
            new_word = this.clockgrid.clocks[index].text;
            if (!this.emoji_keyboard && new_word.charAt(new_word.length - 1) !== " "){
                new_word = new_word.concat(" ");
            }
            selection = new_word;
            var context_length = this.lm_prefix.length;

            // if (context_length > 0){
            //     this.typed = this.typed.slice(context_length, this.typed.length);
            // }
            this.update_text(this.left_context.concat(new_word));
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

        navigator.clipboard.writeText(this.typed.trim());

        // this.draw_words();
        this.update_context();

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

        if (this.emoji_keyboard){
            this.on_word_load();
        } else  {
            this.lm.update_cache(this.left_context, this.lm_prefix, selection);
        }

        // return [this.words_on, this.words_off, this.word_score_prior, is_undo, is_equalize];
    }

    /**
     * Splits the currently typed text into left context and prefix for the language model. The prefix is the current word being typed, the left context is all the words before the current word.
     */
    update_context(){
        var space_index = this.typed.lastIndexOf(" ");
        var break_index = -1;
        for (var break_char_index in kconfig.break_chars){
            var break_char = kconfig.break_chars[break_char_index];
            break_index = Math.max(this.typed.lastIndexOf(break_char), break_index);
        }
        var context_index = Math.max(break_index, space_index);
        this.left_context = this.typed.slice(0, context_index+1);
        this.lm_prefix = this.typed.slice(context_index+1, this.typed.length);
    }

    /**
     * Repeatedly called on the interval defined in the config file. Triggers animation updates for the clock hands.
     */
    animate(){
        if (this.full_init) {
            var time_in = Date.now()/1000;
            this.bc.clock_inf.clock_util.increment();
            this.word_bc.clock_inf.clock_util.increment();
        }
    }

    /**
     * Plays a bell sound when the user clicks their switch
     */
    play_audio(){
        if (this.audio_checkbox.checked){
            this.audio.play();
        }
    }

    /**
     * Triggered by a window resize event. Recalculates all the sizes of the widgets for the new screen size.
     */
    displayWindowSize(){

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

        this.output_canvas.calculate_size(this.keygrid_canvas.screen_height);
        this.wordgrid.calculate_size();
        this.textbox.calculate_size();

        if (this.in_info_screen){
            this.info_canvas.calculate_size(0);
            var info_screen_num = this.info_screen.screen_num - 1;

            this.info_screen = new infoscreen.InfoScreen(this, this.info_canvas, info_screen_num);
        }
    }
}

const params = new URLSearchParams(document.location.search);
const font = params.get("font") || 'regular';

setFont(font);

let keyboard = new Keyboard(null, false, null);
setInterval(keyboard.animate.bind(keyboard), config.ideal_wait_s*1000);
