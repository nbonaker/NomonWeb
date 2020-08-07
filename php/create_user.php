<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_POST['user_id'];
echo $user_id;

$result = mysqli_query($connection, "INSERT INTO user_info (id, webcam_type) VALUES ('$user_id', face)");

$connection->close();
?>
