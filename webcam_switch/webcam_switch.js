import * as fd from './face_detector.js';

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

        this.screen_width = this.canvas.width;
        this.screen_height = this.canvas.height;
    }
    clear(){
        this.ctx.clearRect(0, 0, this.screen_width, this.screen_height);
    }
}

export class WebcamSwitch{
    constructor(parent=null){
        this.parent = parent;
        this.skip_update=0;
        this.video_canvas = document.getElementById("video_canvas");
        this.video_canvas.style.visibility = "hidden";
        this.webcam_canvas = new WebcamCanvas("webcam_canvas", 1);
        this.control_switch = false;
        this.trigger_switch = false;
        this.highlight_trigger = false;
        this.face_sizes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        this.control_lock = false;

        this.face_finder = new fd.FaceFinder(this.video_canvas);
        // this.face_coords = this.face_finder.face_coords;
        // setInterval(this.draw_switch.bind(this), 20);
    }
    draw_switch(){
        var face_x = 1 - this.face_finder.face_coords[0];
        var cur_face_size = this.face_finder.face_coords[2];

        this.face_sizes = this.face_sizes.slice(1);
        this.face_sizes.push(cur_face_size);
        var face_size = 0;
        for (var i in this.face_sizes){
            face_size += this.face_sizes[i]/10;
        }

        var facebar_x = this.webcam_canvas.screen_width*(face_x-face_size);
        var trigger_bar_x = this.webcam_canvas.screen_width*(0.5+face_size*2);
        var control_bar_x = this.webcam_canvas.screen_width*(0.5-face_size*1);

        if (facebar_x < control_bar_x){
            this.control_switch = true;
            this.control_lock = true;
            this.highlight_trigger = true;
        }else{
            this.control_switch = false;
        }

        if (this.face_sizes.includes(0) || this.face_sizes.includes(-1)){
            this.control_lock=false;
        }

        if (facebar_x + this.webcam_canvas.screen_width*face_size*2 > trigger_bar_x){
            this.trigger_switch = true;
        }else{
            this.trigger_switch = false;
        }

        if (this.trigger_switch && this.control_lock){
            this.control_lock = false;
            this.parent.on_press();
        }

        this.webcam_canvas.ctx.beginPath();
        this.webcam_canvas.ctx.fillStyle = "#ededed";
        this.webcam_canvas.ctx.rect(0, 0, this.webcam_canvas.screen_width, this.webcam_canvas.screen_height);
        this.webcam_canvas.ctx.fill();

        this.webcam_canvas.ctx.beginPath();
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

        this.webcam_canvas.ctx.beginPath();
        if (this.control_switch || this.control_lock){
            this.webcam_canvas.ctx.fillStyle = "rgba(0,0,238,0.71)";
        }else{
            this.webcam_canvas.ctx.fillStyle = "rgba(0,0,238,0.44)";
        }

        this.webcam_canvas.ctx.rect(0, 0,
            control_bar_x, this.webcam_canvas.screen_height);
        this.webcam_canvas.ctx.fill();

        this.webcam_canvas.ctx.beginPath();
        this.webcam_canvas.ctx.fillStyle = "rgba(238,133,0,0.44)";
        this.webcam_canvas.ctx.rect(facebar_x, 0,
            this.webcam_canvas.screen_width*face_size*2, this.webcam_canvas.screen_height);
        this.webcam_canvas.ctx.fill();

    }
}

