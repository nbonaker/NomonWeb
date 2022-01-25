import * as widgets from "./widgets.js";
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


export class tutorialManager {
    constructor(parent) {

        this.parent = parent;
        this.parent.in_info_screen = false;

        this.Normon;
        this.normon_pause_length = 1.5;
        this.text_num = 0;
        this.allow_input = false;
        this.target_num = 1;

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
        this.shadow_canvas = new widgets.KeyboardCanvas("shadow", 4);
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
        this.shadow_canvas.ctx.clearRect(0, 0, this.width, this.height);

        this.font_height = Math.min(this.width/55, this.height/25);

        this.allow_input = false;
        if (this.target_num === 1) {
            this.draw_welcome();
        } else if (this.target_num === 2) {
            this.draw_info_1();
        } else if (this.target_num === 3) {
            this.draw_info_2();

        } else {
            this.end_tutorial();
        }
    }

    draw_welcome() {
        this.allow_input = false;
        var normon_x;
        var normon_y;

        if (this.text_num >= 0) {

            normon_x = this.width / 6;
            normon_y = this.info_canvas.topbar_height * 2 + this.height / 4;

            var rect_x = this.width * 0.15;
            var rect_y = this.height * 0.22-this.font_height*2.5;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height*2.5 * 0.1;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.width * 0.7, this.font_height*2.5  * 2,
                20, true, true);

            this.info_canvas.ctx.globalCompositeOperation = 'source-over';
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "bold ".concat((this.font_height*2.5).toString(), "px Helvetica");

            this.info_canvas.ctx.fillText("Welcome Back!", this.width / 4.6, this.height * 0.22);
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 1) {
            normon_x = this.width / 6;
            normon_y = this.info_canvas.topbar_height * 2 + this.height / 4;
            
            this.info_canvas.ctx.globalCompositeOperation = 'source-over';
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "bold ".concat(this.font_height.toString(), "px Helvetica");

            this.info_canvas.ctx.fillText("I'm going to show you our Row Column Scanning interface this time...", this.width / 4.6, this.height * 0.22 + this.font_height*2);
            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 2) {
            
            var rect_x = this.width * 0.22;
            var rect_y = this.height * 0.4;

            normon_x = rect_x - this.Normon.radius * 2;
            normon_y = rect_y + this.font_height * 2.5;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 7,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Here's how you select an item:",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("(1) Locate the box containing the item you want to type.",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("(2) Wait until the row containing the box is highlighted, then press.",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.info_canvas.ctx.fillText("(3) The columns will then scan. Press when the box is highlighted.",
                rect_x + this.font_height, rect_y + this.font_height * 5.5);
            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
        }
        if (this.text_num >= 3) {

            var rect_x = this.width * 0.22;
            var rect_y = this.height * 0.75;

            normon_x = rect_x - this.Normon.radius * 2;
            normon_y = rect_y + this.font_height * 2.5;

            this.info_canvas.ctx.fillStyle = "#ffffff";
            this.info_canvas.ctx.strokeStyle = "#404040";
            this.info_canvas.ctx.lineWidth = this.font_height * 0.3;
            roundRect(this.info_canvas.ctx, this.shadow_canvas.ctx, rect_x, rect_y, this.font_height * 31, this.font_height * 5,
                20, true, true);
            this.info_canvas.ctx.fillStyle = "#404040";
            this.info_canvas.ctx.font = "".concat(this.font_height.toString(), "px Helvetica");
            this.info_canvas.ctx.fillText("Everything else works the same as the Nomon interface.",
                rect_x + this.font_height, rect_y + this.font_height * 1.3);
            this.info_canvas.ctx.fillText("I'll start your practice session shortly.",
                rect_x + this.font_height, rect_y + this.font_height * 2.7);
            this.info_canvas.ctx.fillText("(Press to Continue)",
                rect_x + this.font_height, rect_y + this.font_height * 4.1);
            this.Normon.pause = this.normon_pause_length;
            this.Normon.run_on_return = true;
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
        this.info_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.Normon = null;
        clearInterval(this.normon_interval);

        console.log("END");
        this.parent.end_tutorial(this.failed);
    }

    on_press(time_in) {
        if (this.text_num > 3) {

            this.Normon.jump();
            this.end_tutorial();

        }
    }
}