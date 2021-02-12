import {Clock} from "./widgets.js";

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
    ctx.stroke();
    }
    if (fill) {
    ctx.fill();
    }
}

function drawArrowhead(ctx, locx, locy, angle, sizex, sizey) {
    var hx = sizex / 2;
    var hy = sizey / 2;

    ctx.translate((locx ), (locy));
    ctx.rotate(angle);
    ctx.translate(-hx,-hy);

    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,1*sizey);
    ctx.lineTo(1*sizex,1*hy);
    ctx.closePath();
    ctx.fill();

    ctx.translate(hx,hy);
    ctx.rotate(-angle);
    ctx.translate(-locx,-locy);
}

// returns radians
function findAngle(sx, sy, ex, ey) {
    // make sx and sy at the zero point
    return Math.atan2((ey - sy), (ex - sx));
}

export class InfoScreen {
    constructor(parent, info_canvas, screen_num = 0) {
        this.parent = parent;
        this.info_canvas = info_canvas;
        this.x_pos = 0;
        this.y_pos = 0;
        this.width = this.info_canvas.screen_width;
        this.height = this.info_canvas.screen_height;

        this.screen_num = screen_num;
        this.num_screens = 5;
        this.increment_screen();

    }
    increment_screen(){
        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fillStyle = "rgb(232,232,232)";
        this.info_canvas.ctx.rect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fill();

        this.info_canvas.ctx.fillStyle = "#000000";
        var font_height = this.width/80;
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Press ? to exit",
            this.width*0.91, this.height*0.98);
        this.info_canvas.ctx.fillText("Click on screen for next",
            this.width*0.86, this.height*0.98 - font_height*1.2);

        if (this.screen_num === 0){
            this.draw_welcome();
        } else if (this.screen_num === 1){
            this.draw_text_info();
        } else if (this.screen_num === 2){
            this.draw_speed_info();
        } else if (this.screen_num === 3){
            this.draw_checkbox_info();
        } else if (this.screen_num === 4){
            this.draw_histogram_info();
        } else if (this.screen_num === 5){
            this.draw_help_info();
        }
        this.screen_num += 1;
    }
    draw_welcome() {
        this.info_canvas.ctx.fillStyle = "#f7f7f7";

        this.load_clock = new Clock(this.info_canvas, this.info_canvas,
            this.width/2, this.height*0.35, this.height/9);
        this.load_clock.draw_face();
        this.load_clock.draw_hand(false);

        var font_height = this.width/17;
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "bold ".concat(font_height.toString(), "px Helvetica");
        if (this.parent.user_id) {
            this.info_canvas.ctx.fillText("Welcome to", this.width / 3, this.height * 0.22);
        } else {
            this.info_canvas.ctx.fillText("Welcome to the", this.width / 3.6, this.height * 0.22);
        }
        font_height = this.width/12.5;
        this.info_canvas.ctx.font = "bold ".concat(font_height.toString(), "px Helvetica");
        if (this.parent.user_id) {
            this.info_canvas.ctx.fillText("Keyboard A!", this.width/3.8, this.height*0.6);
        } else {
            this.info_canvas.ctx.fillText("Nomon Keyboard!", this.width/6.2, this.height*0.6);
        }

        var font_height = this.width/70;
        var rect_x = this.width*0.28;
        var rect_y = this.height*0.65;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*31, font_height*5,
            20, true, true);
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("(1) Locate the clock next to the letter or word you want to type.",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("(2) Press the spacebar when the clock passes Noon (the red line.)",
            rect_x + font_height, rect_y + font_height*2.7);
        this.info_canvas.ctx.fillText("(3) Keep pressing on the same clock until it is selected.",
            rect_x + font_height, rect_y + font_height*4.1);

    }
    draw_text_info(){
        this.info_canvas.ctx.clearRect(0, this.height*0.8, this.width * 3/5, this.height);

        var font_height = this.width/70;

        var rect_x = this.width*0.1;
        var rect_y = this.height*0.87;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*12, font_height*3,
            20, true, true);

        var arrow_x_start = rect_x - font_height;
        var arrow_y_start = rect_y + font_height*1.5;

        var arrow_x_end = arrow_x_start - font_height*4;
        var arrow_y_end = arrow_y_start - font_height*1.5;

        var arrow_x_center = arrow_x_start - font_height*3;
        var arrow_y_center = arrow_y_start;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI*0.71, font_height*1.5, font_height*1.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("The text you type will ",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("appear here",
            rect_x + font_height, rect_y + font_height*2.3);
    }
    draw_speed_info(){
        var font_height = this.width/70;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, this.width/26, this.height/15, font_height*15, font_height*3,
            20, true, true);

        var arrow_x_start = this.width/26 + font_height*16;
        var arrow_y_start = this.height/15 + font_height*1.5;

        var arrow_x_end = arrow_x_start + font_height*2.6;
        var arrow_y_end = arrow_y_start - font_height*3;

        var arrow_x_center = arrow_x_start + font_height*3;
        var arrow_y_center = arrow_y_start;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI/2, font_height*1.5, font_height*1.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("This slider controls the ", this.width/20, this.height/15 + 1.3*font_height );
        this.info_canvas.ctx.fillText("rotation speed of the clocks", this.width/20, this.height/15+2.3*font_height);
    }
    draw_checkbox_info(){
        var font_height = this.width/70;

        var rect_x = this.width*0.55;
        var rect_y = this.height*0.01;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*28, font_height*4.5,
            20, true, true);

        var arrow_x_start = rect_x + font_height*29;
        var arrow_y_start = rect_y + font_height*2.2;

        var arrow_x_end = arrow_x_start + font_height*1.5;
        var arrow_y_end = arrow_y_start - font_height*1.5;

        var arrow_x_center = arrow_x_start + font_height*1.5;
        var arrow_y_center = arrow_y_start;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, Math.PI*1.55, font_height*1.5, font_height*1.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Learn: Nomon will adapt to how you type.",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("Pause: The screen will flash green when you select a clock.",
            rect_x + font_height, rect_y + font_height*2.5);
        this.info_canvas.ctx.fillText("Sound: A bell will sound when you press.",
            rect_x + font_height, rect_y + font_height*3.7);
    }
    draw_histogram_info(){
        this.info_canvas.ctx.clearRect(this.width * 3/5, this.height*0.8, this.width, this.height);

        var font_height = this.width/70;

        var rect_x = this.width*0.35;
        var rect_y = this.height*0.84;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*24, font_height*4.5,
            20, true, true);

        var arrow_x_start = rect_x + font_height*25;
        var arrow_y_start = rect_y + font_height*2.5;

        var arrow_x_end = arrow_x_start + font_height*3;
        var arrow_y_end = arrow_y_start + font_height;

        var arrow_x_center = arrow_x_start + font_height*2;
        var arrow_y_center = arrow_y_start;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI*1.79, font_height*1.5, font_height*1.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("This histogram shows how accurately you press",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("relative to the Noon. It will update as you type",
            rect_x + font_height, rect_y + font_height*2.5);
        this.info_canvas.ctx.fillText("if \"Learn\" is enabled.",
            rect_x + font_height, rect_y + font_height*3.7);
    }
    draw_help_info(){
        var font_height = this.width/70;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, this.width/26, this.height/15, font_height*15, font_height*3,
            20, true, true);

        var arrow_x_start = this.width/26 + font_height*16;
        var arrow_y_start = this.height/15 + font_height*1.5;

        var arrow_x_end = arrow_x_start + font_height*2.6;
        var arrow_y_end = arrow_y_start - font_height*3;

        var arrow_x_center = arrow_x_start + font_height*3;
        var arrow_y_center = arrow_y_start;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI/2, font_height*1.5, font_height*1.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Help info can be found here.", this.width/20, this.height/15 + 1.3*font_height );
        this.info_canvas.ctx.fillText("Press ? to launch this tutorial", this.width/20, this.height/15+2.3*font_height);
    }
}

export class WebcamInfoScreen {
    constructor(info_canvas) {
        this.info_canvas = info_canvas;
        this.x_pos = 0;
        this.y_pos = 0;
        this.width = this.info_canvas.screen_width;
        this.height = this.info_canvas.screen_height;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "rgba(232,232,232, 0.5)";
        this.info_canvas.ctx.rect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fill();
        this.draw_screen();
    }
    draw_screen(){
        var font_height = this.width/70;

        var rect_x = this.width*0.6;
        var rect_y = this.height*0.1;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*27, font_height*15,
            20, true, true);

        var arrow_x_start = rect_x + font_height*8;
        var arrow_y_start = rect_y - font_height*0.5;

        var arrow_x_end = arrow_x_start + font_height;
        var arrow_y_end = arrow_y_start - font_height*2;

        var arrow_x_center = arrow_x_start;
        var arrow_y_center = arrow_y_start - font_height;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI*0.3, font_height*1.5, font_height*1.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("The Webcam Switch tracks your face to send inputs",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("into the keyboard. You can activate the switch by",
            rect_x + font_height, rect_y + font_height*2.5);
        this.info_canvas.ctx.fillText("moving your body to the right.",
            rect_x + font_height, rect_y + font_height*3.7);

        this.info_canvas.ctx.fillStyle = "rgba(238,133,0,1)";
        this.info_canvas.ctx.fillText("The orange box is your current face position.",
            rect_x + font_height, rect_y + font_height*6);
        this.info_canvas.ctx.fillStyle = "rgba(0,0,238,1)";
        this.info_canvas.ctx.fillText("The blue rectangle is the reset box.",
            rect_x + font_height, rect_y + font_height*7.2);
        this.info_canvas.ctx.fillStyle = "rgb(0,195,0)";
        this.info_canvas.ctx.fillText("The green rectangle is the trigger box.",
            rect_x + font_height, rect_y + font_height*8.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.fillText("The reset and trigger boxes are activated",
            rect_x + font_height, rect_y + font_height*10.8);
        this.info_canvas.ctx.fillText("when the orange box intersects one of them.",
            rect_x + font_height, rect_y + font_height*12);
        this.info_canvas.ctx.fillText("You must activate the reset box before you",
            rect_x + font_height, rect_y + font_height*13.2);
        this.info_canvas.ctx.fillText("can activate the trigger box.",
            rect_x + font_height, rect_y + font_height*14.4);


        this.info_canvas.ctx.fillStyle = "#000000";
        var font_height = this.width/80;
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Click on screen to exit",
            this.width*0.87, this.height*0.99);
    }
}

export class SessionInfoScreen {
    constructor(info_canvas, screen_num = 0) {
        this.info_canvas = info_canvas;
        this.x_pos = 0;
        this.y_pos = 0;
        this.width = this.info_canvas.screen_width;
        this.height = this.info_canvas.screen_height;

        this.screen_num = screen_num;
        this.num_screens = 3;
        this.increment_screen();

    }
    increment_screen(){
        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fillStyle = "rgba(232,232,232, 0.5)";
        this.info_canvas.ctx.rect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fill();

        this.info_canvas.ctx.fillStyle = "#000000";
        var font_height = this.width/80;
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Press ? to exit",
            this.width*0.91, this.height*0.98);
        this.info_canvas.ctx.fillText("Click on screen for next",
            this.width*0.86, this.height*0.98 - font_height*1.2);

        if (this.screen_num === 0){
            this.draw_text_info();
        } else if (this.screen_num === 1){
            this.draw_scan_delay_info();
        } else if (this.screen_num === 2) {
            this.draw_timer_info();
        } else if (this.screen_num === 3){
            this.draw_help_info();
        }
        this.screen_num += 1;
    }
    draw_text_info(){
        var font_height = this.width/70;

        this.info_canvas.ctx.clearRect(0, this.height*0.8, this.width*3/5, this.height);

        var rect_x = this.width*0.1;
        var rect_y = this.height*0.87;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*30, font_height*4.5,
            20, true, true);

        var arrow_x_start = rect_x - font_height;
        var arrow_y_start = rect_y + font_height*1.5;

        var arrow_x_end = arrow_x_start - font_height*4;
        var arrow_y_end = arrow_y_start - font_height*1.5;

        var arrow_x_center = arrow_x_start - font_height*3;
        var arrow_y_center = arrow_y_start;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI*0.71, font_height*1.5, font_height*1.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("The first row in the textbox contains a phrase. Please",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("type this phrases as quickly and accurately as possible.",
            rect_x + font_height, rect_y + font_height*2.6);
        this.info_canvas.ctx.fillText("When you are finished with a phrase, press the ENTER key.",
            rect_x + font_height, rect_y + font_height*3.9);
    }
    draw_scan_delay_info(){
        var font_height = this.width/70;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, this.width/26, this.height/15, font_height*20, font_height*4.5,
            20, true, true);

        var arrow_x_start = this.width/26 + font_height*21;
        var arrow_y_start = this.height/15 + font_height*2.25;

        var arrow_x_end = arrow_x_start + font_height*2.6;
        var arrow_y_end = arrow_y_start - font_height*3;

        var arrow_x_center = arrow_x_start + font_height*3;
        var arrow_y_center = arrow_y_start;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI/2, font_height*1.5, font_height*1.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("You are allowed to increment/decrement", this.width/20, this.height/15 + 1.3*font_height );
        this.info_canvas.ctx.fillText("the clock rotation speed by 1 between ", this.width/20, this.height/15 + 2.6*font_height );
        this.info_canvas.ctx.fillText("phrases.", this.width/20, this.height/15+3.9*font_height);
    }
    draw_timer_info(){
        var font_height = this.width/70;

        var rect_x = this.width*0.01;
        var rect_y = this.height*0.05

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*17, font_height*12,
            20, true, true);

        var arrow_x_start = rect_x + font_height*18;
        var arrow_y_start = rect_y + font_height*6;

        var arrow_x_end = arrow_x_start + font_height*2.6;
        var arrow_y_end = arrow_y_start - font_height*6;

        var arrow_x_center = arrow_x_start + font_height*3;
        var arrow_y_center = arrow_y_start;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI/2, font_height*1.5, font_height*1.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("This timer shows how much time", rect_x + font_height, rect_y + 1.3*font_height );
        this.info_canvas.ctx.fillText("is remaining with this software. ", rect_x + font_height, rect_y+2.6*font_height);
        this.info_canvas.ctx.fillText("Sessions last 20 minutes. Please ", rect_x + font_height, rect_y+3.9*font_height);
        this.info_canvas.ctx.fillText("Type as many phrases as you can  ", rect_x + font_height, rect_y+5.2*font_height);
        this.info_canvas.ctx.fillText("before the timer expires. ", rect_x + font_height, rect_y+6.5*font_height);
        this.info_canvas.ctx.fillText("At 30 seconds remaining, you  ", rect_x + font_height, rect_y+9*font_height);
        this.info_canvas.ctx.fillText("will no longer be given new ", rect_x + font_height, rect_y+10.3*font_height);
        this.info_canvas.ctx.fillText("phrases. ", rect_x + font_height, rect_y+11.6*font_height);
    }
    draw_help_info(){
        var font_height = this.width/70;

        var rect_x = this.width*0.39;
        var rect_y = this.height*0.02;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*15, font_height*3.3,
            20, true, true);

        var arrow_x_start = rect_x + font_height*16;
        var arrow_y_start = rect_y + font_height*1.5;

        var arrow_x_end = arrow_x_start + font_height*1.5;
        var arrow_y_end = arrow_y_start - font_height*1.5;

        var arrow_x_center = arrow_x_start + font_height*1.5;
        var arrow_y_center = arrow_y_start;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, Math.PI*1.55, font_height*1.5, font_height*1.5);

        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Help info can be found here.", rect_x + font_height, rect_y + 1.3*font_height );
        this.info_canvas.ctx.fillText("Press ? to launch this tutorial", rect_x + font_height, rect_y+2.3*font_height);

    }
}