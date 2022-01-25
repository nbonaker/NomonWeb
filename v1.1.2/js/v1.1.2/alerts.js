import * as rcom from "./rowcol_options_manager.js";

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


class alertButton{
    constructor(ctx, value, select_fun, x, y, width, height){
        this.ctx = ctx;
        this.value = value;
        this.select = select_fun;
        this.className = "btn unhighlighted";
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.draw_ui();
    }
    draw_ui(x, y, width, height) {
        if (this.className === "btn unhighlighted") {
            this.ctx.fillStyle = "#adcaff";
        } else if (this.className === "btn highlighted"){
            this.ctx.fillStyle = "#005eff";
        } else if (this.className === "btn darkhighlighted"){
            this.ctx.fillStyle = "#6700FF";
        }

        roundRect(this.ctx, this.x, this.y, this.width, this.height,
            20, true, false);

        var font_height = this.height*0.4;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.ctx.fillText(this.value, this.x + font_height*0.5, this.y + font_height*1.5);
    }
    darkhighlight() {
        this.className = "btn darkhighlighted";
        this.draw_ui();
    }

    highlight() {
        this.className = "btn highlighted";
        this.draw_ui();
    }

    unhighlight() {
        this.className = "btn unhighlighted";
        this.draw_ui();
    }

}


export class alertConfirmation {
    constructor(canvas, text, options, type, response_function) {
        this.canvas = canvas;
        this.ctx = canvas.ctx;
        this.text = text;
        this.type=type;
        this.options = options;
        this.response_function = response_function;
        this.init_ui();

    }

    init_ui(){
        this.width = this.canvas.screen_width;
        this.height = this.canvas.screen_height;

        var rect_x = this.width * 0.25;
        var rect_y = this.height * 0.1;
        var rect_width = this.width*.5;
        var rect_height = Math.min(this.height*.8, this.width*.5);

        var font_height = rect_height*.4;

        this.ctx.fillStyle = "#ffffff";
        this.ctx.strokeStyle = "#404040";
        this.ctx.lineWidth = font_height * 0.1;
        roundRect(this.ctx, rect_x, rect_y, rect_width, rect_height,
            20, true, true);

        if (this.type === "warning"){
            this.ctx.fillStyle = "#c7c7c7";
            this.ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.ctx.fillText("\u{26A0}", rect_x + rect_width / 2 - font_height * 0.4, rect_y + font_height * 1);
        } else if (this.type === "info"){
            this.ctx.fillStyle = "#c7c7c7";
            this.ctx.font = "".concat(font_height.toString(), "px Helvetica");
            this.ctx.fillText("\u{24D8}", rect_x + rect_width / 2 - font_height * 0.4, rect_y + font_height * 1);
        }

        var font_height = this.width/40;
        this.ctx.fillStyle = "#404040";
        this.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.ctx.fillText(this.text ,rect_x + font_height*0.5, rect_y + rect_height*0.5);

        this.options_array = [[]];
        for (var i in this.options) {
            var button_w = rect_width*(1-0.05*(this.options.length+1))/this.options.length;
            var button_x = rect_x*1.1 + (button_w+rect_x*0.1)*i;
            let value = this.options[i];

            let on_click = function () {
                this.on_response(value);
            }.bind(this);

            this.options_array[0].push(new alertButton(this.ctx, value, on_click,
                button_x, rect_y + rect_height * 0.7, button_w, rect_height * 0.2));
        }

    }
    on_response(value){
        this.response_function(value);
    }
}