<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$exit_code = 0;
$connection = mysqli_connect($host, $username, $password, $dbname);

// create user table if not exists
$query = "CREATE TABLE IF NOT EXISTS final_survey_info (id INT, software Varchar(1), software_order INT, session INT, preferred INT,
 free_response_1 TEXT, free_response_2 TEXT)";
$result = mysqli_query($connection, $query);

$user_id = $_POST['user_id'];
$condition = $_POST['condition'];
$order = $_POST['order'];
$session = $_POST['session'];
$q1 = $_POST['q1'];
$fr1 = $_POST['fr1'];
$fr2 = $_POST['fr2'];

$query = "INSERT INTO final_survey_info (id, software, software_order, session, preferred, free_response_1, free_response_2)
VALUES ('$user_id', '$condition', '$order', '$session', '$q1', '$fr1', '$fr2')";

$result = mysqli_query($connection, $query);

$connection->close();
?>

