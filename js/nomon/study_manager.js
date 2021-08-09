import * as widgets from "./widgets.js";
import * as kconfig from './kconfig.js';

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

        this.intermediate_survey = false;
        this.final_survey = false;
        this.short_tlx = false;
        this.full_tlx = false;
        this.in_survey = false;
        this.survey_complete = false;


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
                study_manager.session_number = parseInt(result[0].nomon_sessions)+1;
                study_manager.session_dates = JSON.parse(result[0].dates);
                study_manager.phrase_queue = JSON.parse(result[0].nomon_phrase_queue);
                study_manager.parse_phrases();

                study_manager.starting_software = "nomon";

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
        // var response = confirm(`Starting session ${this.session_number}. ${last_session}You will start this session with ${software_name}. Please ensure you can commit to the full hour before you press ok.`);
        var response = true;
        if (response){
            //  window.addEventListener('keydown', function (e) {
            //     if (e.keyCode === 13) {
            //         e.preventDefault();
            //         this.phrase_complete();
            //     }
            //     else if (e.keyCode === 32) {
            //         e.preventDefault();
            //         this.parent.on_press();
            //     }
            // }.bind(this), false);

            this.parent.in_session = true;

            document.getElementById("info_label").innerHTML =`<i>Copy the phrase below. Press enter for the next phrase.</i>`;

            this.parent.session_button.value = "End Session";
            this.parent.session_button.onclick = null;
            this.parent.session_button.className = "btn unclickable";

            // this.parent.change_user_button.className = "btn unclickable";
            this.parent.change_user_button.style.display = "none";

            this.parent.learn_checkbox.checked = true;
            this.parent.learn_checkbox.disabled = true;
            this.parent.pause_checkbox.checked = true;
            this.parent.pause_checkbox.disabled = true;

            // document.onkeypress = null;

            this.session_start_time = Math.round(Date.now() / 1000);
            this.session_pause_time = 0;
            this.session_pause_start_time = Infinity;

            this.parent.bc.abs_click_times = [];
            this.parent.bc.rel_click_times = [];
            this.parent.last_selection = null;

            this.parent.draw_phrase();

            this.init_session_specifics();

            // noinspection JSAnnotator
            function create_session_table(study_manager) { // jshint ignore:line
                $.ajax({
                    method: "POST",
                    url: "../php/start_session.php",
                    data: {"user_id": study_manager.user_id.toString(), "session": study_manager.session_number.toString(), "software": "nomon"}
                }).done(function (data) {
                    var result = data;
                    console.log(result);
                });
            }
            create_session_table(this);
        }
    }
    init_session_specifics(){

        if (this.session_number <= 9){
            if (this.session_number === 1){
                this.session_length = 10*60;

                // this.parent.change_speed(1);
                // this.parent.pre_phrase_rotate_index = 1;

                // this.parent.in_info_screen = true;
                // this.parent.init_session_info_screen();

                //remove after beta testing:
                // this.intermediate_survey = true;
                // this.full_tlx = true;

            } else if (this.session_number === 2) {
                this.session_length = 10*60;
                this.parent.change_speed(this.parent.pre_phrase_rotate_index);

                this.parent.in_info_screen = true;
                this.parent.init_session_info_screen();
                //tlx full and questionnaire
                this.intermediate_survey = true;
                this.full_tlx = true;

            } else if (this.session_number === 5){
                this.session_length = 20*60;
                this.parent.change_speed(this.parent.pre_phrase_rotate_index);
                //tlx short and questionnaire
                this.intermediate_survey = true;
                this.short_tlx = true;

            } else if (this.session_number === 9){
                this.session_length = 20*60;
                this.parent.change_speed(this.parent.pre_phrase_rotate_index);
                //tlx full and questionnaire
                //final questionnaire
                this.intermediate_survey = true;
                this.final_survey = true;
                this.full_tlx = true;

            } else {
                this.session_length = 20*60;
                this.parent.change_speed(this.parent.pre_phrase_rotate_index);
            }

        } else if (this.session_number === 10){
            this.session_length = 20*60;
            this.parent.change_speed(this.parent.pre_phrase_rotate_index);
            //tlx full and questionnaire
            //final questionnaire
            this.intermediate_survey = true;
            this.final_survey = true;
            this.full_tlx = true;

        }

        this.parent.pause_checkbox.checked = true;
        this.parent.audio_checkbox.checked = true;
    }
    allow_session_continue(){
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

        var post_data = {"user_id": user_id.toString(), "sessions": sessions, "dates": dates, "phrase_queue": phrase_queue, "software": "nomon"};
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
        this.launch_surveys();

    }
    launch_surveys() {
        if (this.intermediate_survey) {
            alert(`You will now fill out a couple of surveys about your experience using Keyboard A. The survey will open in a new tab. DO NOT CLOSE THIS TAB.`);

            var survey_url = "../html/questionnaire_intermediate.html".concat('?user_id=', this.user_id.toString(), '&condition=A&session=',
                this.session_number.toString(), '&partial_session=', this.partial_session.toString());

            if (this.full_tlx) {
                survey_url = survey_url.concat('&tlx=full');
            } else if (this.short_tlx) {
                survey_url = survey_url.concat('&tlx=short');
            } else {
                survey_url = survey_url.concat('&tlx=false');
            }

            if (this.final_survey) {
                survey_url = survey_url.concat('&final=true');
            } else {
                survey_url = survey_url.concat('&final=false');
            }

            this.survey_win = window.open(survey_url, '_blank');
            this.survey_win.focus();

            this.in_survey = true;
            this.parent.run_on_focus = true;
        } else {
            this.launch_next_software();
        }
    }
    check_survey_complete(){
        var get_data = {};

        get_data["user_id"] = this.user_id;
        get_data["condition"] = "A";
        get_data["order"] = 1 + (this.partial_session | 0);
        get_data["session"] = this.session_number;

        console.log(get_data);

        function check_survey(study_manager) { // jshint ignore:line
            $.ajax({
                method: "GET",
                url: "../php/check_survey_data.php",
                data: get_data
            }).done(function (data) {
                var result_arr = $.parseJSON(data);
                var result = result_arr[0]["COUNT(1)"];
                console.log(result);
                if (result >= 1) {
                    study_manager.survey_complete = true;
                    study_manager.parent.run_on_focus = true;
                } else {
                    alert(`Please complete the surveys before moving on. DO NOT CLOSE THIS TAB.`);
                    study_manager.survey_win.focus();
                    // study_manager.parent.run_on_focus = true;
                }
            });
        }
        check_survey(this);
    }
    launch_next_software(){
        var keyboard_url;

        alert(`You have finished typing for this session. Click to exit.`);
        keyboard_url = "../index.php";
        window.open(keyboard_url, '_self');

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

        console.log(min_rem, sec_rem);
        if (min_rem < 1){
            this.finish_session();
        } else {
            this.parent.draw_phrase();
        }

        // if (this.allow_session_finish){
        //     this.finish_session();
        // }

        this.parent.pre_phrase_rotate_index = this.parent.rotate_index;
        this.parent.allow_slider_input = true;
    }
    parse_emojis(text){
        var output_text = "";
        var emoji_arr = Array.from(text);
        for (var index in emoji_arr){
            var emoji = emoji_arr[index];
            output_text = output_text.concat(kconfig.emoji_conversion_dict[emoji]);
        }
        return output_text;
    }
    save_selection_data(selection){
        var previous_text = this.parent.textbox.text;
        var phrase;
        var typed_text = previous_text.slice(this.cur_phrase.length + 1, previous_text.length);


        phrase = this.cur_phrase.replace("'", "8");
        typed_text = typed_text.replace("'", "8");
        selection = selection.replace("'", "8");


        var phrase_num = this.phrase_num;



        var timestamp = Date.now()/1000;
        var rotate_ind = this.parent.rotate_index;
        var abs_click_times = JSON.stringify(this.parent.bc.abs_click_times);
        var rel_click_times = JSON.stringify(this.parent.bc.rel_click_times);

        this.parent.bc.abs_click_times = [];
        this.parent.bc.rel_click_times = [];

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
        }
        // else{
        //     if (!this.allow_session_finish) {
        //         this.allow_session_continue();
        //     }
        // }
    }
}