<?php

$host         = "localhost";
$username     = "root";
$password     = "";
$dbname       = "userDB";

$connection = mysqli_connect($host, $username, $password, $dbname);

$click_dist = $_POST['click_dist'];
$user_id = $_POST['user_id'];
$Z = $_POST['Z'];
$ksigma = $_POST['$ksigma'];
$ksigma0 = $_POST['$ksigma0'];
echo $click_dist;

$query = "UPDATE user_info SET click_dist = '$click_dist', Z = '$Z', ksigma = '$ksigma', ksigma0 = '$ksigma0'  WHERE id = '$user_id'";

$result = mysqli_query($connection, $query);

$connection->close();
?>
