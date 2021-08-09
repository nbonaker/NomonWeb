import * as kconfig from './kconfig.js';
import * as widgets from "./widgets.js";
import * as config from "./config.js";
import * as normon from "./normon/normontheclock.js";


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


function subarray_includes(array, item, indicies=[], level=0){
    if (indicies.length <= level){
        indicies.push(0);
    }

    var in_array = false;
    for (var i in array){
        if (in_array){
            break;
        }
        indicies[level] = parseInt(i);

        var sub_element = array[i];
        if (sub_element instanceof Array){
            var sub_result = subarray_includes(sub_element, item, indicies.slice(0, level+1), level+1);
            in_array = sub_result[0];
            if (in_array){
                indicies = sub_result[1];
            }
        } else{
            if (sub_element === item){
                in_array = true;
                break;
            }
        }
    }
    return [in_array, indicies];
}


export class helpManager{
    constructor(parent, bc){

        this.parent = parent;
        this.parent.in_info_screen = false;
        this.bc = bc;
        this.emoji_phrase_length = 10;
        this.target_text = null;
        this.target_clock = null;
        this.target_option = null;

        this.circle_x;
        this.circle_y;
        this.circle_rel_size = 1.5;
        this.target_num = 0;
        this.clock;
        this.Normon;
        this.normon_pause_length = 5;
        this.text_num = 0;
        this.allow_input = false;
        this.forward_input = false;
        this.failed = false;

        this.update_target();
        this.start_tutorial();
    }
    initialize_normon(){
        this.normon_canvas = new normon.NormonCanvas("normon_canvas", 5);

        var normon_x = -this.normon_canvas.screen_width/5;
        var normon_y = this.normon_canvas.screen_height/4;
        var normon_r = this.normon_canvas.screen_height/15;

        this.Normon = new normon.Normon(this.normon_canvas, normon_x, normon_y, normon_r, this);

        this.normon_interval = setInterval(this.Normon.animate.bind(this.Normon), 20);
    }
    update_target(){
        this.text_num = 0;
        this.target_num += 1;
        console.log(this.target_num);
    }
    start_tutorial(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.info_canvas.calculate_size(0);
        this.width = this.info_canvas.screen_width;
        this.height = this.info_canvas.screen_height;

        this.parent.info_canvas = this.info_canvas;
        this.initialize_normon();

        this.x_pos = 0;
        this.y_pos = 0;

        this.progress_screens();
    }
    change_focus(center=false){
        this.info_canvas.calculate_size(0);
        this.normon_canvas.calculate_size();
        this.width = this.info_canvas.screen_width;
        this.height = this.info_canvas.screen_height;

        var clock;
        if (center) {
            clock = this.parent.clockgrid.clocks[34];
        } else {
            clock = this.parent.clockgrid.clocks[this.target_clock];
        }

        this.clock = clock;
        // clock.winner = true;
        clock.draw_face();
        this.circle_x = clock.x_pos;
        this.circle_y = clock.y_pos;
        var circle_radius = clock.radius*this.circle_rel_size;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.globalCompositeOperation = 'source-over';
        this.info_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fillStyle = "rgb(255,255,255)";
        this.info_canvas.ctx.rect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fill();

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.globalCompositeOperation = 'destination-out';
        this.info_canvas.ctx.arc(this.circle_x, this.circle_y, circle_radius, 0, Math.PI*2, true);
        this.info_canvas.ctx.fill();

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.globalCompositeOperation = 'source-over';
        this.info_canvas.ctx.strokeStyle = "rgb(134,134,134)";
        this.info_canvas.ctx.lineWidth = clock.radius / 5;
        this.info_canvas.ctx.arc(this.circle_x, this.circle_y, circle_radius, 0, Math.PI*2, true);
        this.info_canvas.ctx.stroke();

        if (center) {
            clock = this.parent.clockgrid.clocks[this.target_clock];
            this.clock = clock;
            // clock.winner = true;
            clock.draw_face();
            this.circle_x = clock.x_pos;
            this.circle_y = clock.y_pos;
        }

    }
    progress_screens(){
        this.info_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.allow_input = false;
        if (this.target_num === 1){
            this.draw_welcome();
        } else if (this.target_num === 2){
            this.draw_info_1();
        } else if (this.target_num === 3){
            this.monitor_first_phrase();
        } else if (this.target_num === 4){
            this.monitor_phrase_end();
        } else {
            this.monitor_study_end();
        }
    }
    draw_welcome() {
        this.allow_input = false;
        var rect_x;
        var rect_y;
        var normon_x;
        var normon_y;
        var font_height;

        if (this.text_num >= 0) {
            font_height = this.width / 55;
            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1;

            normon_x = rect_x - this.Normon.radius*2;
            normon_y = rect_y + font_height*2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = font_height * 0.3;
            roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height * 31, font_height * 5.4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Great! Let's get started with a practice session.",
                rect_x + font_height, rect_y + font_height * 1.3);
            this.info_canvas.ctx.fillText("Don't worry if everything doesn't go perfectly—we're just",
                rect_x + font_height, rect_y + font_height * 2.7);
            this.info_canvas.ctx.fillText("getting you used to the study interface.",
                rect_x + font_height, rect_y + font_height * 4.1);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 1) {
            font_height = this.width / 55;
            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1 + font_height*6;

            normon_x = rect_x - this.Normon.radius*2;
            normon_y = rect_y + font_height*2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = font_height * 0.3;
            roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height * 31, font_height * 5.4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Take as many practice sessions as you feel necessary",
                rect_x + font_height, rect_y + font_height * 1.3);
            this.info_canvas.ctx.fillText("to get a handle on using the interface—we anticipate",
                rect_x + font_height, rect_y + font_height * 2.7);
            this.info_canvas.ctx.fillText("you'll need a few!",
                rect_x + font_height, rect_y + font_height * 4.1);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 2) {
            font_height = this.width / 55;
            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1 + font_height*12;

            normon_x = rect_x - this.Normon.radius*2;
            normon_y = rect_y + font_height*2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = font_height * 0.3;
            roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height * 31, font_height * 5.4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Let us know when you're comfortable to finish the practice",
                rect_x + font_height, rect_y + font_height * 1.3);
            this.info_canvas.ctx.fillText("phase and start the sessions where we'll track your performance.",
                rect_x + font_height, rect_y + font_height * 2.7);
            this.info_canvas.ctx.fillText("Press your switch when you're done reading...",
                rect_x + font_height, rect_y + font_height * 4.1);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = false;
            this.allow_input = true;
        }

        this.Normon.update_radius(this.height / 15);
        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }
    draw_info_1(){
        this.allow_input = false;
        var normon_x;
        var normon_y;
        var font_height;

        if (this.text_num >= 0) {
            font_height = this.width/70;

            var rect_x = this.width*0.1;
            var rect_y = this.height*0.87;

            normon_x = rect_x + font_height*25 + this.Normon.radius*2;
            normon_y = rect_y + font_height*1.5;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = font_height*0.3;
            roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*25, font_height*3,
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
            this.info_canvas.ctx.fillText("In a session, you'll see a phrase like this one ",
                rect_x + font_height, rect_y + font_height*1.3);
            this.info_canvas.ctx.fillText("in the text box. Your job is to copy the phrase.",
                rect_x + font_height, rect_y + font_height*2.3);

            this.Normon.pause = this.normon_pause_length ;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 1) {
            font_height = this.width / 55;
            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1;

            normon_x = rect_x - this.Normon.radius*2;
            normon_y = rect_y + font_height*2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = font_height * 0.3;
            roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height * 31, font_height * 5.4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("I'll keep track of where you are in the phrase for you.",
                rect_x + font_height, rect_y + font_height * 1.3);
            this.info_canvas.ctx.fillText("I'll highlight the item you need to select next in purple ",
                rect_x + font_height, rect_y + font_height * 2.7);
            this.info_canvas.ctx.fillText("so you don't need to go searching for it!",
                rect_x + font_height, rect_y + font_height * 4.1);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 2) {
            font_height = this.width / 55;
            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1 + font_height*6;

            normon_x = rect_x - this.Normon.radius*2;
            normon_y = rect_y + font_height*2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = font_height * 0.3;
            roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height * 31, font_height * 5.4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Go ahead and try to copy this phrase. I'll be back when",
                rect_x + font_height, rect_y + font_height * 1.3);
            this.info_canvas.ctx.fillText(" you're finished to help you through the next part.",
                rect_x + font_height, rect_y + font_height * 2.7);
            this.info_canvas.ctx.fillText("Press your switch when you're ready to start...",
                rect_x + font_height, rect_y + font_height * 4.1);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = false;
            this.allow_input = true;
        }

        this.Normon.update_radius(this.height/15);
        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }
    monitor_first_phrase(){
        var normon_x;
        var normon_y;
        var rect_x;
        var rect_y;
        var font_height;
        this.forward_input = false;
        this.allow_input = false;

        if (this.parent.emojis_selected < 5) {
            normon_x = -this.Normon.radius * 3;
            normon_y = this.Normon.y_pos;
            this.forward_input = true;

        } else if (this.parent.emojis_selected == 5) {
            font_height = this.width / 55;
            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1;

            normon_x = rect_x - this.Normon.radius * 2;
            normon_y = rect_y + font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = font_height * 0.3;
            roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height * 31, font_height * 5.4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Awesome, you copied the first phrase!",
                rect_x + font_height, rect_y + font_height * 1.3);
            this.info_canvas.ctx.fillText("At the end of each phrase, you can type two periods (..) to",
                rect_x + font_height, rect_y + font_height * 2.7);
            this.info_canvas.ctx.fillText("signal you're done and ready for the next phrase. ",
                rect_x + font_height, rect_y + font_height * 4.1);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
            this.allow_input = true;
        }

        this.Normon.update_radius(this.height/15);
        this.Normon.update_target_coords(normon_x, normon_y);
    }
    monitor_phrase_end(){
        var normon_x;
        var normon_y;
        var rect_x;
        var rect_y;
        var font_height;
        this.forward_input = false;
        this.allow_input = false;

        if (this.parent.emojis_selected > 0) {
            normon_x = -this.Normon.radius * 3;
            normon_y = this.Normon.y_pos;
            this.forward_input = true;

        } else {
            font_height = this.width / 55;
            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1;

            normon_x = rect_x - this.Normon.radius*2;
            normon_y = rect_y + font_height*2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = font_height * 0.3;
            roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height * 31, font_height * 5.4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Great Job! Now that you've typed two periods, I've",
                rect_x + font_height, rect_y + font_height * 1.3);
            this.info_canvas.ctx.fillText("put the next phrase down in the text box for you.",
                rect_x + font_height, rect_y + font_height * 2.7);
            this.info_canvas.ctx.fillText("Press your switch when you're ready to try it...",
                rect_x + font_height, rect_y + font_height * 4.1);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
            this.allow_input = true;
            this.target_num += 1;
        }

        this.Normon.update_radius(this.height/15);
        this.Normon.update_target_coords(normon_x, normon_y);
    }
    monitor_study_end(){
        var normon_x;
        var normon_y;
        var rect_x;
        var rect_y;
        var font_height;
        this.forward_input = false;
        this.allow_input = false;

        if (this.parent.study_manager.in_finished_screen) {
            font_height = this.width / 55;
            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1;

            normon_x = rect_x - this.Normon.radius*2;
            normon_y = rect_y + font_height*2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = font_height * 0.3;
            roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height * 31, font_height * 5.4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Awesome work! You've finished all the phrases for this",
                rect_x + font_height, rect_y + font_height * 1.3);
            this.info_canvas.ctx.fillText("session. ",
                rect_x + font_height, rect_y + font_height * 2.7);
            this.info_canvas.ctx.fillText("Press your switch to exit...",
                rect_x + font_height, rect_y + font_height * 4.1);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
            this.allow_input = true;
        } else {
            normon_x = -this.Normon.radius * 3;
            normon_y = this.Normon.y_pos;
            this.forward_input = true;
        }

        this.Normon.update_radius(this.height/15);
        this.Normon.update_target_coords(normon_x, normon_y);
    }
    end_tutorial(){
        this.parent.destroy_info_screen();
        this.parent.in_tutorial = false;
        this.emoji_phrase_length -= 1;
        this.Normon.run_on_return = false;
        this.normon_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.Normon = null;
        clearInterval(this.normon_interval);

        console.log("END");
        this.parent.end_tutorial(this.failed);
    }
    on_press(time_in) {
        if (this.forward_input){
            this.parent.bc.select(time_in);
            this.progress_screens();
        } else if (this.allow_input) {
            this.Normon.jump();
            this.target_num += 1;
            this.text_num = 0;
            this.progress_screens();
        }
    }
    update_kde(){
        console.log(this.rel_click_times);
        this.bc.clock_inf.kde = new KernelDensityEstimation(this.parent.time_rotate);
        this.bc.clock_inf.kde.initialize_zero_dens();
        for (var click_index in this.rel_click_times){
            var yin = this.rel_click_times[click_index];
            this.bc.clock_inf.inc_score_inc(yin);
        }
        this.bc.clock_inf.clock_history = [[]];
    }
}