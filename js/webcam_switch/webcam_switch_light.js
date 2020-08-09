export function pixel_distance(pixel_1, pixel_2, threshold=30) {
    var distance = Math.max(0, Math.abs(pixel_2 - pixel_1)-threshold);
    if (distance > 0){
        distance += threshold;
    }
    return distance;
}

export function mirror_image(data, width, height){
    var data_og = data.slice();

    for (var row = 0; row < height; row += 1){
        for (var col = 0; col < width; col += 1){
            for (var i =0; i < 4; i+= 1){
                data[(row * width + col) * 4 + i] = data_og[(row * width + width-col) * 4 + i];
            }
        }
    }
}

export function convolve(arr1, arr2){
    var conv_arr = [];
    var n = arr1.length;
    var m = arr2.length;
    for (var i = m; i < n; i += 1){
        var conv_value = 0;
        for (var j = 0; j < m; j += 1){
            conv_value += arr1[i-j]*arr2[j];
        }
        conv_arr.push(conv_value);
    }
    return conv_arr
}

export function detectPeaks(data) {

    var smoothed_data = convolve(data, [1/5, 1/5, 1/5, 1/5, 1/5]);

    var first_diff = [];
    var i;
    for (i = 0; i < smoothed_data.length-1; i+= 1){
        first_diff.push(smoothed_data[i+1]-smoothed_data[i]);
    }

    var peaks = [];
    var troughs = [];
    for (i =5; i < first_diff.length-5; i += 1){
        if (Math.abs(first_diff[i-3]) > 3) {
            if (Math.sign(first_diff[i - 1]) > Math.sign(first_diff[i])) {
                peaks.push(smoothed_data[i]);
            } else if (Math.sign(first_diff[i - 1]) < Math.sign(first_diff[i])) {
                troughs.push(smoothed_data[i]);
            }
        }
    }

    var median_peak = Math.ceil(peaks.sort()[Math.ceil(peaks.length/2)]);
    var median_trough = Math.floor(troughs.sort()[Math.ceil(troughs.length/2)]);
    console.log("peak:  ", median_peak, "   num:", peaks.length);
    console.log("trough:", median_trough, "   num:", troughs.length);

    return [median_peak, peaks.length, median_trough, troughs.length];
}


export class WebcamCanvas{
    constructor(canvas_id, layer_index) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.style.zIndex = layer_index;

        this.calculate_size();
    }
    calculate_size(){
        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;

        this.ctx = this.canvas.getContext("2d");

        this.screen_width =  this.canvas.width;
        this.screen_height = this.canvas.height;

    }
    clear(){
        this.ctx.clearRect(0, 0, this.screen_width, this.screen_height);
    }
    draw_grey(){
        this.ctx.beginPath();
        this.ctx.fillStyle = "#d2d2d2";
        this.ctx.rect(0, 0, this.screen_width, this.screen_height);
        this.ctx.fill();
    }
}

export class WebcamSwitch {
    constructor(parent) {
        this.parent = parent;

        this.init_ui();
        this.skip_update = 0;

        this.bottom_offset = 100/420;

        this.center_avg_length = 3;
        this.center_values = [];

        this.startVideo();

        this.previous_frame = null;
        this.motion_frame = null;
        this.previous_center = 0;

        this.face_avg = null;

        this.calibration_data_points = [];
        this.in_calibration = false;
        this.finished_calibration = false;

        this.trigger_pos = null;
        this.reset_pos = null;

    }
    init_ui(){
        this.video_canvas = document.getElementById("video_canvas");
        this.video_canvas_ctx = this.video_canvas.getContext("2d");

        if (this.parent){
            this.webcam_canvas = this.parent.webcam_canvas;
        } else {
            this.webcam_canvas = new WebcamCanvas("webcam_canvas", 1);

            this.webcam_canvas.canvas.width = 560;
            this.webcam_canvas.canvas.height = 50;
            this.webcam_canvas.calculate_size();

            this.webcam_canvas.draw_grey();
        }

    }
    startVideo() {
        const constraints = {
            video: true
        };

        this.video = document.querySelector('video');
        // this.video.style.visibility = "hidden";
        navigator.mediaDevices.getUserMedia({video: {}}) .then((stream)=> {document.querySelector('video').srcObject = stream;}, (err)=> console.error(err));

        this.video.setAttribute('autoplay', '');
        this.video.setAttribute('muted', '');
    }
    grab_stream(){
        this.video_canvas.width = this.video.videoWidth;
        this.video_canvas.height = this.video.videoHeight;
        this.video_canvas_ctx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);

        if (this.video_canvas.width !== 0){
            this.calculate_motion();
        }

    }
    calculate_motion(){
        var imageData = this.video_canvas_ctx.getImageData(0, 0, this.video.videoWidth, this.video.videoHeight);
        var current_frame = imageData.data;

        mirror_image(current_frame, this.video.videoWidth, this.video.videoHeight);
        this.current_frame_save = current_frame.slice();
        this.motion_frame = [];

        if (this.previous_frame != null){
            for (var i = 0; i < current_frame.length; i += 4) {
                var red_difference = pixel_distance(current_frame[i], this.previous_frame[i]);
                var green_difference = pixel_distance(current_frame[i+1], this.previous_frame[i+1]);
                var blue_difference = pixel_distance(current_frame[i+1], this.previous_frame[i+1]);

                var max_difference = Math.max(red_difference, green_difference, blue_difference);

                this.motion_frame.push(max_difference);
            }

            var average_results = this.calculate_motion_center();
            var row_averages = average_results[0];
            this.face_avg = average_results[1];

            if(this.in_calibration) {   // run peak detection if in calibration
                this.calibration_data_points.push(this.face_avg);
                if (this.calibration_data_points.length > 10) {
                    var calibration_values = detectPeaks(this.calibration_data_points);

                    this.trigger_pos = calibration_values[0]/this.video_canvas.width;
                    this.peak_num = calibration_values[1];
                    this.reset_pos = calibration_values[2]/this.video_canvas.width;
                    this.trough_num = calibration_values[3];

                    if(this.peak_num && this.trough_num >= 10){
                        this.finish_calibration();

                    } else {
                        document.getElementById("peak_text").innerText = 10 - Math.min(this.peak_num, this.trough_num);
                    }
                }
            }

            if (this.in_calibration || this.finished_calibration){
                if (this.peak_num > 0){
                    for (row = 0; row < Math.floor(this.video_canvas.height*(1-this.bottom_offset)); row+= 1) {
                        for (col = 0; col < 5; col += 1) {
                            current_frame[row * this.video_canvas.width * 4 +
                                (Math.floor(this.trigger_pos*this.video_canvas.width)+col) * 4 + 2] = 0;
                            current_frame[row * this.video_canvas.width * 4 + (
                                Math.floor(this.trigger_pos*this.video_canvas.width)+col) * 4 + 1] =
                                    Math.min(Math.ceil(255*this.peak_num/10), 255);
                            current_frame[row * this.video_canvas.width * 4 +
                                (Math.floor(this.trigger_pos*this.video_canvas.width)+col) * 4] = 0;
                        }
                    }
                }
                if (this.trough_num > 0){
                    for (row = 0; row < Math.floor(this.video_canvas.height*(1-this.bottom_offset)); row+= 1) {
                        for (col = 0; col < 5; col += 1) {
                            current_frame[row * this.video_canvas.width * 4 +
                                (Math.floor(this.reset_pos*this.video_canvas.width)+col) * 4 + 2] =
                                    Math.min(Math.ceil(255*this.trough_num/10), 255);
                            current_frame[row * this.video_canvas.width * 4 +
                                (Math.floor(this.reset_pos*this.video_canvas.width)+col) * 4 + 1] =
                                    Math.min(Math.ceil(100*this.trough_num/10), 100);
                            current_frame[row * this.video_canvas.width * 4 +
                                (Math.floor(this.reset_pos*this.video_canvas.width)+col) * 4] =
                                    Math.min(Math.ceil(100*this.trough_num/10), 100);
                        }
                    }
                }
            }

            var row;
            var col;

            for (row = 0; row < Math.floor(this.video_canvas.height*(1-this.bottom_offset)); row+= 1) {
                var avg_col_index = row_averages[row];

                // draw average for each row in red
                current_frame[row * this.video_canvas.width * 4 + avg_col_index * 4] = 255;
                current_frame[row * this.video_canvas.width * 4 + avg_col_index * 4 + 2] = 0;
                current_frame[row * this.video_canvas.width * 4 + avg_col_index * 4 + 1] = 0;

                //draw total average bar in blue
                for (col = 0; col < 5; col += 1) {
                    current_frame[row * this.video_canvas.width * 4 + (this.face_avg+col) * 4 + 2] = 0;
                    current_frame[row * this.video_canvas.width * 4 + (this.face_avg+col) * 4 + 1] = 150;
                    current_frame[row * this.video_canvas.width * 4 + (this.face_avg+col) * 4] = 255;
                }
            }

            for (col = 0; col < this.video_canvas.width; col+= 1) {
                var bottom_row = Math.floor(this.video_canvas.height*(1-this.bottom_offset));

                for (row = 0; row < 5; row += 1) {
                    current_frame[(bottom_row + row) * this.video_canvas.width * 4 + col * 4] = 255;
                    current_frame[(bottom_row + row) * this.video_canvas.width * 4 + col * 4 + 1] = 0;
                    current_frame[(bottom_row + row) * this.video_canvas.width * 4 + col * 4 + 2] = 0;
                }
            }

            this.video_canvas_ctx.putImageData(imageData, 0, 0);
        }
        this.previous_frame = this.current_frame_save;
    }
    calculate_motion_center(){
        var row_averages = [];
        var row_sums = [];
        var row;
        for (row = 0; row < this.video_canvas.height; row+= 1){
            var row_average = 0;
            var row_sum = 0;
            for (var col = 0; col < this.video_canvas.width; col += 1){
                row_average += this.motion_frame[row*this.video_canvas.width+ col]*col;
                row_sum += this.motion_frame[row*this.video_canvas.width  + col]
            }
            row_average = Math.floor(row_average/row_sum);
            if (isNaN(row_average)){
                row_average = Math.floor(this.video_canvas.width/2);
                row_sum = 0;
            }
            row_averages.push(Math.floor(row_average));
            row_sums.push(row_sum);
        }

        var col_avg = 0;
        var total_sum = 0;
        for (row = 0; row < Math.floor(this.video_canvas.height*(1-this.bottom_offset)); row+= 1){
            col_avg += row_averages[row]*row_sums[row];
            total_sum += row_sums[row];
        }
        if (total_sum > 10000){
            col_avg = Math.floor(col_avg/total_sum);
            this.previous_center = col_avg;
        }
        else {
            col_avg = this.previous_center;
        }

        if (this.center_values.length >= this.center_avg_length){
            this.center_values = this.center_values.slice(1, this.center_avg_length);
        }
        this.center_values.push(col_avg);
        var center_value = Math.floor(this.center_values.reduce((a, b) => a + b, 0)/this.center_values.length);

        return [row_averages, center_value];
    }
    start_calibration(){
        this.calibration_data_points = [];
        this.in_calibration = true;
        this.finished_calibration = false;

        this.parent.start_button.value = "Restart Calibration";
        this.parent.save_button.style.display = "none";
        this.parent.info_text.innerHTML  = `Start in a centered, neutral position. Move your torso to the right, 
            and then back to<br> the center. Repeat <span id="peak_text">10</span> more times`
    }
    finish_calibration(){
        this.in_calibration = false;
        this.finished_calibration = true;

        this.parent.start_button.value = "Recalibrate";
        this.parent.info_text.innerHTML  = `You've finished calibrating! Press recalibrate if you want to adjust, or save and return.`;
        // this.video_canvas.style.visibility = "hidden";
        this.parent.save_button.style.display = "inline";
        this.parent.save_button.onclick = function (){this.save_results();}.bind(this.parent);
        this.parent.sound_on = true;
    }
    draw_switch(){
        this.webcam_canvas.ctx.beginPath();
        this.webcam_canvas.ctx.fillStyle = "#ededed";
        this.webcam_canvas.ctx.rect(0, 0, this.webcam_canvas.screen_width, this.webcam_canvas.screen_height);
        this.webcam_canvas.ctx.fill();

        var face_x = (this.face_avg/this.video_canvas.width-0.1)*this.webcam_canvas.screen_width;

        var face_percent = this.face_avg/this.video_canvas.width;

        if (face_percent < this.reset_pos){
            this.control_switch = true;
            this.control_lock = true;
            this.highlight_trigger = true;
        }else{
            this.control_switch = false;
        }

        if (face_percent > this.trigger_pos){
            this.trigger_switch = true;
            if(this.trigger_switch && this.control_lock){
                if (this.parent) {
                    this.parent.on_press();
                }
            }
            this.control_lock = false;
        }else{
            this.trigger_switch = false;
        }

        if (this.reset_pos != null){
            this.webcam_canvas.ctx.beginPath();

            var control_bar_x = (this.reset_pos-0.1)*this.webcam_canvas.screen_width;

             if (this.control_switch || this.control_lock){
                this.webcam_canvas.ctx.fillStyle = "rgba(0,0,238,0.71)";
            }else{
                this.webcam_canvas.ctx.fillStyle = "rgba(0,0,238,0.44)";
            }

            this.webcam_canvas.ctx.rect(0, 0,
                control_bar_x, this.webcam_canvas.screen_height);
            this.webcam_canvas.ctx.fill();
        }

        if (this.trigger_pos != null){
            this.webcam_canvas.ctx.beginPath();

            var trigger_bar_x = (this.trigger_pos+0.1)*this.webcam_canvas.screen_width;

            if (this.trigger_switch && this.highlight_trigger){
                this.webcam_canvas.ctx.fillStyle = "rgba(0,238,0,0.84)";
            }else{
                this.webcam_canvas.ctx.fillStyle = "rgba(0,238,0,0.29)";
                if (!this.control_lock) {
                    this.highlight_trigger = false;
                }
            }

            this.webcam_canvas.ctx.rect(trigger_bar_x, 0,
                this.webcam_canvas.screen_width - trigger_bar_x, this.webcam_canvas.screen_height);
            this.webcam_canvas.ctx.fill();
        }

        this.webcam_canvas.ctx.beginPath();
        this.webcam_canvas.ctx.fillStyle = "rgba(238,133,0,0.44)";
        this.webcam_canvas.ctx.rect(face_x, 0,
            this.webcam_canvas.screen_width*0.2, this.webcam_canvas.screen_height);
        this.webcam_canvas.ctx.fill();
    }
}

// let ws = new WebcamSwitch();
