<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$exit_code = 0;
$connection = mysqli_connect($host, $username, $password, $dbname);

// create user table if not exists
$query = "CREATE TABLE IF NOT EXISTS tlx_info (id INT, software Varchar(1), software_order INT, session INT,
mental_load INT, physical_load INT, temporal_load INT, performance_load INT, effort_load INT, frustration_load INT,
mental_weight INT, physical_weight INT, temporal_weight INT, performance_weight INT, effort_weight INT,
frustration_weight INT)";

$result = mysqli_query($connection, $query);

$user_id = $_POST['user_id'];
$condition = $_POST['condition'];
$order = $_POST['order'];
$session = $_POST['session'];

$mental_load = $_POST['mental_load'];
$physical_load = $_POST['physical_load'];
$temporal_load = $_POST['temporal_load'];
$performance_load = $_POST['performance_load'];
$effort_load = $_POST['effort_load'];
$frustration_load = $_POST['frustration_load'];

if (isset($_POST['mental_weight'])) {
    $mental_weight = $_POST['mental_weight'];
    $physical_weight = $_POST['physical_weight'];
    $temporal_weight = $_POST['temporal_weight'];
    $performance_weight = $_POST['performance_weight'];
    $effort_weight = $_POST['effort_weight'];
    $frustration_weight = $_POST['frustration_weight'];

    $query = "INSERT INTO tlx_info (id, software, software_order, session, mental_load, physical_load,
    temporal_load, performance_load, effort_load, frustration_load, mental_weight, physical_weight,
    temporal_weight, performance_weight, effort_weight, frustration_weight) VALUES ('$user_id', '$condition', '$order',
    '$session', '$mental_load', '$physical_load', '$temporal_load', '$performance_load', '$effort_load',
    '$frustration_load', '$mental_weight', '$physical_weight', '$temporal_weight', '$performance_weight', '$effort_weight',
    '$frustration_weight')";

} else {
    $query = "INSERT INTO tlx_info (id, software, software_order, session, mental_load, physical_load,
    temporal_load, performance_load, effort_load, frustration_load) VALUES ('$user_id', '$condition', '$order',
    '$session', '$mental_load', '$physical_load', '$temporal_load', '$performance_load', '$effort_load',
    '$frustration_load')";
}

$result = mysqli_query($connection, $query);

$connection->close();
?>

