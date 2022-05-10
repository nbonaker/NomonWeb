<?php
$text_data = $_POST['text'];
$id = $_POST['id'];
$user_id = $_POST['user_id'];

$save_file='/var/www/keyboardstudy.csail.mit.edu/html/v1.1.2/html/data_analysis/notes/'.$user_id.'/'.$id.'.txt';
file_put_contents($save_file, $text_data);
echo($save_file);
?>