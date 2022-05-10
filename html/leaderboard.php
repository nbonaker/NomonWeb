<?php
$page = $_SERVER['PHP_SELF'];
$sec = "60";
?>

<!DOCTYPE html>
<html>
<title>Live Nomon Leaderboard!</title>
<link href="../../icon.png"
      rel="icon"
      type="image/png">
<head>
    <meta http-equiv="refresh" content="<?php echo $sec?>;URL='<?php echo $page?>'">
    <link rel="stylesheet" type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.1.3/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css">
    <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'>

    <script src="https://code.jquery.com/jquery-3.5.1.js"></script>
    <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>
</head>
    <style>
        body {
            font-family: "Helvetica", Gadget, sans-serif;
        }

        table, td, th {
            border: 1px solid black;
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

<div style="width: 100%; text-align: center">
    <h1><b>Live Leader Board</b></h1>
    <h2>CHI '22 Nomon Text Entry Competition</h2>
</div>
<table id="leaderboard" class="table table-striped">
    <thead>
    <tr style="text-align: right; position: sticky; background-color: white; top: 0;">
        <th style="width: 3%;">Rank</th>
        <th>Username</th>
        <th>Date | Time</th>
        <th>Entry Rate (selections/min)</th>
        <th>Click Load (clicks/selection)</th>
        <th>Error Rate</th>
    </tr>
    </thead>
    <tbody>
        <?php
            $query = "SELECT username, MAX(timestamp) timestamp, ROUND(AVG(entry_rate), 2) entry_rate, ROUND(AVG(click_load), 2) click_load, ROUND(AVG(error_rate), 2) error_rate,  COUNT(*) FROM
                        (select * from (
                        select username,
                               entry_rate,
                               click_load,
                           timestamp,
                           error_rate,
                               row_number() over (partition by username order by entry_rate desc) as user_rank
                        from (select * from scoreboard where error_rate < 0.15) a) ranks
                    where user_rank <= 2) top_scores
                    GROUP BY username
                    HAVING COUNT(*) > 1 AND error_rate <= 0.05
                    order by entry_rate desc;";
            $result_array = make_query($connection, $query);

            $rank = 1;

            foreach ($result_array as $user_info) {

                if ($rank == 1){
        ?>
                <tr style="background-color: rgb(255,242,179); font-weight:bold">
        <?php
                } else if ($rank == 2){
        ?>
                <tr style="background-color: rgb(230,238,243); font-weight:bold">
        <?php
                } else if ($rank == 3){
        ?>
                <tr style="background-color: rgb(229,194,155); font-weight:bold">
        <?php
                } else {
        ?>
                <tr>
        <?php } ?>

                    <td><?php echo $rank ?></td>
                    <?php   if ($rank < 4){ ?>
                    <td style="font-size: 20pt">
                    <?php } else { ?>
                    <td>
                    <?php }
                            if ($rank == 1){ ?>
                                🥇
                    <?php   } else if ($rank == 2) {?>
                                🥈
                    <?php   } else if ($rank == 3) {?>
                                🥉
                    <?php   }
                            echo $user_info['username'];
                    ?>
                    </td>
                    <td><?php echo date('m/d/Y | H:i:s', $user_info['timestamp']).' EDT' ?></td>
                    <td><?php echo $user_info['entry_rate'] ?></td>
                    <td><?php echo $user_info['click_load'] ?></td>
                    <td><?php echo $user_info['error_rate'] ?></td>
                </tr>
        <?php

                $rank = $rank + 1;
            }
        ?>


</tbody>
</table>

<script>
    $(document).ready(function () {
        $('#leaderboard').DataTable({
            "paging": false,
            // fixedHeader: true,
        });
    });

</script>


</body>
</html>