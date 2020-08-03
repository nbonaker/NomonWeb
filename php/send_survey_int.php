<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$exit_code = 0;
$connection = mysqli_connect($host, $username, $password, $dbname);

// create user table if not exists
$query = "CREATE TABLE IF NOT EXISTS survey_info (id INT, software Varchar(1), software_order INT, session INT, type_quick INT,
 type_accurate INT, many_errors INT, corr_ease INT, recovery INT, audio INT, free_response_1 TEXT, free_response_2 TEXT)";
$result = mysqli_query($connection, $query);

$user_id = $_POST['user_id'];
$condition = $_POST['condition'];
$order = $_POST['order'];
$session = $_POST['session'];
$q1 = $_POST['q1'];
$q2 = $_POST['q2'];
$q3 = $_POST['q3'];
$q4 = $_POST['q4'];
$q5 = $_POST['q5'];
$q6 = $_POST['q6'];
$fr1 = $_POST['fr1'];
$fr2 = $_POST['fr2'];

$query = "INSERT INTO survey_info (id, software, software_order, session, type_quick, type_accurate, many_errors, corr_ease,
 recovery, audio, free_response_1, free_response_2) VALUES ('$user_id', '$condition', '$order', '$session', '$q1', '$q2', '$q3', '$q4',
 '$q5', '$q6', '$fr1', '$fr2')";

$result = mysqli_query($connection, $query);

$connection->close();
?>

