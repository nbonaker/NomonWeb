<?php

include '../../mysql_login.php';


function make_query($connection, $query) {
    $result = mysqli_query($connection, $query);
    $result_array = array();

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            array_push($result_array, $row);
        }
    }
    return $result_array;
}


$connection = mysqli_connect($host, $username, $password, $dbname);

$username = $_POST['username'];
$is_mobile = $_POST['is_mobile'];
$timestamp = $_POST['timestamp'];
$entry_rate = $_POST['entry_rate'];
$error_rate = $_POST['error_rate'];
$click_load = $_POST['click_load'];

// check if scoreboard table exists
$query = "CREATE TABLE IF NOT EXISTS scoreboard (username Varchar(20), is_mobile INT, timestamp DOUBLE, entry_rate FLOAT, error_rate FLOAT, click_load FLOAT)";

$result_array = make_query($connection, $query);

// check if user has started study

$query = "INSERT INTO scoreboard (username, is_mobile, timestamp, entry_rate, error_rate, click_load) VALUES ('$username', '$is_mobile', '$timestamp', '$entry_rate', '$error_rate', '$click_load')";

$result_array = make_query($connection, $query);

echo $query;

$connection->close();

?>
