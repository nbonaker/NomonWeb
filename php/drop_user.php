<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_POST['user_id'];
$nomon_sessions = $_POST['nomon_sessions'];
$rowcol_sessions = $_POST['rowcol_sessions'];
$login_password = $_POST['password'];

if ($login_password !== $password) {
    echo "Login Failed!";
} else {
    for ($session_num = 1; $session_num  <= $nomon_sessions; $session_num ++){
        $query = "DROP TABLE IF EXISTS nomon_session_".$session_num."_user_".$user_id;
        $result = mysqli_query($connection, $query);
        echo $query;
        echo "\n";
    }
    for ($session_num = 1; $session_num  <= $rowcol_sessions; $session_num ++){
        $query = "DROP TABLE IF EXISTS rowcol_session_".$session_num."_user_".$user_id;
        $result = mysqli_query($connection, $query);
        echo $query;
        echo "\n";
    }

    $query = "DELETE FROM study_info WHERE id=".$user_id;
    $result = mysqli_query($connection, $query);
    echo $query;
    echo "\n";

    $query = "DELETE FROM user_info WHERE id=".$user_id;
    $result = mysqli_query($connection, $query);
    echo $query;
}

$connection->close();

?>