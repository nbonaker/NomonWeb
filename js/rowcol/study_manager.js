import * as widgets from "./widgets.js";


export class studyManager {
    constructor(parent, user_id, first_load, partial_session, prev_data){
        this.parent = parent;
        this.partial_session = partial_session;
        this.user_id = user_id;
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

    }
    request_session_data(){
        var user_id = parseInt(this.user_id);
        console.log({"user_id": user_id});
        function init_phrases(study_manager) {
            $.ajax({
                method: "POST",
                url: "../php/init_study.php",
                data: {"user_id": user_id}
            }).done(function (data) {
                var result = $.parseJSON(data);
                console.log(result);
                study_manager.session_number = parseInt(result[0].rowcol_sessions)+1;
                study_manager.session_dates = JSON.parse(result[0].dates);
                study_manager.phrase_queue = JSON.parse(result[0].rowcol_phrase_queue);
                study_manager.parse_phrases();

                study_manager.starting_software = "rocol";

                study_manager.init_session();
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
             window.addEventListener('keydown', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    this.phrase_complete();
                }
            }.bind(this), false);

            this.parent.in_session = true;

            document.getElementById("info_label").innerHTML =`<i>Copy the phrase in the box below. Press enter for the next phrase.</i>`;

            this.parent.session_button.value = "End Session";
            this.parent.session_button.onclick = null;
            this.parent.session_button.className = "btn unclickable";

            this.parent.change_user_button.className = "btn unclickable";

            this.parent.checkbox_webcam.checked = true;

            // this.init_webcam_switch();
            // document.onkeypress = null;

            this.session_length = 60*3;
            this.session_start_time = Math.round(Date.now() / 1000);
            this.session_pause_time = 0;
            this.session_pause_start_time = Infinity;

            this.parent.draw_phrase();

            if (this.session_number === 1){

                this.parent.change_scan_delay(1);
                this.parent.speed_slider_output.innerHTML = 1;
                this.parent.speed_slider.value = 1;
                this.parent.pre_phrase_scan_delay_index = 1;

                this.parent.change_extra_delay(1);
                this.parent.extra_delay_slider_output.innerHTML = 1;
                this.parent.extra_delay_slider.value = 1;
                this.parent.pre_phrase_extra_delay_index = 1;

                this.parent.audio_checkbox.checked = true;

                this.parent.in_info_screen = true;
                this.parent.init_session_info_screen();
            } else {
                this.parent.pre_phrase_scan_delay_index = this.parent.scan_delay_index;
                this.parent.pre_phrase_extra_delay_index = this.parent.extra_delay_index;
                this.parent.init_webcam_switch();
            }
            // noinspection JSAnnotator
            function create_session_table(study_manager) { // jshint ignore:line
                $.ajax({
                    method: "POST",
                    url: "../php/start_session.php",
                    data: {"user_id": study_manager.user_id.toString(), "session": study_manager.session_number.toString(), "software": "rowcol"}
                }).done(function (data) {
                    var result = data;
                    console.log(result);
                });
            }
            create_session_table(this);
        }
    }
    allow_session_continue(){
        this.parent.session_button.value = "Finished Typing";
        this.parent.session_button.onclick = function () {
            this.session_continue();
        }.bind(this);
        this.parent.session_button.className = "btn clickable";
        this.allow_session_finish = true;

        document.getElementById("info_label").innerHTML =`<i>This is your last phrase.</i>`;
    }
    finish_session(){
        this.in_finished_screen = true;
        this.parent.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.parent.info_canvas.calculate_size(0);

        this.parent.info_canvas.ctx.beginPath();
        this.parent.info_canvas.ctx.fillStyle = "rgba(232,232,232, 0.5)";
        this.parent.info_canvas.ctx.rect(0, 0, this.parent.info_canvas.screen_width, this.parent.info_canvas.screen_height);
        this.parent.info_canvas.ctx.fill();

        this.parent.info_button.disabled = true;
        this.parent.info_button.className = "btn unclickable";
        document.getElementById("info_label").innerHTML =`<i>press Finished Typing</i>`;
        this.parent.textbox.draw_text("");

    }
    session_continue(){
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

        var post_data = {"user_id": user_id.toString(), "sessions": sessions, "dates": dates, "phrase_queue": phrase_queue, "software": "rowcol"};
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

        var keyboard_url;
        if (this.partial_session){
            alert(`You have finished typing for this session. Click to exit.`);
            keyboard_url = "../index.php";
            window.open(keyboard_url, '_self');
        } else {
            alert(`You have finished typing with Software B in this session. You will now be redirected to Software A to finish this session.`);
            keyboard_url = "../html/keyboard.html";

            var first_load;
            if (this.session_number === 1){
                first_load = "true";
            } else {
                first_load = "false";
            }
            keyboard_url = keyboard_url.concat('?user_id=', this.user_id.toString(), '&first_load=', first_load, '&partial_session=true');
            window.open(keyboard_url, '_self');
        }
    }
    parse_phrases(){
        var temp_phrase_queue = this.phrase_queue.slice();
        this.phrase_queue = [];
        for (var phrase_index in temp_phrase_queue){
            var phrase = temp_phrase_queue[phrase_index];
            this.phrase_queue.push(phrase.replace(new RegExp("8", "g"), "'"));
        }
        this.phrase_num = 0;
    }
    unparse_phrases(){
        var temp_phrase_queue = [];
        for (var phrase_index in this.phrase_queue){
            var phrase = this.phrase_queue[phrase_index];
            temp_phrase_queue.push(phrase.replace(new RegExp("'", "g"), "8"));
        }
        return(temp_phrase_queue);
    }
    phrase_complete(){
        var time_in = Date.now()/1000;

        var session_paused_time = this.session_pause_time;
        if (this.session_pause_start_time !== Infinity){
            session_paused_time += time_in - this.session_pause_start_time;
        }
        var session_rem_time = this.session_length - (time_in - this.session_start_time) + session_paused_time;
        var min_rem = Math.floor((session_rem_time)/60);
        var sec_rem = Math.floor(session_rem_time) - min_rem*60;

        if ((min_rem <= 0 && sec_rem < 30) || (min_rem < 0)){
            this.allow_session_continue();
        } else {
            this.parent.draw_phrase();
            this.parent.pre_phrase_scan_delay_index = this.parent.scan_delay_index;
            this.parent.pre_phrase_extra_delay_index = this.parent.extra_delay_index;
            this.parent.allow_slider_input = true;
        }

        if (this.allow_session_finish){
            this.finish_session();
        }
    }
    save_selection_data(selection){
        var phrase = this.cur_phrase.replace("'", "8");
        var phrase_num = this.phrase_num;
        selection = selection.replace("'", "8");
        var previous_text = this.parent.textbox.text;
        var typed_text = previous_text.slice(this.cur_phrase.length + 1, previous_text.length).replace("'", "8");
        var timestamp = Date.now()/1000;
        var scan_delay = this.parent.scan_delay_index;
        var extra_delay = this.parent.extra_delay_index;
        var abs_click_times = JSON.stringify(this.parent.abs_click_times);
        var rel_click_times = JSON.stringify(this.parent.rel_click_times);
        var click_scan_positions = JSON.stringify(this.parent.click_scan_positions);

        this.parent.abs_click_times = [];
        this.parent.rel_click_times = [];
        this.parent.click_scan_positions = [];

        var post_data = {"user_id": this.user_id.toString(), "session": this.session_number.toString(),
            "software": "rowcol", "phrase": phrase, "phrase_num": phrase_num, "typed_text": typed_text,
            "timestamp": timestamp, "scan_delay": scan_delay, "extra_delay": extra_delay, "abs_click_times": abs_click_times,
            "rel_click_times": rel_click_times, "click_scan_pos": click_scan_positions, "selection": selection};

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
        send_click_data(this.parent);

    }
    update_session_timer(time_in){
        var session_paused_time = this.session_pause_time;
        if (this.session_pause_start_time !== Infinity){
            session_paused_time += time_in - this.session_pause_start_time;
        }
        var session_rem_time = this.session_length - (time_in - this.session_start_time) + session_paused_time;
        var min_rem = Math.floor((session_rem_time)/60);
        var sec_rem = Math.floor(session_rem_time) - min_rem*60;
        if (min_rem >= 0) {
            if (sec_rem < 10) {
            sec_rem = `0${sec_rem}`;
            }
            this.parent.session_time_label.innerHTML = `<b>Time remaining: ${min_rem}:${sec_rem}</b>`;
        }else{
            if (!this.allow_session_finish) {
                this.allow_session_continue();
            }
        }
    }
}