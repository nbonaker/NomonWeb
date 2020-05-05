<?php

$host         = "localhost";
$username     = "root";
$password     = "";
$dbname       = "userDB";
$result = 0;

/* Create connection */
$conn = new mysqli($host, $username, $password, $dbname);

/* Check connection */
if ($conn->connect_error) {
    die("Connection to database failed: " . $conn->connect_error);
}

/* Get data from Client side using $_POST array */
$uname  = $_POST['user_id'];
$id_result_array = array();

$uname = (int)$num;
$sql_id_query = "SELECT count(*) FROM user_info WHERE id = (?)  ";
$stmt_id_query   = $conn->prepare($sql_id_query);
$result = $conn->query($stmt_id_query);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($id_result_array, $row);
    }
}

echo json_encode($result_array);

$conn->close();

?>