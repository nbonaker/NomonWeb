import * as kconfig from './kconfig.js';


function red_green_color_map(percent) {
    percent = percent ** 0.5;
    var color = "#";
    var red;
    var green;
    if (percent > 0.5) {
        red = "ff";
        green = Math.round((1 - percent) * 2 * 255).toString(16);
    } else {
        green = "ff";
        red = Math.round((percent) * 2 * 255).toString(16);
    }
    if (red.length === 1) {
        red = "0".concat(red);
    }
    if (green.length === 1) {
        green = "0".concat(green);
    }
    return color.concat(red, green, "00");
}


export class KeyboardCanvas {
    constructor(canvas_id, layer_index) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.style.zIndex = layer_index;

        this.calculate_size();
    }

    calculate_size(bottom_height_factor = 0.2) {
        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;

        this.topbar_height = document.getElementById('top_bar_top').getBoundingClientRect().height +
            document.getElementById('top_bar_bottom').getBoundingClientRect().height + 10;

        this.footer_height = document.getElementById('footer_version').getBoundingClientRect().height*2;

        this.canvas.style.position = "absolute";
        this.canvas.style.top = this.topbar_height.toString().concat("px");
        this.canvas.style.left = "0px";
        this.ctx = this.canvas.getContext("2d");

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.989;
        this.bottom_height_factor = bottom_height_factor;

        this.canvas.width = this.window_width * this.resolution_factor;
        this.canvas.height = (this.window_height - this.topbar_height - this.footer_height) * (1 - this.bottom_height_factor) * this.resolution_factor;
        this.canvas.style.width = (this.window_width * this.screen_fill_factor).toString().concat("px");
        this.canvas.style.height = ((this.window_height - this.topbar_height - this.footer_height) * (1 - this.bottom_height_factor) * this.screen_fill_factor).toString().concat("px");

        this.screen_width = this.window_width * this.resolution_factor;
        this.screen_height = (this.window_height - this.topbar_height - this.footer_height) * (1 - this.bottom_height_factor) * this.resolution_factor;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.screen_width, this.screen_height);
    }

    grey() {
        this.ctx.beginPath();
        this.ctx.fillStyle = "rgba(232,232,232,0.76)";
        this.ctx.rect(0, 0, this.screen_width, this.screen_height);
        this.ctx.fill();
    }

    radial_highlight(x, y) {
        var res = 20;

        for (var i = 0; i < res; i += 1) {
            this.ctx.beginPath();
            this.ctx.lineWidth = this.screen_height / res;
            this.ctx.strokeStyle = `rgba(20,200,20,${(1 - i / res) * 0.8})`;
            this.ctx.arc(x, y, this.screen_height * i / res, 0, 2 * Math.PI);
            this.ctx.stroke();
        }

    }

}

export class OutputCanvas {
    constructor(canvas_id, y_offset) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.style.position = "absolute";
        this.canvas.style.left = "0px";
        this.ctx = this.canvas.getContext("2d");
        this.calculate_size(y_offset);
    }

    calculate_size(y_offset) {
        this.canvas.style.top = y_offset.toString().concat("px");
        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;

        this.topbar_height = document.getElementById('top_bar_top').getBoundingClientRect().height +
            document.getElementById('top_bar_bottom').getBoundingClientRect().height + 10;
        this.footer_height = document.getElementById('footer_version').getBoundingClientRect().height*2;

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.98;
        this.bottom_height_factor = 0.2;

        this.canvas.width = this.window_width * this.resolution_factor;
        this.canvas.height = (this.window_height - this.topbar_height - this.footer_height ) * (this.bottom_height_factor) * this.resolution_factor;
        this.canvas.style.width = (this.window_width * this.screen_fill_factor).toString().concat("px");
        this.canvas.style.height = ((this.window_height - this.topbar_height - this.footer_height ) * (this.bottom_height_factor) * this.screen_fill_factor).toString().concat("px");

        this.screen_width = this.window_width * this.resolution_factor;
        this.screen_height = (this.window_height - this.topbar_height  - this.footer_height ) * (this.bottom_height_factor) * this.resolution_factor;
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
        } else {
            this.keygrid_canvas.ctx.fillStyle = "#d1d1d1";
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
                } else {
                    this.keygrid_canvas.ctx.fillStyle = "#ffffff";
                }
                this.keygrid_canvas.ctx.strokeStyle = "#000000";
                this.keygrid_canvas.ctx.rect(x_start, y_start, x_end - x_start, y_end - y_start);
                this.keygrid_canvas.ctx.fill();
                this.keygrid_canvas.ctx.stroke();
            }
        }

    }

    highlight_square(row, col) {
        var y_start = this.y_positions[row][0];
        var y_end = this.y_positions[row][1];

        var x_start = this.x_positions[row][col][0];
        var x_end = this.x_positions[row][col][1];

        this.keygrid_canvas.ctx.beginPath();
        this.keygrid_canvas.ctx.fillStyle = "#ee6dab";
        this.keygrid_canvas.ctx.strokeStyle = "#000000";
        this.keygrid_canvas.ctx.rect(x_start, y_start, x_end - x_start, y_end - y_start);
        this.keygrid_canvas.ctx.fill();
        this.keygrid_canvas.ctx.stroke();
    }
}

export class ClockGrid {
    constructor(parent, face_canvas, hand_canvas, keygrid, target_layout, key_chars, main_chars, n_pred) {
        this.parent = parent;
        this.face_canvas = face_canvas;
        this.hand_canvas = hand_canvas;
        this.keygrid = keygrid;
        this.target_layout = target_layout;
        this.key_chars = key_chars;
        this.main_chars = main_chars;
        this.n_pred = n_pred;

        this.clocks = [];
        this.generate_layout();
        console.log(this.clocks);
    }

    generate_layout() {

        var x_start;
        var x_end;
        var y_start;
        var y_end;

        if (this.parent.emoji_keyboard) {
            this.clock_radius = Math.min((this.keygrid.y_positions[0][1] - this.keygrid.y_positions[0][0]) / 3.5,
                (this.keygrid.x_positions[0][1][1] - this.keygrid.x_positions[0][1][0]) / 6.0);
        } else {
            this.clock_radius = (this.keygrid.y_positions[0][1] - this.keygrid.y_positions[0][0]) / 7;
        }

        for (var i in this.main_chars) {
            var main_char = this.main_chars[i];
            var main_char_indices = indexOf_2d(this.target_layout, main_char);

            x_start = this.keygrid.x_positions[main_char_indices[0]][main_char_indices[1]][0];
            x_end = this.keygrid.x_positions[main_char_indices[0]][main_char_indices[1]][1];
            y_start = this.keygrid.y_positions[main_char_indices[0]][0];
            y_end = this.keygrid.y_positions[main_char_indices[0]][1];
            if (main_char == '$') {
                main_char = 'Clear';
            }

            this.generate_word_clock_layout(x_start, y_start, x_end, y_end);
            this.generate_main_clock_layout(x_start, y_start, x_end, y_end, main_char);

        }

        if (indexOf_2d(this.target_layout, "OPTUNIT") !== false) {
            var back_chars = ['.', "%"];
            back_chars = this.key_chars.filter(value => -1 !== back_chars.indexOf(value));

            var back_unit_indicies = indexOf_2d(this.target_layout, "OPTUNIT");
            x_start = this.keygrid.x_positions[back_unit_indicies[0]][back_unit_indicies[1]][0];

            for (var back_char_index  in back_chars) {
                var back_char = back_chars[back_char_index];

                var back_clock_x = x_start + this.clock_radius * 1.5;
                var back_clock_y = y_start + (y_end - y_start) / 4 * ((back_char_index % 2) * 2 + 1);

                if (back_char == '%') {
                    back_char = 'Options';
                }

                let cur_back_clock = new Clock(this.face_canvas, this.hand_canvas,
                    back_clock_x, back_clock_y, this.clock_radius, back_char);
                for (var i = 0; i < this.parent.n_pred; i++) {
                    this.clocks.push(null);
                }
                this.clocks.push(cur_back_clock);

            }
        }

        // if (indexOf_2d(this.target_layout, "BREAKUNIT") !== false){
        //     var break_chars = [',', '?', '.', '!'];
        //     break_chars = this.key_chars.filter(value => -1 !== break_chars.indexOf(value));
        //
        //     var break_unit_indicies = indexOf_2d(this.target_layout, "BREAKUNIT");
        //     x_start = this.keygrid.x_positions[break_unit_indicies[0]][break_unit_indicies[1]][0];
        //     x_end = this.keygrid.x_positions[break_unit_indicies[0]][break_unit_indicies[1]][1];
        //     y_start = this.keygrid.y_positions[break_unit_indicies[0]][0];
        //     y_end = this.keygrid.y_positions[break_unit_indicies[0]][1];
        //
        //     for (var break_char_index  in break_chars){
        //         var break_char = break_chars[break_char_index];
        //
        //         var break_clock_x = x_start + (x_end - x_start) / 2 * (break_char_index % 2 + 0.25);
        //         var break_clock_y;
        //         if (break_char_index < 2){
        //             break_clock_y = y_start + (y_end - y_start) / 4;
        //         }else{
        //             break_clock_y = y_start + (y_end - y_start) * 3 / 4;
        //         }
        //
        //         let cur_break_clock = new Clock(this.face_canvas, this.hand_canvas,
        //                                 break_clock_x, break_clock_y, this.clock_radius, break_char);
        //         for (var i=0; i<this.parent.n_pred; i++) {
        //             this.clocks.push(null);
        //         }
        //         this.clocks.push(cur_break_clock);
        //     }
        // }

        // if (indexOf_2d(this.target_layout, "SPACEUNIT") !== false){
        //     var space_chars = ['_', '\''];
        //     space_chars = this.key_chars.filter(value => -1 !== space_chars.indexOf(value));
        //
        //     var space_unit_indicies = indexOf_2d(this.target_layout, "SPACEUNIT");
        //     x_start = this.keygrid.x_positions[space_unit_indicies[0]][space_unit_indicies[1]][0];
        //     x_end = this.keygrid.x_positions[space_unit_indicies[0]][space_unit_indicies[1]][1];
        //     y_start = this.keygrid.y_positions[space_unit_indicies[0]][0];
        //     y_end = this.keygrid.y_positions[space_unit_indicies[0]][1];
        //
        //     for (var space_char_index  in space_chars){
        //         var space_char = space_chars[space_char_index];
        //
        //         var space_clock_x = x_start + this.clock_radius * 1.5;
        //         var space_clock_y= y_start + (y_end - y_start) / 4 * ((space_char_index % 2)*2 + 1);
        //
        //         let cur_space_clock = new Clock(this.face_canvas, this.hand_canvas,
        //                                 space_clock_x, space_clock_y, this.clock_radius, space_char);
        //         this.clocks.push(null);
        //         this.clocks.push(null);
        //         this.clocks.push(null);
        //         this.clocks.push(cur_space_clock);
        //     }
        // }

        if (indexOf_2d(this.target_layout, "BACKUNIT") !== false) {
            var back_chars = ['#', '$'];
            back_chars = this.key_chars.filter(value => -1 !== back_chars.indexOf(value));

            var back_unit_indicies = indexOf_2d(this.target_layout, "BACKUNIT");
            x_start = this.keygrid.x_positions[back_unit_indicies[0]][back_unit_indicies[1]][0];

            for (var back_char_index  in back_chars) {
                var back_char = back_chars[back_char_index];

                var back_clock_x = x_start + this.clock_radius * 1.5;
                var back_clock_y = y_start + (y_end - y_start) / 4 * ((back_char_index % 2) * 2 + 1);

                if (back_char == '#') {
                    back_char = 'Backspace';
                } else if (back_char == '$') {
                    back_char = 'Clear';
                }
                let cur_back_clock = new Clock(this.face_canvas, this.hand_canvas,
                    back_clock_x, back_clock_y, this.clock_radius, back_char);
                for (var i = 0; i < this.parent.n_pred; i++) {
                    this.clocks.push(null);
                }
                this.clocks.push(cur_back_clock);

            }
        }

        if (indexOf_2d(this.target_layout, "UNDOUNIT") !== false) {

            var undo_unit_indicies = indexOf_2d(this.target_layout, "UNDOUNIT");
            x_start = this.keygrid.x_positions[undo_unit_indicies[0]][undo_unit_indicies[1]][0];
            x_end = this.keygrid.x_positions[undo_unit_indicies[0]][undo_unit_indicies[1]][1];
            y_start = this.keygrid.y_positions[undo_unit_indicies[0]][0];
            y_end = this.keygrid.y_positions[undo_unit_indicies[0]][1];

            var undo_clock_x = x_start + this.clock_radius * 1.5;
            var undo_clock_y = y_start + (y_end - y_start) / 4;

            let cur_undo_clock = new Clock(this.face_canvas, this.hand_canvas,
                undo_clock_x, undo_clock_y, this.clock_radius, "Undo");
            for (var i = 0; i < this.parent.n_pred; i++) {
                this.clocks.push(null);
            }
            this.clocks.push(cur_undo_clock);

            var space_clock_x = x_start + this.clock_radius * 1.5;
            var space_clock_y = y_start + (y_end - y_start) / 4 * 3;

            let cur_space_clock = new Clock(this.face_canvas, this.hand_canvas,
                space_clock_x, space_clock_y, this.clock_radius, "Space");
            for (var i = 0; i < this.parent.n_pred; i++) {
                this.clocks.push(null);
            }
            this.clocks.push(cur_space_clock);

            var undo_label_x = x_start + this.clock_radius * 8;
            var undo_label_y = y_start + (y_end - y_start) / 4;

            this.undo_label = new Label(this.face_canvas, undo_label_x, undo_label_y, this.clock_radius * 2, "");

        }
        if (indexOf_2d(this.target_layout, kconfig.mybad_char) !== false) {

            var undo_unit_indicies = indexOf_2d(this.target_layout, kconfig.mybad_char);
            x_start = this.keygrid.x_positions[undo_unit_indicies[0]][undo_unit_indicies[1]][0];
            x_end = this.keygrid.x_positions[undo_unit_indicies[0]][undo_unit_indicies[1]][1];
            y_start = this.keygrid.y_positions[undo_unit_indicies[0]][0];
            y_end = this.keygrid.y_positions[undo_unit_indicies[0]][1];

            var undo_clock_x = x_start + this.clock_radius * 1.5;
            var undo_clock_y = y_start + (y_end - y_start) * 0.3;

            let cur_undo_clock = new Clock(this.face_canvas, this.hand_canvas,
                undo_clock_x, undo_clock_y, this.clock_radius, "Undo");
            for (var i = 0; i < this.parent.n_pred; i++) {
                this.clocks.push(null);
            }
            this.clocks.push(cur_undo_clock);

            var undo_label_x = x_start + this.clock_radius * 0.2;
            var undo_label_y = y_start + (y_end - y_start) * 4 / 5;

            this.undo_label = new Label(this.face_canvas, undo_label_x, undo_label_y, this.clock_radius * 1.2, "");

        }

    }

    generate_main_clock_layout(x_start, y_start, x_end, y_end, text) {
        var main_clock_x = x_start + this.clock_radius * 1.3;
        var main_clock_y = (y_start + y_end) / 2;

        let cur_main_clock = new Clock(this.face_canvas, this.hand_canvas,
            main_clock_x, main_clock_y, this.clock_radius, text);
        this.clocks.push(cur_main_clock);
    }

    generate_word_clock_layout(x_start, y_start, x_end, y_end) {
        var word_clock_x = x_start + (x_end - x_start) * 0.4;

        for (var word_clock_index = -1; word_clock_index < this.n_pred - 1; word_clock_index++) {

            var word_clock_y = (y_start + y_end) / 2 + this.clock_radius * 2.25 * word_clock_index;

            let cur_word_clock = new Clock(this.face_canvas, this.hand_canvas,
                word_clock_x, word_clock_y, this.clock_radius, "");
            this.clocks.push(cur_word_clock);
        }
    }

    update_word_clocks(words) {
        var clock;
        var clock_index;

        if (!this.parent.emoji_keyboard) {
            for (clock_index in this.clocks) {
                clock = this.clocks[clock_index];

                var key_index = Math.floor(clock_index / (this.n_pred + 1));
                var word_index = clock_index % (this.n_pred + 1);
                if (word_index != 3 && key_index < this.main_chars.length) {
                    if (words[key_index][word_index] != "") {
                        var word = words[key_index][word_index];
                        clock.text = word;
                        clock.filler = false;
                    } else {
                        clock.text = "";
                        clock.filler = true;
                        clock.hand_canvas.ctx.clearRect(clock.x_pos - clock.radius, clock.y_pos - clock.radius,
                            clock.radius * 2, clock.radius * 2);
                    }

                }
            }
        }

        for (clock_index in this.clocks) {
            clock = this.clocks[clock_index];
            if (clock != null) {
                clock.draw_face();
                clock.draw_hand();
            }
        }
        if (!this.parent.emoji_keyboard) {
            this.undo_label.draw_text();
        }
    }
}

export class CommTile {
    constructor(face_canvas, x_pos, y_pos, height, num) {
        this.face_canvas = face_canvas;
        this.crop_x = 0;
        this.crop_y = 0;
        this.scale = 1.847;
        this.crop_h = 170 * this.scale;
        this.crop_w = 170 * this.scale;
        this.x_pos = x_pos;
        this.y_pos = y_pos;
        this.height = height;
        this.get_crop_pos(parseInt(num) - 10);
        this.draw_text();
    }

    get_crop_pos(num) {
        this.crop_x = 193.5 * (num % kconfig.comm_num_columns) * this.scale;
        this.crop_y = 193.5 * Math.floor(num / kconfig.comm_num_columns) * this.scale;
    }

    draw_text() {
        this.face_canvas.ctx.fillStyle = "#000000";
        var base_image = document.getElementById("commboard");
        this.face_canvas.ctx.drawImage(base_image, this.crop_x, this.crop_y, this.crop_w, this.crop_h,
            this.x_pos, this.y_pos, this.height, this.height);
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
        this.face_canvas.ctx.clearRect(this.x_pos, this.y_pos + this.height, this.height * 10, -this.height * 1.5);
        this.face_canvas.ctx.fillStyle = "#000000";
        var font_height = this.height;
        this.face_canvas.ctx.font = font_height.toString().concat("px Helvetica");
        this.face_canvas.ctx.fillText(this.text, this.x_pos, this.y_pos + font_height / 3);
    }
}

export class Clock {
    constructor(face_canvas, hand_canvas, x_pos, y_pos, radius, text = "") {
        this.face_canvas = face_canvas;
        this.hand_canvas = hand_canvas;
        this.x_pos = x_pos;
        this.y_pos = y_pos;
        this.radius = radius;
        this.angle = 0;
        this.text = text;
        this.filler = false;
        this.highlighted = true;
        this.winner = false;
    }

    draw_face() {
        if (!this.filler) {
            this.face_canvas.ctx.beginPath();
            this.face_canvas.ctx.arc(this.x_pos, this.y_pos, this.radius, 0, 2 * Math.PI);
            this.face_canvas.ctx.fillStyle = "#ffffff";
            this.face_canvas.ctx.fill();
            if (this.winner) {
                this.face_canvas.ctx.strokeStyle = "#00ff00";
            } else if (this.highlighted) {
                this.face_canvas.ctx.strokeStyle = "#0056ff";
            } else {
                this.face_canvas.ctx.strokeStyle = "#000000";
            }
            this.face_canvas.ctx.lineWidth = this.radius / 4;
            this.face_canvas.ctx.stroke();

            this.face_canvas.ctx.fillStyle = "#000000";
            var font_height = this.radius * 1.7;
            this.face_canvas.ctx.font = font_height.toString().concat("px Helvetica");
            if (parseInt(this.text) >= 10) {
                let tile = new CommTile(this.face_canvas, this.x_pos + this.radius * 1.25,
                    this.y_pos - this.radius * 1.75, this.radius * 3.5, parseInt(this.text));
            } else {
                this.face_canvas.ctx.fillText(this.text, this.x_pos + this.radius * 1.25, this.y_pos + font_height / 3);
            }
        }
    }

    draw_hand(clear = true) {
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

            if (this.winner) {
                this.hand_canvas.ctx.strokeStyle = "#00ff00";
            } else if (this.highlighted) {
                this.hand_canvas.ctx.strokeStyle = "#0056ff";
            } else {
                this.hand_canvas.ctx.strokeStyle = "#000000";
            }
            this.hand_canvas.ctx.lineWidth = this.radius / 4;
            this.hand_canvas.ctx.stroke();

            this.hand_canvas.ctx.beginPath();
            this.hand_canvas.ctx.moveTo(this.x_pos, this.y_pos);
            this.hand_canvas.ctx.lineTo(this.x_pos, this.y_pos - this.radius * 0.925);
            this.hand_canvas.ctx.strokeStyle = "#ff0000";
            this.hand_canvas.ctx.lineWidth = this.radius / 8;
            this.hand_canvas.ctx.stroke();
        }
    }
}

export class Histogram {
    constructor(output_canvas) {
        this.output_canvas = output_canvas;
        this.text = "";
        this.calculate_size();
        this.num_bins = 80;

        this.generate_normal_values();
        this.renormalize();
        this.normal_vals = this.dens_li.slice();

        this.update(this.dens_li);
    }

    calculate_size() {
        this.box_x_offset = this.output_canvas.screen_width * 3 / 5;
        this.box_width = this.output_canvas.screen_width * 2 / 5;
        this.box_height = this.output_canvas.screen_height;
    }

    update(dens_li) {
        this.dens_li = [];
        for (var i in dens_li) {
            this.dens_li.push(dens_li[i]);
        }
        this.renormalize();
        this.draw_box();
        this.draw_histogram();
    }

    draw_box() {
        this.output_canvas.ctx.beginPath();
        this.output_canvas.ctx.fillStyle = "#eeeeee";
        this.output_canvas.ctx.rect(this.box_x_offset, 0, this.box_width, this.box_height);
        this.output_canvas.ctx.fill();

        this.output_canvas.ctx.beginPath();
        this.output_canvas.ctx.fillStyle = "#ffffff";
        this.output_canvas.ctx.strokeStyle = "#000000";
        this.output_canvas.ctx.rect(this.box_x_offset + this.box_height * 0.02, this.box_height * 0.025,
            this.box_width - this.box_height * 0.05, this.box_height * 0.95);
        this.output_canvas.ctx.fill();
        this.output_canvas.ctx.stroke();
    }

    generate_normal_values() {
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

    calc_hist_colors() {
        var mode = this.dens_li.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
        var colors = [];

        for (var i = 0; i <= this.num_bins; i++) {
            colors.push(red_green_color_map(Math.min(1, Math.max(0, Math.abs(mode - i) / 40))));
        }
        return colors;
    }

    draw_histogram() {
        var colors = this.calc_hist_colors();
        var bin_width = (this.box_width - this.box_height * 0.05) / (this.num_bins + 1);
        for (var i = 0; i <= this.num_bins; i++) {
            this.output_canvas.ctx.beginPath();
            this.output_canvas.ctx.fillStyle = colors[i];
            this.output_canvas.ctx.strokeStyle = "#000000";

            var bin_x_offset = this.box_x_offset + this.box_height * 0.02 + bin_width * i;
            this.output_canvas.ctx.rect(bin_x_offset, this.box_height * 0.975,
                bin_width, -this.box_height * 0.95 * (this.dens_li[i]));
            this.output_canvas.ctx.fill();
            this.output_canvas.ctx.stroke();

            this.output_canvas.ctx.beginPath();
            this.output_canvas.ctx.strokeStyle = "#000000";
            this.output_canvas.ctx.arc(bin_x_offset + bin_width/2, this.box_height * (0.98 - 0.95 * this.normal_vals[i]), 3, 0, 2 * Math.PI, true);
            this.output_canvas.ctx.stroke();

        }
    }
}

export class Textbox {
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

    toggle_cursor() {
        this.cursor_on = this.cursor_on == false;
        if (this.cursor_on) {
            this.box.value = this.text.concat("|");
        } else {
            this.box.value = this.text;
        }
    }

    calculate_size() {
        this.box.style['top'] = this.output_canvas.canvas.style.top;
        this.box.style['width'] = ((this.output_canvas.screen_width / 2) * 3 / 5 - 20).toString().concat("px");
        this.box.style['height'] = ((this.output_canvas.screen_height / 2) * 0.9).toString().concat("px");

    }

    draw_text(text) {
        this.text = text;
        this.box.value = text;
    }
}


export function indexOf_2d(array, item) {
    for (var row_index in array) {
        var row = array[row_index]
        if (row.includes(item)) {
            var col_index = array[row_index].indexOf(item);
            return [parseInt(row_index), col_index];
        }
    }
    return false;
}

export function normal(x, mu, sigma_sq) {
    return 1 / Math.sqrt(2 * Math.PI * sigma_sq) * Math.E ** ((-1 / 2) * ((x - mu)) ** 2 / sigma_sq);
}



