import * as rcom from './rowcol_options_manager.js';

var logged_in = false;
var redirect_url = "";

function create_user(user_id) {
    $.ajax({
        method: "POST",
        url: "../php/create_user.php",
        data: {"user_id": user_id}
    }).done(function (data) {
        console.log(data);
    });
}

function handle_partial_sessions(nomon_sessions, rowcol_sessions, first_software) {
    var session_num = Math.min(nomon_sessions, rowcol_sessions);
    var partial_session;
    var next_software;
    var cur_info_text = document.getElementById("info_text").textContent;

    if (nomon_sessions < rowcol_sessions) {
        document.getElementById("info_text").innerHTML =
            `<strong>${cur_info_text} <br> You have not completed session ${session_num}. Click to continue.</strong>`;

        next_software = "A";
        partial_session = true;

    } else if (rowcol_sessions < nomon_sessions) {

        document.getElementById("info_text").innerHTML =
            `<strong>${cur_info_text} <br> You have not completed session ${session_num}. Click to continue.</strong>`;

        next_software = "B";
        partial_session = true;

    } else {

        document.getElementById("info_text").innerHTML =
            `<strong>${cur_info_text} <br> You have completed ${session_num} sessions. Click to launch the keyboard software.</strong>`;

        if (session_num % 2) {
            if (first_software === "nomon") {
                first_software = "rowcol";
            } else {
                first_software = "nomon";
            }
        }
        if (first_software === "nomon") {
            next_software = "A";
        } else {
            next_software = "B";
        }
        partial_session = false;
    }

    return [session_num, next_software, partial_session];
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
        var first_software = result[0].first_software;

        var next_session_results = handle_partial_sessions(parseInt(result[0].nomon_sessions), parseInt(result[0].rowcol_sessions), first_software);
        var session_num = next_session_results[0];
        var next_software = next_session_results[1];
        var partial_session = next_session_results[2];

        var first_load;
        if (session_num == 0) {
            first_load = "true";
        } else {
            first_load = "false";
        }

        var emoji;

        if (session_num == 5) {
            emoji = "false";
            launch_software(user_id, next_software, partial_session, first_load, emoji, webcam_type, true);
        } else if (session_num == 6) {
            emoji = "false";
            launch_software(user_id, next_software, partial_session, first_load, emoji, webcam_type, false);
        } else if (session_num == 9) {
            emoji = "true";
            launch_software(user_id, next_software, partial_session, first_load, emoji, webcam_type);
        } else if (session_num >= 10) {
            alert("You have completed all sessions in this study. Please contact us at mitkbstudy@gmail.com to discuss payment. Thank you for participating!")
        } else {
            emoji = "false";
            launch_software(user_id, next_software, partial_session, first_load, emoji, webcam_type);
        }

    });

}

function launch_software(user_id, next_software, partial_session, first_load, emoji, webcam_type, webcam = null) {

    document.getElementById("send_button").value = "Launch Software";
    document.getElementById("send_button").className = "btn darkhighlighted";
    for (var button_num = 0; button_num < 10 ; button_num += 1){
        document.getElementById("button".concat(button_num.toString())).style.display = "none"
    }

    redirect_url = "../html/commboard.html".concat('?user_id=', user_id.toString(), '&first_load=', first_load,
        '&partial_session=', partial_session.toString(), '&software=', next_software, '&emoji=', emoji, '&forward=true');

    clearInterval(RCOM_interval);
    RCOM = null;

    window.addEventListener('keydown', function (e) {
        if (e.keyCode === 32) {
            e.preventDefault();
            window.open(redirect_url, '_self');
        }
    }, false);

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
        var webcam_type = "face";
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
                init_study(user_id, webcam_type);
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
            webcam_type = result.webcam_type;
            console.log("given_id:", user_id, "webcam switch:", webcam_type);
            init_study(user_id, webcam_type);
        } else {  //  User not found
            document.getElementById("info_text").innerHTML =
                `<strong>We could not find a user with ID ${requested_user_id}. Please try again.</strong>`;
            document.getElementById("send_button").value = "Enter";
            document.getElementById("user_id").value = "";
        }
    });
}

class rowcolButton{
    constructor(id, value) {
        this.value = value;
        this.button = document.getElementById(id);
        this.button.onclick = function (){this.select()}.bind(this);
    }
    darkhighlight(){
        this.button.className = "btn darkhighlighted";
    }
    highlight(){
        this.button.className = "btn highlighted";
    }
    unhighlight(){
        this.button.className = "btn unhighlighted";
    }
    select(){
        if (this.value === "Enter" ) {
            send_login();
        } else {
            var output_elem = document.getElementById("user_id");
            output_elem.value = output_elem.value.concat(this.value);
        }
    }
}

var options_array = [
    [new rowcolButton("button1", "1"), new rowcolButton("button2", "2"), new rowcolButton("button3", "3")],
    [new rowcolButton("button4", "4"), new rowcolButton("button5", "5"), new rowcolButton("button6", "6")],
    [new rowcolButton("button7", "7"), new rowcolButton("button8", "8"), new rowcolButton("button9", "9")],
    [new rowcolButton("button0", "0"), new rowcolButton("send_button", "Enter")],
    ];
console.log(options_array);
let RCOM = new rcom.OptionsManager(options_array);
var RCOM_interval = setInterval(RCOM.animate.bind(RCOM), 0.05*1000);