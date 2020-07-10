<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$exit_code = 0;
$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_GET['user_id'];
$condition = $_GET['condition'];
$order = $_GET['order'];
$session = $_GET['session'];

$query = "SELECT COUNT(1) FROM survey_info WHERE id = '$user_id' AND software = '$condition' AND software_order = '$order'
 AND session = '$session'";

$result = mysqli_query($connection, $query);

$result_array = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($result_array, $row);
    }
}

echo json_encode($result_array);

$connection->close();
?>

