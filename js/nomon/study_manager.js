import * as widgets from "./widgets.js";
import * as kconfig from './kconfig.js';

export class studyManager {
    constructor(parent, user_id, first_load, phase, prev_data) {
        this.parent = parent;
        this.user_id = user_id;
        this.phase = phase;
        this.first_load = first_load;
        this.prev_data = prev_data;
        this.session_pause_time = 0;

        this.allow_session_finish = false;
        this.session_number = null;
        this.session_dates = null;
        this.phrase_queue = null;
        this.cur_phrase = null;
        this.phrase_num = 0;
        this.starting_software = null;
        this.session_length = null;
        this.session_start_time = null;

        this.intermediate_survey = false;
        this.final_survey = false;
        this.short_tlx = false;
        this.full_tlx = false;
        this.in_survey = false;
        this.survey_complete = false;

        this.sent_beacon = false;
    }

    init_session() {

        // var response = confirm(`Starting session ${this.session_number}. ${last_session}You will start this session with ${software_name}. Please ensure you can commit to the full hour before you press ok.`);
        var response = true;
        if (response) {

            window.addEventListener('beforeunload', this.finish_session.bind(this), false);

            this.parent.in_session = true;

            document.getElementById("info_label").innerHTML = `<i>Copy the phrase below. Type two periods \"..\" to finish.</i>`;

            this.parent.end_session_button = document.getElementById("end_session_button");
            this.parent.end_session_button.onclick = function(e){
                if (e) {     // ignore if PointerEvent or other Mouse related event (not triggered by "switch")
                    return
                }
                this.destroy_options_rcom();
                this.end_session_alert();

            }.bind(this.parent);

            this.parent.end_session_button.className = "btn unhighlighted";
            this.parent.tutorial_button.className = "btn unhighlighted";
            // document.onkeypress = null;

            this.session_start_time = 0;
            this.session_pause_time = 0;
            this.session_pause_start_time = Infinity;

            this.parent.bc.abs_click_times = [];
            this.parent.bc.rel_click_times = [];
            this.parent.last_selection = null;

            this.num_clicks = 0;

            this.parent.draw_phrase();

            this.init_session_specifics();

        }
    }

    init_session_specifics() {

        this.session_length = 10 * 60;

        if (this.first_load) {
            this.parent.init_session_help();
        } else {
            // this.parent.init_session_help();
            // this.parent.help_manager.target_num = 5;
            // this.parent.help_manager.progress_screens();
        }

        // this.parent.change_speed(1);
        // this.parent.pre_phrase_rotate_index = 1;

        // this.parent.in_info_screen = true;
        // this.parent.init_session_info_screen();

        //remove after beta testing:
        // this.intermediate_survey = true;
        // this.full_tlx = true;

    }

    allow_session_continue() {
        document.getElementById("info_label").innerHTML = `<i>This is your last phrase.</i>`;
    }

    finish_session(exit=true) {
        this.in_finished_screen = true;

        this.parent.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.parent.info_canvas.calculate_size(0);

        this.parent.info_canvas.ctx.beginPath();
        this.parent.info_canvas.ctx.fillStyle = "rgba(232,232,232, 0.5)";
        this.parent.info_canvas.ctx.rect(0, 0, this.parent.info_canvas.screen_width, this.parent.info_canvas.screen_height);
        this.parent.info_canvas.ctx.fill();

        this.parent.textbox.draw_text("");


        this.session_continue();


        if (exit) {
            if (this.parent.help_manager) {
                this.parent.help_manager.monitor_study_end();
            }
            document.getElementById("info_label").innerHTML = `<i>You have finished this session. Click to return to the Interface Selection Page.</i>`;
            this.parent.on_press = function () {
                var login_url = "./training_menu.html";
                let anticache = (Math.random() + 1).toString(36).substring(7);
                login_url = login_url.concat("?user_id=", user_id.toString(), "&phase=", this.study_manager.phase, "&anticache=", anticache, "&sender=nomon");
                window.open(login_url, '_self');
            }
        }
    }

    session_continue() {
        var user_id = this.user_id;
        var sessions = this.session_number;

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var dates;
        if (this.session_dates !== null) {
            this.session_dates.push(date);
            dates = JSON.stringify(this.session_dates);
        } else {
            dates = JSON.stringify([date]);
        }
        var phrase_queue = JSON.stringify(this.unparse_phrases());

        var phase;
        var new_phase;
        if (this.phase === "intro") {
            phase = "practice";
            new_phase = "intro";
        } else {
            phase = this.phase;
            new_phase = this.phase;
        }
        this.phase = new_phase;

        let post_data = new FormData();

        post_data.append('user_id', user_id.toString());
        post_data.append("sessions", sessions);
        post_data.append("dates", dates);
        post_data.append("phrase_queue", phrase_queue);
        post_data.append("software", "nomon");
        post_data.append("phase", phase);
        post_data.append("new_phase", new_phase);

        // var post_data = {"user_id": user_id.toString(), "sessions": sessions, "dates": dates,
        //     "phrase_queue": phrase_queue, "software": "nomon", "phase": phase, "new_phase": new_phase};


        if (this.sent_beacon){ // don't update server twice
            return
        } else{
            this.sent_beacon = true;
        }
        console.log(post_data);

        let result = navigator.sendBeacon("../php/increment_session.php", post_data);
        console.log(result);

        // function increment_session() { // jshint ignore:line
        //     $.ajax({
        //         method: "POST",
        //         url: "../php/increment_session.php",
        //         data: post_data
        //     }).done(function (data) {
        //         var result = data;
        //         console.log(result);
        //     });
        // }
        // increment_session();
        // this.launch_surveys();

    }

    parse_phrases() {
        var temp_phrase_queue = this.phrase_queue.slice();
        this.phrase_queue = [];
        for (var phrase_index in temp_phrase_queue) {
            var phrase = temp_phrase_queue[phrase_index];
            this.phrase_queue.push(phrase.replace(new RegExp("8", "g"), "'"));
        }
        this.phrase_num = 0;
    }

    unparse_phrases() {
        var temp_phrase_queue = [];
        for (var phrase_index in this.phrase_queue) {
            var phrase = this.phrase_queue[phrase_index];
            temp_phrase_queue.push(phrase.replace(new RegExp("'", "g"), "8"));
        }
        return (temp_phrase_queue);
    }

    phrase_complete() {
        var time_in = Date.now() / 1000;

        var session_paused_time = this.session_pause_time;
        if (this.session_pause_start_time !== Infinity) {
            session_paused_time += time_in - this.session_pause_start_time;
        }
        var session_rem_time = this.session_length - (time_in - this.session_start_time) + session_paused_time;
        var min_rem = Math.floor((session_rem_time) / 60);
        var sec_rem = Math.floor(session_rem_time) - min_rem * 60;

        console.log(min_rem, sec_rem);

        this.parent.phrase_arr.push('.');
        this.parent.phrase_arr.push('.');
        console.log(this.parent.typed_arr, this.parent.phrase_arr);

        var entry_rate = this.parent.typed_arr.length / (time_in - this.session_start_time)*60;
        var click_load = this.num_clicks / this.parent.typed_arr.length;
        var error_rate = 0;
        for (var i=0; i < this.parent.phrase_arr.length; i+=1){
            if (this.parent.typed_arr.length > i){
                if (this.parent.phrase_arr[i] != this.parent.typed_arr[i]){
                    error_rate += 1;
                }
            } else {
                error_rate += 1;
            }
        }
        error_rate /= this.parent.phrase_arr.length;

        console.log("Entry Rate: ", entry_rate);
        console.log("Click Load: ", click_load);
        console.log("Error Rate: ", error_rate);


        var post_data = {'username': this.parent.user_id, 'is_mobile': 0, 'timestamp': time_in, 'entry_rate': entry_rate,
            'error_rate': error_rate, 'click_load': click_load};

        function send_click_data() { // jshint ignore:line
            $.ajax({
                method: "POST",
                url: "../php/update_scoreboard.php",
                data: post_data
            }).done(function (data) {
                var result = data;
                console.log(result);
            });
        }

        send_click_data();

        this.parent.typed_arr = [];
        this.parent.draw_phrase();
        this.init_session();

    }

    parse_emojis(text) {
        var output_text = "";
        var emoji_arr = Array.from(text);
        for (var index in emoji_arr) {
            var emoji = emoji_arr[index];
            output_text = output_text.concat(kconfig.emoji_conversion_dict[emoji]);
        }
        return output_text;
    }

    save_data() {
        var previous_text = this.parent.textbox.text;
        var phrase;
        var typed_text = previous_text.slice(this.cur_phrase.length + 1, previous_text.length);


        phrase = this.cur_phrase.replace("'", "8");
        typed_text = typed_text.replace("'", "8");
        selection = selection.replace("'", "8");


        var phrase_num = this.phrase_num;


        var timestamp = Date.now() / 1000;
        var rotate_ind = this.parent.rotate_index;
        var abs_click_times = JSON.stringify(this.parent.bc.abs_click_times);
        var rel_click_times = JSON.stringify(this.parent.bc.rel_click_times);

        this.parent.bc.abs_click_times = [];
        this.parent.bc.rel_click_times = [];
        //
        // var post_data = {
        //     "user_id": this.user_id.toString(), "session": this.session_number.toString(),
        //     "software": "nomon", "phrase": phrase, "phrase_num": phrase_num, "typed_text": typed_text,
        //     "timestamp": timestamp, "rotate_ind": rotate_ind, "abs_click_times": abs_click_times,
        //     "rel_click_times": rel_click_times, "selection": selection
        // };
        //
        // console.log(post_data);
        //
        // // noinspection JSAnnotator
        // function send_click_data(keyboard) { // jshint ignore:line
        //     $.ajax({
        //         method: "POST",
        //         url: "../php/send_click_data.php",
        //         data: post_data
        //     }).done(function (data) {
        //         var result = data;
        //         console.log(result);
        //     });
        // }
        //
        // send_click_data(this.parent);

    }

    update_session_timer(time_in) {

        if (this.session_start_time === 0) {
            var elapsed_time = 0;
        } else {
            var elapsed_time = time_in - this.session_start_time;
        }
        var min_rem = Math.floor((elapsed_time) / 60);
        var sec_rem = Math.floor(elapsed_time) - min_rem * 60;
        if (min_rem >= 0) {
            if (sec_rem < 10) {
                sec_rem = `0${sec_rem}`;
            }
            this.parent.session_time_label.innerHTML = `<b>Time Elapsed: ${min_rem}:${sec_rem}</b>`;
        }

    }
}