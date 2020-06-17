import * as kconfig from './kconfig.js';

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

export class KeyboardCanvas{
    constructor(canvas_id, layer_index) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.style.zIndex = layer_index;

        this.calculate_size();
    }
    calculate_size(bottom_height_factor=0.2){
        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;

        this.topbar_height = document.getElementById('top_bar_top').getBoundingClientRect().height +
            document.getElementById('top_bar_bottom').getBoundingClientRect().height + 10;

        this.canvas.style.position = "absolute";
        this.canvas.style.top = this.topbar_height.toString().concat("px");
        this.canvas.style.left = "0px";
        this.ctx = this.canvas.getContext("2d");

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.98;
        this.bottom_height_factor = bottom_height_factor;

        this.canvas.width = (this.window_width) * this.resolution_factor;
        this.canvas.height = (this.window_height - this.topbar_height) * (1 - this.bottom_height_factor) * this.resolution_factor;
        this.canvas.style.width = (this.window_width * this.screen_fill_factor).toString().concat("px");
        this.canvas.style.height = ((this.window_height - this.topbar_height) * (1 - this.bottom_height_factor) * this.screen_fill_factor).toString().concat("px");

        this.screen_width = this.window_width * this.resolution_factor;
        this.screen_height = (this.window_height - this.topbar_height) * (1 - this.bottom_height_factor) * this.resolution_factor;
    }
    clear(){
        this.ctx.clearRect(0, 0, this.screen_width, this.screen_height);
    }
}

export class OutputCanvas{
    constructor(canvas_id, y_offset) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.style.position = "absolute";
        this.canvas.style.left = "0px";
        this.ctx = this.canvas.getContext("2d");
        this.calculate_size(y_offset);
    }
    calculate_size(y_offset){
        this.canvas.style.top = y_offset.toString().concat("px");
        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;

        this.topbar_height = document.getElementById('top_bar_top').getBoundingClientRect().height +
            document.getElementById('top_bar_bottom').getBoundingClientRect().height + 10;

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.98;
        this.bottom_height_factor = 0.2;

        this.canvas.width = this.window_width * this.resolution_factor;
        this.canvas.height = (this.window_height - this.topbar_height) * (this.bottom_height_factor) * this.resolution_factor;
        this.canvas.style.width = (this.window_width * this.screen_fill_factor).toString().concat("px");
        this.canvas.style.height = ((this.window_height - this.topbar_height) * (this.bottom_height_factor) * this.screen_fill_factor).toString().concat("px");

        this.screen_width = this.window_width * this.resolution_factor;
        this.screen_height = (this.window_height - this.topbar_height) * (this.bottom_height_factor) * this.resolution_factor;
    }
}

export class KeyGrid {
    constructor(keygrid_canvas, target_layout) {
        this.keygrid_canvas = keygrid_canvas;
        this.target_layout = target_layout;

        this.in_pause = false;
        this.generate_layout();
        this.draw_layout();
    }

    generate_layout() {
        var word_y_offset = this.keygrid_canvas.screen_height / (this.target_layout.length + 1) * 0.1;

        var y_height = (this.keygrid_canvas.screen_height - word_y_offset) / this.target_layout.length * 0.95;
        var y_spacing = (this.keygrid_canvas.screen_height - word_y_offset) / (this.target_layout.length + 1) * 0.05;
        var x_width;
        var x_spacing;

        this.x_positions = [];
        for (var row in this.target_layout) {
            var row_x_positions = [];

            var layout_row = this.target_layout[row];
            x_width = (this.keygrid_canvas.screen_width - y_spacing * (layout_row.length + 1)) / layout_row.length;

            for (var col in layout_row) {
                var x_start = col * y_spacing + col * x_width + y_spacing;
                var x_end = x_start + x_width;
                row_x_positions.push([x_start, x_end]);
            }
            this.x_positions.push(row_x_positions);
        }

        this.y_positions = [];
        var y_start ;
        var y_end;
        for (row in this.target_layout) {
            if (row < 1){
                y_start = row * y_spacing + row * y_height + y_spacing;
                y_end = y_start + y_height;
                this.y_positions.push([y_start, y_end]);
            } else {
                y_start = row * y_spacing + row * y_height + y_spacing + word_y_offset;
                y_end = y_start + y_height;
                this.y_positions.push([y_start, y_end]);
            }
        }
    }

    draw_layout(row_highlight=-1, col_highlight=-1) {
        this.keygrid_canvas.ctx.beginPath();
        if (this.in_pause) {
            this.keygrid_canvas.ctx.fillStyle = "#bfeec2";
        } else {
            this.keygrid_canvas.ctx.fillStyle = "#eeeeee";
        }
        this.keygrid_canvas.ctx.rect(0, 0, this.keygrid_canvas.screen_width, this.keygrid_canvas.screen_height);
        this.keygrid_canvas.ctx.fill();

        for (var row in this.x_positions) {
            var y_start = this.y_positions[row][0];
            var y_end = this.y_positions[row][1];

            for (var col in this.x_positions[row]) {
                var x_start = this.x_positions[row][col][0];
                var x_end = this.x_positions[row][col][1];

                var cell_text = this.target_layout[row][col];

                this.keygrid_canvas.ctx.beginPath();

                if (col_highlight === parseInt(col) && row_highlight === parseInt(row)){
                    if (cell_text !== "") {
                        this.keygrid_canvas.ctx.fillStyle = "rgb(113,160,255)";
                    } else {
                        this.keygrid_canvas.ctx.fillStyle = "#eeeeee";
                    }
                } else if (row_highlight === parseInt(row)){
                    if (cell_text !== "") {
                        this.keygrid_canvas.ctx.fillStyle = "rgb(197,219,255)";
                    } else {
                        this.keygrid_canvas.ctx.fillStyle = "#eeeeee";
                    }
                } else {
                    if (cell_text !== "") {
                        this.keygrid_canvas.ctx.fillStyle = "#ffffff";
                    } else {
                        this.keygrid_canvas.ctx.fillStyle = "#eeeeee";
                    }
                }
                this.keygrid_canvas.ctx.strokeStyle = "#000000";
                this.keygrid_canvas.ctx.rect(x_start, y_start, x_end - x_start, y_end - y_start);
                this.keygrid_canvas.ctx.fill();
                this.keygrid_canvas.ctx.stroke();

                cell_text = cell_text.replace(kconfig.mybad_char, "Undo");
                cell_text = cell_text.replace(kconfig.back_char, "Backspace");
                cell_text = cell_text.replace(kconfig.clear_char, "Clear");

                this.keygrid_canvas.ctx.fillStyle = "#000000";
                var cell_height = y_end - y_start;
                var font_height = cell_height * 0.5;
                this.keygrid_canvas.ctx.font = font_height.toString().concat("px Helvetica");
                var font_width = this.keygrid_canvas.ctx.measureText(cell_text).width;
                if (font_width > (x_end - x_start)*0.9){
                    var font_shrink_factor = (x_end - x_start)*0.9/font_width;
                    font_width = font_width * font_shrink_factor;
                    this.keygrid_canvas.ctx.font = (font_height * font_shrink_factor).toString().concat("px Helvetica");
                }
                this.keygrid_canvas.ctx.fillText(cell_text, (x_end + x_start - font_width) / 2,
                    y_end - font_height * 2 / 3);
            }
        }
    }
    update_words(word_list, row_highlight=-1, col_highlight=-1) {

        var y_start = this.y_positions[0][0];
        var y_end = this.y_positions[0][1];

        for (var col in this.x_positions[0]) {
            var x_start = this.x_positions[0][col][0];
            var x_end = this.x_positions[0][col][1];

            var cell_text = word_list[col];

            this.keygrid_canvas.ctx.beginPath();
            if (col_highlight === parseInt(col) && row_highlight === 0){
                if (cell_text !== "") {
                    this.keygrid_canvas.ctx.fillStyle = "rgb(113,160,255)";
                } else {
                    this.keygrid_canvas.ctx.fillStyle = "#eeeeee";
                }
            } else if (row_highlight === 0){
                if (cell_text !== "") {
                    this.keygrid_canvas.ctx.fillStyle = "rgb(197,219,255)";
                } else {
                    this.keygrid_canvas.ctx.fillStyle = "#eeeeee";
                }
            } else {
                if (cell_text !== "") {
                    this.keygrid_canvas.ctx.fillStyle = "#ffffff";
                } else {
                    this.keygrid_canvas.ctx.fillStyle = "#eeeeee";
                }
            }
            this.keygrid_canvas.ctx.strokeStyle = "#000000";
            this.keygrid_canvas.ctx.rect(x_start, y_start, x_end - x_start, y_end - y_start);
            this.keygrid_canvas.ctx.fill();
            this.keygrid_canvas.ctx.stroke();

            this.keygrid_canvas.ctx.fillStyle = "#000000";
            var cell_height = y_end - y_start;
            var font_height = cell_height * 0.5;
            this.keygrid_canvas.ctx.font = font_height.toString().concat("px Helvetica");
            var font_width = this.keygrid_canvas.ctx.measureText(cell_text).width;
            if (font_width > (x_end - x_start)*0.9){
                var font_shrink_factor = (x_end - x_start)*0.9/font_width;
                font_width = font_width * font_shrink_factor;
                this.keygrid_canvas.ctx.font = (font_height * font_shrink_factor).toString().concat("px Helvetica");
            }

            this.keygrid_canvas.ctx.fillText(cell_text, (x_end + x_start - font_width) / 2,
                y_end - font_height * 2 / 3);
        }
    }
}


export class Label {
    constructor(face_canvas, x_pos, y_pos, height, text = "") {
        this.face_canvas = face_canvas;
        this.x_pos = x_pos;
        this.y_pos = y_pos;
        this.height = height;
        this.text = text;
    }

    draw_text() {
        this.face_canvas.ctx.clearRect(this.x_pos, this.y_pos+this.height, this.height*10, -this.height*2);
        this.face_canvas.ctx.fillStyle = "#000000";
        var font_height = this.height;
        this.face_canvas.ctx.font = font_height.toString().concat("px Helvetica");
        this.face_canvas.ctx.fillText(this.text, this.x_pos, this.y_pos + font_height / 3);
    }
}

export class Textbox{
    constructor(output_canvas) {
        this.output_canvas = output_canvas;
        this.text = "";
        this.cursor_on = false;
        setInterval(this.toggle_cursor.bind(this), 530);

        this.box = document.getElementById("output_textbox");
        this.box.style.position = 'absolute';  // position it
        this.box.style.left = '5px';

        this.calculate_size();
        this.draw_text("");


    }
    toggle_cursor(){
        this.cursor_on = this.cursor_on == false;
        if (this.cursor_on) {
            this.box.value = this.text.concat("|");
        }else{
            this.box.value = this.text;
        }
    }
    calculate_size(){
        this.box.style['top'] = this.output_canvas.canvas.style.top;
        this.box.style['width'] = (this.output_canvas.screen_width*0.97/2).toString().concat("px");
        this.box.style['height'] = (this.output_canvas.screen_height*0.9/2).toString().concat("px");

    }
    draw_text(text){
        this.text = text;
        this.box.value = text;
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
        this.info_canvas.ctx.fillText("into Nomon. You can activate the switch by moving",
            rect_x + font_height, rect_y + font_height*2.5);
        this.info_canvas.ctx.fillText("your body to the right.",
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

export function indexOf_2d(array, item){
    for (var row_index in array){
        var row = array[row_index]
        if (row.includes(item)){
            var col_index = array[row_index].indexOf(item);
            return [parseInt(row_index), col_index];
        }
    }
    return false;
}

export function normal(x, mu, sigma_sq){
    return 1 / Math.sqrt(2 * Math.PI * sigma_sq) * Math.E ** ( (-1 / 2)* ((x - mu)) ** 2 / sigma_sq);
}



