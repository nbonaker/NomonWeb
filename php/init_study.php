<?php

$host         = "localhost";
$username     = "root";
$password     = "";
$dbname       = "userDB";

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_POST['user_id'];

// check if user has started study
$query = "SELECT COUNT(id) FROM study_info WHERE id = '$user_id'";
$result = mysqli_query($connection, $query);
$result_array = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($result_array, $row);
    }
}
$user_exists = $result_array[0]['COUNT(id)'];

// if new user, construct entry in study_info table
if (!$user_exists){
        // shuffle iv and oov phrase data with 2 to 1 mix
        $file_path = '/var/www/nomon.csail.mit.edu/html/resources/phrases_iv.json';
        $data = file_get_contents($file_path);
        $phrases_iv = json_decode($data);

        $file_path = '/var/www/nomon.csail.mit.edu/html/resources/phrases_oov.json';
        $data = file_get_contents($file_path);
        $phrases_oov = json_decode($data);

        $phrases_shuffled = array();

        $phrase_index = 0;
        while (count($phrases_oov) > 0 && count($phrases_iv) > 0){
                if ($phrase_index % 3){
                        $rand_index = rand(0, count($phrases_iv)-1);
                        $sample_phrase = $phrases_iv[$rand_index];
                        unset($phrases_iv[$rand_index]);
                        $phrases_iv = array_values($phrases_iv);
                        array_push($phrases_shuffled, $sample_phrase);
                } else {
                        $rand_index = rand(0, count($phrases_oov)-1);
                        $sample_phrase = $phrases_oov[$rand_index];
                        unset($phrases_oov[$rand_index]);
                        $phrases_oov = array_values($phrases_oov);
                        array_push($phrases_shuffled, $sample_phrase);
                }
                $phrase_index++;
        }

        $phrases_json = json_encode($phrases_shuffled);

        //determine starting software
        $query = "SELECT first_software FROM study_info ORDER BY id DESC LIMIT 1";
        $result = mysqli_query($connection, $query);
        $result_array = array();

        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                array_push($result_array, $row);
            }
        }
        $last_software = $result_array[0]['first_software'];

        if (!$last_software){
                $last_software = "nomon";
        }else{
                if ($last_software == "nomon"){
                        $last_software = "rowcol";
                }else{
                        $last_software = "nomon";
                }
        }

        //insert user into study_info table
        $query = "INSERT INTO study_info (id, sessions, phrase_queue, first_software) VALUES ('$user_id', 0, '$phrases_json', '$last_software')";
        $result = mysqli_query($connection, $query);
}

// query user from study_info table to send to front end
$query = "SELECT * FROM study_info WHERE id = '$user_id'";
$result = mysqli_query($connection, $query);
$result_array = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        array_push($result_array, $row);
    }
}

echo json_encode($result_array);

$connection->close();

?>
