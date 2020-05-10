<?php

include '/var/www/nomon.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_POST['user_id'];
echo $user_id;

$result = mysqli_query($connection, "INSERT INTO user_info (id) VALUES ('$user_id')");

$connection->close();
?>
