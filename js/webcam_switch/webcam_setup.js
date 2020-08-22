import * as webswitch from "./webcam_switch.js";


function trapesoid_wave(t, period, amplitude){
    var angle;
    if (t < period/4){
        angle = (t/(period/4))*amplitude;
    } else if (t < period/2){
        angle = amplitude
    } else if (t < period*3/4){
        angle = amplitude*(1-(t-period/2)/(period/4))
    } else {
        angle = 0;
    }
    return angle;
}


export class WebcamCanvas{
    constructor(canvas_id, layer_index) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.style.zIndex = layer_index;

        this.calculate_size();
    }
    calculate_size(){
        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;

        this.canvas.style.position = "absolute";
        this.ctx = this.canvas.getContext("2d");

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.035;

        this.canvas.width = this.window_width * this.resolution_factor;
        this.canvas.height = this.window_height * 0.1;
        this.canvas.style.width = (this.window_width * this.screen_fill_factor).toString().concat("vw");
        // this.canvas.style.height = ((this.window_width * 0.1)  * this.screen_fill_factor).toString().concat("vh");

        this.screen_width = this.window_width * this.resolution_factor;
        this.screen_height = (this.window_height - 50) * this.resolution_factor;
    }
    clear(){
        this.ctx.clearRect(0, 0, this.screen_width, this.screen_height);
    }
}


class webcamSetup {
    constructor(forward_url=null){
        this.forward_url = forward_url;
        this.animation_canvas = document.getElementById("animation_canvas");
        this.scale = 18;
        this.shrink_factor = 1/9;
        var w = this.animation_canvas.width;
        var h = this.animation_canvas.height;

        this.animation_canvas.width *= this.scale;
        this.animation_canvas.height *= this.scale;
        this.animation_canvas.style.width = w + "vh";
        this.animation_canvas.style.height = h + "vh";
        this.animation_ctx = this.animation_canvas.getContext("2d");
        this.animation_canvas.getContext("2d").setTransform(this.scale, 0, 0, this.scale, 0, 0);
        this.init_ui();
        this.animation_timer = setInterval(this.rotate.bind(this), 50);

        this.webcam_canvas = new WebcamCanvas("webcam_canvas", 1);

        this.draw_left = false;
        this.draw_right = false;
        this.rotate_to_webcam = false;
        this.allow_save = false;

        this.sound_on = false;

        this.resting_pos;
        this.trigger_pos;
        
    }
    init_ui(){
        this.start_button = document.getElementById("start_button");
        this.start_button.onclick = this.start_calibration.bind(this);

        this.save_button = document.getElementById("save_button");
        this.save_button.style.display = "none";

        this.audio = new Audio('../audio/bell.wav');

        this.person_image = document.getElementById("rotater");

        this.animation_ctx.beginPath();
        this.animation_ctx.fillStyle = "rgba(0,0,238,0.44)";
        this.animation_ctx.lineWidth = 10*this.shrink_factor;
        this.animation_ctx.strokeStyle = "rgba(0,0,238,0.71)";
        this.animation_ctx.rect(10*this.shrink_factor, 10*this.shrink_factor, 170*this.shrink_factor, 310*this.shrink_factor);
        this.animation_ctx.fill();
        this.animation_ctx.stroke();

        var font_height = 30*this.shrink_factor;
        this.animation_ctx.fillStyle = "rgb(255,255,255)";
        this.animation_ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.animation_ctx.fillText("Reset Box",
            22*this.shrink_factor, 50*this.shrink_factor);
        
        this.animation_ctx.beginPath();
        this.animation_ctx.fillStyle = "rgba(0,238,0,0.29)";
        this.animation_ctx.lineWidth = 10*this.shrink_factor;
        this.animation_ctx.strokeStyle = "rgba(0,238,0,0.84)";
        this.animation_ctx.rect(390*this.shrink_factor, 10*this.shrink_factor, 100*this.shrink_factor, 310*this.shrink_factor);
        this.animation_ctx.fill();
        this.animation_ctx.stroke();

        var font_height = 30*this.shrink_factor;
        this.animation_ctx.fillStyle = "rgb(0,0,0)";
        this.animation_ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.animation_ctx.fillText("Trigger",
            390*this.shrink_factor, 50*this.shrink_factor);this.animation_ctx.fillText("Box",
            430*this.shrink_factor, 50*this.shrink_factor + font_height*1.2);

    }
    draw_webcam_bar(head_pos, period_time){
        this.animation_ctx.beginPath();
        this.animation_ctx.clearRect(10*this.shrink_factor, 380*this.shrink_factor, 500*this.shrink_factor, 600*this.shrink_factor);

        this.animation_ctx.fillStyle = "#ededed";
        this.animation_ctx.lineWidth = 10*this.shrink_factor;
        this.animation_ctx.strokeStyle = "rgba(0,0,0,0)";
        this.animation_ctx.rect(10*this.shrink_factor, 380*this.shrink_factor, 480*this.shrink_factor, 60*this.shrink_factor);
        this.animation_ctx.fill();
        this.animation_ctx.stroke();
    
        this.animation_ctx.beginPath();
        if (head_pos < 0.3 || period_time < 0.2) {
            this.animation_ctx.fillStyle = "rgba(0,0,238,0.71)";
        } else {
            this.animation_ctx.fillStyle = "rgba(0,0,238,0.44)";
        }
        this.animation_ctx.lineWidth = 10*this.shrink_factor;
        this.animation_ctx.rect(10*this.shrink_factor, 380*this.shrink_factor, 170*this.shrink_factor, 60*this.shrink_factor);
        this.animation_ctx.fill();
        this.animation_ctx.stroke();
    
        this.animation_ctx.beginPath();
        if (head_pos < 0.8) {
            this.animation_ctx.fillStyle = "rgba(0,238,0,0.29)";
        } else {
            this.animation_ctx.fillStyle = "rgba(0,238,0,0.84)";
        }
        this.animation_ctx.lineWidth = 10*this.shrink_factor;
        this.animation_ctx.rect(390*this.shrink_factor, 380*this.shrink_factor, 100*this.shrink_factor, 60*this.shrink_factor);
        this.animation_ctx.fill();
        this.animation_ctx.stroke();
    
        this.animation_ctx.beginPath();
        this.animation_ctx.fillStyle = "rgba(238,133,0,0.44)";
        this.animation_ctx.lineWidth = 10*this.shrink_factor;
        this.animation_ctx.rect((150+120*head_pos)*this.shrink_factor, 380*this.shrink_factor, 150*this.shrink_factor, 60*this.shrink_factor);
        this.animation_ctx.fill();
        this.animation_ctx.stroke();

        var rect_x = 0*this.shrink_factor;
        var rect_y = 450*this.shrink_factor;
        var font_height = 20*this.shrink_factor;
        
        this.animation_ctx.fillStyle = "#404040";
        this.animation_ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.animation_ctx.fillText("The Webcam Switch tracks your face to send inputs",
            rect_x*this.shrink_factor + font_height, rect_y + font_height*1.3);
        this.animation_ctx.fillText("into the keyboard. You can activate the switch by",
            rect_x + font_height, rect_y + font_height*2.5);
        this.animation_ctx.fillText("moving your body to the right.",
            rect_x + font_height, rect_y + font_height*3.7);

        this.animation_ctx.fillStyle = "rgba(238,133,0,1)";
        this.animation_ctx.fillText("The orange box is your current face position.",
            rect_x + font_height, rect_y + font_height*6);
        this.animation_ctx.fillStyle = "rgba(0,0,238,1)";
        this.animation_ctx.fillText("The blue rectangle is the reset box.",
            rect_x + font_height, rect_y + font_height*7.2);
        this.animation_ctx.fillStyle = "rgb(0,195,0)";
        this.animation_ctx.fillText("The green rectangle is the trigger box.",
            rect_x + font_height, rect_y + font_height*8.5);
    }
    rotate() {
        var cur_time = Date.now()/1000;
        var period_time = cur_time % 5;
        var rotate_angle = trapesoid_wave(period_time, 5, 30);
        this.person_image.setAttribute("style", "transform: rotate(" + rotate_angle + "deg)");
        this.draw_webcam_bar(rotate_angle/30, period_time/5);
    }
    rotate_to_angle(rotate_angle){
        this.person_image.setAttribute("style", "transform: rotate(" + rotate_angle + "deg)");
    }
    start_calibration(){
        this.webcam_switch = new webswitch.WebcamSwitch(this);
        // this.webcam_canvas.canvas.style.height ="60px";
        // this.webcam_canvas.canvas.style.width ="480px";

        clearInterval(this.animation_timer);

        this.draw_left = false;
        this.draw_right = false;
        this.rotate_to_webcam = false;
        this.webcam_switch.face_x_calibration = 0;
        this.webcam_switch.triger_x_calibration = 1;
        this.sound_on = false;
        this.save_button.style.display = "none";

        this.person_image.setAttribute("style", "transform: rotate(0deg)");

        setInterval(this.update_webcam.bind(this), 50);
        this.start_button.onclick = this.save_resting.bind(this);
        this.start_button.value = "Calibrate Reset";

        this.animation_ctx.beginPath();
        this.animation_ctx.clearRect(10*this.shrink_factor, 380*this.shrink_factor, 500*this.shrink_factor, 600*this.shrink_factor);

        var rect_x = 0*this.shrink_factor;
        var rect_y = 470*this.shrink_factor;
        var font_height = 23*this.shrink_factor;

        this.animation_ctx.fillStyle = "rgba(0,0,238,1)";
        this.animation_ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.animation_ctx.fillText("Move your body to a neutral, centered postion.",
            rect_x + font_height, rect_y + font_height*1.3);
        this.animation_ctx.fillText("This will calibrate the reset box, when you",
            rect_x + font_height, rect_y + font_height*2.5);
        this.animation_ctx.fillText("are positioned, click \"Calibrate Reset\".",
            rect_x + font_height, rect_y + font_height*3.7);
    }
    save_resting(){
        if (this.allow_save) {
            this.person_image.setAttribute("style", "transform: rotate(30deg)");

            this.resting_pos = this.webcam_switch.face_x;
            this.webcam_switch.face_x_calibration = 0.5 - this.resting_pos;
            console.log("Resting:", this.resting_pos);

            this.start_button.onclick = this.save_trigger.bind(this);
            this.start_button.value = "Calibrate Trigger";
            this.draw_left = true;

            this.animation_ctx.beginPath();
            this.animation_ctx.clearRect(0, 400*this.shrink_factor, 500*this.shrink_factor, 500*this.shrink_factor);

            var rect_x = 0*this.shrink_factor;
            var rect_y = 470*this.shrink_factor;
            var font_height = 23*this.shrink_factor;

            this.animation_ctx.fillStyle = "rgb(0,195,0)";
            this.animation_ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.animation_ctx.fillText("Move your torso (including your head) about",
                rect_x + font_height, rect_y + font_height * 1.3);
            this.animation_ctx.fillText("30 degrees to the right. When you are ",
                rect_x + font_height, rect_y + font_height * 2.5);
            this.animation_ctx.fillText("positioned, click \"Calibrate Trigger\".",
                rect_x + font_height, rect_y + font_height * 3.7);
        }
    }
    save_trigger(){
        if (this.allow_save) {
            this.person_image.setAttribute("style", "transform: rotate(30deg)");

            this.trigger_pos = this.webcam_switch.face_x;
            this.webcam_switch.triger_x_calibration = 0.5-(this.trigger_pos - this.resting_pos);
            console.log("Trigger:", this.trigger_pos);

            this.rotate_to_webcam = true;

            this.start_button.value = "Recalibrate";
            this.start_button.onclick = this.start_calibration.bind(this);
            this.save_button.style.display = "inline";
            this.save_button.onclick = this.save_results.bind(this);

            this.draw_right = true;
            this.sound_on = true;

            this.animation_ctx.beginPath();
            this.animation_ctx.clearRect(0, 400*this.shrink_factor, 500*this.shrink_factor, 500*this.shrink_factor);

            var rect_x = 0*this.shrink_factor;
            var rect_y = 470*this.shrink_factor;
            var font_height = 23*this.shrink_factor;

            this.animation_ctx.fillStyle = "#404040";
            this.animation_ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.animation_ctx.fillText("The reset and trigger boxes are activated",
                rect_x + font_height, rect_y + font_height * 1.3);
            this.animation_ctx.fillText("when the orange box intersects one of them.",
                rect_x + font_height, rect_y + font_height * 2.5);
            this.animation_ctx.fillText("You must activate the reset box before you",
                rect_x + font_height, rect_y + font_height * 3.7);
            this.animation_ctx.fillText("can activate the trigger box. Try it!",
                rect_x + font_height, rect_y + font_height * 4.9);
        }
    }
    save_results(){
        var resting_pos = this.resting_pos;
        var trigger_pos = this.trigger_pos;
        // noinspection JSAnnotator
        function send_data(forward_url) { // jshint ignore:line
            console.log({"user_id": user_id, "webcam_reset": resting_pos, "webcam_trigger": trigger_pos});
            $.ajax({
                method: "POST",
                url: "../php/update_webcam_data.php",
                data: {"user_id": user_id, "webcam_reset": resting_pos, "webcam_trigger": trigger_pos}
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
    update_webcam(){
        this.webcam_switch.detect_face();
        this.webcam_switch.draw_switch(this.draw_left, this.draw_right);

        if (!this.webcam_switch.in_frame) {
            var font_height = 30*this.shrink_factor;
            this.animation_ctx.beginPath();
            this.animation_ctx.fillStyle = "rgb(0,0,0)";
            this.animation_ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.animation_ctx.fillText("Your face is out of the Frame!",
                22*this.shrink_factor, 470*this.shrink_factor);
            this.allow_save = false;
        } else {
            this.animation_ctx.beginPath();
            this.animation_ctx.clearRect(0, 440*this.shrink_factor, 500*this.shrink_factor, 35*this.shrink_factor);
            this.allow_save = true;
        }

        if (this.rotate_to_webcam){
            var face_x = this.webcam_switch.face_x;
            var angle = (this.resting_pos - face_x)/
                (this.resting_pos - this.trigger_pos + this.webcam_switch.face_width)*30;
            // console.log(angle);
            this.rotate_to_angle(angle);

        }
    }
    on_press(){
        if (this.sound_on) {
            this.audio.play();
        }
    }
}

const params = new URLSearchParams(document.location.search);
const user_id = params.get("user_id");
const first_load = (params.get("first_load") === 'true' || params.get("first_load") === null);
const partial_session = params.get("partial_session") === 'true';
const software = params.get("software");
const emoji = params.get("emoji");
const forward = params.get("forward") === 'true';
if ("webcam" in params) {
    const webcam = params.get("webcam") === 'true';
} else {
    const webcam = null;
}
console.log("User ID: ", user_id, " First Load: ", first_load, " Partial Session: ", partial_session, " Software: ", software, " Forward: ", forward);

var forward_url;
if (forward) {
    if (software === "A") {
        forward_url = "keyboard.html";
        forward_url = forward_url.concat('?user_id=', user_id.toString(), '&first_load=', first_load,
            '&partial_session=', partial_session.toString(), '&emoji=', emoji);
    } else if (software === "B") {
        forward_url = "rowcol.html";
        forward_url = forward_url.concat('?user_id=', user_id.toString(), '&first_load=', first_load,
            '&partial_session=', partial_session.toString(), '&emoji=', emoji);
    }

    if (webcam != null){
        forward_url = forward_url.concat("webcam", webcam);
    }
}

let webcam_setup = new webcamSetup(forward_url);
