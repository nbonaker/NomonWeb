import * as widgets from './widgets.js';
import * as kconfig from './kconfig.js';
import * as config from './config.js';
import * as lm from './lm.js';
import * as webswitch from "../webcam_switch/webcam_switch.js";
import {makeCorsRequest} from "../cors_request.js";

function log_add_exp(a_1, a_2){
    var b = Math.max(a_1, a_2);
    var sum =  b + Math.log(Math.exp(a_1 - b)+Math.exp(a_2-b));
    return sum;
}

class Keyboard{
    constructor(user_id, first_load, prev_data){
        console.log(prev_data);
        this.user_id = user_id;
        this.prev_data = prev_data;

        this.keygrid_canvas = new widgets.KeyboardCanvas("key_grid", 1);
        this.output_canvas = new widgets.OutputCanvas("output", this.keygrid_canvas.screen_height / 2 + 70);
        this.webcam_canvas = document.getElementById("webcam_canvas");
        this.webcam_enabled = false;
        this.webcam_info_complete=false;
        this.in_webcam_info_screen = false;
        this.ws = null;
        this.init_webcam_switch();

        window.addEventListener('keypress', function (e) {
            if (e.keyCode === 32) {
                this.on_press();
            }
        }.bind(this), false);
        // document.onkeypress = function() {this.on_press();}.bind(this);
        // document.onmousedown = function() {this.destroy_info_screen();}.bind(this);
        window.addEventListener("resize", this.displayWindowSize.bind(this));

        this.left_context = "";
        this.lm_prefix = "";

        this.init_locs();
        // if (this.prev_data.rotate_index !== null) {
        //     this.rotate_index = this.prev_data.rotate_index;
        // }else{
        //     this.scan_delay_index = config.default_scan_delay_index;
        // }
        this.scan_delay_index = config.default_scan_delay_index;
        this.scan_delay = config.scan_delay_li[this.scan_delay_index];

        this.extra_delay_index = config.default_extra_delay_index;
        this.extra_delay = config.extra_delay_li[this.extra_delay_index];

        this.row_scan = -1;
        this.col_scan = -1;
        this.next_scan_time = Infinity;

        this.typed = "";
        this.typed_versions = [""];
        this.btyped = "";
        this.ctyped = [];
        this.context = "";
        this.old_context_li = [""];
        this.last_add_li = [0];
        this.skip_hist = false;

        this.in_session = false;
        this.session_number = null;
        this.session_dates = null;
        this.phrase_queue = null;
        this.cur_phrase = null;
        this.phrase_num = 0;
        this.starting_software = null;
        this.session_length = null;
        this.session_start_time = null;

        this.full_init=true;
        this.fetched_words = false;
        this.lm = new lm.LanguageModel(this);

        this.in_info_screen = first_load;
        this.init_ui();
    }
    init_webcam_switch(){
        this.webcam_enabled = document.getElementById("checkbox_webcam").checked;
        if (!this.webcam_enabled){
            var ctx = this.webcam_canvas.getContext("2d");
            ctx.beginPath();
            ctx.fillStyle = "#ededed";
            ctx.rect(0, 0, this.webcam_canvas.width, this.webcam_canvas.height);
            ctx.fill();
            if (this.ws != null) {
                var stream = this.ws.face_finder.mycamvas.video.srcObject;
                stream.getTracks().forEach(function(track) {
                  track.stop();
                });
                this.ws.face_finder.mycamvas = null;
                this.ws.face_finder = null;
                this.ws = null;
            }
        }else {
            document.getElementById("checkbox_webcam").disabled = true;
            setTimeout(function(){document.getElementById("checkbox_webcam").disabled = false}, 1500);
            this.ws = new webswitch.WebcamSwitch(this);
            if (!this.webcam_info_complete) {
                this.in_webcam_info_screen = true;
                this.webcam_info_complete = true;
                this.init_webcam_info_screen();
            }
        }
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

        this.session_button = document.getElementById("session_button");
        this.session_button.onclick = function () {
            this.request_session_data();
        }.bind(this);
        this.session_time_label = document.getElementById("session_timer");

        this.audio = new Audio('../audio/bell.wav');
        this.audio_checkbox = document.getElementById("checkbox_sound");
        if (this.prev_data.sound !== null){
            this.audio_checkbox.checked = this.prev_data.sound;
        }else {
            this.audio_checkbox.checked = true;
        }

        this.checkbox_webcam = document.getElementById("checkbox_webcam");
        this.checkbox_webcam.onchange = function () {
            this.init_webcam_switch();
        }.bind(this);

        this.keygrid = new widgets.KeyGrid(this.keygrid_canvas, kconfig.target_layout);
        this.textbox = new widgets.Textbox(this.output_canvas);

        if (this.in_info_screen){
            // this.init_info_screen();
        }
    }
    init_webcam_info_screen(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.info_canvas.calculate_size(0);
        this.info_canvas.canvas.style.top = "75px";
        this.info_screen = new widgets.WebcamInfoScreen(this.info_canvas);
    }
    init_info_screen(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.info_canvas.calculate_size(0);
        this.info_canvas.canvas.style.top = "75px";
        this.info_screen = new widgets.InfoScreen(this.info_canvas);
    }
    destroy_info_screen(){
        if (this.in_info_screen || this.in_webcam_info_screen) {
            this.info_canvas.ctx.clearRect(0, 0, this.info_canvas.screen_width, this.info_canvas.screen_height);
            this.in_info_screen = false;
            this.in_webcam_info_screen = false;
        }
    }
    request_session_data(){
        var user_id = parseInt(this.user_id);
        console.log({"user_id": user_id});
        function init_phrases(keyboard) {
            $.ajax({
                method: "POST",
                url: "../php/init_study.php",
                data: {"user_id": user_id}
            }).done(function (data) {
                var result = $.parseJSON(data);
                console.log(result);
                keyboard.session_number = parseInt(result[0].sessions)+1;
                keyboard.session_dates = JSON.parse(result[0].dates);
                keyboard.phrase_queue = JSON.parse(result[0].phrase_queue);
                keyboard.parse_phrases();

                var first_software = result[0].first_software;
                if (keyboard.session_number-1 % 2){
                    keyboard.starting_software = first_software;
                }else{
                    if (first_software === "nomon") {
                        keyboard.starting_software = "rowcol";
                    }else{
                        keyboard.starting_software = "nomon";
                    }
                }
                keyboard.init_session();
            });
        }
        init_phrases(this);
    }
    init_session(){
        console.log(this.session_number, this.session_dates, this.phrase_queue, this.starting_software);
        var software_name;
        if (this.starting_software === "nomon"){
            software_name = "software A";
        } else {
            software_name = "software B";
        }
        var last_session;
        if (this.session_dates !== null){
            last_session = `Your last session was on ${this.session_dates[this.session_dates.length-1]}. `;
        } else {
            last_session = "";
        }
        var response = confirm(`Starting session ${this.session_number}. ${last_session}You will start this session with ${software_name}. Please ensure you can commit to the full hour before you press ok.`);
        if (response){
             window.addEventListener('keypress', function (e) {
                if (e.keyCode === 13) {
                    this.phrase_complete();
                }
            }.bind(this), false);

            this.in_session = true;

            this.session_button.value = "Finished Typing";
            this.session_button.onclick = null;
            this.session_button.className = "btn unclickable";

            this.change_user_button.onclick = null;
            this.change_user_button.className = "btn unclickable";

            this.learn_checkbox.checked = true;
            this.checkbox_webcam.checked = true;

            this.init_webcam_switch();
            // document.onkeypress = null;

            this.session_length = 60*3;
            this.session_start_time = Math.round(Date.now() / 1000);

            this.draw_phrase();

            if (this.session_number === 1){

                this.change_speed(1);
                this.speed_slider_output.innerHTML = 1;
                this.speed_slider.value = 1;

                this.pause_checkbox.checked = true;
                this.audio_checkbox.checked = true;
            }
            // noinspection JSAnnotator
            function create_session_table(keyboard) { // jshint ignore:line
                $.ajax({
                    method: "POST",
                    url: "../php/start_session.php",
                    data: {"user_id": keyboard.user_id.toString(), "session": keyboard.session_number.toString(), "software": "nomon"}
                }).done(function (data) {
                    var result = data;
                    console.log(result);
                });
            }
            create_session_table(this);
        }
    }
    allow_session_continue(){
        this.session_button.value = "Finished Typing";
        this.session_button.onclick = function () {
            this.session_continue();
        }.bind(this);
        this.session_button.className = "btn clickable";
    }
    session_continue(){
        var current_software_name;
        if (this.starting_software === "nomon"){
            current_software_name = "software A";
        } else {
            current_software_name = "software B";
        }

        var next_software_name;
        if (this.starting_software === "nomon"){
            next_software_name = "software B";
        } else {
            next_software_name = "software A";
        }

        var user_id = this.user_id;
        var sessions = this.session_number;

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var dates;
        if (this.session_dates !== null) {
            this.session_dates.push(date);
            dates = JSON.stringify(this.session_dates);
        } else {
            dates = JSON.stringify([date]);
        }
        var phrase_queue = JSON.stringify(this.unparse_phrases());

        var post_data = {"user_id": user_id.toString(), "sessions": sessions, "dates": dates, "phrase_queue": phrase_queue};
        console.log(post_data);

        function increment_session() { // jshint ignore:line
            $.ajax({
                method: "POST",
                url: "../php/increment_session.php",
                data: post_data
            }).done(function (data) {
                var result = data;
                console.log(result);
            });
        }
        increment_session();

        alert(`You have finished typing with ${current_software_name} in this session. You will now be redirected to ${next_software_name} to finish this session.`);
        var keyboard_url = "../html/keyboard.html";
        keyboard_url = keyboard_url.concat('?user_id=', this.user_id.toString(), '&first_load=false');
        window.open(keyboard_url,'_self');
    }
    parse_phrases(){
        var temp_phrase_queue = this.phrase_queue.slice();
        this.phrase_queue = [];
        for (var phrase_index in temp_phrase_queue){
            var phrase = temp_phrase_queue[phrase_index];
            this.phrase_queue.push(phrase.replace("8", "'"));
        }
        this.phrase_num = 0;
    }
    unparse_phrases(){
        var temp_phrase_queue = [];
        for (var phrase_index in this.phrase_queue){
            var phrase = this.phrase_queue[phrase_index];
            temp_phrase_queue.push(phrase.replace("'", "8"));
        }
        return(temp_phrase_queue);
    }
    draw_phrase(){
        this.typed_versions = [''];
        this.lm_prefix = "";
        this.left_context = "";
        this.fetched_words = false;
        this.is_undo = false;
        this.is_equalize = false;
        this.skip_hist = true;
        this.lm.update_cache(this.left_context, this.lm_prefix, null);

        this.cur_phrase = this.phrase_queue.shift();
        this.textbox.draw_text(this.cur_phrase.concat('\n'));
        this.phrase_num = this.phrase_num + 1;
    }
    phrase_complete(){
        var min_rem = Math.floor((this.session_length - (Date.now() / 1000 - this.session_start_time))/60);
        var sec_rem = Math.floor(this.session_length - (Date.now() / 1000 - this.session_start_time) - min_rem*60);

        if (min_rem <= 0 && sec_rem < 30){
            this.allow_session_continue();
        } else {
            this.draw_phrase();
        }
    }
    save_selection_data(selection){
        var phrase = this.cur_phrase.replace("'", "8");
        var phrase_num = this.phrase_num;
        selection = selection.replace("'", "8");
        var previous_text = this.textbox.text;
        var typed_text = previous_text.slice(this.cur_phrase.length + 1, previous_text.length).replace("'", "8");
        var timestamp = Date.now()/1000;
        var rotate_ind = this.rotate_index;
        var abs_click_times = JSON.stringify(this.bc.abs_click_times);
        var rel_click_times = JSON.stringify(this.bc.rel_click_times);

        this.bc.abs_click_times = [];
        this.bc.rel_click_times = [];

        var post_data = {"user_id": this.user_id.toString(), "session": this.session_number.toString(),
            "software": "nomon", "phrase": phrase, "phrase_num": phrase_num, "typed_text": typed_text,
            "timestamp": timestamp, "rotate_ind": rotate_ind, "abs_click_times": abs_click_times,
            "rel_click_times": rel_click_times, "selection": selection};

        console.log(post_data);

        // noinspection JSAnnotator
        function send_click_data(keyboard) { // jshint ignore:line
            $.ajax({
                method: "POST",
                url: "../php/send_click_data.php",
                data: post_data
            }).done(function (data) {
                var result = data;
                console.log(result);
            });
        }
        send_click_data(this);

    }
    change_scan_delay(index){
        var speed_index = Math.floor(index);
        // # period (as stored in config.py)
        this.scan_delay_index = speed_index;
        var old_scan_delay = this.scan_delay;
        this.scan_delay = config.scan_delay_li[this.scan_delay_index];

    }
    change_extra_delay(index){
        var speed_index = Math.floor(index);
        // # period (as stored in config.py)
        this.extra_delay_index = speed_index;
        var old_extra_delay = this.extra_delay;
        this.extra_delay = config.extra_delay_li[this.extra_delay_index];

    }
    on_press(){
        this.play_audio();
        if (this.fetched_words) {
            this.update_scan_time(true);
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
    on_word_load(){
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

        this.w_canvas = 0
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
            previous_text = previous_text.slice(this.cur_phrase.length + 1, previous_text.length);
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
            this.textbox.draw_text('');
            this.clear_text = false;
            undo_text = 'Clear';
        }
        else if (is_delete){
            if (this.typed_versions[this.typed_versions.length -1 ] != ''){
                this.typed_versions.push(previous_text.slice(0, previous_text.length-1));
                new_text = this.typed_versions[this.typed_versions.length - 1];
                if (new_text.length > 0 && new_text.charAt(new_text.length - 1) == " "){
                    new_text = new_text.slice(0, new_text.lenght-1).concat("_");
                }

                input_text = new_text;
                if (this.in_session) {
                    new_text = this.cur_phrase.concat('\n', new_text);
                }
                this.textbox.draw_text(new_text);
            }
            else {
                input_text = "";
                if (this.in_session) {
                    input_text = this.cur_phrase.concat('\n', input_text);
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
                    new_text = this.cur_phrase.concat('\n', new_text);
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
                input_text = this.cur_phrase.concat('\n', input_text);
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

        var i;
        // # if selected a key
        if (this.row_scan > 0){
            new_char = text;
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
            new_word = text.concat("_");
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
            this.save_selection_data(selection);
        }
        // # update the word prior

        this.fetched_words = false;
        this.skip_hist = false;
        this.lm.update_cache(this.left_context, this.lm_prefix, selection);

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

        console.log(this.row_scan, this.col_scan, press);
        if (press) {
            if (this.col_scan == -1) { // in row scan
                this.col_scan = kconfig.num_cols;
                this.next_scan_time = time_in;
            } else { // in col scan
                var selected_text;
                if (this.row_scan == 0) {
                    selected_text = this.lm.word_predictions[this.col_scan];
                } else{
                    selected_text = kconfig.target_layout[this.row_scan][this.col_scan];
                }
                this.make_choice(selected_text);

                this.col_scan = -1;
                this.row_scan = kconfig.num_rows-1;
                this.next_scan_time = Infinity;
            }

        } else {
            if (this.col_scan == -1) { // in row scan
                this.row_scan += 1;
                if (this.row_scan >= kconfig.num_rows) {
                    this.row_scan = 0;
                }

                if (this.row_scan == 0) { // first row
                    this.next_scan_time = time_in + this.scan_delay + this.extra_delay;
                } else {
                    this.next_scan_time = time_in + this.scan_delay;
                }
            } else { // in col scan
                this.col_scan += 1;
                if (this.row_scan == 0) {
                    var num_words = 0;
                    for (var word_index in this.lm.word_predictions){
                        if (this.lm.word_predictions[word_index] != ""){
                            num_words += 1;
                        }
                    }
                    if (this.col_scan >= num_words) {
                        this.col_scan = 0;
                    }
                } else {
                    if (this.col_scan >= kconfig.row_lengths[this.row_scan]) {
                        this.col_scan = 0;
                    }
                }

                if (this.col_scan == 0) { // first row
                    this.next_scan_time = time_in + this.scan_delay + this.extra_delay;
                } else {
                    this.next_scan_time = time_in + this.scan_delay;
                }
            }
        }
    }
    animate(){
        if (this.full_init) {
            var time_in = Date.now()/1000;
            if (time_in >= this.next_scan_time){
                this.update_scan_time(false);
                this.keygrid.draw_layout(this.row_scan, this.col_scan);
                this.keygrid.update_words(this.lm.word_predictions, this.row_scan, this.col_scan);
            }
            if (this.webcam_enabled) {
                if (this.ws.skip_update == 0) {
                    this.ws.face_finder.mycamvas.update();
                    this.ws.draw_switch();
                    this.ws.skip_update = true;
                }
                this.ws.skip_update = (this.ws.skip_update + 1) % 2;
            }

            if (this.in_session){
                var min_rem = Math.floor((this.session_length - (Date.now() / 1000 - this.session_start_time))/60);
                var sec_rem = Math.floor(this.session_length - (Date.now() / 1000 - this.session_start_time) - min_rem*60);
                if (min_rem >= 0) {
                    if (sec_rem < 10) {
                    sec_rem = `0${sec_rem}`;
                    }
                    this.session_time_label.innerHTML = `<b>Time remaining: ${min_rem}:${sec_rem}</b>`;
                }else{
                    this.allow_session_continue();
                }
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
        this.keygrid.update_words(this.lm.word_predictions);

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

        this.output_canvas.calculate_size(this.keygrid_canvas.screen_height / 2 + 70);
        this.histogram.calculate_size();
        this.histogram.draw_box();
        this.histogram.draw_histogram();
        this.textbox.calculate_size();
    }
}

const params = new URLSearchParams(document.location.search);
const user_id = params.get("user_id");
const first_load = (params.get("first_load") === 'true' || params.get("first_load") === null);
console.log(user_id);

var prev_data = {};

let keyboard = new Keyboard(user_id, first_load, prev_data);
        setInterval(keyboard.animate.bind(keyboard), config.ideal_wait_s*1000);

// function send_login() {
//     $.ajax({
//         method: "GET",
//         url: "../php/send_login.php",
//         data: {"user_id": user_id}
//     }).done(function (data) {
//         var result = $.parseJSON(data);
//         var click_dist;
//         var prev_data;
//         if (result.length > 0) {
//             var prev_data = {};
//             result = result[0];
//             var click_dist = JSON.parse(result.click_dist);
//             if (click_dist !== null) {
//                 console.log("Retrieved Click Dist!");
//             }
//             prev_data["click_dist"]= click_dist;
//
//             var y_li = JSON.parse(result.y_li);
//             if (y_li !== null) {
//                 console.log("Retrieved y_li!");
//             }
//             prev_data["y_li"]= y_li;
//
//             var Z = JSON.parse(result.Z);
//             if (Z !== null) {
//                 console.log("Retrieved Z!");
//             }
//             prev_data["Z"]= Z;
//
//             var ksigma = JSON.parse(result.ksigma);
//             if (ksigma !== null) {
//                 console.log("Retrieved ksigma!");
//             }
//             prev_data["ksigma"]= ksigma;
//
//             var ksigma0 = JSON.parse(result.ksigma0);
//             if (ksigma0 !== null) {
//                 console.log("Retrieved ksigma0!");
//             }
//             prev_data["ksigma0"]= ksigma0;
//
//             var rotate_index = JSON.parse(result.rotate_index);
//             if (rotate_index !== null) {
//                 console.log("Retrieved Rotation Index!");
//             }
//             prev_data["rotate_index"]= rotate_index;
//
//             var learn = JSON.parse(result.learn);
//             if (learn !== null) {
//                 console.log("Retrieved Learn Checkbox!");
//             }
//             prev_data["learn"]= learn;
//
//             var pause = JSON.parse(result.pause);
//             if (pause !== null) {
//                 console.log("Retrieved Pause Checkbox!");
//             }
//             prev_data["pause"]= pause;
//
//             var sound = JSON.parse(result.sound);
//             if (sound !== null) {
//                 console.log("Retrieved Sound Checkbox!");
//             }
//             prev_data["sound"]= sound;
//         }
//
//         let keyboard = new Keyboard(user_id, first_load, prev_data);
//         setInterval(keyboard.animate.bind(keyboard), config.ideal_wait_s*1000);
//     });
// }
//
// send_login();




// Attaching the event listener function to window's resize event

    // Calling the function for the first time
// displayWindowSize();