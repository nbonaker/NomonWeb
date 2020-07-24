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
        this.video_canvas = document.getElementById('video_canvas');
        this.video_canvas.style.visibility = "hidden";
        this.face_requested = true;

        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('../js/webcam_switch/models'),
        ]).then(this.startVideo.bind(this));

        video_canvas.addEventListener('play', () => {
            this.canvas = faceapi.createCanvasFromMedia(video_canvas);
            // document.body.append(canvas)
            const displaySize = {width: this.video_canvas.width, height: this.video_canvas.height};
            faceapi.matchDimensions(this.canvas, displaySize);
        });

        if (this.parent){
            this.webcam_canvas = this.parent.webcam_canvas;
        } else {
            this.webcam_canvas = new WebcamCanvas("webcam_canvas", 1);
        }
        this.skip_update = 0;

        this.control_switch = false;
        this.trigger_switch = false;
        this.highlight_trigger = false;
        this.control_lock = false;

        this.face_x_calibration = 0;
        this.triger_x_calibration = 1;

        this.x_avg_length = 5;
        this.face_x_values = [];
        this.face_x = null;
        this.in_frame = false;
        this.width_avg_length = 5;
        this.face_width_values = [];
        this.face_width = null;

    }
    startVideo() {
        this.face_requested = false;
        navigator.getUserMedia(
            {video: {}},
            stream => document.getElementById('video_canvas').srcObject = stream, // jshint ignore:line
            err => console.error(err) // jshint ignore:line
        );

    }
    detect_face(){
        if (!this.face_requested) {
            this.face_requested = true;
            // noinspection JSAnnotator
            async function run_faceapi(ws) { // jshint ignore:line

                let detection = await faceapi.detectSingleFace(ws.video_canvas, // jshint ignore:line
                    new faceapi.TinyFaceDetectorOptions({inputSize: 192, scoreThreshold: 0.35}));

                if (detection != null) {
                    const face_box = detection.box; // jshint ignore:line
                    ws.retrieve_faces((face_box.x + 100) / 600, face_box.width / 1000, detection._score);
                } else {
                    ws.retrieve_faces(null, null, null);
                }
            }

            run_faceapi(this).catch(this.face_requested = false);
        }
    }
    retrieve_faces(face_x, face_width, confidence){
        this.face_requested = false;
        if (face_x == null){
            this.in_frame = false;
        } else if(this.face_x_values.length < this.x_avg_length){
            this.face_x_values.push(face_x);
            this.in_frame = true;
        } else {
            this.in_frame = true;
            this.face_x_values = this.face_x_values.slice(1, this.x_avg_length);
            this.face_x_values.push(face_x);
        }
        this.face_x = this.face_x_values.reduce(function(a, b){ return a + b;}, 0) / this.face_x_values.length;

        if (face_width == null){
            this.in_frame = false;
        } else if(this.face_width_values.length < this.width_avg_length){
            this.face_width_values.push(face_width);
            this.in_frame = true;
        } else {
            this.in_frame = true;
            this.face_width_values = this.face_width_values.slice(1, this.width_avg_length);
            this.face_width_values.push(face_width);
        }
        this.face_width = this.face_width_values.reduce(function(a, b){ return a + b;}, 0) / this.face_width_values.length;

        // console.log(this.face_x, this.face_width);
        this.draw_switch();
    }
    draw_switch(){
        var face_x = 1 - this.face_x;
        var face_size = this.face_width;

        var facebar_x = this.webcam_canvas.screen_width*(face_x - face_size/2 - this.face_x_calibration);
        var trigger_bar_x = this.webcam_canvas.screen_width*(this.triger_x_calibration + face_size);
        var control_bar_x = this.webcam_canvas.screen_width*(0.47 - face_size/2);

        if (facebar_x < control_bar_x){
            this.control_switch = true;
            this.control_lock = true;
            this.highlight_trigger = true;
        }else{
            this.control_switch = false;
        }

        if (facebar_x > trigger_bar_x-face_size*this.webcam_canvas.screen_width){
            this.trigger_switch = true;
            if(this.trigger_switch && this.control_lock){
                this.parent.on_press();
            }
            this.control_lock = false;
        }else{
            this.trigger_switch = false;
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
            this.webcam_canvas.screen_width*face_size, this.webcam_canvas.screen_height);
        this.webcam_canvas.ctx.fill();
    }
}

// let ws = new WebcamSwitch();
// setInterval(async () => {
//     ws.detect_face();
// }, 100);
