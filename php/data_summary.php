<?php

include '/var/www/nomon.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$result = mysqli_query($connection, "SELECT id from study_info");
$user_ids = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($user_ids, $row["id"]);
    }
}

$user_data = array();
foreach($user_ids as $user_id) {
    $result = mysqli_query($connection, "SELECT sessions FROM study_info WHERE id = '$user_id'");
    $num_sessions = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            array_push($num_sessions, $row["sessions"]);
        }
    }
    $num_sessions = $num_sessions[0];

    $session_array = array();
    for ($session_num = 1; $session_num <= $num_sessions; $session_num++) {
        $table_name =  "nomon_session_".$session_num."_user_".$user_id;
        $words_per_min = array();

        $result = mysqli_query($connection, "SELECT MAX(phrase_num) FROM ".$table_name );
        $num_phrases = array();
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                array_push($num_phrases, $row["MAX(phrase_num)"]);
            }
        }
        $num_phrases = $num_phrases[0];

        $phrase_array = array();
        for ($phrase_num = 1; $phrase_num <= $num_phrases; $phrase_num++) {
            $cur_phrase_data = array();

            $result = mysqli_query($connection, "SELECT typed_text, timestamp, abs_click_times FROM ".$table_name." WHERE phrase_num = '$phrase_num' ORDER BY timestamp ASC");
            $phrase_data = array();
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    array_push($phrase_data, $row);
                }
            }
            $start_time = json_decode($phrase_data[0]["abs_click_times"])[0];
            $end_time = end($phrase_data)["timestamp"];

            $typed_text = end($phrase_data)["typed_text"];
            $num_words = count(explode(" ", $typed_text));

            $num_chars = strlen($typed_text);
            $num_press = 0;
            for ($sel_num = 0; $sel_num < count($phrase_data); $sel_num++){
                $num_press = $num_press + count(json_decode($phrase_data[$sel_num]["abs_click_times"]));
            }

            $wpm = $num_words / ($end_time - $start_time) * 60;
            $cur_phrase_data["wpm"] = $wpm;

            $ppc = $num_press / $num_chars;
            $cur_phrase_data["ppc"] = $ppc;

            array_push($phrase_array, $cur_phrase_data);

        }
        $session_array[$session_num] = $phrase_array;
    }
    $user_data[$user_id] = $session_array;
}
echo json_encode($user_data);

?>
