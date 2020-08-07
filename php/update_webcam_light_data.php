<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$webcam_reset = $_POST['webcam_reset'];
$webcam_trigger = $_POST['webcam_trigger'];
$webcam_bottom = $_POST['bottom_pos'];
$user_id = $_POST['user_id'];

$query = "UPDATE user_info SET webcam_reset = '$webcam_reset', webcam_trigger = '$webcam_trigger', webcam_bottom = '$webcam_bottom'
  WHERE id = '$user_id'";

$result = mysqli_query($connection, $query);

$connection->close();
?>
