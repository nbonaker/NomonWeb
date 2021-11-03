import * as rcom from './rowcol_options_manager.js';

var logged_in = false;
var redirect_url = "";

// Update Footer with JS Version
var scripts = document.getElementsByTagName('script');
var path = scripts[scripts.length - 1].src.split('?')[0];
var js_version = path.split('/')[5];
document.getElementById("footer_version").innerText = js_version;


function create_user(user_id) {
    $.ajax({
        method: "POST",
        url: "../php/create_user.php",
        data: {"user_id": user_id}
    }).done(function (data) {
        console.log(data);
    });
}


function init_study(user_id, webcam_type) {
    $.ajax({
        method: "POST",
        url: "../php/init_study.php",
        data: {"user_id": user_id}
    }).done(function (data) {
        var result = $.parseJSON(data);
        console.log(result);
        var user_id = result[0].id;

        var phase = result[0].phase;
        var redirect_url;

        if (phase === "intro") {
            if (result[0].nomon_practice <= result[0].rowcol_practice) {
                redirect_url = "../html/commboard.html";
            } else {
                redirect_url = "../html/commboard_rcs.html";
            }

        } else if (phase === "practice") {
            redirect_url = "../html/training_menu.html";

        } else if (phase === "symbol") {
            if (result[0].nomon_symbol <= result[0].rowcol_symbol) {
                redirect_url = "../html/commboard.html";
            } else {
                redirect_url = "../html/commboard_rcs.html";
            }

        } else if (phase === "text") {
            if (result[0].nomon_text <= result[0].rowcol_text) {
                redirect_url = "../html/keyboard.html";
            } else {
                redirect_url = "../html/rowcol.html";
            }
        }

        let r = (Math.random() + 1).toString(36).substring(7);
        redirect_url = redirect_url.concat('?user_id=', user_id.toString(), '&phase=', phase, '&anticache=', r);
        window.open(redirect_url, '_self');

    });

}

function send_login() {
    var requested_user_id = $("#user_id").val();
    $.ajax({
        method: "GET",
        url: "../php/send_login.php",
        data: {"user_id": requested_user_id}
    }).done(function (data) {
        var result = $.parseJSON(data);
        console.log(result);
        var user_id;
        var click_dist;
        if (result.length > 0) {
            result = result[0];
        }
        if ("MAX(id)" in result) {  // Create new user
            console.log("requested_id:", requested_user_id);
            if (!Number.isInteger(parseInt(requested_user_id))) {
                user_id = parseInt(result["MAX(id)"]) + 7;
                if (Number.isNaN(user_id)) {
                    user_id = 0;
                }
                console.log("given_id:", user_id);
                document.getElementById("info_text").innerHTML =
                    `<strong>Your ID will be: ${user_id}. Press "Create User".</strong>`;
                document.getElementById("send_button").value = "Create User";
                document.getElementById("user_id").style.display = "none";
                create_user(user_id);
                document.getElementById("info_text").innerHTML =
                    `<strong>Created user with ID ${user_id}!</strong>`;
                init_study(user_id);
            }
        } else if ("id" in result) {  // Load previous user
            user_id = requested_user_id;
            click_dist = result.click_dist;
            if (click_dist === null) {
                document.getElementById("info_text").innerHTML =
                    `<strong>Loading User ${user_id}... No user preferences were found.</strong>`;
            } else {
                document.getElementById("info_text").innerHTML =
                    `<strong>Loading User ${user_id}... User preferences loaded!</strong>`;
            }
            console.log("given_id:", user_id);
            init_study(user_id);
        } else {  //  User not found
            document.getElementById("info_text").innerHTML =
                `<strong>We could not find a user with ID ${requested_user_id}. Please try again.</strong>`;
            // document.getElementById("send_button").value = "Enter";
            document.getElementById("user_id").value = "";
        }
    });
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
        var output_elem = document.getElementById("user_id");
        if (this.value === "Enter") {
            send_login();
        } else if (this.value === "Delete") {
            if (output_elem.value.length > 0) {
                output_elem.value = output_elem.value.slice(0, output_elem.value.length - 1)
                RCOM.scan_delay = Math.min(3, RCOM.scan_delay * 1.5);
            }
        } else if (this.value === "Clear") {
            output_elem.value = "";
            RCOM.scan_delay = Math.min(3, RCOM.scan_delay * 1.5);
        } else {
            output_elem.value = output_elem.value.concat(this.value);
        }
    }
}

var options_array = [
    [new rowcolButton("button1", "1"), new rowcolButton("button2", "2"), new rowcolButton("button3", "3")],
    [new rowcolButton("button4", "4"), new rowcolButton("button5", "5"), new rowcolButton("button6", "6")],
    [new rowcolButton("button7", "7"), new rowcolButton("button8", "8"), new rowcolButton("button9", "9")],
    [new rowcolButton("button0", "0"), new rowcolButton("send_button", "Enter")],
    [new rowcolButton("button_delete", "Delete"), new rowcolButton("button_clear", "Clear")]
];
console.log(options_array);
let RCOM = new rcom.OptionsManager(options_array, 1.5);
var RCOM_interval = setInterval(RCOM.animate.bind(RCOM), 0.05 * 1000);