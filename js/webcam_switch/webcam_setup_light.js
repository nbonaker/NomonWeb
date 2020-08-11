import * as webswitch from "./webcam_switch_light.js";

class webcamSetup {
    constructor(forward_url=null) {
        this.forward_url = forward_url;
        this.webcam_canvas = new webswitch.WebcamCanvas("webcam_canvas", 1);
        this.webcam_canvas.canvas.width = 560;
        this.webcam_canvas.canvas.height = 50;
        this.webcam_canvas.calculate_size();

        this.webcam_canvas.draw_grey();

        this.ws = new webswitch.WebcamSwitch(this);

        setInterval(async () => {
            this.ws.grab_stream();
            this.ws.draw_switch();
        }, 100);

        function getMousePosition(canvas, event) {
            let rect = canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            return [x, y]
        }
        this.ws.video_canvas.addEventListener("mousedown", function(e)
        {
            var coords = getMousePosition(this.video_canvas, e);
            this.bottom_offset = (this.video_canvas.height - coords[1])/this.video_canvas.height;

        }.bind(this.ws));

        this.start_button = document.getElementById("start_button");
        this.start_button.onclick = function (){this.ws.start_calibration();}.bind(this);

        this.save_button = document.getElementById("save_button");
        this.save_button.style.display = "none";

        this.info_text = document.getElementById("info_text");

        this.audio = new Audio('../audio/bell.wav');
        this.sound_on = false;
    }
    on_press(){
        if (this.sound_on) {
            this.audio.play();
        }
    }
    save_results(){
        var resting_pos = this.ws.reset_pos;
        var trigger_pos = this.ws.trigger_pos;
        var bottom_pos = this.ws.bottom_offset;
        // noinspection JSAnnotator
        function send_data(forward_url) { // jshint ignore:line
            console.log({"user_id": user_id, "webcam_reset": resting_pos, "webcam_trigger": trigger_pos, "bottom_pos": bottom_pos});
            $.ajax({
                method: "POST",
                url: "../php/update_webcam_light_data.php",
                data: {"user_id": user_id, "webcam_reset": resting_pos, "webcam_trigger": trigger_pos, "bottom_pos": bottom_pos}
            }).done(function (data) {
                console.log("SENT DATA");
                if (forward_url !== null) {
                    window.open(forward_url, '_self');
                } else {
                    window.close();
                }
            });
        }

        send_data(this.forward_url);


    }
}

const params = new URLSearchParams(document.location.search);
const user_id = params.get("user_id");
const first_load = (params.get("first_load") === 'true' || params.get("first_load") === null);
const partial_session = params.get("partial_session") === 'true';
const software = params.get("software");
const emoji = params.get("emoji");
const forward = params.get("forward") === 'true';
if ("webcam" in params) {
    const webcam = params.get("webcam") === 'true';
} else {
    const webcam = null;
}
console.log("User ID: ", user_id, " First Load: ", first_load, " Partial Session: ", partial_session, " Software: ", software, " Forward: ", forward);

var forward_url;
if (forward) {
    if (software === "A") {
        forward_url = "keyboard.html";
        forward_url = forward_url.concat('?user_id=', user_id.toString(), '&first_load=', first_load,
            '&partial_session=', partial_session.toString(), '&emoji=', emoji);
    } else if (software === "B") {
        forward_url = "rowcol.html";
        forward_url = forward_url.concat('?user_id=', user_id.toString(), '&first_load=', first_load,
            '&partial_session=', partial_session.toString(), '&emoji=', emoji);
    }

    if (webcam != null){
        forward_url = forward_url.concat("webcam", webcam);
    }
}

let webcam_setup = new webcamSetup(forward_url);