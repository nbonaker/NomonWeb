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

$user_name = $_GET['username'];

$query = "CREATE TABLE IF NOT EXISTS user_info (username Varchar(20), pin Varchar(4), click_dist JSON, Z INT, ksigma FLOAT, ksigma0 FLOAT, rotate_index INT, y_li JSON)";
$result_array = make_query($connection, $query);

$query = "SELECT * FROM user_info WHERE username = '$user_name'";
$result_array = make_query($connection, $query);

echo json_encode($result_array);
$connection->close();
?>
