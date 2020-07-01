import * as webswitch from "./webcam_switch/webcam_switch.js";

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

function draw_webcam_bar(head_pos, period_time){
    animation_ctx.beginPath();
    animation_ctx.fillStyle = "#ededed";
    animation_ctx.lineWidth = 10;
    animation_ctx.strokeStyle = "rgba(0,0,0,0)";
    animation_ctx.rect(10, 380, 480, 60);
    animation_ctx.fill();
    animation_ctx.stroke();

    animation_ctx.beginPath();
    if (head_pos < 0.3 || period_time < 0.2) {
        animation_ctx.fillStyle = "rgba(0,0,238,0.71)";
    } else {
        animation_ctx.fillStyle = "rgba(0,0,238,0.44)";
    }
    animation_ctx.lineWidth = 10;
    animation_ctx.rect(10, 380, 170, 60);
    animation_ctx.fill();
    animation_ctx.stroke();

    animation_ctx.beginPath();
    if (head_pos < 0.8) {
        animation_ctx.fillStyle = "rgba(0,238,0,0.29)";
    } else {
        animation_ctx.fillStyle = "rgba(0,238,0,0.84)";
    }
    animation_ctx.lineWidth = 10;
    animation_ctx.rect(390, 380, 100, 60);
    animation_ctx.fill();
    animation_ctx.stroke();

    animation_ctx.beginPath();
    animation_ctx.fillStyle = "rgba(238,133,0,0.44)";
    animation_ctx.lineWidth = 10;
    animation_ctx.rect(150+120*head_pos, 380, 150, 60);
    animation_ctx.fill();
    animation_ctx.stroke();

}

function rotate() {
    var cur_time = Date.now()/1000;
    var period_time = cur_time % 5;
    var rotate_angle = trapesoid_wave(period_time, 5, 30);
    var person_image = document.getElementById("rotater");
    person_image.setAttribute("style", "transform: rotate(" + rotate_angle + "deg)");
    draw_webcam_bar(rotate_angle/30, period_time/5);
}

var animation = setInterval(rotate, 20);

var animation_canvas = document.getElementById("animation_canvas");
var animation_ctx = animation_canvas.getContext("2d");

animation_ctx.beginPath();
animation_ctx.fillStyle = "rgba(0,0,238,0.44)";
animation_ctx.lineWidth = 10;
animation_ctx.strokeStyle = "rgba(0,0,238,0.71)";
animation_ctx.rect(10, 10, 170, 310);
animation_ctx.fill();
animation_ctx.stroke();

animation_ctx.beginPath();
animation_ctx.fillStyle = "rgba(0,238,0,0.29)";
animation_ctx.lineWidth = 10;
animation_ctx.strokeStyle = "rgba(0,238,0,0.84)";
animation_ctx.rect(390, 10, 100, 310);
animation_ctx.fill();
animation_ctx.stroke();


function start_calibration(){
    let webcam_switch = new webswitch.WebcamSwitch();
    clearInterval(animation);

    function update_webcam(){
        webcam_switch.face_finder.mycamvas.update();
        webcam_switch.draw_switch();
    }
    setInterval(update_webcam, 50);
}

var start_button = document.getElementById("start_button");
start_button.onclick = start_calibration;