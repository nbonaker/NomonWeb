<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_POST['user_id'];
$sessions = $_POST['sessions'];
$dates = $_POST['dates'];
$phrase_queue = $_POST['phrase_queue'];
$software = $_POST['software'];
$phase = $_POST['phase'];
$new_phase = $_POST['new_phase'];

//query from study info table to get phase session number
$query = "SELECT ".$software."_".$phase." FROM study_info WHERE id = '$user_id'";
$result = mysqli_query($connection, $query);
$result_array = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($result_array, $row);
    }
}

$phase_session_num = $result_array[0][$software."_".$phase] + 1;

// query user from study_info table to send to front end
$query = "UPDATE study_info SET ".$software."_".$phase." = '$phase_session_num', dates = '$dates', phase = '$new_phase', ".$software."_phrase_queue = '$phrase_queue' WHERE id = '$user_id'";

echo $query;

$result = mysqli_query($connection, $query);



$connection->close();

?>