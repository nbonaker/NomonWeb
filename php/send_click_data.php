<?php

include '/var/www/nomon.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$software = $_POST['software'];
$user_id = $_POST['user_id'];
$session = $_POST['session'];

$table_name = $software."_session_".$session."_user_".$user_id;

$phrase = $_POST['phrase'];
$phrase_num = $_POST['phrase_num'];
$typed_text = $_POST['typed_text'];
$selection = $_POST['selection'];
$timestamp = $_POST['timestamp'];
$rotate_ind = $_POST['rotate_ind'];
$abs_click_times = $_POST['abs_click_times'];
$rel_click_times = $_POST['rel_click_times'];

$query = "INSERT INTO ".$table_name." (phrase, phrase_num, typed_text, selection, timestamp, rotate_ind, abs_click_times, rel_click_times) VALUES ('$phrase', '$phrase_num', '$typed_text', '$selection', '$timestamp', '$rotate_ind', '$abs_click_times', '$rel_click_times')";
$result = mysqli_query($connection, $query);

echo $query;

$connection->close();
?>
