<?php

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

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';
$connection = mysqli_connect($host, $username, $password, $dbname);
$participant_ids = array(7);

$query = "show tables";
$result_array = make_query($connection, $query);

foreach ($result_array as $table_name){
    echo $table_name["Tables_in_MIuserDB"];
}

?>