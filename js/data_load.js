function getFormattedDate(date) {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '/' + day + '/' + year;
}


function r(x, y){
    return x !== y;
}


function calc_MSD(a, b){
    a = a.split('');
    b = b.split('');

    if (a[a.length-1] === " "){
        a = a.slice(0, a.length-1);
    }
    if (b[b.length-1] === " "){
        b = b.slice(0, b.length-1);
    }

    var D = [];
    var i;
    var j;
    var row = [];
    for (j in b) {
        row.push(0);
    }
    for (i in a){
        D.push(row.slice(0, row.length));
    }
    for (i in a) {
        D[i][0] = parseInt(i);
    }
    for (j in b) {
        D[0][j] = parseInt(j);
    }

    var l;
    var m;
    for (i in a) {
        for (j in b) {
            if (i > 0){
                l = parseInt(i)-1;
            }else{
                l = a.length-1
            }
            if (j > 0){
                m = parseInt(j)-1;
            }else{
                m = b.length-1
            }
            D[parseInt(i)][parseInt(j)] = Math.min(D[l][parseInt(j)] + 1, D[parseInt(i)][m] + 1, D[l][m] + r(a[parseInt(i)], b[parseInt(j)]));
        }
    }
    return D[a.length-1][b.length-1] / Math.max(a.length, b.length)*100;
}


class dataScreen {
    constructor() {
        this.nomon_user_data = false;
        this.rowcol_user_data = false;

        this.get_user_data("nomon");
        this.get_user_data("rowcol");

        this.display_type = "nomon";

        this.nomon_button = document.getElementById("nomon_button");
        this.nomon_button.onclick = function(){
            this.switch_display("nomon");
        }.bind(this);
        this.rowcol_button = document.getElementById("rowcol_button");
        this.rowcol_button.onclick = function(){
            this.switch_display("rowcol");
        }.bind(this);
        this.average_button = document.getElementById("avg_button");
        this.average_button.onclick = function(){
            this.switch_display("avg");
        }.bind(this);

        this.wpm_chart;
        this.ppc_chart;
        this.uer_char;
        this.cps_chart;

    }
    switch_display(type){
        this.display_type = type;
        if (this.display_type === "nomon"){
            this.nomon_button.className = "btn clickable";
            this.rowcol_button.className = "btn unclickable";
            this.average_button.className = "btn unclickable";

        } else if (this.display_type === "rowcol"){
            this.nomon_button.className = "btn unclickable";
            this.rowcol_button.className = "btn clickable";
            this.average_button.className = "btn unclickable";

        }if (this.display_type === "avg"){
            this.nomon_button.className = "btn unclickable";
            this.rowcol_button.className = "btn unclickable";
            this.average_button.className = "btn clickable";

        }
        this.update_content()
    }
    get_user_data(software) {
        $.ajax({
            method: "GET",
            url: "../php/data_summary.php",
            data: {"software": software}
        }).done(function (data) {
            var user_data = JSON.parse(data);

            if (software === "nomon") {
                console.log("Nomon data: ", user_data);
                this.nomon_user_data = user_data;
            } else {
                console.log("Rowcol data: ", user_data);
                this.rowcol_user_data = user_data;
            }

            if (this.nomon_user_data !== false && this.rowcol_user_data !== false) {
                console.log("both data loaded!");
                this.switch_display("nomon");
            }

        }.bind(this));
    }
    update_content() {

        var user_data;
        if (this.display_type === "nomon") {
            user_data = this.nomon_user_data;
        } else if (this.display_type === "rowcol"){
            user_data = this.rowcol_user_data;
        }else if (this.display_type === "avg"){
            user_data = this.rowcol_user_data;
        }

        this.fill_user_table(this.nomon_user_data, this.rowcol_user_data);
        this.draw_graph(user_data, "wpm");
        this.draw_graph(user_data, "ppc");
        this.draw_graph(user_data, "uer");
        this.draw_graph(user_data, "cps");
    }
    fill_user_table(nomon_user_data, rowcol_user_data) {
        var table = document.getElementById("user_table");

        var tableRows = table.getElementsByTagName('tr');
        var rowCount = tableRows.length;

        for (var i = 1; i < rowCount; i++) {
            table.deleteRow(1);
        }

        Object.keys(nomon_user_data).forEach(function (user_key) {
            var row = table.insertRow(-1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            cell1.innerHTML = user_key;

            var nomon_sessions = [0];
            Object.keys(nomon_user_data[user_key]).forEach(function (session_key) {
                var session = parseInt(session_key);
                if (!Number.isNaN(session)) {
                    nomon_sessions.push(session);
                }
            });

            var rowcol_sessions = [0];
            Object.keys(rowcol_user_data[user_key]).forEach(function (session_key) {
                var session = parseInt(session_key);
                if (!Number.isNaN(session)) {
                    rowcol_sessions.push(session);
                }
            });

            var num_nomon_sessions = Math.max.apply(Math, nomon_sessions);
            cell2.innerHTML = num_nomon_sessions.toString().concat(`    <progress id=\"file\" value=\"${num_nomon_sessions}\" max=\"10\"></progress>`);

            var num_rowcol_sessions = Math.max.apply(Math, rowcol_sessions);
            cell3.innerHTML = num_rowcol_sessions.toString().concat(`    <progress id=\"file\" value=\"${num_rowcol_sessions}\" max=\"10\"></progress>`);


            var epoch_timestamp = Math.max(nomon_user_data[user_key]["timestamp"] * 1000, rowcol_user_data[user_key]["timestamp"] * 1000);
            var date = new Date(epoch_timestamp);

            cell4.innerHTML = getFormattedDate(date);

            cell5.innerHTML = `<input class='btn clickable' type="button" id = "drop_user_${user_key}" value = "Drop User"/>`;
            var drop_user_button = document.getElementById("drop_user_".concat(user_key.toString()));
            drop_user_button.onclick = function() {
                this.drop_user_form(user_key, cell5, num_nomon_sessions, num_rowcol_sessions);
            }.bind(this);
        }.bind(this));
    }
    drop_user_form(user_id, button_cell, nomon_sessions, rowcol_sessions){
        button_cell.innerHTML = ` <label for="fname">Password:</label>
            <input type="password" id="pwd" name="pwd" minlength="8">
            <input class='btn clickable' type="button" id = "drop_user_${user_id}" value ="Submit"/>`;

        var send_button = document.getElementById("drop_user_".concat(user_id.toString()));
        send_button.onclick = function() {
                this.send_drop_user(user_id, button_cell, nomon_sessions, rowcol_sessions);
            }.bind(this);
    }
    send_drop_user(user_id, button_cell, nomon_sessions, rowcol_sessions){
        var password_field = document.getElementById("pwd");
        var password = password_field.value;

        var data = {"user_id": user_id.toString(), "nomon_sessions": nomon_sessions, "rowcol_sessions": rowcol_sessions, "password": password};
        console.log(data);

        $.ajax({
            method: "POST",
            url: "../php/drop_user.php",
            data: data
        }).done(function (data) {
            var response = data;
            console.log(response);

            if (response === "Login Failed!"){
                button_cell.innerHTML = ` <label for="fname">Login Failed:</label>
                    <input type="password" id="pwd" name="pwd" minlength="8">
                    <input class='btn clickable' type="button" id = "drop_user_${user_id}" value ="Submit"/>`;
                var send_button = document.getElementById("drop_user_".concat(user_id.toString()));
                send_button.onclick = function() {
                    this.send_drop_user(user_id, button_cell, nomon_sessions, rowcol_sessions);
                }.bind(this);

            } else {
                button_cell.innerHTML = ` <label>User Deleted! Reload Page ...</label>`;
            }

        }.bind(this));

    }
    compute_average_data(graph_datas){
        var average_data = [];
        var std_data = [];
        console.log("full_data: ", graph_datas);

        var session_avg_data = [];
        var session_std_data = [];
        var session_sample_sizes = [];
        for (var user in graph_datas){
            for (var session in (graph_datas[user][0])){
                if (session_avg_data.length <= session){
                    session_avg_data.push([]);
                    session_std_data.push([]);
                    session_sample_sizes.push([]);
                }
                var avg = graph_datas[user][1][session];
                var std = graph_datas[user][2][session] - avg;
                var sample_size = graph_datas[user][4][session];
                session_avg_data[session].push(avg);
                session_std_data[session].push(std);
                session_sample_sizes[session].push(sample_size)
            }
        }
        for (session in session_avg_data) {
            var cur_average = 0;
            var cur_sample_size = 0;
            for (var user in session_avg_data[session]){
                cur_average += session_avg_data[session][user] * session_sample_sizes[session][user];
                cur_sample_size += session_sample_sizes[session][user];
            }
            average_data.push(cur_average / cur_sample_size);
        }
        console.log("avg:", average_data);

        for (session in session_avg_data) {
            var cur_var = 0;
            var cur_sample_size = 0;
            for (var user in session_std_data[session]) {
                // qi = (ni-1)*var(xi) + ni*mean(xi)^2

                cur_var += Math.pow(session_std_data[session][user], 2) * (session_sample_sizes[session][user] - 1);
                cur_var += Math.pow(session_avg_data[session][user], 2) * session_sample_sizes[session][user];

                cur_sample_size += session_sample_sizes[session][user];
            }
            // qc = sum(q_i)
            // sc = sqrt( (qc - sum(ni)*mean(x)^2)/(sum(ni)-1))

            cur_average = average_data[session];
            var cur_std = Math.sqrt((cur_var - cur_sample_size*Math.pow(cur_average, 2))/ (cur_sample_size - 1));

            std_data.push(cur_std);
        }
        console.log("std:", std_data);

        return [average_data, std_data];

    }
    get_graph_data(user_data, user, type) {
        var session_data = user_data[user];

        var sessions = Object.keys(session_data);
        var x_labels = [];

        var values_avg_data = [];
        var values_std_data = [];
        var values_sample_size = [];
        for (var i in sessions) {
            if (sessions[i] !== "timestamp") {
                x_labels.push(sessions[i]);
                var session = sessions[i];
                var phrase_data = session_data[session];

                console.log(type);
                var phrase_values = [];
                if (type === "wpm" || type === "ppc") {
                    for (var phrase_num in phrase_data) {
                        phrase_values.push(phrase_data[phrase_num][type]);
                    }
                } else if (type === "uer") {
                    for (var phrase_num in phrase_data) {
                        var phrase_text = phrase_data[phrase_num]["phrase"];
                        var typed_text = phrase_data[phrase_num]["typed"];
                        phrase_values.push(calc_MSD(phrase_text, typed_text));
                    }
                } else if (type === "cps") {
                    for (var phrase_num in phrase_data) {
                        var num_corrections = phrase_data[phrase_num]["corr"];
                        var num_selections = phrase_data[phrase_num]["sel"];
                        phrase_values.push(num_corrections / num_selections);
                        // console.log(phrase_values);
                    }
                }

                var values_avg = phrase_values.reduce((a, b) => (a + b)) / phrase_values.length;
                values_avg_data.push(values_avg);

                values_sample_size.push(phrase_values.length);

                var wpm_std;
                if (phrase_values.length > 1) {
                    wpm_std = Math.sqrt(phrase_values.map(x => Math.pow(x - values_avg, 2)).reduce((a, b) => a + b) / (phrase_values.length - 1));
                } else {
                    wpm_std = 0;
                }
                values_std_data.push(wpm_std);
            }
        }

        var values_std_upper = [];
        var values_std_lower = [];
        for (var j in values_avg_data) {
            values_std_upper.push(values_avg_data[j] + values_std_data[j]);
            values_std_lower.push(Math.max(values_avg_data[j] - values_std_data[j], 0));
        }


        return [x_labels, values_avg_data, values_std_upper, values_std_lower, values_sample_size];
    }
    generate_dataset(graph_datas, users) {
        var num_users = users.length;
        var colors = [];
        for (var color_index in users) {
            colors.push([(210 + 360 / num_users * color_index) % 360, 100, 55]);
        }
        // console.log(colors);

        var dataset = [];
        var largest_x_label = [];
        for (var user_index in  graph_datas) {
            var color = colors[user_index];
            var h = color[0];
            var s = color[1];
            var l = color[2];

            var user_id = users[user_index];
            var graph_data = graph_datas[user_index];
            var x_labels = graph_data[0];
            if (x_labels.length > largest_x_label.length) {
                largest_x_label = x_labels;
            }

            var values_avg = graph_data[1];
            var values_std_upper = graph_data[2];
            var values_std_lower = graph_data[3];

            dataset.push({
                label: `User ${user_id}`,
                borderColor: `hsl(${h},${s}%,${l}%)`,
                backgroundColor: 'rgb(0,241,0, 0)',
                data: values_avg
            });
            dataset.push({
                label: "hide",
                backgroundColor: `hsla(${h},${s}%,${l}%, 0.15)`,
                borderColor: 'rgb(0,89,255,0)',
                fill: false,  //no fill here
                data: values_std_lower
            });
            dataset.push({
                label: "hide",
                backgroundColor: `hsla(${h},${s}%,${l}%, 0.15)`,
                borderColor: 'rgb(0,89,255,0)',
                fill: '-1', //fill until previous dataset
                data: values_std_upper
            });
        }
        return [dataset, largest_x_label];
    }
    draw_graph(user_data, type) {

        var results;
        var dataset;
        var x_labels;

        if (this.display_type === "avg"){
            var rowcol_graph_datas = [];
            var nomon_graph_datas = [];

            Object.keys(this.rowcol_user_data).forEach(function (user_key) {
                if (parseInt(user_key) >= 91){
                    var graph_data = this.get_graph_data(this.rowcol_user_data, user_key, type);
                    rowcol_graph_datas.push(graph_data);
                }
            }.bind(this));

            Object.keys(this.nomon_user_data).forEach(function (user_key) {
                if (parseInt(user_key) >= 91) {
                    var graph_data = this.get_graph_data(this.nomon_user_data, user_key, type);
                    nomon_graph_datas.push(graph_data);
                }
            }.bind(this));

            var rowcol_avg_results = this.compute_average_data(rowcol_graph_datas);
            var rowcol_values_avg_data = rowcol_avg_results[0];
            var rowcol_values_std_data = rowcol_avg_results[1];

            var rowcol_labels = [];
            var i;
            for (i in rowcol_values_avg_data){
                rowcol_labels.push((i+1).toString());
            }
            var rowcol_values_std_upper = [];
            var rowcol_values_std_lower = [];
            for (i in rowcol_values_avg_data){
                rowcol_values_std_upper.push(rowcol_values_avg_data[i] + rowcol_values_std_data[i]);
                rowcol_values_std_lower.push(Math.max(0, rowcol_values_avg_data[i] - rowcol_values_std_data[i]));
            }
            
            var nomon_avg_results = this.compute_average_data(nomon_graph_datas);
            var nomon_values_avg_data = nomon_avg_results[0];
            var nomon_values_std_data = nomon_avg_results[1];

            var nomon_labels = [];
            var i;
            for (i in nomon_values_avg_data){
                nomon_labels.push((i+1).toString());
            }
            var nomon_values_std_upper = [];
            var nomon_values_std_lower = [];
            for (i in nomon_values_avg_data) {
                nomon_values_std_upper.push(nomon_values_avg_data[i] + nomon_values_std_data[i]);
                nomon_values_std_lower.push(Math.max(0, nomon_values_avg_data[i] - nomon_values_std_data[i]));
            }

            graph_datas = [[nomon_labels, nomon_values_avg_data, nomon_values_std_upper, nomon_values_std_lower],
                [rowcol_labels, rowcol_values_avg_data, rowcol_values_std_upper, rowcol_values_std_lower]];

            results = this.generate_dataset(graph_datas, ["Nomon", "Rowcol"]);
            dataset = results[0];
            x_labels = results[1];

        } else {
            var graph_datas = [];
            var users = [];

            Object.keys(user_data).forEach(function (user_key) {
                if (parseInt(user_key) >= 91) {
                    var graph_data = this.get_graph_data(user_data, user_key, type);
                    graph_datas.push(graph_data);
                    users.push(user_key);
                }
            }.bind(this));

            results = this.generate_dataset(graph_datas, users);
            dataset = results[0];
            x_labels = results[1];
        }

        if (type === "wpm") {
            var title = 'Text Entry Rate of Users';
            var y_axis = 'Entry Rate (wpm)';
            if (!!this.wpm_chart){
                this.wpm_chart.destroy();
            }
        } else if (type === "ppc") {
            var title = 'Click Load of Users';
            var y_axis = 'Click Load (clicks per character)';
            if (!!this.ppc_chart){
                this.ppc_chart.destroy();
            }
        } else if (type === "uer") {
            var title = 'Uncorrected Error Rate Users';
            var y_axis = 'Uncorrected Error Rate (%)';
            if (!!this.uer_chart){
                this.uer_chart.destroy();
            }
        } else if (type === "cps") {
            var title = 'Correction Rate Users';
            var y_axis = 'Correction Rate (corrections per selection)';
            if (!!this.cps_chart){
                this.cps_chart.destroy();
            }
        }

        var ctx = document.getElementById(`${type}_chart`).getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: x_labels,
                datasets: dataset
            },

            // Configuration options go here
            options: {
                responsive: false,
                elements: {
                    line: {
                        tension: 0, // disables bezier curves
                    }
                },
                legend: {
                    labels: {
                        filter: function (item, chart) {
                            // Logic to remove a particular legend item goes here
                            return !item.text.includes("hide");
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: y_axis
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Session Number'
                        }
                    }]
                },
                title: {
                    display: true,
                    text: title
                }
            }
        });

        if (type === "wpm") {
            this.wpm_chart = chart;
        } else if (type === "ppc") {
            this.ppc_chart = chart;
        } else if (type === "uer") {
            this.uer_chart = chart;
        } else if (type === "cps") {
            this.cps_chart = chart;
        }
    }
}

let data_screen = new dataScreen();