<?php

include '/var/www/nomon.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$click_dist = $_POST['click_dist'];
$user_id = $_POST['user_id'];
$Z = $_POST['Z'];
$ksigma = $_POST['ksigma'];
$ksigma0 = $_POST['ksigma0'];
$y_li = $_POST['y_li'];
$rotate_index = $_POST['rotate_index'];
$learn_bool = $_POST['learn'];
$learn = (int)($learn_bool === 'true');
$pause_bool = $_POST['pause'];
$pause = (int)($pause_bool === 'true');
$sound_bool = $_POST['sound'];
$sound = (int)($sound_bool === 'true');

echo $click_dist;

$query = "UPDATE user_info SET click_dist = '$click_dist', Z = '$Z', ksigma = '$ksigma', ksigma0 = '$ksigma0',
 rotate_index = '$rotate_index', y_li = '$y_li', learn = '$learn', pause = '$pause', sound = '$sound'
  WHERE id = '$user_id'";

$result = mysqli_query($connection, $query);

$connection->close();
?>
