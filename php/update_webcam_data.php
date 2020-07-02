<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$webcam_reset = $_POST['webcam_reset'];
$webcam_trigger = $_POST['webcam_trigger'];
$user_id = $_POST['user_id'];

echo $click_dist;

$query = "UPDATE user_info SET webcam_reset = '$webcam_reset', webcam_trigger = '$webcam_trigger'
  WHERE id = '$user_id'";

$result = mysqli_query($connection, $query);

$connection->close();
?>
