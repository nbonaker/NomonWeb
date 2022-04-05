<!DOCTYPE html>
<html>
<title>Study Data</title>
<link href="../../icon.png"
      rel="icon"
      type="image/png">
<head>
    <style>
        body {
            font-family: "Helvetica", Gadget, sans-serif;
        }

        table, td, th {
            border: 1px solid black;
        }

        table {
            border-collapse: collapse;
        }

        th {
            height: 30px;
        }

        .btn {
            border: none;
            color: white;
            padding: 5px 15px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-family: Helvetica, sans-serif;
            width: 3em;
            font-size: 1.1vw;
            margin: 1px 1px;
            cursor: pointer;
            border-radius: 4px;
        }

        .clickable {
            background-color: #0056ff;
        }

        .unclickable {
            background-color: rgba(0, 89, 255, 0.32);
        }
    </style>
</head>
<body>
<?php
    include '../../mysql_login.php';
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
?>

<h2><b>Leader Board</b></h2>

<table id="user_table" style="width:100%">
    <tr>
        <th>Rank</th>
        <th>Username</th>
        <th>Date | Time</th>
        <th>Entry Rate</th>
        <th>Click Load</th>
        <th>Error Rate</th>
    </tr>
        <?php
            $query = "SELECT a.* FROM scoreboard a INNER JOIN (SELECT username, MAX(entry_rate) entry_rate FROM scoreboard WHERE error_rate < 0.1 GROUP BY username) b ON a.username= b.username AND a.entry_rate = b.entry_rate ORDER BY entry_rate DESC";
            $result_array = make_query($connection, $query);

            $rank = 1;

            foreach ($result_array as $user_info) {

         ?>
                <tr>
                    <th><?php echo $rank ?></th>
                    <th><?php echo $user_info['username'] ?></th>
                    <th><?php echo date('m/d/Y | H:i:s', $user_info['timestamp']).' EDT' ?></th>
                    <th><?php echo $user_info['entry_rate'] ?></th>
                    <th><?php echo $user_info['click_load'] ?></th>
                    <th><?php echo $user_info['error_rate'] ?></th>
                </tr>
        <?php

                $rank = $rank + 1;
            }
        ?>



</table>


</body>
</html>