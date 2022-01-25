<?php
    include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

    $connection = mysqli_connect($host, $username, $password, $dbname);

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

    function Stand_Deviation($arr)
    {
        $num_of_elements = count($arr);

        $variance = 0.0;

                // calculating mean using array_sum() method
        $average = array_sum($arr)/$num_of_elements;

        foreach($arr as $i)
        {
            // sum of squares of differences between
                        // all numbers and means.
            $variance += pow(($i - $average), 2);
        }

        return (float)sqrt($variance/$num_of_elements);
    }

    function Mean($arr)
    {
        $num_of_elements = count($arr);
                // calculating mean using array_sum() method
        $average = array_sum($arr)/$num_of_elements;

        return $average;
    }

    echo "<h3><i>Showing data from:</i></h3>";
    echo "Table Name: "; echo $_POST["table_name"]; echo "<br>";
    echo "Interface:  "; echo $_POST["interface"];echo "<br>";
    echo "Phase:      "; echo $_POST["phase"];echo "<br>";

    $query = "SELECT DISTINCT phrase_num FROM ".$_POST["table_name"];
    $phrase_nums = make_query($connection, $query);
?>
<table style="width:100%">
    <tr>
        <th>Phrase #</th>
        <th>Phrase </th>
        <th>Final Typed</th>
        <?php
            if ($_POST["phase"] == "text"){
                echo "<th>Words/Min</th>";
            } else {
                echo "<th>Selections/Min</th>";
            }

            if ($_POST["phase"] == "text"){
                echo "<th>Clicks/Character</th>";
            } else {
                echo "<th>Clicks/Selection</th>";
            }

            if ($_POST["interface"] == "nomon"){
                echo "<th>Clock Speed</th>";
            } else if ($_POST["interface"] == "rowcol") {
                echo "<th>Scan | First Row Speeds</th>";
            }
        ?>
        <th>Active Time</th>
        <th>Passive Time</th>
    </tr>
    <?php
    $entry_rates = array();
    $click_loads = array();
    $active_time_total = 0;
    $passive_time_total = 0;

    foreach ($phrase_nums as $phrase_num){
        $phrase_num = $phrase_num["phrase_num"];

        $query = "SELECT * FROM ".$_POST["table_name"]." WHERE phrase_num=".$phrase_num;
        $phrase_data = make_query($connection, $query);

        $phrase_text = $phrase_data[0]["phrase"];
        $phrase_typed = end($phrase_data)["typed_text"];
        while ($phrase_typed == ""){
           $phrase_typed = prev($phrase_data)["typed_text"];
        }

        $num_selections = count($phrase_data);
        $selection_num = 1;
        $period_offset = 0;
        $num_presses = 0;
        $avg_speed = 0;
        $avg_scan_delay = 0;
        $avg_extra_delay = 0;

        $active_time = 0;
        $passive_time = 0;
        $options_start = 0;
        $last_selection_time=0;

        foreach ($phrase_data as $selection_data){

            // Find First click time for phrase and finish time
            if ($selection_num == 1+$period_offset AND $selection_data["selection"] == "."){
                $period_offset++;
                $selection_num++;
                continue;
            } else if ($selection_num == 1+$period_offset){
                $phrase_start = json_decode($selection_data["abs_click_times"])[0];
            } else if ($selection_num == $num_selections){
                $phrase_end = $selection_data["timestamp"];
            }

            // Check if Options Manager is open and augment passive time
            if ($selection_data["selection"] == "Options" AND $options_start == 0){
                $options_start = json_decode($selection_data["abs_click_times"])[0];
            } else if ($options_start != 0){
                $options_end = json_decode($selection_data["abs_click_times"])[0];
                $passive_time += ($options_end-$options_start);
                $options_start = 0;
            }

            //Check for large gaps between selections
            if ($last_selection_time != 0 AND $selection_data["timestamp"] - $last_selection_time > 30){

                $passive_time += ($selection_data["timestamp"] - $last_selection_time);
            }

            $last_selection_time = $selection_data["timestamp"];
            $num_presses += count(json_decode($selection_data["abs_click_times"]));

            if ($_POST["interface"] == "nomon"){
                $avg_speed += $selection_data["rotate_ind"];
            } else if ($_POST["interface"] == "rowcol") {
                $avg_scan_delay += $selection_data["scan_delay"];
                $avg_extra_delay += $selection_data["extra_delay"];
            }

            $selection_num++;
        }
        if ($_POST["phase"] == "text"){
            $click_load = round($num_presses/strlen($phrase_typed), 2);
            $entry_rate = round(strlen($phrase_typed)/($phrase_end-$phrase_start)*60/5, 2);
        } else {
            $click_load = round($num_presses/$num_selections, 2);
            $entry_rate = round($num_selections/($phrase_end-$phrase_start)*60, 2);
        }


        $avg_speed = round($avg_speed/$num_selections);
        $avg_scan_delay = round($avg_scan_delay/$num_selections);
        $avg_extra_delay = round($avg_extra_delay/$num_selections);
        $passive_time = round($passive_time, 1);
        $active_time = round($phrase_end-$phrase_start-$passive_time, 1);

        array_push($entry_rates, $entry_rate);
        array_push($click_loads, $click_load);
        $active_time_total += $active_time;
        $passive_time_total += $passive_time;


        echo "<tr>";
            ?>
            <td>
                <input class='btn clickable' id="phrase_button_<?php echo $phrase_num ?>" type="button" value="<?php echo $phrase_num ?>"
                        onclick=phrase_button_fun("<?php echo $_POST["table_name"] ?>","<?php echo $phrase_num ?>") />
            </td>
            <?php
            echo "<td>${phrase_text}</td>";
            echo "<td>${phrase_typed}</td>";
            echo "<td>${entry_rate}</td>";
            echo "<td>${click_load}</td>";
            if ($_POST["interface"] == "nomon"){
                echo "<td>${avg_speed}</td>";
            } else if ($_POST["interface"] == "rowcol") {
                echo "<td>${avg_scan_delay} | ${avg_extra_delay}</td>";
            }
            echo "<td>".gmdate("H:i:s", $active_time)."</td>";
            echo "<td>".gmdate("H:i:s", $passive_time)."</td>";
        echo "</tr>";
    }
    ?>
    <tr>
        <th>Mean (std)</th>
        <th>N/A</th>
        <th>N/A</th>
        <?php
            echo "<th>".round(Mean($entry_rates),2)." (".round(Stand_Deviation($entry_rates),2).")</th>";

            echo "<th>".round(Mean($click_loads),2)." (".round(Stand_Deviation($click_loads),2).")</th>";
        ?>
        <th>N/A</th>
        <?php
            echo "<th>".gmdate("H:i:s", $active_time_total)." (total)</th>";

            echo "<th>".gmdate("H:i:s", $passive_time_total)." (total)</th>";
        ?>
    </tr>
</table>

<script>
    function phrase_button_fun(table_name, phrase_num) {
        $.ajax({
            url: "../php/gather_phrase_data.php",
            context: document.body,
            method: "POST",
            data: {'table_name': table_name,
                    'phrase_num': phrase_num,}
        }).done(function (response) {

            $('#phrase_data').html(response);
        });
    }
</script>


