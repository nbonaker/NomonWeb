import * as rcom from './rowcol_options_manager.js';


// Update Footer with JS Version
var scripts = document.getElementsByTagName('script');
var path = scripts[scripts.length - 1].src.split('?')[0];
var js_version = path.split('/')[5];
document.getElementById("footer_version").innerText = js_version;



function launch_software(software) {
    var redirect_url;

    if (software === "nomon") {
        redirect_url = "./commboard.html";
    } else if (software === "rcs") {
        redirect_url = "./commboard_rcs.html";
    } else {
        redirect_url = "./commboard.html";
        phase = "symbol";
    }

    redirect_url = redirect_url.concat('?user_id=', user_id.toString(), '&phase=', phase, '&anticache=', anticache);
    window.open(redirect_url, '_self');
}


class rowcolButton {
    constructor(id, value) {
        this.value = value;
        this.button = document.getElementById(id);
        this.button.onclick = function (e) {
            if (e) {     // ignore if PointerEvent or other Mouse related event (not triggered by "switch")
                return
            }
            this.select()
        }.bind(this);
    }

    darkhighlight() {
        this.button.className = "btn darkhighlighted";
    }

    highlight() {
        this.button.className = "btn highlighted";
    }

    unhighlight() {
        this.button.className = "btn unhighlighted";
    }

    select() {
        launch_software(this.value);

    }
}

const params = new URLSearchParams(document.location.search);
const user_id = params.get("user_id");
var phase = params.get("phase");
var anticache = params.get("anticache");

var options_array = [
    [new rowcolButton("button1", "nomon"), new rowcolButton("button2", "rcs"), new rowcolButton("button3", "done")]
];
console.log(options_array);

let RCOM = new rcom.OptionsManager(options_array);

var RCOM_interval = setInterval(RCOM.animate.bind(RCOM), 0.05 * 1500);