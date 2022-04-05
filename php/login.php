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

$user_name = $_POST['username'];
$pin = $_POST['pin'];

//if (!is_string($user_name) || strlen($user_name) > 20 ||!is_string($pin) || strlen(pin) != 4){
//    echo 0;
//    exit();
//}


$connection = mysqli_connect($host, $username, $password, $dbname);



$query = "SELECT * FROM user_info WHERE username = '$user_name'";
$result_array = make_query($connection, $query);

if (count($result_array[0]) > 0){
//    check PIN
    $query = "SELECT pin FROM user_info WHERE username = '$user_name'";
    $result_array = make_query($connection, $query);

    if ($result_array[0]["pin"] == $pin){
        echo 1;
    } else {
        echo 0;
    }
} else {
//    create user
    $query = "INSERT INTO user_info (username, pin) VALUES ('$user_name', '$pin')";
    $result_array = make_query($connection, $query);
    echo 2;
}


$connection->close();
?>
