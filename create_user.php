<?php

$host         = "localhost";
$username     = "root";
$password     = "";
$dbname       = "userDB";

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_POST['user_id'];
echo $user_id;

$result = mysqli_query($connection, "INSERT INTO user_info (id) VALUES ('$user_id');

$connection->close();
?>
