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
        this.emoji_phrase_length = 5;
        this.target_text = null;
        this.target_clock = null;
        this.cur_presses_remaining = 0;
        this.cur_press = 0;
        this.rel_click_times = [];

        this.circle_x;
        this.circle_y;
        this.circle_rel_size = 1.5;
        this.target_num = 0;
        this.clock;

        this.update_target();
        this.start_tutorial();
    }
    update_target(){
        this.target_num += 1;
        if (this.parent.emoji_keyboard){
            this.target_clock = 34;
            if (this.target_num === 1){
                this.circle_rel_size = 1.5;
                this.target_clock = 34;
            } else if (this.target_num === 2){
                this.circle_rel_size = 6;
                this.target_clock = 34;
            } else if (this.target_num === 3) {
                this.circle_rel_size = 14;
                this.target_clock = 25;
            } else if (this.target_num === 4){
                this.circle_rel_size = 29;
                this.target_clock = 31;
            } else {
                this.circle_rel_size = 50;
                this.target_clock = 4
            }


            if (this.emoji_phrase_length <= 0) {
                this.update_kde();
                this.parent.destroy_info_screen();
                this.parent.in_tutorial = false;
            } else {

                this.cur_presses_remaining = Math.floor(Math.random() * 2) + 3;
                this.cur_press = 0;

                console.log("target clock:", this.target_clock);
                if (this.info_canvas) {
                    this.change_focus(true);
                }
                this.emoji_phrase_length -= 1;
            }

        } else {
            var typed_text = this.parent.typed;
            var word_index = typed_text.split("_").length - 1;
            var char_index = typed_text.length;

            var target_words = this.target_phrase.split(" ");
            if (word_index <= target_words.length) {
                if (char_index <= this.target_phrase.length) {
                    var cur_word = target_words[word_index];
                    if (subarray_includes(this.parent.words_li, cur_word)[0]) {
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

            if (this.target_text === null || this.target_text === "") {
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
                if (this.info_canvas) {
                    this.change_focus();
                }
            }
            this.circle_rel_size = 6;
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
    change_focus(center=false){
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

        this.draw_clock_instruction(this.circle_x, this.circle_y, clock.radius);
        if (this.target_num === 1){
            this.draw_welcome();
        } if (this.target_num === 2){
            this.draw_info_1();
        } if (this.target_num === 3){
            this.draw_info_2();
        } else if (this.target_num === 5){
            this.draw_info_3();
        }

    }
    draw_welcome(){
        var font_height = this.width/17;
        this.info_canvas.ctx.globalCompositeOperation = 'source-over';
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "bold ".concat(font_height.toString(), "px Helvetica");

        this.info_canvas.ctx.fillText("Welcome to Nomon!", this.width / 4.6, this.height * 0.22);

        font_height = this.width/12.5;
        this.info_canvas.ctx.font = "bold ".concat(font_height.toString(), "px Helvetica");


        font_height = this.width/55;
        var rect_x = this.width*0.22;
        var rect_y = this.height*0.7;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*31, font_height*5,
            20, true, true);
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Nomon centers around clocks like the one above. Clocks allow you ",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("to select the items that they are next to. You can select a clock",
            rect_x + font_height, rect_y + font_height*2.7);
        this.info_canvas.ctx.fillText("by pressing when its minute hand passes the red Noon line.",
            rect_x + font_height, rect_y + font_height*4.1);

    }
    draw_info_1(){

        var font_height = this.width/55;
        var rect_x = this.width*0.22;
        var rect_y = this.height*0.7;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*31, font_height*5,
            20, true, true);
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("You've just selected your first clock! Notice how it turned green.",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("Now let's add a couple more clocks... You need to look only at the",
            rect_x + font_height, rect_y + font_height*2.7);
        this.info_canvas.ctx.fillText("clock you want to select. Focus on the center clock and select it.",
            rect_x + font_height, rect_y + font_height*4.1);

    }
    draw_info_2(){

        var font_height = this.width/55;
        var rect_x = this.width*0.22;
        var rect_y = this.height*0.7;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*31, font_height*6.2,
            20, true, true);
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Great! Let's add a few more clocks. Remember that you need to",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("look only at the clock you want to select. ",
            rect_x + font_height, rect_y + font_height*2.7);
        this.info_canvas.ctx.fillText("Notice the items (colored squares) to the right of each clock.",
            rect_x + font_height, rect_y + font_height*4.1);
        this.info_canvas.ctx.fillText("Selecting a clock selects the item to its right.",
            rect_x + font_height, rect_y + font_height*5.5);

    }
    draw_info_3(){
        var font_height = this.width/70;

        var rect_x = this.width*0.1;
        var rect_y = this.height*0.87;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*17, font_height*3,
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
        this.info_canvas.ctx.fillText("Notice how the items you selected ",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("appear here in the text box.",
            rect_x + font_height, rect_y + font_height*2.3);
    }
    draw_info_4(){

        var font_height = this.width/55;
        var rect_x = this.width*0.22;
        var rect_y = this.height*0.6;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.3;
        roundRect(this.info_canvas.ctx, rect_x, rect_y, font_height*31, font_height*6.2,
            20, true, true);
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Notice how some clocks are blue and some are black. As you",
            rect_x + font_height, rect_y + font_height*1.3);
        this.info_canvas.ctx.fillText("press more times, more clocks will change from blue to black. ",
            rect_x + font_height, rect_y + font_height*2.7);
        this.info_canvas.ctx.fillText("Blue clocks are on track to be selected based off of your",
            rect_x + font_height, rect_y + font_height*4.1);
        this.info_canvas.ctx.fillText("recent presses.",
            rect_x + font_height, rect_y + font_height*5.5);

    }
    draw_clock_instruction(clock_x, clock_y, radius){

        var font_height = radius*1;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.5;

        var arrow_x_end;
        var arrow_y_end;
        var arrow_x_start;
        var arrow_y_start;
        var arrow_x_center;
        var arrow_y_center;

        if (clock_x < this.info_canvas.screen_width/5) {
            arrow_x_end = clock_x;
            arrow_y_end = clock_y + radius * 2;

            arrow_x_start = arrow_x_end + radius*6;
            arrow_y_start = arrow_y_end + radius * 3;

            arrow_x_center = arrow_x_end ;
            arrow_y_center = arrow_y_end + radius*3;
            drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI/2, font_height*0.8, font_height*0.8);
        } else {
            arrow_x_end = clock_x - radius *1.7 ;
            arrow_y_end = clock_y + radius *1.7;

            arrow_x_start = arrow_x_end + radius * 2;
            arrow_y_start = arrow_y_end + radius * 6;

            arrow_x_center = arrow_x_end - radius * 4;
            arrow_y_center = arrow_y_end + radius * 4;

            drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI/4, font_height*0.8, font_height*0.8);
        }

        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.15;

        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        if (this.target_num === 1) {
            if (this.cur_press < 1) {
                roundRect(this.info_canvas.ctx, arrow_x_start + font_height, arrow_y_start - font_height * 1.5, font_height * 27, font_height * 3,
                    20, true, true);
                this.info_canvas.ctx.fillStyle = "#404040";
                this.info_canvas.ctx.fillText("To start, press your switch when this clock passes noon", arrow_x_start + font_height * 2, arrow_y_start + font_height * 0.2);
            } else {
                roundRect(this.info_canvas.ctx, arrow_x_start + font_height, arrow_y_start - font_height * 1.7, font_height * 27, font_height * 4.2,
                    20, true, true);
                this.info_canvas.ctx.fillStyle = "#404040";
                this.info_canvas.ctx.fillText("Great! You have to press multiple times to select a clock.", arrow_x_start + font_height * 2, arrow_y_start);
                this.info_canvas.ctx.fillText("Keep pressing when the clock passes noon.", arrow_x_start + font_height * 2, arrow_y_start + font_height * 1.5);

            }
        } else {
            var cur_word;
            if (this.target_num === 2){
                cur_word = "less";
            } else if (this.target_num === 3){
                cur_word = "little";
            } else if (this.target_num === 4){
                cur_word = "make";
            } else if (this.target_num === 5){
                cur_word = "where";
                if (this.cur_press > 0){
                    this.draw_info_4();
                    this.info_canvas.ctx.fillStyle = "#ffffff";
                    this.info_canvas.ctx.strokeStyle = "#404040";
                    this.info_canvas.ctx.lineWidth = font_height*0.15;
                    this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
                }
            }

            if (this.cur_press < 1) {
                roundRect(this.info_canvas.ctx, arrow_x_start + font_height, arrow_y_start - font_height * 1.5, font_height * 32, font_height * 3,
                    20, true, true);
                this.info_canvas.ctx.fillStyle = "#404040";
                this.info_canvas.ctx.fillText("Press when this clock passes noon to select the item \"".concat(cur_word, "\""), arrow_x_start + font_height * 2, arrow_y_start + font_height * 0.2);
            } else {
                roundRect(this.info_canvas.ctx, arrow_x_start + font_height, arrow_y_start - font_height * 1.5, font_height * 32, font_height * 3,
                    20, true, true);
                this.info_canvas.ctx.fillStyle = "#404040";
                this.info_canvas.ctx.fillText("Keep pressing when the clock passes noon to select the item \"".concat(cur_word, "\""), arrow_x_start + font_height * 2, arrow_y_start + font_height * 0.2);
            }
        }
    }
    on_press(time_in){
        this.cur_presses_remaining -= 1;
        this.cur_press += 1;
        var clock_history = this.bc.clock_inf.clock_history[0];

        this.bc.clock_inf.update_scores(time_in - this.bc.latest_time);
        this.bc.clock_inf.update_history(time_in - this.bc.latest_time);


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
        } else {
            this.bc.init_round(false, false, []);
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