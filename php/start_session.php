<?php

$host         = "localhost";
$username     = "root";
$password     = "";
$dbname       = "userDB";

$connection = mysqli_connect($host, $username, $password, $dbname);

$software = $_POST['software'];
$user_id = $_POST['user_id'];
$session = $_POST['session'];

$table_name = $software."_session_".$session."_user_".$user_id;

$query = "CREATE TABLE IF NOT EXISTS ".$table_name." (phrase TEXT, phrase_num INT, typed_text TEXT, selection TEXT, timestamp FLOAT, rotate_ind INT)";
$result = mysqli_query($connection, $query);

echo $query;

$connection->close();
?>

