<?php
    include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';

    $connection = mysqli_connect($host, $username, $password, $dbname);

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

    echo "<h3><i>Showing data from phrase ${_POST["phrase_num"]}</i></h3>";

?>

<pre>

<?php
$query = "SELECT * FROM ".$_POST["table_name"]." WHERE phrase_num=".$_POST["phrase_num"];
$phrase_data = make_query($connection, $query);
print_r($phrase_data);
?>
</pre>
