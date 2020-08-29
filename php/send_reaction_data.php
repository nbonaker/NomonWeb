<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_POST['user_id'];

// create user table if not exists
$query = "CREATE TABLE IF NOT EXISTS reaction_info (id INT, switch_type Varchar(6), srt JSON, dpt JSON)";
$result = mysqli_query($connection, $query);


$switch = $_POST['switch'];
$srt = $_POST['srt'];
$dpt = $_POST['dpt'];


$query = "INSERT INTO reaction_info (id, switch_type, srt, dpt) VALUES ('$user_id', '$switch', '$srt', '$dpt')";
$result = mysqli_query($connection, $query);

echo $query;

$connection->close();
?>

