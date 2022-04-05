import * as widgets from "./widgets.js";
import * as normon from "../normon/normontheclock.js";


function roundRect(ctx, shadow_ctx, x, y, width, height, radius, fill, stroke) {
    box_shaddow(shadow_ctx, x, y, width, height);

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


function box_shaddow(ctx, x, y, width, height) {
    var res = 25;
    var feather=100;
    ctx.beginPath();
    // ctx.clearRect(x-feather, y-feather, width+2*feather, height+2*feather);
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


export class sessionGreeting {
    constructor(parent, bc) {

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
        this.target_num = 1;
        this.clock;
        this.Normon;
        this.normon_pause_length = 1.5;
        this.text_num = 0;
        this.allow_input = false;
        this.forward_input = false;
        this.failed = false;

        this.start_tutorial();
    }

    initialize_normon() {
        this.normon_canvas = new normon.NormonCanvas("normon_canvas", 5);

        var normon_x = -this.normon_canvas.screen_width / 5;
        var normon_y = this.normon_canvas.screen_height / 4;
        var normon_r = this.normon_canvas.screen_height / 15;

        this.Normon = new normon.Normon(this.normon_canvas, normon_x, normon_y, normon_r, this);

        this.normon_interval = setInterval(this.Normon.animate.bind(this.Normon), 20);
    }

    start_tutorial() {
        this.info_canvas = new widgets.KeyboardCanvas("info", 5);
        this.info_canvas.calculate_size(0);
        this.shadow_canvas = new widgets.KeyboardCanvas("shadow", 4);
        this.shadow_canvas.calculate_size(0);

        this.width = this.info_canvas.screen_width;
        this.height = this.info_canvas.screen_height;

        this.parent.info_canvas = this.info_canvas;
        this.parent.shadow_canvas = this.shadow_canvas;
        this.initialize_normon();

        this.x_pos = 0;
        this.y_pos = 0;

        this.progress_screens();
    }

    progress_screens() {
        this.width = this.info_canvas.screen_width;
        this.height = this.info_canvas.screen_height;

        this.font_height = Math.min(this.width/55, this.height/30);

        this.info_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.shadow_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.allow_input = false;
        if (this.target_num === 1) {
            this.draw_welcome();
        } else {
            this.end_tutorial();
        }
    }

    draw_welcome() {
        this.shadow_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.allow_input = false;
        var rect_x;
        var rect_y;
        var normon_x;
        var normon_y;
        ;

        if (this.text_num >= 0) {

            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1;

            normon_x = rect_x - this.Normon.radius * 2;
            normon_y = rect_y + this.font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 5.4,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";

            if (this.parent.study_manager.phase === "intro") {
                this.info_canvas.ctx.font = "".concat((this.font_height*3).toString(), "px Helvetica");
                this.info_canvas.ctx.fillText("Welcome to Nomon!",
                    rect_x + this.font_height, rect_y + this.font_height * 3.9);

            } else if (this.parent.study_manager.phase === "practice"){
                this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
                this.info_canvas.ctx.fillText("Welcome Back! You've chosen to practice Nomon. If you chose ",
                    rect_x + this.font_height, rect_y + this.font_height * 1.3);
                this.info_canvas.ctx.fillText("this by mistake, you can select the \"Options\" clock and then ",
                    rect_x + this.font_height, rect_y + this.font_height * 2.7);
                this.info_canvas.ctx.fillText("\"End Session\" to change to RCS.",
                    rect_x + this.font_height, rect_y + this.font_height * 4.1);

            } else if (this.parent.study_manager.phase === "symbol"){
                this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
                this.info_canvas.ctx.fillText("Welcome Back!",
                    rect_x + this.font_height, rect_y + this.font_height * 1.3);
                this.info_canvas.ctx.fillText("You're about to start an evaluation session with the Nomon interface.",
                    rect_x + this.font_height, rect_y + this.font_height * 2.7);
                this.info_canvas.ctx.fillText("Press your switch when you're ready to start! ",
                    rect_x + this.font_height, rect_y + this.font_height * 4.1);

            } else if (this.parent.study_manager.phase === "text"){
                this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
                this.info_canvas.ctx.fillText("Welcome Back!",
                    rect_x + this.font_height, rect_y + this.font_height * 1.3);
                this.info_canvas.ctx.fillText("You're about to start an evaluation session with the Nomon interface.",
                    rect_x + this.font_height, rect_y + this.font_height * 2.7);
                this.info_canvas.ctx.fillText("Press your switch when you're ready to start! ",
                    rect_x + this.font_height, rect_y + this.font_height * 4.1);
            }

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }

        if (this.text_num >= 2) {

            rect_x = this.width * 0.22;
            rect_y = this.height * 0.1 + this.font_height * 7;

            normon_x = rect_x - this.Normon.radius * 2;
            normon_y = rect_y + this.font_height * 2.5 + this.Normon.radius;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 7,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("If you need a refresher on how to use Nomon, or you notice",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("that your histogram looks too red and it's hard use Nomon,",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("select the \"Options\" clock and then \"Help\".",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("Press your switch to exit...",
                rect_x + this.font_height, rect_y + this.font_height * 6);

            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = false;
            this.allow_input = true;
        }

        this.Normon.update_radius(this.height / 15);
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
        this.parent.begin_session();
    }

    on_press(time_in) {

        if (this.allow_input) {
            this.Normon.jump();
            this.target_num += 1;
            this.text_num = 0;
            this.progress_screens();
        }
    }
}