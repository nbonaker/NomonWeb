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

function send_login(user_id) {
    $.ajax({
        method: "GET",
        url: "../php/send_login.php",
        data: {"user_id": user_id}
    }).done(function (data) {
        var result = $.parseJSON(data);
        console.log(result);
        if (result.length > 0) {
            result = result[0];
        }
        if ("MAX(id)" in result) {  // Create new user
            //remove Loading Screen
            $(".se-pre-con").fadeOut("slow");;
        } else if ("id" in result) {  // Load previous user
            console.log("given_id:", user_id);
            init_study(user_id);
        } else {  //  User not found
            //remove Loading Screen
            $(".se-pre-con").fadeOut("slow");;
        }
    });
}

const params = new URLSearchParams(document.location.search);
const user_id = params.get("user_id");

if (user_id == "data"){
    window.open("../html/data_load.php", '_self');
}

send_login(user_id);