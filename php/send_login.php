<?php

include '../../mysql_login.php';

$exit_code = 0;
$connection = mysqli_connect($host, $username, $password, $dbname);

// create user table if not exists
$query = "CREATE TABLE IF NOT EXISTS user_info (id INT, click_dist JSON, Z INT, ksigma FLOAT, ksigma0 FLOAT, rotate_index INT, scan_delay INT, extra_delay INT, y_li JSON, learn TINYINT, pause TINYINT, sound TINYINT, webcam_reset FLOAT, webcam_trigger FLOAT, webcam_type Varchar(7), webcam_bottom FLOAT)";
$result = mysqli_query($connection, $query);

$user_id = $_GET['user_id'];

$exit_code = 1;
$query = "SELECT * FROM user_info WHERE username = '$user_id'";

$result_array = array();
$result = mysqli_query($connection, $query);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($result_array, $row);
    }
}
/* send a JSON encded array to client */

echo json_encode($result_array);
$connection->close();
?>

