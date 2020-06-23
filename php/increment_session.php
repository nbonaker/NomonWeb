<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_POST['user_id'];
$sessions = $_POST['sessions'];
$dates = $_POST['dates'];
$phrase_queue = $_POST['phrase_queue'];
$software = $_POST['software'];


// query user from study_info table to send to front end
$query = "UPDATE study_info SET ".$software."_sessions = '$sessions', dates = '$dates', ".$software."_phrase_queue = '$phrase_queue' WHERE id = '$user_id'";
$result = mysqli_query($connection, $query);

echo $query;

$connection->close();

?>