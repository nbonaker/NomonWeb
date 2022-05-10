import * as kconfig from './kconfig.js';
import * as widgets from "./widgets.js";
import {KernelDensityEstimation} from "./clock_inference_engine.js";
import * as config from "./config.js";
import * as normon from "../normon/normontheclock.js";


function roundRect(ctx, shadow_ctx, x, y, width, height, radius, fill, stroke, clear_shadow=false) {
    box_shadow(shadow_ctx, x, y, width, height, clear_shadow);

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


function box_shadow(ctx, x, y, width, height, clear_shadow) {
    var res = 25;
    var feather=100;
    ctx.beginPath();
    if (clear_shadow){
        ctx.clearRect(x-feather, y-feather, width+2*feather, height+2*feather);
    }
    for (var i = 0; i < res; i += 1) {
        ctx.strokeStyle = `rgba(80,80,80,${(1 - i / res) * 0.2})`;
        ctx.lineWidth = 5;
        ctx.rect(x-i/res*feather, y-i/res*feather, width+i/res*feather*2, height+i/res*feather*2);
        ctx.stroke();
    }

}

function drawArrowhead(ctx, locx, locy, angle, sizex, sizey) {
    var hx = sizex / 2;
    var hy = sizey / 2;

    ctx.translate((locx), (locy));
    ctx.rotate(angle);
    ctx.translate(-hx, -hy);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 1 * sizey);
    ctx.lineTo(1 * sizex, 1 * hy);
    ctx.closePath();
    ctx.fill();

    ctx.translate(hx, hy);
    ctx.rotate(-angle);
    ctx.translate(-locx, -locy);
}

// returns radians
function findAngle(sx, sy, ex, ey) {
    // make sx and sy at the zero point
    return Math.atan2((ey - sy), (ex - sx));
}


function subarray_includes(array, item, indicies = [], level = 0) {
    if (indicies.length <= level) {
        indicies.push(0);
    }

    var in_array = false;
    for (var i in array) {
        if (in_array) {
            break;
        }
        indicies[level] = parseInt(i);

        var sub_element = array[i];
        if (sub_element instanceof Array) {
            var sub_result = subarray_includes(sub_element, item, indicies.slice(0, level + 1), level + 1);
            in_array = sub_result[0];
            if (in_array) {
                indicies = sub_result[1];
            }
        } else {
            if (sub_element === item) {
                in_array = true;
                break;
            }
        }
    }
    return [in_array, indicies];
}


export class tutorialManager {
    constructor(parent, bc) {

        this.parent = parent;
        this.parent.in_info_screen = false;
        this.bc = bc;
        this.target_phrase = "calibrating ";
        this.emoji_phrase_length = 10;
        this.target_text = null;
        this.target_clock = null;
        this.target_option = null;
        this.cur_presses_remaining = 0;
        this.cur_press = 0;
        this.rel_click_times = [];

        this.circle_x;
        this.circle_y;
        this.circle_rel_size = 1.5;
        this.target_num = 0;
        this.clock;
        this.Normon;
        // this.normon_pause_length = 1.5;
        this.normon_pause_length = 3;

        this.text_num = 0;
        this.allow_input = false;
        this.failed = false;

        this.update_target();
        this.start_tutorial();
    }

    initialize_normon() {
        this.normon_canvas = new normon.NormonCanvas("normon_canvas", 5);

        var normon_x = -this.normon_canvas.screen_width / 5;
        var normon_y = this.normon_canvas.screen_height / 4;
        var normon_r = Math.min(this.normon_canvas.screen_height / 15, this.normon_canvas.screen_width / 15);

        this.Normon = new normon.Normon(this.normon_canvas, normon_x, normon_y, normon_r, this);

        this.normon_interval = setInterval(this.Normon.animate.bind(this.Normon), 20);
    }

    update_target() {
        this.text_num = 0;
        this.target_num += 1;
        console.log(this.target_num);

        this.target_clock = 27;
        if (this.target_num === 1) {
            this.circle_rel_size = 1.5;
            this.target_clock = 27;
        } else if (this.target_num === 2) {
            this.circle_rel_size = 1.5;
            this.target_clock = 27;
        } else if (this.target_num === 3) {
            this.circle_rel_size = 8;
            this.target_clock = 27;
        } else if (this.target_num === 4) {
            this.circle_rel_size = 14;
            this.target_clock = 21;
        } else if (this.target_num === 5) {
            this.circle_rel_size = 29;
            this.target_clock = 31;
        } else if (this.target_num === 6) {
            this.circle_rel_size = 100;
            this.target_clock = 4
        } else if (this.target_num === 7) {
            this.circle_rel_size = 100;
            this.target_clock = 52;
        } else{
            // this.end_tutorial();
        }
        // else if (this.target_num === 10) {
        //     this.circle_rel_size = 100;
        //     this.target_clock = 62;
        // }


        this.cur_presses_remaining = Math.floor(Math.random() * 2) + 3;

        this.cur_press = 0;

        console.log("target clock:", this.target_clock);
        if (this.info_canvas) {
            this.change_focus(true);
        }
        this.emoji_phrase_length -= 1;

    }

    start_tutorial() {
        this.info_canvas = new widgets.KeyboardCanvas("info", 5);
        this.shadow_canvas = new widgets.KeyboardCanvas("shadow", 4);
        this.parent.info_canvas = this.info_canvas;
        this.parent.shadow_canvas = this.shadow_canvas;
        this.initialize_normon();

        this.x_pos = 0;
        this.y_pos = 0;

        this.change_focus();

    }

    change_focus(center = false) {
        this.info_canvas.calculate_size(-0.01);
        this.shadow_canvas.calculate_size(-0.01);
        this.normon_canvas.calculate_size();

        this.width = this.info_canvas.screen_width;
        this.height = this.info_canvas.screen_height;

        this.font_height = Math.min(this.height/45);

        var clock;
        if (center) {
            clock = this.parent.clockgrid.clocks[27];
        } else {
            clock = this.parent.clockgrid.clocks[this.target_clock];
        }

        this.clock = clock;
        // clock.winner = true;
        clock.draw_face();
        this.circle_x = clock.x_pos;
        this.circle_y = clock.y_pos;
        var circle_radius = clock.radius * this.circle_rel_size;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.globalCompositeOperation = 'source-over';
        this.info_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.shadow_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fillStyle = "rgb(255,255,255)";
        this.info_canvas.ctx.rect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fill();

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.globalCompositeOperation = 'destination-out';
        this.info_canvas.ctx.arc(this.circle_x, this.circle_y, circle_radius, 0, Math.PI * 2, true);
        this.info_canvas.ctx.fill();

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.globalCompositeOperation = 'source-over';
        this.info_canvas.ctx.strokeStyle = "rgb(134,134,134)";
        this.info_canvas.ctx.lineWidth = clock.radius / 5;
        this.info_canvas.ctx.arc(this.circle_x, this.circle_y, circle_radius, 0, Math.PI * 2, true);
        this.info_canvas.ctx.stroke();

        if (center) {
            clock = this.parent.clockgrid.clocks[this.target_clock];
            this.clock = clock;
            // clock.winner = true;
            clock.draw_face();
            this.circle_x = clock.x_pos;
            this.circle_y = clock.y_pos;
        }

        this.progress_screens();

    }

    progress_screens() {
        this.shadow_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.allow_input = false;
        if (this.target_num === 1) {
            this.draw_welcome();
        }else if (this.target_num === 2) {
            this.draw_info_0();
        } else if (this.target_num === 3) {
            this.draw_info_1();
        } else if (this.target_num === 4) {
            this.draw_info_2();
        } else if (this.target_num === 5) {
            this.allow_input = true;
            this.draw_clock_instruction(this.circle_x, this.circle_y, this.clock.radius);
            this.Normon.run_on_return = false;
            var normon_x = this.circle_x - this.clock.radius * 3 - this.Normon.radius;
            var normon_y = this.circle_y + this.info_canvas.topbar_height * 2;
            this.Normon.update_target_coords(normon_x, normon_y);
        } else if (this.target_num === 6) {
            this.draw_info_3();
        } else if (this.target_num === 7) {
            this.draw_info_5();
        } else if (this.target_num === 8) {
            this.draw_end();
        } else {
            this.end_tutorial();
        }
    }

    draw_welcome() {
        this.allow_input = false;
        var normon_x;
        var normon_y;


        if (this.text_num >= 0) {
            normon_x = this.width / 8;
            normon_y = this.info_canvas.topbar_height * 2 + this.height / 4;

            // this.font_height = this.width / 17;
            this.info_canvas.ctx.globalCompositeOperation = 'source-over';
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "bold ".concat((this.font_height*3).toString(), "px Helvetica");

            this.info_canvas.ctx.fillText("Welcome to", this.width / 4.7, this.height * 0.22);
            this.info_canvas.ctx.fillText("Nomon!", this.width / 4.7, this.height * 0.22+this.font_height*3);

            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 1) {
            normon_x = this.width / 8;
            normon_y = this.info_canvas.topbar_height * 2 + this.height / 4;


            this.info_canvas.ctx.globalCompositeOperation = 'source-over';
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "bold ".concat(this.font_height.toString(), "px Helvetica");

            this.info_canvas.ctx.fillText("I'm Normon and I will help you", this.width / 4.7, this.height * 0.32);
            this.info_canvas.ctx.fillText("get started...", this.width / 4.7, this.height * 0.35);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 2) {

            var rect_x = this.width * 0.2;
            var rect_y = this.height * 0.55;

            normon_x = rect_x - this.Normon.radius * 1.5;
            normon_y = rect_y + this.font_height * 6;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 8,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Nomon is a single-switch ",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("communication interface that ",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("offers fast and flexible computer",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("interaction for individuals",
                rect_x + this.font_height, rect_y + this.font_height * 5.5);
            this.info_canvas.ctx.fillText("with severe motor impairments.",
                rect_x + this.font_height, rect_y + this.font_height * 6.9);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 3) {

            var rect_x = this.width * 0.2;
            var rect_y = this.height * 0.55 + this.font_height * 10;

            normon_x = rect_x - this.Normon.radius*1.5;
            normon_y = rect_y + this.font_height * 6;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 8,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("You can emulate \"clicking\" a ",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("a single-switch in this demo",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("by tapping anywhere on the",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("screen.",
                rect_x + this.font_height, rect_y + this.font_height * 5.5);
            this.info_canvas.ctx.fillText("(click your \"switch\" to continue...)",
                rect_x + this.font_height, rect_y + this.font_height * 6.9);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = false;
            this.allow_input = true;
        }

        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }
    draw_info_0() {
        this.allow_input = false;
        var normon_x;
        var normon_y;


        if (this.text_num >= 0) {

            var rect_x = this.width * 0.2;
            var rect_y = this.height * 0.7;

            normon_x = rect_x - this.Normon.radius * 1.5;
            normon_y = rect_y + this.font_height * 2.5;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 9,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Nomon centers around clocks ",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("like the one above. Clocks",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("allow you to select between",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("items. You can select a clock",
                rect_x + this.font_height, rect_y + this.font_height * 5.5);
            this.info_canvas.ctx.fillText("by clicking when its minute",
                rect_x + this.font_height, rect_y + this.font_height * 6.9);
            this.info_canvas.ctx.fillText("hand passes the Noon line.",
                rect_x + this.font_height, rect_y + this.font_height * 8.3);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 1) {
            normon_x = this.circle_x - this.clock.radius * 3 - this.Normon.radius;
            normon_y = this.circle_y + this.info_canvas.topbar_height * 2;

            this.draw_clock_instruction(this.circle_x, this.circle_y, this.clock.radius);
            this.Normon.run_on_return = false;
        }

        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }

    draw_info_1() {
        this.allow_input = false;
        var normon_x;
        var normon_y;


        if (this.text_num >= 0) {

            var rect_x = this.width * 0.2;
            var rect_y = this.height * 0.7;

            normon_x = rect_x - this.Normon.radius * 1.5;
            normon_y = rect_y + this.font_height * 2.5;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 9,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("You've just selected your",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("first clock! Notice how it",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("turned green. Now let's add",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("a couple more clocks...",
                rect_x + this.font_height, rect_y + this.font_height * 5.5);
            this.info_canvas.ctx.fillText("you need to look only at the",
                rect_x + this.font_height, rect_y + this.font_height * 6.9);
            this.info_canvas.ctx.fillText("clock you want to select.",
                rect_x + this.font_height, rect_y + this.font_height * 8.3);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 2) {
            normon_x = this.circle_x - this.clock.radius * 3 - this.Normon.radius;
            normon_y = this.circle_y + this.info_canvas.topbar_height * 2;

            this.draw_clock_instruction(this.circle_x, this.circle_y, this.clock.radius);
            this.Normon.run_on_return = false;
        }

        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }

    draw_info_2() {
        this.allow_input = false;
        var normon_x;
        var normon_y;


        if (this.text_num >= 0) {


            var rect_x = this.width * 0.2;
            var rect_y = this.height * 0.7;

            normon_x = rect_x - this.Normon.radius * 1.5;
            normon_y = rect_y + this.font_height * 3.1;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 11,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Great! Let's add a few more ",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("clocks. Remember that you",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("need to only look at the clock",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("you want to select. Notice the",
                rect_x + this.font_height, rect_y + this.font_height * 5.5);
            this.info_canvas.ctx.fillText("items (colored squares) to right",
                rect_x + this.font_height, rect_y + this.font_height * 6.9);
            this.info_canvas.ctx.fillText("of each clock. Selecting a clock",
                rect_x + this.font_height, rect_y + this.font_height * 8.3);
            this.info_canvas.ctx.fillText("selects the item to its right.",
                rect_x + this.font_height, rect_y + this.font_height * 9.7);


            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 2) {
            normon_x = this.circle_x - this.clock.radius * 3 - this.Normon.radius;
            normon_y = this.circle_y + this.info_canvas.topbar_height * 2;

            this.draw_clock_instruction(this.circle_x, this.circle_y, this.clock.radius);
            this.Normon.run_on_return = false;
        }

        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }

    draw_info_3() {
        this.allow_input = false;
        var normon_x;
        var normon_y;


        if (this.text_num >= 0) {

            var rect_x = this.width * 0.1;
            var rect_y = this.height * 0.7;

            normon_x = rect_x + this.font_height * 17 + this.Normon.radius * 1.5;
            normon_y = rect_y + this.font_height * 1.5;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 3,
                20, true, true, true);

            var arrow_x_start = rect_x - this.font_height;
            var arrow_y_start = rect_y + this.font_height * 1.5;

            var arrow_x_end = arrow_x_start - this.font_height * 4;
            var arrow_y_end = arrow_y_start - this.font_height * 1.5;

            var arrow_x_center = arrow_x_start - this.font_height * 3;
            var arrow_y_center = arrow_y_start;

            this.info_canvas.ctx.beginPath();
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.4;
            this.info_canvas.ctx.moveTo(arrow_x_start, arrow_y_start);
            this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
            this.info_canvas.ctx.stroke();
            drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI * 0.71, this.font_height * 1.5, this.font_height * 1.5);

            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Notice how the items you selected ",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("appear down here in the text box.",
                rect_x + this.font_height, rect_y + this.font_height * 2.3);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 1) {
            normon_x = this.circle_x - this.clock.radius * 3 - this.Normon.radius;
            normon_y = this.circle_y + this.info_canvas.topbar_height * 2;

            this.draw_clock_instruction(this.circle_x, this.circle_y, this.clock.radius);
            this.Normon.run_on_return = false;

        }

        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }

    draw_info_4() {


        var rect_x = this.width * 0.22;
        var rect_y = this.height * 0.6;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
        roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 6.2,
            20, true, true, true);
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Notice how some clocks are blue and some are black. As you",
            rect_x + this.font_height, rect_y + this.font_height * 1.3);
        this.info_canvas.ctx.fillText("press more times, more clocks will change from blue to black. ",
            rect_x + this.font_height, rect_y + this.font_height * 2.7);
        this.info_canvas.ctx.fillText("Blue clocks are on track to be selected based off of your",
            rect_x + this.font_height, rect_y + this.font_height * 4.1);
        this.info_canvas.ctx.fillText("recent presses.",
            rect_x + this.font_height, rect_y + this.font_height * 5.5);

    }

    draw_info_5() {
        this.allow_input = false;
        var normon_x;
        var normon_y;


        if (this.text_num >= 0) {

            var rect_x = this.width * 0.2;
            var rect_y = this.height * 0.1;

            normon_x = rect_x - this.Normon.radius * 1.5;
            normon_y = rect_y + this.font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 7,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Great job! Now that you know",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("how to select clocks, let's",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("talk about a clock with a",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("special function...",
                rect_x + this.font_height, rect_y + this.font_height * 5.5);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 1) {

            var rect_x = this.width * 0.2;
            var rect_y = this.height * 0.1 + this.font_height * 8;

            normon_x = rect_x - this.Normon.radius * 1.5;
            normon_y = rect_y + this.font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 7,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("The \"Undo\" clock. ",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("This clock will undo whatever",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("clock you selected last.",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("Try to select it!",
                rect_x + this.font_height, rect_y + this.font_height * 5.5);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 2) {
            normon_x = this.circle_x - this.clock.radius * 3 - this.Normon.radius;
            normon_y = this.circle_y + this.info_canvas.topbar_height * 2;

            this.draw_clock_instruction(this.circle_x, this.circle_y, this.clock.radius);
            this.Normon.run_on_return = false;

        }

        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }

    draw_info_6() {
        this.allow_input = false;
        var normon_x;
        var normon_y;


        if (this.text_num >= 0) {

            var rect_x = this.width * 0.22;
            var rect_y = this.height * 0.1;

            normon_x = rect_x - this.Normon.radius * 2;
            normon_y = rect_y + this.font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("You did it! Notice how the the last item you typed -- \"where\" --",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("disappeared. Use undo if you ever select the wrong clock.",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 1) {

            var rect_x = this.width * 0.22;
            var rect_y = this.height * 0.1 + this.font_height * 5;

            normon_x = this.Normon.radius * 1.5;
            normon_y = this.info_canvas.topbar_height * 2 + this.Normon.radius * 1.5;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Now let's talk about the \"options\" clock... This clock allows you to",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("control the options up here at the top of the screen.",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 2) {

            var rect_x = this.width * 0.22;
            var rect_y = this.height * 0.1 + this.font_height * 10;

            normon_x = rect_x - this.Normon.radius * 2;
            normon_y = rect_y + this.font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("After selecting the options clock, you can control these options",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("through a row-column-scanning interface. Let me show you!",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 3) {
            normon_x = this.circle_x - this.clock.radius * 3 - this.Normon.radius;
            normon_y = this.circle_y + this.info_canvas.topbar_height * 2;

            this.draw_clock_instruction(this.circle_x, this.circle_y, this.clock.radius);
            this.Normon.run_on_return = false;

        }

        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }

    draw_info_7() {
        this.allow_input = false;
        this.target_option = [0, 2];
        var normon_x;
        var normon_y;


        if (this.text_num >= 0) {

            var rect_x = this.width * 0.22;
            var rect_y = this.height * 0.1;

            normon_x = rect_x - this.Normon.radius * 2;
            normon_y = rect_y + this.font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Great! By selecting the \"options\" clock, you've activated a",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("row-column scanning interface over the options up here.",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 1) {

            var rect_x = this.width * 0.22;
            var rect_y = this.height * 0.1 + this.font_height * 5;

            normon_x = rect_x - this.Normon.radius * 2;
            normon_y = rect_y + this.font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("These options allow you to change the clock rotation speed,",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("ask me for help, or end the session.",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 2) {

            var rect_x = this.width * 0.22;
            var rect_y = this.height * 0.1 + this.font_height * 10;

            normon_x = rect_x - this.Normon.radius * 2;
            normon_y = rect_y + this.font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Try to select the \"Exit Options\" option. Wait until the first row is ",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("highlighted in dark blue and then press!",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);

            // this.Normon.pause = this.normon_pause_length ;
            this.Normon.run_on_return = false;
        }

        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }

    draw_rcom_help(error_type) {

        var rect_x = this.width * 0.22;
        var rect_y = this.height * 0.1 + this.font_height * 5;

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
        roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 4,
            20, true, true, true);
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
        // this.info_canvas.ctx.fillText("Try to select the \"Stop Scan\" option.",
        //     rect_x + this.font_height, rect_y + this.font_height * 1.3);

        this.Normon.run_on_return = false;
        if (error_type === "late row") {
            this.info_canvas.ctx.fillText("Oops! you pressed a little too late! Wait till the row containing",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("the item is highlighted in dark blue and then press!",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
        } else if (error_type === "early col") {
            this.info_canvas.ctx.fillText("Oops! you pressed a little too early! Wait till the",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("item is highlighted in purple and then press!",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
        } else if (error_type === "late col") {
            this.info_canvas.ctx.fillText("Oops! you pressed a little too late! Wait till the",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("item is highlighted in purple and then press!",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
        } else if (error_type === "row correct") {
            this.info_canvas.ctx.fillText("Perfect! You've selected the row containing the item. Now wait",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("until the item is highlighted in purple and then press!",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
        } else if (error_type === "col correct") {
            this.target_num += 1;
            this.text_num = 0;
            this.change_focus();
            this.update_kde();
        }
    }

    allow_rcom_input(row_scan, col_scan) {
        this.Normon.jump();
        if (row_scan === this.target_option[0] && col_scan === -2) {
            this.draw_rcom_help("row correct");
            return true;
        } else if (row_scan === this.target_option[0] && col_scan === this.target_option[1]) {
            this.draw_rcom_help("col correct");
            return true;
        }
        if (col_scan === -2 && row_scan === !this.target_option[0]) {
            this.draw_rcom_help("late row");
        } else if (col_scan < this.target_option[1]) {
            this.draw_rcom_help("early col");
        } else if (col_scan > this.target_option[1]) {
            this.draw_rcom_help("late col");
        }
        return false;
    }

    draw_end() {
        this.allow_input = false;
        var normon_x;
        var normon_y;

        var rect_x;
        var rect_y;

        if (this.text_num >= 0 && this.text_num < 1) {

            rect_x = this.width * 0.2;
            rect_y = this.height * 0.1 + this.font_height * 3;

            normon_x = rect_x - this.Normon.radius * 1.5;
            normon_y = rect_y + this.font_height * 1 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 3.5,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Let me show you one more",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("thing before we start...",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);


            this.Normon.pause = 2;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 1) {

            rect_x = this.width * 0.2;
            rect_y = this.height * 0.1;

            normon_x = this.width * 9 / 10;
            normon_y = this.info_canvas.topbar_height * 2 + this.height * 7 / 9 - this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 8,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("This histogram down here shows",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("how accurately you're pressing",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("relative to when your target",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("clock passes Noon. It will",
                rect_x + this.font_height, rect_y + this.font_height * 5.5);
            this.info_canvas.ctx.fillText("update as you type more.",
                rect_x + this.font_height, rect_y + this.font_height * 6.9);


            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 2) {

            rect_x = this.width * 0.2;
            rect_y = this.height * 0.1 + this.font_height * 9;

            normon_x = this.width * 9 / 10;
            normon_y = this.info_canvas.topbar_height * 2 + this.height * 7 / 9 - this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 12.5,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("If most of the histogram is",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("green, you will be able to",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("select clocks easily and with",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("few presses. If you see a lot ",
                rect_x + this.font_height, rect_y + this.font_height * 5.5);
            this.info_canvas.ctx.fillText("red in the histogram, it might" ,
                rect_x + this.font_height, rect_y + this.font_height * 6.9);
            this.info_canvas.ctx.fillText("be worth lowering the clock",
                rect_x + this.font_height, rect_y + this.font_height * 8.3);
            this.info_canvas.ctx.fillText("rotation speed above.",
                rect_x + this.font_height, rect_y + this.font_height * 9.7);
            this.info_canvas.ctx.fillText("Click to continue...",
                rect_x + this.font_height, rect_y + this.font_height * 11.1);


            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num === 3) {

            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1 + this.font_height * 12;

            normon_x = this.width * 9 / 10;
            normon_y = this.info_canvas.topbar_height * 2 + this.height * 7 / 9 - this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            // roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 7,
            //     20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");

            var click_performance = this.parent.evaluate_click_dist();
            console.log(click_performance);
            var cur_speed = this.parent.rotate_index;
            var updated_speed = cur_speed;
            this.failed = false;
            //
            // if (click_performance === "excelent") {
            //     this.info_canvas.ctx.fillText("Wow - Your histogram looks great! You should be able to select",
            //         rect_x + this.font_height, rect_y + this.font_height * 1.3);
            //     this.info_canvas.ctx.fillText("clocks in very few presses if you keep pressing this precisely!",
            //         rect_x + this.font_height, rect_y + this.font_height * 2.7);
            //     this.info_canvas.ctx.fillText("I think you're good to go!",
            //         rect_x + this.font_height, rect_y + this.font_height * 4.1);
            //     updated_speed = cur_speed;
            //
            // } else if (click_performance === "good") {
            //     this.info_canvas.ctx.fillText("You clicked pretty precisely! It should only take a few presses",
            //         rect_x + this.font_height, rect_y + this.font_height * 1.3);
            //     this.info_canvas.ctx.fillText("for you to select clocks. I think you're good to go!",
            //         rect_x + this.font_height, rect_y + this.font_height * 2.7);
            //
            //     updated_speed = Math.max(0, Math.min(cur_speed - 1, 4));
            //
            // } else if (click_performance === "ok") {
            //     this.info_canvas.ctx.fillText("You clicked fairly precisely! It should take a few presses",
            //         rect_x + this.font_height, rect_y + this.font_height * 1.3);
            //     this.info_canvas.ctx.fillText("for you to select clocks, but just keep trying to click exactly",
            //         rect_x + this.font_height, rect_y + this.font_height * 2.7);
            //     this.info_canvas.ctx.fillText("as the clock passes Noon. I think you're good to go!",
            //         rect_x + this.font_height, rect_y + this.font_height * 4.1);
            //
            //     updated_speed = Math.max(0, Math.min(cur_speed - 2, 3));
            //
            // } else if (click_performance === "poor" || click_performance === "redo") {
            //     this.info_canvas.ctx.fillText("Hmmm... The results of your training were inconclusive. I highly ",
            //         rect_x + this.font_height, rect_y + this.font_height * 1.3);
            //     this.info_canvas.ctx.fillText("recommend we practice selecting clocks some more before we",
            //         rect_x + this.font_height, rect_y + this.font_height * 2.7);
            //     this.info_canvas.ctx.fillText("proceed. Are you good to train some more?",
            //         rect_x + this.font_height, rect_y + this.font_height * 4.1);
            //     this.failed = true;
            //     this.text_num += 1;
            //
            //     updated_speed = 0;
            //
            // }

            // this.info_canvas.ctx.fillText("Press your switch to continue...",
            //         rect_x + this.font_height, rect_y + this.font_height * 6);

            this.parent.change_speed(updated_speed);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
            // this.update_target();
            this.parent.in_info_screen = false;

        }
        // if (this.text_num === 4) {
        //
        //     rect_x = this.width * 0.22;
        //     rect_y = this.height * 0.1 + this.font_height*18;
        //
        //     normon_x = this.Normon.radius*1.5;
        //     normon_y = this.info_canvas.topbar_height*2+this.Normon.radius*1.5;
        //
        //     this.info_canvas.ctx.fillStyle = "#ffffff";
        //     this.info_canvas.ctx.strokeStyle = "#404040";
        //     this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
        //     roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 2,
        //         20, true, true);
        //     this.info_canvas.ctx.fillStyle = "#404040";
        //     this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
        //     this.info_canvas.ctx.fillText("If you need me, you can call me through the help button up here!",
        //         rect_x + this.font_height, rect_y + this.font_height * 1.3);
        //
        //     this.Normon.pause = this.normon_pause_length;
        //     this.Normon.run_on_return = true;
        // }
        // if (this.text_num >= 5) {
        //
        //     normon_x = -this.Normon.radius*1.5;
        //     normon_y = this.height/2;
        //     this.Normon.pause = 1;
        //     this.Normon.run_on_return = true;
        // }
        if (this.text_num >=4){
            this.allow_input = true;
        }

        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }

    draw_study_info_1() {
        this.allow_input = false;

        var normon_x;
        var normon_y;


        if (this.text_num >= 0) {

            var rect_x = this.width * 0.2;
            var rect_y = this.height * 0.1;

            normon_x = rect_x - this.Normon.radius * 15;
            normon_y = rect_y + this.font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 17, this.font_height * 4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("We're ready to start! Press",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("your switch when ready...",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;

        }

        this.Normon.update_target_coords(normon_x, normon_y);
        this.text_num += 1;
    }

    end_tutorial() {
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

    draw_clock_instruction(clock_x, clock_y, radius) {
        this.allow_input = true;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = this.font_height * 0.5;

        var arrow_x_end;
        var arrow_y_end;
        var arrow_x_start;
        var arrow_y_start;
        var arrow_x_center;
        var arrow_y_center;
        var rect_x;
        var rect_y;
        var text_x;

        if (clock_x < this.info_canvas.screen_width / 5) {
            arrow_x_end = clock_x;
            arrow_y_end = clock_y + radius * 2;

            arrow_x_start = arrow_x_end + radius * 6;
            arrow_y_start = arrow_y_end + radius * 3;

            arrow_x_center = arrow_x_end;
            arrow_y_center = arrow_y_end + radius * 3;

            rect_x = arrow_x_start + this.font_height;
            rect_y = arrow_y_start - this.font_height * 1.5;
            text_x = rect_x + this.font_height;

            drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI / 2, this.font_height * 0.8, this.font_height * 0.8);
        } else if (clock_x > this.info_canvas.screen_width * 2 / 3) {
            arrow_x_end = clock_x + radius * 1.7;
            arrow_y_end = clock_y + radius * 1.7;

            arrow_x_start = arrow_x_end - radius * 2;
            arrow_y_start = arrow_y_end + radius * 6;

            arrow_x_center = arrow_x_end + radius * 4;
            arrow_y_center = arrow_y_end + radius * 4;

            rect_x = arrow_x_start - this.font_height * 10;
            rect_y = arrow_y_start - this.font_height * 1.5;
            text_x = rect_x + this.font_height;

            drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI * 3 / 4, this.font_height * 0.8, this.font_height * 0.8);
        } else {
            arrow_x_end = clock_x - radius * 1.7;
            arrow_y_end = clock_y + radius * 1.7;

            arrow_x_start = arrow_x_end + radius * 2;
            arrow_y_start = arrow_y_end + radius * 4;

            arrow_x_center = arrow_x_end - radius * 4;
            arrow_y_center = arrow_y_end + radius * 4;

            rect_x = arrow_x_start + this.font_height;
            rect_y = arrow_y_start - this.font_height * 1.5;

            text_x = rect_x + this.font_height;

            drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI / 4, this.font_height * 0.8, this.font_height * 0.8);
        }

        this.info_canvas.ctx.moveTo(arrow_x_start, arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();

        this.info_canvas.ctx.fillStyle = "#ffffff";
        this.info_canvas.ctx.strokeStyle = "#404040";
        this.info_canvas.ctx.lineWidth = this.font_height * 0.25;

        this.info_canvas.ctx.font = "".concat((this.font_height.toString()*0.8), "px Helvetica");
        if (this.target_num === 2) {
            if (this.cur_press < 1) {
                roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 10, this.font_height * 4.7,
                    20, true, true, true);

                this.info_canvas.ctx.fillStyle = "#404040";
                this.info_canvas.ctx.fillText("To start, press your", text_x, arrow_y_start + this.font_height * 0.2);
                this.info_canvas.ctx.fillText("switch when this clock", text_x, arrow_y_start + this.font_height * 1.5);
                this.info_canvas.ctx.fillText("passes noon", text_x, arrow_y_start + this.font_height * 2.8);


            } else {
                roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 10, this.font_height * 7,
                    20, true, true, true);
                this.info_canvas.ctx.fillStyle = "#404040";
                this.info_canvas.ctx.fillText("Great! You have to press", text_x, arrow_y_start + this.font_height * 0.2);
                this.info_canvas.ctx.fillText("multiple times to select", text_x, arrow_y_start + this.font_height * 1.5);
                this.info_canvas.ctx.fillText("a clock. Keep pressing", text_x, arrow_y_start + this.font_height * 2.8);
                this.info_canvas.ctx.fillText("as the clock passes noon.", text_x, arrow_y_start + this.font_height * 4.1);
            }
        } else {
            var cur_word;
            if (this.target_num === 3) {
                cur_word = "have";
            } else if (this.target_num === 4) {
                cur_word = "want";
            } else if (this.target_num === 5) {
                cur_word = "make";
            } else if (this.target_num === 6) {
                cur_word = "where";
                // if (this.cur_press > 0) {
                //     this.draw_info_4();
                //     this.info_canvas.ctx.fillStyle = "#ffffff";
                //     this.info_canvas.ctx.strokeStyle = "#404040";
                //     this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
                // }
            } else if (this.target_num === 7) {
                cur_word = "Undo";
            }

            if (this.cur_press < 1) {
                roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 10, this.font_height * 4.7,
                    20, true, true, true);
                this.info_canvas.ctx.fillStyle = "#404040";
                this.info_canvas.ctx.fillText("Press when this clock", text_x, arrow_y_start + this.font_height * 0.2);
                this.info_canvas.ctx.fillText("passes noon to select", text_x, arrow_y_start + this.font_height * 1.5);
                this.info_canvas.ctx.fillText("the item \"".concat(cur_word, "\""), text_x, arrow_y_start + this.font_height * 2.8);
            } else {
                roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 10, this.font_height * 7,
                    20, true, true, true);
                this.info_canvas.ctx.fillStyle = "#404040";
                this.info_canvas.ctx.fillText("Keep pressing when", text_x, arrow_y_start + this.font_height * 0.2);
                this.info_canvas.ctx.fillText("this clock passes ", text_x, arrow_y_start + this.font_height * 1.5);
                this.info_canvas.ctx.fillText("noon to select", text_x, arrow_y_start + this.font_height * 2.8);
                this.info_canvas.ctx.fillText("the item \"".concat(cur_word, "\""), text_x, arrow_y_start + this.font_height * 4.1);
}
        }
    }

    on_press(time_in) {
        if (this.allow_input) {
            if (this.target_num === 8 && this.text_num > 3){
                this.end_tutorial();
                return;
            } else if (this.target_num == 1){
                if (this.text_num >= 3){
                    this.update_target();
                }
                return;
            }
            this.cur_presses_remaining -= 1;
            this.cur_press += 1;
            var clock_history = this.bc.clock_inf.clock_history[0];

            this.bc.clock_inf.update_scores(time_in - this.bc.latest_time);
            this.bc.clock_inf.update_history(time_in - this.bc.latest_time);

            this.Normon.jump();

            var time_diff_in = time_in - this.bc.latest_time;

            var last_bc_time = this.bc.clock_inf.clock_util.cur_hours[this.target_clock] * this.bc.clock_inf.time_rotate / this.bc.clock_inf.clock_util.num_divs_time;
            var lag_time = time_diff_in;
            var half_period = this.bc.clock_inf.time_rotate * config.frac_period;

            var rel_click_time = last_bc_time + lag_time - half_period;
            this.rel_click_times.push(rel_click_time);

            this.draw_clock_instruction(this.circle_x, this.circle_y, this.clock.radius);

            if (this.cur_presses_remaining === 0) {
                this.bc.clock_inf.win_history[0] = this.target_clock;
                this.bc.clock_inf.entropy.update_bits();
                this.parent.make_choice(this.target_clock);
            } else {
                this.bc.init_round(false, false, []);
                this.clock_history = [[]];
            }


        }
    }

    update_kde() {
        console.log(this.rel_click_times);
        this.bc.clock_inf.kde = new KernelDensityEstimation(this.parent.time_rotate);
        this.bc.clock_inf.kde.initialize_zero_dens();
        for (var click_index in this.rel_click_times) {
            var yin = this.rel_click_times[click_index];
            this.bc.clock_inf.inc_score_inc(yin);
        }
        this.bc.clock_inf.clock_history = [[]];
    }
}