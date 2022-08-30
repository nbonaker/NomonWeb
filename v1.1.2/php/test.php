<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = 77;
$session = 20;

$table_name = "nomon_session_".$session."_user_".$user_id."_mouseloc";

$query = "CREATE TABLE IF NOT EXISTS ".$table_name." (timestamp DOUBLE, mousex INT, mousey INT, targetx INT, targety INT, radius INT)";
$result = mysqli_query($connection, $query);

$folder = '/var/www/keyboardstudy.csail.mit.edu/mouse_data_77/';
$files = scandir($folder);
foreach($files as $file) {
    echo $file;
    $myfile = fopen($folder."".$file, "r") or die("Unable to open file!");

    $data_string = fgets($myfile);
    fclose($myfile);

    $data_array = json_decode($data_string);

    foreach ($data_array as &$value) {
        $timestamp = $value->timestamp;
        $mousex = $value->mousex;
        $mousey = $value->mousey;
        $targetx = $value->targetx;
        $targety = $value->targety;
        $radius = $value->radius;

        $query = "INSERT INTO ".$table_name." (timestamp, mousex, mousey, targetx, targety, radius) VALUES (".$timestamp.", ".$mousex.", ".$mousey.", ".$targetx.", ".$targety.", ".$radius.")";
        $result = mysqli_query($connection, $query);
    }
}



$connection->close();

?>

