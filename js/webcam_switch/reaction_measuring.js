import * as webswitch from "../webcam_switch/webcam_switch.js";
import * as webswitchlight from "../webcam_switch/webcam_switch_light.js";

export class AnimationCanvas{
    constructor(canvas_id, layer_index) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.style.zIndex = layer_index;

        this.calculate_size();
    }
    calculate_size(bottom_height_factor=0.2){
        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;

        this.ctx = this.canvas.getContext("2d");

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.989;

        this.canvas.style.width = ( this.canvas.width * this.screen_fill_factor).toString().concat("px");
        this.canvas.style.height = ( this.canvas.width  * this.screen_fill_factor).toString().concat("px");

        this.screen_width = this.canvas.width * this.resolution_factor;
        this.screen_height = this.canvas.height * this.resolution_factor;

        this.canvas.width = this.canvas.width * this.resolution_factor;
        this.canvas.height = this.canvas.height * this.resolution_factor;

    }
    clear(){
        this.ctx.clearRect(0, 0, this.screen_width, this.screen_height);
    }
}

class reactionManager{
    constructor(webcam_data, forward_url=null) {
        this.webcam_data = webcam_data;
        this.forward_url = forward_url;

        this.webcam_canvas = new webswitch.WebcamCanvas("webcam_canvas", 1);
        this.webcam_canvas.draw_grey();

        if (webcam_data.webcam) {
            if (webcam_data.webcam_type === "face") {
                this.ws = new webswitch.WebcamSwitch(this);

                this.ws.face_x_calibration = webcam_data["webcam_reset"];
                this.ws.triger_x_calibration = webcam_data["webcam_trigger"];
            } else {
                this.ws = new webswitchlight.WebcamSwitch(this);

                this.ws.trigger_pos = webcam_data.webcam_trigger;
                this.ws.reset_pos = webcam_data.webcam_reset;
                this.ws.bottom_offset = webcam_data.webcam_bottom;
            }
        } else {
            window.addEventListener('keydown', function (e) {
                if (e.keyCode === 32) {
                    e.preventDefault();
                    this.on_press();
                }
            }.bind(this), false);
        }

        this.animation_canvas = new AnimationCanvas("animation_canvas", 1);

        this.audio = new Audio('../audio/bell.wav');

        this.srts = [];
        this.dpts = [];

        this.presses_left = 0;
        this.next_trial_time = Infinity;
        this.last_show_time = Infinity;

        this.start_button = document.getElementById("start_button");
        this.start_button.onclick = function () {
            this.start_trial();
            this.start_button.className = "btn unclickable";
            this.start_button.value = "Finished";
            this.start_button.onclick = null;
        }.bind(this);

        this.draw_reaction_box();

    }
    draw_reaction_box(){
        this.animation_canvas.clear();
        this.animation_canvas.ctx.beginPath();
        if (this.presses_left > 0) {
            this.animation_canvas.ctx.fillStyle = "#8deb93";
        } else {
            this.animation_canvas.ctx.fillStyle = "#d2d2d2";
        }

        var box_width = this.animation_canvas.screen_width / 2;
        var box_offset = this.animation_canvas.screen_width / 4;
        this.animation_canvas.ctx.rect(box_offset, box_offset, box_width, box_width);
        this.animation_canvas.ctx.fill();
        this.animation_canvas.ctx.stroke();

        this.animation_canvas.ctx.fillStyle = "#5c5c5c";
        var font_height = box_width*0.75;
        this.animation_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.animation_canvas.ctx.fillText(this.presses_left.toString(), box_offset*1.55, box_offset*2.5)
    }
    on_press(){
        var time_in = Date.now();
        this.audio.play();
        if (this.presses_left > 0) {


            this.presses_left -= 1;
            this.draw_reaction_box();

            if (this.presses_left === 1){
                var srt = time_in - this.last_show_time;
                this.srts.push(srt);
            } else if (this.presses_left === 0) {
                var dpt = time_in - this.srts[this.srts.length - 1] - this.last_show_time;
                this.dpts.push(dpt);
                this.start_trial();
            }
        }

    }
    start_trial(){
        if (this.srts.length < 30) {
            this.next_trial_time = Date.now() + Math.max(2500, Math.random() * 6000);
            this.draw_reaction_box();
            console.log("SRTs:", this.srts);
            console.log("DPTs:", this.dpts);
        } else {
            this.finish_trials();
        }
    }
    finish_trials(){
        this.start_button.className = "btn clickable";
        this.start_button.onclick = function(){
            this.save_data();
        }.bind(this);

        document.getElementById("info_text").innerHTML = `You have finished the trials. Press Finished to proceed.`
    }
    save_data(){
        var user_id = this.webcam_data.user_id;
        var switch_type;
        if (this.webcam_data.webcam){
            switch_type = this.webcam_data.webcam_type;
        } else {
            switch_type = "button";
        }

        var srt = JSON.stringify(this.srts);
        var dpt = JSON.stringify(this.dpts);

        function send_data(forward_url) { // jshint ignore:line

            console.log({"user_id": user_id, "switch": switch_type, "srt": srt, "dpt": dpt});
            $.ajax({
                method: "POST",
                url: "../php/send_reaction_data.php",
                data: {"user_id": user_id, "switch": switch_type, "srt": srt, "dpt": dpt}
            }).done(function (data) {
                console.log("SENT DATA");
                if (forward_url !== null) {
                    window.open(forward_url, '_self');
                } else {
                    window.close();
                }
            });
        }

        send_data(this.forward_url);
    }
    animate(){
        if (this.ws) {
            if (this.webcam_data.webcam_type == "face"){
                this.ws.detect_face();
            } else {
                this.ws.grab_stream();
                this.ws.draw_switch();
            }
        }

        var cur_time = Date.now();
        if (cur_time >= this.next_trial_time){
            this.presses_left = 2;
            this.draw_reaction_box();
            this.next_trial_time = Infinity;
            this.last_show_time = Date.now();
            if (this.ws) {
                this.ws.control_lock = false;
            }

        }
    }
}

const params = new URLSearchParams(document.location.search);
const user_id = params.get("user_id");
const software = params.get("software");
const first_load = (params.get("first_load") === 'true' || params.get("first_load") === null);
const partial_session = params.get("partial_session") === 'true';
const emoji = params.get("emoji") === 'true';
const webcam = params.get("webcam") === 'true';
console.log("User ID: ", user_id, " Software: ", software, " First Load: ", first_load, " Partial Session: ", partial_session, " Webcam Input: ", webcam);

var forward_url;

if (software === "A") {
    forward_url = "keyboard.html";
    forward_url = forward_url.concat('?user_id=', user_id.toString(), '&first_load=', first_load,
        '&partial_session=', partial_session.toString(), '&emoji=', emoji);
} else if (software === "B") {
    forward_url = "rowcol.html";
    forward_url = forward_url.concat('?user_id=', user_id.toString(), '&first_load=', first_load,
        '&partial_session=', partial_session.toString(), '&emoji=', emoji);
}


function send_login() {
    $.ajax({
        method: "GET",
        url: "../php/send_login.php",
        data: {"user_id": user_id}
    }).done(function (data) {
        var result = $.parseJSON(data);
        var webcam_data;
        if (result.length > 0) {

            result = result[0];
            webcam_data = {"webcam": webcam, "user_id": result.id};

            var webcam_type = result.webcam_type;
            if (webcam_type !== null) {
                console.log("Retrieved Webcam Type!");
            }
            webcam_data["webcam_type"]= webcam_type;

            var webcam_reset = JSON.parse(result.webcam_reset);
            if (webcam_reset !== null) {
                console.log("Retrieved Webcam Reset!");
            }
            webcam_data["webcam_reset"]= webcam_reset;

            var webcam_trigger = JSON.parse(result.webcam_trigger);
            if (webcam_trigger !== null) {
                console.log("Retrieved Webcam Trigger!");
            }
            webcam_data["webcam_trigger"]= webcam_trigger;

            var webcam_bottom = JSON.parse(result.webcam_bottom);
            if (webcam_bottom !== null) {
                console.log("Retrieved Webcam Bottom!");
            }
            webcam_data["webcam_bottom"]= webcam_bottom;
        }

        let rm = new reactionManager(webcam_data, forward_url);
        setInterval(rm.animate.bind(rm), 50);
    });
}

if (user_id){
    send_login();
} else {
    var webcam_data = {"webcam": webcam, "webcam_type": "motion", "webcam_trigger": 0.6, "webcam_reset": 0.4,
        "webcam_bottom": 0.2};

    let rm = new reactionManager(webcam_data);
    setInterval(rm.animate.bind(rm), 50);
}