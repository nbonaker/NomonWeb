import * as kconfig from './kconfig.js';
import * as widgets from "./widgets.js";
import {KernelDensityEstimation} from "./clock_inference_engine.js";
import * as config from "./config.js";


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


export class tutorialManager{
    constructor(parent, bc){
        this.parent = parent;
        this.bc = bc;
        this.target_phrase = "calibrating ";
        this.target_text = null;
        this.target_clock = null;
        this.cur_presses_remaining = 0;
        this.cur_press = 0;
        this.rel_click_times = [];

        this.circle_x;
        this.circle_y;
        this.clock;

        this.update_target();
        this.start_tutorial();
    }
    update_target(){
        var typed_text = this.parent.typed;
        var word_index = typed_text.split("_").length - 1;
        var char_index = typed_text.length;

        var target_words = this.target_phrase.split(" ");
        if (word_index <= target_words.length){
            if (char_index <= this.target_phrase.length){
                var cur_word = target_words[word_index];
                if (subarray_includes(this.parent.words_li, cur_word)[0]){
                    this.target_text = cur_word;
                } else {
                    this.target_text = this.target_phrase.charAt(char_index);
                }
            } else {
                this.target_text = null;
            }
        } else {
            this.target_text = null;
        }

        if (this.target_text === null || this.target_text === ""){
            this.update_kde();
            this.parent.destroy_info_screen();
            this.parent.in_tutorial = false;
        } else {
            if (this.target_text === " ") {
                this.target_text = "_";
            }
            console.log("target text:", this.target_text);

            if (this.target_text.length === 1) {
                this.target_clock = kconfig.main_chars.indexOf(this.target_text) * 4 + 3;
            } else {
                var word_li_index = subarray_includes(this.parent.words_li, this.target_text)[1];
                this.target_clock = word_li_index[0] * 4 + word_li_index[1];
            }
            this.cur_presses_remaining = Math.floor(Math.random() * 2) + 2;
            this.cur_press = 0;

            console.log("target clock: ", this.target_clock, "target clock_text:", this.parent.clockgrid.clocks[this.target_clock].text, "num presses:", this.cur_presses_remaining);
            if (this.info_canvas){
                this.change_focus();
            }
        }
    }
    start_tutorial(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.parent.info_canvas = this.info_canvas;
        this.info_canvas.calculate_size(0);

        this.x_pos = 0;
        this.y_pos = 0;
        this.width = this.info_canvas.screen_width;
        this.height = this.info_canvas.screen_height;

        this.change_focus();

    }
    change_focus(){
        var clock = this.parent.clockgrid.clocks[this.target_clock];
        this.clock = clock;
        clock.winner = true;
        clock.draw_face();
        this.circle_x = clock.x_pos;
        this.circle_y = clock.y_pos;
        var circle_radius = clock.radius*6;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.globalCompositeOperation = 'source-over';
        this.info_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fillStyle = "rgba(232,232,232, 0.7)";
        this.info_canvas.ctx.rect(0, 0, this.width, this.height*0.8);
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

        this.draw_clock_instruction(this.circle_x, this.circle_y, clock.radius);

    }
    draw_clock_instruction(clock_x, clock_y, radius){

        var font_height = radius*2;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.2;

        var arrow_x_end;
        var arrow_y_end;
        var arrow_x_start;
        var arrow_y_start;
        var arrow_x_center;
        var arrow_y_center;

        if (clock_x < this.info_canvas.screen_width/5) {
            arrow_x_end = clock_x;
            arrow_y_end = clock_y + radius * 3;

            arrow_x_start = arrow_x_end + radius*6;
            arrow_y_start = arrow_y_end + radius * 3;

            arrow_x_center = arrow_x_end ;
            arrow_y_center = arrow_y_end + radius*3;
            drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI/2, font_height*0.6, font_height*0.6);
        } else {
            arrow_x_end = clock_x - radius * 2;
            arrow_y_end = clock_y + radius * 2;

            arrow_x_start = arrow_x_end + radius * 2;
            arrow_y_start = arrow_y_end + radius * 6;

            arrow_x_center = arrow_x_end - radius * 4;
            arrow_y_center = arrow_y_end + radius * 4;

            drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI/4, font_height*0.6, font_height*0.6);
        }

        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.15;

        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        if (this.cur_press < 1) {
            roundRect(this.info_canvas.ctx, arrow_x_start + font_height, arrow_y_start - font_height*1.5, font_height*17.5, font_height*3,
            20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.fillText("Press when this clock passes noon", arrow_x_start + font_height * 2, arrow_y_start + font_height * 0.2);
        } else {
            roundRect(this.info_canvas.ctx, arrow_x_start + font_height, arrow_y_start - font_height*1.5, font_height*24.5, font_height*3,
            20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.fillText("You have to press multiple times to select a clock", arrow_x_start + font_height * 2, arrow_y_start + font_height * 0.2);
        }
    }
    on_press(time_in){
        this.cur_presses_remaining -= 1;
        this.cur_press += 1;
        var clock_history = this.bc.clock_inf.clock_history[0];

        var time_diff_in = time_in - this.bc.latest_time;

        var last_bc_time = this.bc.clock_inf.clock_util.cur_hours[this.target_clock] * this.bc.clock_inf.time_rotate / this.bc.clock_inf.clock_util.num_divs_time;
        var lag_time = time_diff_in;
        var half_period = this.bc.clock_inf.time_rotate * config.frac_period;

        var rel_click_time = last_bc_time + lag_time -half_period;
        this.rel_click_times.push(rel_click_time);

        this.draw_clock_instruction(this.circle_x, this.circle_y, this.clock.radius);

        if (this.cur_presses_remaining === 0){
            this.bc.clock_inf.win_history[0] = this.target_clock;
            this.bc.clock_inf.entropy.update_bits();
            this.parent.make_choice(this.target_clock);
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

        this.parent.end_tutorial();
    }
}