<?php

include '/var/www/nomon.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_POST['user_id'];
$scan_delay = $_POST['scan_delay'];
$extra_delay = $_POST['extra_delay'];
$sound_bool = $_POST['sound'];
$sound = (int)($sound_bool === 'true');

$query = "UPDATE user_info SET scan_delay = '$scan_delay', extra_delay = '$extra_delay', sound = '$sound'
  WHERE id = '$user_id'";

$result = mysqli_query($connection, $query);

$connection->close();
?>
