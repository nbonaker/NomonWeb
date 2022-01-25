<!DOCTYPE html>
<html>
<title>Study Data</title>
<link href="../../icon.png"
      rel="icon"
      type="image/png">
<head>
    <style>
        body {
            font-family: "Helvetica", Gadget, sans-serif;
        }

        table, td, th {
            border: 1px solid black;
        }

        table {
            border-collapse: collapse;
        }

        th {
            height: 30px;
        }

        .btn {
            border: none;
            color: white;
            padding: 5px 15px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-family: Helvetica, sans-serif;
            width: 3em;
            font-size: 1.1vw;
            margin: 1px 1px;
            cursor: pointer;
            border-radius: 4px;
        }

        .clickable {
            background-color: #0056ff;
        }

        .unclickable {
            background-color: rgba(0, 89, 255, 0.32);
        }
    </style>
</head>
<body>
<?php
    include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';
    $connection = mysqli_connect($host, $username, $password, $dbname);
    $participant_ids = array(7, 63, 70, 77, 84, 85, 36, 35, 98);
?>

<h2><b>Study Data</b></h2>
<h3><b>User Progress</b></h3>
<table id="user_table" style="width:100%">
    <tr>
        <th>User ID</th>
        <th>Phase</th>
        <th>Nomon Sessions</th>
        <th>Rowcol Sessions</th>
        <th>Last Session</th>
        <th>Total Time</th>
        <th>Actions</th>
    </tr>
    <?php
    function make_query($connection, $query) {
        $result = mysqli_query($connection, $query);
        $result_array = array();

        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                array_push($result_array, $row);
            }
        }
        return $result_array;
    }

    function count_valid_tables($connection, $table_name_base, $start, $stop) {
        $table_count = 0;
        $sub_time = 0;
        for ($table_num=$start; $table_num <= $stop; $table_num++){
            $table_name = $table_name_base[0].$table_num.$table_name_base[1];

            $query = 'SELECT COUNT(*) FROM '.$table_name ;
            $result_array = make_query($connection, $query);
            if ($result_array[0]['COUNT(*)'] > 0){
                $table_count ++;

                $query = 'SELECT timestamp FROM '.$table_name.' ORDER BY timestamp';
                $result_array = make_query($connection, $query);

                $cur_min_time = $result_array[0]['timestamp'];
                for ($row=0; $row < count($result_array)-1; $row++){
                    if ($result_array[$row+1]['timestamp'] - $result_array[$row]['timestamp'] > 120){
                        $sub_time += round($result_array[$row]['timestamp'] - $cur_min_time);
                        $cur_min_time = $result_array[$row+1]['timestamp'];
                    }
                }
                $sub_time += round(end($result_array)['timestamp'] - $cur_min_time);
            }
        }
        return array($table_count, $sub_time);
    }

    $query = "SELECT id, phase, nomon_practice, nomon_symbol, nomon_text, rowcol_practice, rowcol_symbol, rowcol_text,
        dates FROM study_info ORDER BY id";

    $result_array = make_query($connection, $query);

    foreach ($result_array as $user_info) {
        if (in_array((int)$user_info['id'], $participant_ids)){
            $id = $user_info['id'];
            $total_time = 0;


            // PRACTICE TABLES
            $nomon_practice_raw = $user_info['nomon_practice'];
            $nomon_practice_results = count_valid_tables($connection, array('nomon_session_', '_user_'.$id),
                                                            1, $nomon_practice_raw);
            $nomon_practice = $nomon_practice_results[0];
            $total_time +=  $nomon_practice_results[1];

            $rowcol_practice_raw = $user_info['rowcol_practice'];
            $rowcol_practice_results = count_valid_tables($connection, array('rowcol_session_', '_user_'.$id),
                                                            1, $rowcol_practice_raw);
            $rowcol_practice = $rowcol_practice_results[0];
            $total_time += $rowcol_practice_results[1];


            // SYMBOL TABLES
            $nomon_symbol_raw = $user_info['nomon_symbol'];
            $nomon_symbol_results = count_valid_tables($connection, array('nomon_session_', '_user_'.$id),
                                                            $nomon_practice_raw+1, $nomon_symbol_raw);
            $nomon_symbol = $nomon_symbol_results[0];
            $total_time +=  $nomon_symbol_results[1];

            $rowcol_symbol_raw = $user_info['rowcol_symbol'];
            $rowcol_symbol_results = count_valid_tables($connection, array('rowcol_session_', '_user_'.$id),
                                                            $rowcol_practice_raw+1, $rowcol_symbol_raw);
            $rowcol_symbol = $rowcol_symbol_results[0];
            $total_time +=  $rowcol_symbol_results[1];


            // TEXT TABLES
            $nomon_text_raw = $user_info['nomon_text'];
            $nomon_text_results = count_valid_tables($connection, array('nomon_session_', '_user_'.$id),
                                                            $nomon_practice_raw + $nomon_symbol_raw +1, $nomon_text_raw);
            $nomon_text = $nomon_text_results[0];
            $total_time +=  $nomon_text_results[1];

            $rowcol_text_raw = $user_info['rowcol_text'];
            $rowcol_text_results = count_valid_tables($connection, array('rowcol_session_', '_user_'.$id),
                                                            $rowcol_practice_raw + $rowcol_symbol_raw + 1, $rowcol_text_raw);
            $rowcol_text = $rowcol_text_results[0];
            $total_time +=  $rowcol_text_results[1];

    
    ?>

        <tr>
            <td>
                <input class='btn clickable' id="user_button_<?php echo $id ?>" type="button" value="<?php echo $id ?>"
                        onclick=user_button_fun("<?php echo $id ?>") />
<!--                <?php echo $id; ?>-->
            </td>
            <td><?php echo $user_info['phase']; ?></td>
            <td><?php echo $nomon_practice.' (practice) | '.$nomon_symbol.' (symbol) | '.$nomon_text.' (text)'; ?></td>
            <td><?php echo $rowcol_practice.' (practice) | '.$rowcol_symbol.' (symbol) | '.$rowcol_text.' (text)'; ?></td>
            <td><?php
                $date_array = json_decode($user_info['dates']);
                if (count($date_array) > 0){
                    $date = new DateTime(end($date_array));
                    echo $date->format('D, d M Y');
                } else {
                    echo "N/A";
                }
            ?></td>
            <td><?php
                echo gmdate("H:i:s", $total_time);
            ?></td>

        </tr>
    <?php }} ?>
</table>

<div id="chartContainer" style="height: 15em; width: 50em; margin: auto"></div>
<script src="https://canvasjs.com/assets/script/canvasjs.min.js"></script>

<div id="user_specifics">
    <h3><i>Select a user above to display data.</i></h3>
</div>

<div id="session_data">
    <h3><i>Select a session above to display data.</i></h3>
</div>
<div id="phrase_data">
    <h3><i>Select a phrase above to display data.</i></h3>
</div>
<!--<canvas height="500" id="wpm_chart" width="1000"></canvas>-->
<!--<canvas height="500" id="ppc_chart" width="1000"></canvas>-->
<!--<canvas height="500" id="uer_chart" width="1000"></canvas>-->
<!--<canvas height="500" id="cps_chart" width="1000"></canvas>-->
<script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
<!--<script src="../node_modules/chart.js/dist/Chart.js"></script>-->
<!--<script src="../js/v1.1.0/data_load.js" type="module"></script>-->

<?php

$dataPoints = array(
    array("y" => 7,"label" => "March" ),
    array("y" => 12,"label" => "April" ),
    array("y" => 28,"label" => "May" ),
    array("y" => 18,"label" => "June" ),
    array("y" => 41,"label" => "July" )
);

?>

<script>
    function user_button_fun(user_id) {
        $.ajax({
            url: "../php/gather_user_info.php",
            context: document.body,
            method: "POST",
            data: {'user_id': user_id}
        }).done(function (response) {
            $('#user_specifics').html(response);
        });

        $.ajax({
            url: "../php/send_login.php",
            method: "GET",
            data: {'user_id': user_id}
        }).done(function (response) {
            var click_dist = JSON.parse(JSON.parse(response)[0].click_dist);
            var user_id = JSON.parse(response)[0].id;
            var rotate_index = JSON.parse(response)[0].rotate_index;

            var period_li = [];
            for (var i = 0; i < 21; i++) {
                period_li.push(6 * Math.exp((-i) / 10));
            }

            var period = period_li[rotate_index];

            var chart_data = [{"x": -3, "y":0}, {"x": 3, "y":0}];
            for (var i=0; i < click_dist.length; i+=1){
                var data_point = {};
                data_point["y"] = click_dist[i];
                data_point["x"] = (i-40)/80*period;
                chart_data.push(data_point);
            }
            console.log(chart_data);
            update_chart(chart_data, user_id, period);
        });

    }

    function update_chart(data, user_id, period) {

    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: "User ".concat(user_id.toString(), " Current Click Distribution")
        },
        data: [{
            type: "area",
            indexLabelFontSize: 16,
            dataPoints: data
        }],
        axisX:{
            stripLines:[
            {
                startValue:-0.5*period,
                endValue:0.5*period,
                color:"#e6e6e6",
            }, {
                startValue:-0.01,
                endValue:0.01,
                color:"#e60306",
            }
            ],
            title: "Time (s)"
        }
    });
    chart.render();
}

</script>
</body>
</html>
