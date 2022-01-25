<?php

include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

$connection = mysqli_connect($host, $username, $password, $dbname);

$user_id = $_POST['user_id'];

// check if study table exists
$query = "CREATE TABLE IF NOT EXISTS study_info (id INT, nomon_practice INT, rowcol_practice INT, rowcol_symbol INT, nomon_symbol INT, nomon_text INT, rowcol_text INT, dates JSON, nomon_phrase_queue JSON, rowcol_phrase_queue JSON, phase Varchar(10)";
$result = mysqli_query($connection, $query);

$result = mysqli_query($connection, $query);

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
        $file_path = '/var/www/keyboardstudy.csail.mit.edu/html/phrases/phrases_iv.json';
        $data = file_get_contents($file_path);
        $phrases_iv = json_decode($data);

        $file_path = '/var/www/keyboardstudy.csail.mit.edu/html/phrases/phrases_oov.json';
        $data = file_get_contents($file_path);
        $phrases_oov = json_decode($data);

        for ($software_ind = 0; $software_ind < 2; $software_ind++){
                $temp_iv = $phrases_iv;
                $temp_oov = $phrases_oov;
                $phrases_shuffled = array();

                $phrase_index = 0;
                while (count($temp_oov) > 0 && count($temp_iv) > 0){
                        if ($phrase_index % 3){
                                $rand_index = rand(0, count($temp_iv)-1);
                                $sample_phrase = $temp_iv[$rand_index];
                                unset($temp_iv[$rand_index]);
                                $temp_iv = array_values($temp_iv);
                                array_push($phrases_shuffled, $sample_phrase);
                        } else {
                                $rand_index = rand(0, count($temp_oov)-1);
                                $sample_phrase = $temp_oov[$rand_index];
                                unset($temp_oov[$rand_index]);
                                $temp_oov = array_values($temp_oov);
                                array_push($phrases_shuffled, $sample_phrase);
                        }
                        $phrase_index++;
                }

                if ($software_ind == 0){
                        $nomon_phrases_json = json_encode($phrases_shuffled);
                } else {
                        $rowcol_phrases_json = json_encode($phrases_shuffled);
                }

        }


        //insert user into study_info table
        $query = "INSERT INTO study_info (id, nomon_phrase_queue, rowcol_phrase_queue) VALUES ('$user_id', '$nomon_phrases_json', '$rowcol_phrases_json')";
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
