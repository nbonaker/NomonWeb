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

        this.canvas.style.position = "absolute";
        this.canvas.style.top = "50px";
        this.canvas.style.left = "0px";
        this.ctx = this.canvas.getContext("2d");

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.989;
        this.bottom_height_factor = bottom_height_factor;

        this.canvas.width = this.window_width * this.resolution_factor;
        this.canvas.height = (this.window_height - 50) * (1 - this.bottom_height_factor) * this.resolution_factor;
        this.canvas.style.width = (this.window_width * this.screen_fill_factor).toString().concat("px");
        this.canvas.style.height = ((this.window_height - 50) * (1 - this.bottom_height_factor) * this.screen_fill_factor).toString().concat("px");

        this.screen_width = this.window_width * this.resolution_factor;
        this.screen_height = (this.window_height - 50) * (1 - this.bottom_height_factor) * this.resolution_factor;
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

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.989;
        this.bottom_height_factor = 0.2;

        this.canvas.width = this.window_width * this.resolution_factor;
        this.canvas.height = (this.window_height - 50) * (this.bottom_height_factor) * this.resolution_factor;
        this.canvas.style.width = (this.window_width * this.screen_fill_factor).toString().concat("px");
        this.canvas.style.height = ((this.window_height - 50) * (this.bottom_height_factor) * this.screen_fill_factor).toString().concat("px");

        this.screen_width = this.window_width * this.resolution_factor;
        this.screen_height = (this.window_height - 50) * (this.bottom_height_factor) * this.resolution_factor;
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
        var y_height = this.keygrid_canvas.screen_height / this.target_layout.length * 0.95;
        var y_spacing = this.keygrid_canvas.screen_height / (this.target_layout.length + 1) * 0.05;
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
        for (var row in this.target_layout) {
            var y_start = row * y_spacing + row * y_height + y_spacing;
            var y_end = y_start + y_height;
            this.y_positions.push([y_start, y_end]);
        }
    }

    draw_layout() {
        this.keygrid_canvas.ctx.beginPath();
        if (this.in_pause) {
            this.keygrid_canvas.ctx.fillStyle = "#bfeec2";
        }
        else{
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

                this.keygrid_canvas.ctx.beginPath();
                if (this.in_pause) {
                    this.keygrid_canvas.ctx.fillStyle = "#ecfff0";
                }
                else{
                    this.keygrid_canvas.ctx.fillStyle = "#ffffff";
                }
                this.keygrid_canvas.ctx.strokeStyle = "#000000";
                this.keygrid_canvas.ctx.rect(x_start, y_start, x_end - x_start, y_end - y_start);
                this.keygrid_canvas.ctx.fill();
                this.keygrid_canvas.ctx.stroke();
            }
        }

    }
}

export class ClockGrid{
    constructor(face_canvas, hand_canvas, keygrid, target_layout, key_chars, main_chars, n_pred){
        this.face_canvas = face_canvas;
        this.hand_canvas = hand_canvas;
        this.keygrid = keygrid;
        this.target_layout = target_layout;
        this.key_chars = key_chars;
        this.main_chars = main_chars;
        this.n_pred = n_pred;

        this.clocks = [];
        this.generate_layout();
    }
    generate_layout() {

        var x_start;
        var x_end;
        var y_start;
        var y_end;

        this.clock_radius = (this.keygrid.y_positions[0][1] - this.keygrid.y_positions[0][0]) / 7;

        for (var i in this.main_chars){
            var main_char = this.main_chars[i];
            var main_char_indices = indexOf_2d(this.target_layout, main_char);

            x_start = this.keygrid.x_positions[main_char_indices[0]][main_char_indices[1]][0];
            x_end = this.keygrid.x_positions[main_char_indices[0]][main_char_indices[1]][1];
            y_start = this.keygrid.y_positions[main_char_indices[0]][0];
            y_end = this.keygrid.y_positions[main_char_indices[0]][1];

            this.generate_word_clock_layout(x_start, y_start, x_end, y_end);
            this.generate_main_clock_layout(x_start, y_start, x_end, y_end, main_char);

        }

        if (indexOf_2d(this.target_layout, "BREAKUNIT") !== false){
            var break_chars = [',', '?', '.', '!'];
            break_chars = this.key_chars.filter(value => -1 !== break_chars.indexOf(value));

            var break_unit_indicies = indexOf_2d(this.target_layout, "BREAKUNIT");
            x_start = this.keygrid.x_positions[break_unit_indicies[0]][break_unit_indicies[1]][0];
            x_end = this.keygrid.x_positions[break_unit_indicies[0]][break_unit_indicies[1]][1];
            y_start = this.keygrid.y_positions[break_unit_indicies[0]][0];
            y_end = this.keygrid.y_positions[break_unit_indicies[0]][1];

            for (var break_char_index  in break_chars){
                var break_char = break_chars[break_char_index];

                var break_clock_x = x_start + (x_end - x_start) / 2 * (break_char_index % 2 + 0.25);
                var break_clock_y;
                if (break_char_index < 2){
                    break_clock_y = y_start + (y_end - y_start) / 4;
                }else{
                    break_clock_y = y_start + (y_end - y_start) * 3 / 4;
                }

                let cur_break_clock = new Clock(this.face_canvas, this.hand_canvas,
                                        break_clock_x, break_clock_y, this.clock_radius, break_char);
                this.clocks.push(null);
                this.clocks.push(null);
                this.clocks.push(null);
                this.clocks.push(cur_break_clock);
            }
        }

        if (indexOf_2d(this.target_layout, "SPACEUNIT") !== false){
            var space_chars = ['_', '\''];
            space_chars = this.key_chars.filter(value => -1 !== space_chars.indexOf(value));

            var space_unit_indicies = indexOf_2d(this.target_layout, "SPACEUNIT");
            x_start = this.keygrid.x_positions[space_unit_indicies[0]][space_unit_indicies[1]][0];
            x_end = this.keygrid.x_positions[space_unit_indicies[0]][space_unit_indicies[1]][1];
            y_start = this.keygrid.y_positions[space_unit_indicies[0]][0];
            y_end = this.keygrid.y_positions[space_unit_indicies[0]][1];

            for (var space_char_index  in space_chars){
                var space_char = space_chars[space_char_index];

                var space_clock_x = x_start + this.clock_radius * 1.5;
                var space_clock_y= y_start + (y_end - y_start) / 4 * ((space_char_index % 2)*2 + 1);

                let cur_space_clock = new Clock(this.face_canvas, this.hand_canvas,
                                        space_clock_x, space_clock_y, this.clock_radius, space_char);
                this.clocks.push(null);
                this.clocks.push(null);
                this.clocks.push(null);
                this.clocks.push(cur_space_clock);
            }
        }

        if (indexOf_2d(this.target_layout, "BACKUNIT") !== false){
            var back_chars = ['#', '$'];
            back_chars = this.key_chars.filter(value => -1 !== back_chars.indexOf(value));

            var back_unit_indicies = indexOf_2d(this.target_layout, "BACKUNIT");
            x_start = this.keygrid.x_positions[back_unit_indicies[0]][back_unit_indicies[1]][0];

            for (var back_char_index  in back_chars){
                var back_char = back_chars[back_char_index];

                var back_clock_x = x_start + this.clock_radius * 1.5;
                var back_clock_y= y_start + (y_end - y_start) / 4 * ((back_char_index % 2)*2 + 1);

                if (back_char == '#'){
                    back_char = 'Backspace';
                }else if (back_char == '$'){
                    back_char = 'Clear';
                }
                let cur_back_clock = new Clock(this.face_canvas, this.hand_canvas,
                                        back_clock_x, back_clock_y, this.clock_radius, back_char);
                this.clocks.push(null);
                this.clocks.push(null);
                this.clocks.push(null);
                this.clocks.push(cur_back_clock);

            }
        }

        if (indexOf_2d(this.target_layout, "UNDOUNIT") !== false){
            var undo_char = ['@'];

            var undo_unit_indicies = indexOf_2d(this.target_layout, "UNDOUNIT");
            x_start = this.keygrid.x_positions[undo_unit_indicies[0]][undo_unit_indicies[1]][0];
            x_end = this.keygrid.x_positions[undo_unit_indicies[0]][undo_unit_indicies[1]][1];
            y_start = this.keygrid.y_positions[undo_unit_indicies[0]][0];
            y_end = this.keygrid.y_positions[undo_unit_indicies[0]][1];

            var undo_clock_x = x_start + this.clock_radius * 1.5;
            var undo_clock_y = y_start + (y_end - y_start) / 4;

            let cur_undo_clock = new Clock(this.face_canvas, this.hand_canvas,
                                    undo_clock_x, undo_clock_y, this.clock_radius, "Undo");
            this.clocks.push(null);
            this.clocks.push(null);
            this.clocks.push(null);
            this.clocks.push(cur_undo_clock);

            var undo_label_x = x_start + this.clock_radius * 3;
            var undo_label_y = y_start + (y_end - y_start) * 2 / 3;

            this.undo_label = new Label(this.face_canvas, undo_label_x, undo_label_y, this.clock_radius*2,"");

        }
        var help;

    }
    generate_main_clock_layout(x_start, y_start, x_end, y_end, text){
        var main_clock_x = x_start + this.clock_radius * 1.5;
        var main_clock_y = (y_start + y_end) / 2;

        let cur_main_clock = new Clock(this.face_canvas, this.hand_canvas,
                                        main_clock_x, main_clock_y, this.clock_radius, text);
        this.clocks.push(cur_main_clock);
    }
    generate_word_clock_layout(x_start, y_start, x_end, y_end){
        var word_clock_x = x_start + (x_end-x_start) * 0.4;

        for (var word_clock_index = -1; word_clock_index < this.n_pred-1; word_clock_index++){

             var word_clock_y = (y_start + y_end) / 2 + this.clock_radius * 2.25 * word_clock_index;

             let cur_word_clock = new Clock(this.face_canvas, this.hand_canvas,
                                        word_clock_x, word_clock_y, this.clock_radius, "");
            this.clocks.push(cur_word_clock);
        }
    }
    update_word_clocks(words){
        var clock;
        var clock_index;

        for (clock_index in this.clocks){
            clock = this.clocks[clock_index];

            var key_index = Math.floor(clock_index / (this.n_pred + 1));
            var word_index = clock_index % (this.n_pred + 1);
            if (word_index != 3 && key_index < this.main_chars.length){
                if (words[key_index][word_index] != ""){
                    var word = words[key_index][word_index];
                    clock.text = word;
                    clock.filler = false;
                }
                else{
                    clock.text = "";
                    clock.filler = true;
                    clock.hand_canvas.ctx.clearRect(clock.x_pos - clock.radius, clock.y_pos - clock.radius,
                    clock.radius * 2, clock.radius * 2);
                }

            }
        }

        for (clock_index in this.clocks){
            clock = this.clocks[clock_index];
            if (clock != null) {
                clock.draw_face();
                clock.draw_hand();
            }
        }
        this.undo_label.draw_text();
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

export class Clock{
    constructor(face_canvas, hand_canvas, x_pos, y_pos, radius, text="") {
        this.face_canvas = face_canvas;
        this.hand_canvas = hand_canvas;
        this.x_pos = x_pos;
        this.y_pos = y_pos;
        this.radius = radius;
        this.angle = 0;
        this.text = text;
        this.filler = false;
        this.highlighted=true;
        this.winner = false;
    }
    draw_face(){
        if (!this.filler) {
            this.face_canvas.ctx.beginPath();
            this.face_canvas.ctx.arc(this.x_pos, this.y_pos, this.radius, 0, 2 * Math.PI);
            this.face_canvas.ctx.fillStyle = "#ffffff";
            this.face_canvas.ctx.fill();
            if (this.winner){
                this.face_canvas.ctx.strokeStyle = "#00ff00";
            }
            else if (this.highlighted) {
                this.face_canvas.ctx.strokeStyle = "#0056ff";
            }else{
                this.face_canvas.ctx.strokeStyle = "#000000";
            }
            this.face_canvas.ctx.lineWidth = this.radius / 5;
            this.face_canvas.ctx.stroke();

            this.face_canvas.ctx.fillStyle = "#000000";
            var font_height = this.radius * 1.7;
            this.face_canvas.ctx.font = font_height.toString().concat("px Helvetica");
            this.face_canvas.ctx.fillText(this.text, this.x_pos + this.radius * 1.25, this.y_pos + font_height / 3);
        }
    }
    draw_hand(clear=true) {
        if (!this.filler) {
            if (this.angle > Math.PI * 2) {
                this.angle = this.angle % Math.PI * 2;
            }
            if (clear) {
                this.hand_canvas.ctx.clearRect(this.x_pos - this.radius, this.y_pos - this.radius,
                    this.radius * 2, this.radius * 2);
            }
            this.hand_canvas.ctx.beginPath();
            this.hand_canvas.ctx.lineCap = "round";

            var angle_correction = 0;
            this.hand_canvas.ctx.moveTo(this.x_pos + Math.cos(this.angle - angle_correction) * this.radius * 0.7,
                this.y_pos + Math.sin(this.angle - angle_correction) * this.radius * 0.7);
            this.hand_canvas.ctx.lineTo(this.x_pos - Math.cos(this.angle - angle_correction) * this.radius * 0.1,
                this.y_pos - Math.sin(this.angle - angle_correction) * this.radius * 0.1);

            if (this.winner){
                this.hand_canvas.ctx.strokeStyle = "#00ff00";
            }
            else if (this.highlighted) {
                this.hand_canvas.ctx.strokeStyle = "#0056ff";
            }else{
                this.hand_canvas.ctx.strokeStyle = "#000000";
            }
            this.hand_canvas.ctx.lineWidth = this.radius / 5;
            this.hand_canvas.ctx.stroke();

            this.hand_canvas.ctx.beginPath();
            this.hand_canvas.ctx.moveTo(this.x_pos, this.y_pos);
            this.hand_canvas.ctx.lineTo(this.x_pos, this.y_pos - this.radius * 0.925);
            this.hand_canvas.ctx.strokeStyle = "#ff0000";
            this.hand_canvas.ctx.lineWidth = this.radius / 10;
            this.hand_canvas.ctx.stroke();
        }
    }
}

export class Histogram{
    constructor(output_canvas) {
        this.output_canvas = output_canvas;
        this.text = "";
        this.calculate_size();
        this.num_bins = 80;

        this.generate_normal_values();
        this.update(this.dens_li);
    }
    calculate_size(){
        this.box_x_offset = this.output_canvas.screen_width * 3 / 5;
        this.box_width = this.output_canvas.screen_width * 2 / 5;
        this.box_height = this.output_canvas.screen_height;
    }
    update(dens_li){
        this.dens_li = [];
        for (var i in dens_li){
            this.dens_li.push(dens_li[i]);
        }
        this.renormalize();
        this.draw_box();
        this.draw_histogram();
    }
    draw_box(){
        this.output_canvas.ctx.beginPath();
        this.output_canvas.ctx.fillStyle = "#eeeeee";
        this.output_canvas.ctx.rect(this.box_x_offset, 0, this.box_width, this.box_height);
        this.output_canvas.ctx.fill();

        this.output_canvas.ctx.beginPath();
        this.output_canvas.ctx.fillStyle = "#ffffff";
        this.output_canvas.ctx.strokeStyle = "#000000";
        this.output_canvas.ctx.rect(this.box_x_offset + this.box_height * 0.02, this.box_height * 0.025,
            this.box_width - this.box_height*0.05, this.box_height * 0.95);
        this.output_canvas.ctx.fill();
        this.output_canvas.ctx.stroke();
    }
    generate_normal_values(){
        this.dens_li = [];
        for (var i = 0; i <= this.num_bins; i++) {
            this.dens_li.push(normal(i, 40, 20));
        }
    }
    renormalize() {
        var normalizer = Math.max.apply(Math, this.dens_li);
        for (var i in this.dens_li) {
            this.dens_li[i] = this.dens_li[i] / normalizer;
        }
    }
    draw_histogram(){
        var bin_width = (this.box_width - this.box_height*0.05) / (this.num_bins + 1);
        for (var i = 0; i <= this.num_bins; i++){
            this.output_canvas.ctx.beginPath();
            this.output_canvas.ctx.fillStyle = "#0067ff";
            this.output_canvas.ctx.strokeStyle = "#000000";
            var bin_x_offset = this.box_x_offset + this.box_height * 0.02 + bin_width*i;
            this.output_canvas.ctx.rect(bin_x_offset, this.box_height*0.975,
                bin_width, -this.box_height*0.95*(this.dens_li[i]));
            this.output_canvas.ctx.fill();
            this.output_canvas.ctx.stroke();
        }
    }
}

export class Textbox{
    constructor(output_canvas) {
        this.output_canvas = output_canvas;
        this.text = "";
        this.calculate_size();
        this.draw_box();
        this.draw_text();
    }
    calculate_size(){
        this.box_width = this.output_canvas.screen_width * 3 / 5;
        this.box_height = this.output_canvas.screen_height;
    }
    draw_box(){
        this.output_canvas.ctx.beginPath();
        this.output_canvas.ctx.fillStyle = "#eeeeee";
        this.output_canvas.ctx.rect(0, 0, this.box_width, this.box_height);
        this.output_canvas.ctx.fill();

        this.output_canvas.ctx.beginPath();
        this.output_canvas.ctx.fillStyle = "#ffffff";
        this.output_canvas.ctx.strokeStyle = "#000000";
        this.output_canvas.ctx.rect(this.box_height * 0.025, this.box_height * 0.025,
            this.box_width - this.box_height*0.0375, this.box_height * 0.95);
        this.output_canvas.ctx.fill();
        this.output_canvas.ctx.stroke();
    }
    draw_text(text=null){
        if (text != null){
            this.text = text;
        }

        this.output_canvas.ctx.beginPath();
        this.output_canvas.ctx.fillStyle = "#ffffff";
        this.output_canvas.ctx.strokeStyle = "#000000";
        this.output_canvas.ctx.rect(this.box_height * 0.025, this.box_height * 0.025,
            this.box_width - this.box_height*0.0375, this.box_height * 0.95);
        this.output_canvas.ctx.fill();
        this.output_canvas.ctx.stroke();

        var font_height = 50;
        this.output_canvas.ctx.fillStyle = "#000000";
        this.output_canvas.ctx.font = font_height.toString().concat("px Helvetica");
        this.output_canvas.ctx.fillText(this.text, this.box_height * 0.07, this.box_height * 0.03+font_height);
    }
}

export class InfoScreen {
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
        this.draw_welcome();
        this.draw_speed_info();
        this.draw_text_info();
        this.draw_checkbox_info();
        this.draw_histogram_info();
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
        this.info_canvas.ctx.fillText("Welcome to the", this.width/3.4, this.height * 0.22);
        font_height = this.width/12.5;
        this.info_canvas.ctx.font = "bold ".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Nomon Keyboard!", this.width/6.3, this.height*0.6);

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

        this.info_canvas.ctx.fillStyle = "#000000";
        var font_height = this.width/80;
        this.info_canvas.ctx.font = "".concat(font_height.toString(), "px Helvetica");
        this.info_canvas.ctx.fillText("Click on screen to exit",
            this.width*0.87, this.height*0.99);

    }
    draw_text_info(){
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
        this.info_canvas.ctx.fillText("This slider controls the ", this.width/20, this.height/10);
        this.info_canvas.ctx.fillText("rotation speed of the clocks", this.width/20, this.height/10+font_height);
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

        var arrow_x_start = rect_x - font_height;
        var arrow_y_start = rect_y + font_height*2.2;

        var arrow_x_end = arrow_x_start - font_height*2;
        var arrow_y_end = arrow_y_start - font_height*1.5;

        var arrow_x_center = arrow_x_start - font_height*2;
        var arrow_y_center = arrow_y_start;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.fillStyle = "#404040";
        this.info_canvas.ctx.lineWidth = font_height*0.4;
        this.info_canvas.ctx.moveTo(arrow_x_start,arrow_y_start);
        this.info_canvas.ctx.quadraticCurveTo(arrow_x_center, arrow_y_center, arrow_x_end, arrow_y_end);
        this.info_canvas.ctx.stroke();
        drawArrowhead(this.info_canvas.ctx, arrow_x_end, arrow_y_end, -Math.PI*0.55, font_height*1.5, font_height*1.5);

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



