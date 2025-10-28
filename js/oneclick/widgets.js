
// Global variable to track font setting
var current_font = 'regular';

/**
 * Get the appropriate font family based on font setting.
 * @returns {string} Font family string
 */
function getFontFamily() {
    return current_font === 'dyslexic' ? "'OpenDyslexic'" : "Helvetica, sans-serif";
}

/**
 * Set font setting.
 * @param {string} font - Font type ('regular' or 'dyslexic')
 */
export function setFont(font) {
    if (current_font !== font) {
        current_font = font;
        // Trigger font change across the application
        if (window.ClockGrid && window.ClockGrid.update_word_clocks) {
            window.ClockGrid.update_word_clocks();
        }
    }
}

/**
 * @param {string} canvas_id The id for the canvas element defined in the main HTML page.
 * @param {number} layer_index The zIndex order for display of the canvas element. Higher-valued canvases are displayed on top of lower-valued ones.
 */
export class KeyboardCanvas{
    constructor(canvas_id, layer_index, word) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.style.zIndex = layer_index;

        this.calculate_size();
    }

    /**
     * Calculates the size of the keyboard based on the available screen space. Styles the canvas position and resolution. Needs to be recalled for each canvas upon any window resizing events.
     * @param {number} bottom_height_factor - The proportion of screen space to allocate for the output canvas on the bottom (the textbox and histogram).
     */
    calculate_size(bottom_height_factor=0.4){
        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;

        this.topbar_height = document.getElementById('top_bar_top').getBoundingClientRect().height +
            document.getElementById('top_bar_bottom').getBoundingClientRect().height + 10;

        this.canvas.style.position = "absolute";
        this.canvas.style.top = this.topbar_height.toString().concat("px");
        this.canvas.style.left = "0px";
        this.ctx = this.canvas.getContext("2d");

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.989;
        this.bottom_height_factor = bottom_height_factor;

        this.canvas.width = this.window_width * this.resolution_factor;
        this.canvas.height = (this.window_height - this.topbar_height) * (1 - this.bottom_height_factor) * this.resolution_factor;
        this.canvas.style.width = (this.window_width * this.screen_fill_factor).toString().concat("px");
        this.canvas.style.height = ((this.window_height - this.topbar_height) * (1 - this.bottom_height_factor) * this.screen_fill_factor).toString().concat("px");

        this.screen_width = this.window_width * this.resolution_factor;
        this.screen_height = (this.window_height - this.topbar_height) * (1 - this.bottom_height_factor) * this.resolution_factor;
    }

    /**
     * Clears the content of the canvas, leaving it transparent.
     */
    clear(){
        this.ctx.clearRect(0, 0, this.screen_width, this.screen_height);
    }
}
/**
 * Wrapper class for the canvas elements that display the output elements (textbox and histogram).
 * @param {string} canvas_id - The id for the canvas element defined in the main HTML page.
 * @param {number} y_offset - The number of pixels to shift the canvas down from the top of the window. Equal to the location of the bottom of the bounding-box for the keyboard canvases.
 */
export class OutputCanvas{
    constructor(canvas_id, y_offset, layer_index=1) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.style.zIndex = layer_index;
        this.canvas.style.position = "absolute";
        this.canvas.style.left = "0px";
        this.ctx = this.canvas.getContext("2d");
        this.calculate_size(y_offset);
    }

    /**
     * Calculates the size of the output box based on the available screen space. Styles the canvas position and resolution. Needs to be recalled for each canvas upon any window resizing events.
     * @param {number} y_offset - The number of pixels to shift the canvas down from the top of the window. Equal to the location of the bottom of the bounding-box for the keyboard canvases.
     */
    calculate_size(y_offset){
        this.canvas.style.top = y_offset.toString().concat("px");
        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;

        this.topbar_height = document.getElementById('top_bar_top').getBoundingClientRect().height +
            document.getElementById('top_bar_bottom').getBoundingClientRect().height;

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.98;
        this.bottom_height_factor = 0.38;

        this.canvas.width = this.window_width * this.resolution_factor;
        this.canvas.height = (this.window_height - this.topbar_height) * (this.bottom_height_factor) * this.resolution_factor;
        this.canvas.style.width = (this.window_width * this.screen_fill_factor).toString().concat("px");
        this.canvas.style.height = ((this.window_height - this.topbar_height) * (this.bottom_height_factor) * this.screen_fill_factor).toString().concat("px");

        this.screen_width = this.window_width * this.resolution_factor;
        this.screen_height = (this.window_height - this.topbar_height) * (this.bottom_height_factor) * this.resolution_factor;
    }
}
/**
 * Specifies the locations of the bounding rectangles of the grid containing the keyboard options. Draws the bounding rectangles on the keygrid_canvas.
 * @param {KeyboardCanvas} keygrid_canvas - The KeyboardCanvas instance used to draw the keygrid
 * @param {Array<Array<String>>} target_layout - A 2D array specifying the relative locations of the keyboard keys.
 */
export class KeyGrid {
    constructor(keygrid_canvas, target_layout) {
        this.keygrid_canvas = keygrid_canvas;
        this.target_layout = target_layout;

        this.in_pause = false;
        this.generate_layout();
        this.draw_layout();
    }

    /**
     * Calculates the pixel positions for the bounding rectangles in the keygrid. Needs to be recalled on any window resizing event.
     */
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

    /**
     * Draws the bounding rectangles for the currently calculated keygrid layout.
     */
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

    /**
     * Highlights the rectangle of the keygrid specified by the given row and column
     * @param {number} row - the row index in the keygrid of the rectangle to highlight
     * @param {number} col - the column index in the keygrid of the rectangle to highlight
     */
    highlight_square(row, col){
        var y_start = this.y_positions[row][0];
        var y_end = this.y_positions[row][1];

        var x_start = this.x_positions[row][col][0];
        var x_end = this.x_positions[row][col][1];

        this.keygrid_canvas.ctx.beginPath();
        this.keygrid_canvas.ctx.fillStyle = "#bfeec2";
        this.keygrid_canvas.ctx.strokeStyle = "#000000";
        this.keygrid_canvas.ctx.rect(x_start, y_start, x_end - x_start, y_end - y_start);
        this.keygrid_canvas.ctx.fill();
        this.keygrid_canvas.ctx.stroke();
    }
}

/**
 * Specifies the locations of the all clocks (both on and off). Draws the clock faces for all active clocks.
 * @param {Keyboard} parent - The main Keyboard instance.
 * @param {KeyboardCanvas} face_canvas - The KeyboardCanvas instance used to draw the clock faces.
 * @param {KeyboardCanvas} hand_canvas - The KeyboardCanvas instance used to draw the clock hands.
 * @param {KeyGrid} keygrid - The instance of the KeyGrid class.
 * @param {Array<Array<String>>} target_layout - A 2D array specifying the relative locations of the keyboard keys.
 * @param {Array<String>} key_chars - An array of all keys (including characters and corrective options).
 */
export class ClockGrid{
    constructor(parent, face_canvas, hand_canvas, keygrid, target_layout, key_chars){
        this.parent = parent;
        this.face_canvas = face_canvas;
        this.hand_canvas = hand_canvas;
        this.keygrid = keygrid;
        this.target_layout = target_layout;
        this.key_chars = key_chars;
        this.n_pred = 0;

        this.clocks = [];
        this.generate_layout();
        console.log(this.clocks);
    }

    /**
     * calculates the position and size of all clocks. Needs to be recalled on any window resizing event.
     */
    generate_layout() {

        var x_start;
        var x_end;
        var y_start;
        var y_end;

        this.clock_radius = (this.keygrid.y_positions[0][1] - this.keygrid.y_positions[0][0]) / 7;

        for (var i in this.key_chars){
            var main_char = this.key_chars[i];
            var main_char_indices = indexOf_2d(this.target_layout, main_char);

            x_start = this.keygrid.x_positions[main_char_indices[0]][main_char_indices[1]][0];
            x_end = this.keygrid.x_positions[main_char_indices[0]][main_char_indices[1]][1];
            y_start = this.keygrid.y_positions[main_char_indices[0]][0];
            y_end = this.keygrid.y_positions[main_char_indices[0]][1];

            this.generate_word_clock_layout(x_start, y_start, x_end, y_end);
            this.generate_main_clock_layout(x_start, y_start, x_end, y_end, main_char);

        }
    }

    /**
     * helper function to calculate the relative position of a main character clock
     * @param {number} x_start - the starting x position in pixels of the corresponding KeyGrid bounding box.
     * @param {number} y_start - the starting y position in pixels of the corresponding KeyGrid bounding box.
     * @param {number} x_end - the ending x position in pixels of the corresponding KeyGrid bounding box.
     * @param {number} y_end - the ending y position in pixels of the corresponding KeyGrid bounding box.
     * @param {string} text - the textual component of the clock, i.e. "a"
     */
    generate_main_clock_layout(x_start, y_start, x_end, y_end, text){
        var main_clock_x = x_start + this.clock_radius * 1.5;
        var main_clock_y = (y_start + y_end) / 2;

        let cur_main_clock = new Clock(this.face_canvas, this.hand_canvas,
                                        main_clock_x, main_clock_y, this.clock_radius, text);
        this.clocks.push(cur_main_clock);
    }
    /**
     * helper function to calculate the relative positions of the word clocks for a main character. Genreates n_pred clock faces.
     * @param {number} x_start - the starting x position in pixels of the corresponding KeyGrid bounding box.
     * @param {number} y_start - the starting y position in pixels of the corresponding KeyGrid bounding box.
     * @param {number} x_end - the ending x position in pixels of the corresponding KeyGrid bounding box.
     * @param {number} y_end - the ending y position in pixels of the corresponding KeyGrid bounding box.
     */
    generate_word_clock_layout(x_start, y_start, x_end, y_end){
        var word_clock_x = x_start + (x_end-x_start) * 0.4;

        for (var word_clock_index = -1; word_clock_index < this.n_pred-1; word_clock_index++){

             var word_clock_y = (y_start + y_end) / 2 + this.clock_radius * 2.25 * word_clock_index;

             let cur_word_clock = new Clock(this.face_canvas, this.hand_canvas,
                                        word_clock_x, word_clock_y, this.clock_radius, "");
            this.clocks.push(cur_word_clock);
        }
    }
}

/**
 * Class to display the textual component of an option next to its corresponding clock.
 * @param {KeyboardCanvas} face_canvas - The KeyboardCanvas instance used to draw the clock faces.
 * @param {number} x_pos - The starting x position in pixels of the label, calculated in the ClockGrid class.
 * @param {number} y_pos - The starting y position in pixels of the label, calculated in the ClockGrid class.
 * @param {number} height - The height in pixels of the label, calculated in the ClockGrid class.
 * @param {string} text - the textual component of the label, i.e. "a", "Undo"
 */
export class Label {

    constructor(face_canvas, x_pos, y_pos, height, text = "") {
        this.face_canvas = face_canvas;
        this.x_pos = x_pos;
        this.y_pos = y_pos;
        this.height = height;
        this.text = text;
    }

    /**
     * Re-draws the text for the label.
     */
    draw_text() {
        this.face_canvas.ctx.clearRect(this.x_pos, this.y_pos+this.height, this.height*10, -this.height*2);
        this.face_canvas.ctx.fillStyle = "#000000";
        var font_height = this.height;
        this.face_canvas.ctx.font = font_height.toString().concat("px " + getFontFamily());
        this.face_canvas.ctx.fillText(this.text, this.x_pos, this.y_pos + font_height / 3);
    }
}

/**
 * Class to manage the drawing and animation of a clock's face and hands.
 * @param {KeyboardCanvas} face_canvas - The KeyboardCanvas instance used to draw the clock faces.
 * @param {KeyboardCanvas} hand_canvas - The KeyboardCanvas instance used to draw the clock hands.
 * @param {number} x_pos - The starting x position in pixels of the clock, calculated in the ClockGrid class.
 * @param {number} y_pos - The starting x position in pixels of the clock, calculated in the ClockGrid class.
 * @param {number} radius - The radius of the clock in pixels, calculated in the ClockGrid class.
 * @param {string} text - The textual component of the clock's option.
 */
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

    /**
     * Draws the clock face on the face_canvas without updating the minute hand.
     */
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
            var font_height = this.radius * 2.5;
            this.face_canvas.ctx.font = font_height.toString().concat("px " + getFontFamily());
            this.face_canvas.ctx.fillText(this.text.replace(/ /g, "_"), this.x_pos + this.radius * 1.25, this.y_pos + font_height / 3);
        }
    }

    /**
     * Draws the clock minute hand on the clock_hand canvas.
     * @param {boolean} clear - Whether to clear the canvas of the previously drawn minute hand.
     */
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

/**
 * Class to handle the display and update of the histogram of the user's current click-time-distribution estimate.
 * @param {OutputCanvas} output_canvas - The OutputCanvas instance used to draw the histogram and text box.
 */
export class Histogram{

    constructor(output_canvas) {
        this.output_canvas = output_canvas;
        this.text = "";
        this.calculate_size();
        this.num_bins = 80;

        this.generate_normal_values();
        this.update(this.dens_li);
    }

    /**
     * Calculates the size of the histogram from the available screen space. Needs to be recalled on any window resizing event.
     */
    calculate_size(){
        this.box_x_offset = this.output_canvas.screen_width * 3 / 5;
        this.box_width = this.output_canvas.screen_width * 2 / 5;
        this.box_height = this.output_canvas.screen_height;
    }

    /**
     * Redraws the histogram based on a new density list estimate from the KDE class.
     * @param {Array<number>} dens_li - An array of integers representing the relative height of each histogram bar.
     */
    update(dens_li){
        this.dens_li = [];
        for (var i in dens_li){
            this.dens_li.push(dens_li[i]);
        }
        this.renormalize();
        this.draw_box();
        this.draw_histogram();
    }

    /**
     * Draws the white box in the background of the histogram.
     */
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

    /**
     * Generates the initial normal distribution used for the KDE when the user has no prior click data.
     */
    generate_normal_values(){
        this.dens_li = [];
        for (var i = 0; i <= this.num_bins; i++) {
            this.dens_li.push(normal(i, 40, 20));
        }
    }

    /**
     * Normalizes the dens_li values prior to the drawing process.
     */
    renormalize() {
        var normalizer = Math.max.apply(Math, this.dens_li);
        for (var i in this.dens_li) {
            this.dens_li[i] = this.dens_li[i] / normalizer;
        }
    }

    /**
     * Draws the bars of the histogram from the dens_li attribute.
     */
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

/**
 * Class to handle the display of word selection options with clocks to the left of each option.
 * @param {KeyboardCanvas} face_canvas - The KeyboardCanvas instance used to draw the clock faces.
 * @param {KeyboardCanvas} hand_canvas - The KeyboardCanvas instance used to draw the clock hands.
 * @param {OutputCanvas} output_canvas - The OutputCanvas instance used to draw the word grid.
 */
export class WordGrid{

    constructor(face_canvas, hand_canvas, output_canvas, n_words) {
        this.face_canvas = face_canvas;
        this.hand_canvas = hand_canvas;
        this.output_canvas = output_canvas;
        this.word_options = [];
        this.clocks = [];
        this.n_words = n_words;
        this.calculate_size();
        this.draw_box();
    }

    /**
     * Calculates the size of the word grid from the available screen space. Needs to be recalled on any window resizing event.
     */
    calculate_size(){
        this.box_x_offset = this.output_canvas.screen_width * 3 / 5;
        this.box_y_offset
        this.box_width = this.output_canvas.screen_width * 2 / 5;
        this.box_height = this.output_canvas.screen_height;
        
        // Calculate clock size based on available space
        this.clock_radius = Math.min(this.box_height * 0.06, this.box_width * 0.08);
    }

    /**
     * Updates the word options and redraws the grid with clocks.
     * @param {Array} word_options - Array of word option objects with text, type, and display properties.
     * @param {number} selected_index - The currently selected option index.
     */
    update(word_options){
        this.word_options = word_options.map(x => x.text) || [];
        this.generate_clocks();
        this.draw_box();
        this.draw_clocks_and_options();
    }

    /**
     * Generates clock instances for each word option.
     */
    generate_clocks(){
        this.clocks = [];

        const option_height = (this.box_height * 0.95) / this.n_words;
                
        for (let i = 0; i < this.n_words; i++) {
            const y_start = this.box_height * 0.025 + i * option_height;
            const y_center = y_start + option_height / 2;
            
            // Position clock on the left side of the option area
            const clock_x = this.box_x_offset + this.box_height * 0.02 + this.clock_radius * 1.5;
            // Add the output canvas y-offset to position the clock correctly on the face_canvas
            const clock_y = y_center;
            
            let clock = new Clock(this.face_canvas, this.hand_canvas, 
                                clock_x, clock_y, this.clock_radius, "");
            
            // Set clock properties based on selection state
            clock.highlighted = false;
            clock.winner = false;
            clock.angle = 0; // Initial angle, will be updated by clock animation logic
            
            this.clocks.push(clock);
        }
    }

    /**
     * Draws the white box in the background of the word grid.
     */
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

    /**
     * Draws the clocks and word options in the grid.
     */
    draw_clocks_and_options(){
        if (this.word_options.length < this.n_words - 1) {
            return;
        }

        const ctx = this.output_canvas.ctx;
        const option_height = (this.box_height * 0.95) / this.n_words;
        const font_size = option_height * 0.6;
        
        ctx.font = font_size.toString() + "px " + getFontFamily();
        
        // Clear the clock areas first
        for (let clock of this.clocks) {
            this.face_canvas.ctx.clearRect(clock.x_pos - clock.radius * 1.5, 
                                         clock.y_pos - clock.radius * 1.5,
                                         clock.radius * 3, clock.radius * 3);
            this.hand_canvas.ctx.clearRect(clock.x_pos - clock.radius * 1.5, 
                                         clock.y_pos - clock.radius * 1.5,
                                         clock.radius * 3, clock.radius * 3);
        }
        
        const words = this.word_options.slice(0, this.n_words-1).concat("UNDO");
        for (let i = 0; i < this.n_words; i++) {
            const option = words[i];
            const y_start = this.box_height * 0.025 + i * option_height;
            const y_center = y_start + option_height / 2;
            const clock = this.clocks[i];
            
            // Draw clock face and hand
            clock.draw_face();
            clock.draw_hand();
            
            // Draw option text to the right of the clock
            const text_x = clock.x_pos + this.clock_radius * 2;
            
            ctx.fillStyle = "#000000";
            
            ctx.fillText(option, text_x, y_center + font_size / 3);
        }
    }

    /**
     * Updates the angle of a specific clock by index.
     * @param {number} index - The index of the clock to update.
     * @param {number} angle - The new angle for the clock hand.
     */
    update_clock_angle(index, angle){
        if (index >= 0 && index < this.clocks.length) {
            this.clocks[index].angle = angle;
            this.clocks[index].draw_hand();
        }
    }

    /**
     * Clears the word grid display.
     */
    clear(){
        this.word_options = [];
        this.clocks = [];
        
        // Clear clock canvases in the word grid area
        this.face_canvas.ctx.clearRect(this.box_x_offset, 0, this.box_width, this.box_height);
        this.hand_canvas.ctx.clearRect(this.box_x_offset, 0, this.box_width, this.box_height);
        
        this.draw_box();
    }
}

/**
 * Class to handle the display of the output text box that shows what the user has typed.
 * @param {OutputCanvas} output_canvas - The OutputCanvas instance used to draw the histogram and text box.
 */
export class Textbox{

    constructor(output_canvas) {
        this.output_canvas = output_canvas;
        this.text = "";
        this.grey_text = "";
        this.num_selected = 0;
        this.cursor_on = false;
        setInterval(this.toggle_cursor.bind(this), 530);

        this.box = document.getElementById("output_textbox");
        this.box.style.position = 'absolute';  // position it
        this.box.style.left = '5px';

        this.calculate_size();
        this.draw_text("");
    }

    /**
     * Animates the flashing cursor in the text box.
     */
    toggle_cursor(){
        this.cursor_on = this.cursor_on == false;
        this.box.innerHTML = this.format_text();
    }

    /**
     * calculates the size of the text box from the available canvas space.
     */
    calculate_size(){
        this.box.style['top'] = this.output_canvas.canvas.style.top;
        this.box.style['width'] = ((this.output_canvas.screen_width/2)*3/5-20).toString().concat("px");
        this.box.style['height'] = ((this.output_canvas.screen_height/2)*0.9).toString().concat("px");

    }

    /**
     * Draws the text that the user has written in the textbox.
     * @param {string} text - The text that the user has currently written.
     */
    draw_text(text, grey_text = "", num_selected = 0) {
        this.text = text;
        this.grey_text = grey_text;
        this.num_selected = num_selected;
        this.box.innerHTML = this.format_text();
    }

    format_text(isCursor) {
        const cursor = this.cursor_on ? "|" : " ";
        if (this.num_selected == 0) {
            return this.text.trim() + cursor + '<span style="color: grey;">' + this.grey_text + '</span>';
        } else {
            return this.text + '<span style="color: grey; text-decoration: underline;">' + this.grey_text.slice(0, this.num_selected) + '</span>' + cursor +
                '<span style="color: grey;">' + this.grey_text.slice(this.num_selected) + '</span>';
        }
    }
}

/**
 * Helper function that finds the row and column index position of an object in a nested 2D array.
 * @private
 * @param {Array<Array>} array - The 2D array in which to search.
 * @param item - The item to find in the array.
 * @returns {(number)[]|boolean} - Returns the row and column index of the item if it exists in the array, otherwise returns False.
 */
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

/**
 * Helper function to generate the probability of a normal function with specified mean and variance at a given input value.
 * @private
 * @param {number} x - The point at which to calculate the probability.
 * @param {number} mu - The mean of the distribution
 * @param {number} sigma_sq - The variance of the distribution
 * @returns {number} - Returns the value of the normal distribution at point x.
 */
export function normal(x, mu, sigma_sq){
    return 1 / Math.sqrt(2 * Math.PI * sigma_sq) * Math.E ** ( (-1 / 2)* ((x - mu)) ** 2 / sigma_sq);
}



