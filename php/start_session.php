<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$software = $_POST['software'];
$user_id = $_POST['user_id'];
$session = $_POST['session'];

$table_name = $software."_session_".$session."_user_".$user_id;

$query = "CREATE TABLE IF NOT EXISTS ".$table_name." (phrase TEXT, phrase_num INT, typed_text TEXT, selection TEXT, timestamp DOUBLE, rotate_ind INT, scan_delay INT, extra_delay INT, abs_click_times JSON, rel_click_times JSON, click_scan_pos JSON)";
$result = mysqli_query($connection, $query);

echo $query;

$connection->close();
?>

