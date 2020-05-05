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
/* validate whether user has entered all values. */
var numbers = /^[0-9]+$/;
if(!$uname){
    $result = 2;
}else (!inputtxt.value.match(numbers)) {
    $result = 3;
}
else {
    $id_result_array = array();
    $uname = parseInt($uname)
    //check if user ID already exists:
    $sql_id_query = "SELECT count(*) FROM user_info WHERE id = (?)  ";
    $stmt_id_query   = $conn->prepare($sql_id_query);
    $result = $conn->query($stmt_id_query);

    if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($id_result_array, $row);
    }
    }
    echo $id_result_array;


    //SQL query to get results from database
    //$sql    = "insert into users (user_id) values (?)  ";
    //$stmt   = $conn->prepare($sql);
    //$stmt->bind_param('sss', $uname);
    //if($stmt->execute()){
    //    $result = 1;
    //}
}
echo $result;
$conn->close();

?>