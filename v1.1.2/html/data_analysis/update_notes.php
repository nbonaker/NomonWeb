<?php
$text_data = $_POST['text'];
$id = $_POST['id'];

$save_file='/var/www/keyboardstudy.csail.mit.edu/html/v1.1.2/html/data_analysis/85_notes/'.$id.'.txt';
file_put_contents($save_file, $text_data);
?>