<?php
    include '/var/www/keyboardstudy.csail.mit.edu/mysql_login.php';
    $id=$_POST["user_id"];

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

    function organize_tables_by_phase($connection, $id) {
        $query = 'SELECT nomon_practice, nomon_symbol, nomon_text, rowcol_practice, rowcol_symbol, rowcol_text FROM study_info WHERE id='.$id;
        $user_info = make_query($connection, $query)[0];

        $interface_tables = array();

        $interfaces = array("nomon", "rowcol");
        $phases = array("practice", "symbol", "text");

        foreach ($interfaces as $interface){
            $table_num = 1;
            $phase_num_cap = 1;
            foreach ($phases as $phase){
                $phase_tables = array();

                $phase_num_cap += $user_info[$interface.'_'.$phase];
                while ($table_num < $phase_num_cap):
                    $table_name = $interface."_session_".$table_num."_user_".$id;

                    $query = 'SELECT COUNT(*) FROM '.$table_name ;
                    $result_array = make_query($connection, $query);
                    if ($result_array[0]['COUNT(*)'] > 0){
                        array_push($phase_tables, $table_name);
                    }
                    $table_num ++;
                endwhile;
                $interface_tables[$interface][$phase] = $phase_tables;
            }
        }
        return $interface_tables;
    }

    $interface_tables = organize_tables_by_phase($connection, $id);
?>
<h3><i>Showing data for user <?php echo $id ?></i></h3>
<?php
    $interfaces = array("nomon", "rowcol");
    $phases = array("practice", "symbol", "text");
?>
<table style="width:100%">
    <tr>
        <?php foreach ($interfaces as $interface){
            echo "<th colspan=3 style='width:50%;'>${interface}</th>";
        } ?>
    </tr>
    <tr>
        <?php foreach ($interfaces as $interface){
            foreach ($phases as $phase){
                echo "<th style='width:16.6%;'>${phase}</th>";
            }
        } ?>
    </tr>
    <tr>
        <?php foreach ($interfaces as $interface){
            foreach ($phases as $phase){
                echo "<td>";
                foreach ($interface_tables[$interface][$phase] as $table_name){

                   echo "<span style='color:blue' onclick=session_data_request('${table_name}','${interface}','${phase}')> $table_name </span><br>";
                }
                echo "</td>";
            }
        } ?>
    </tr>
</table>


<script>
    function session_data_request(table_name, interface, phase) {
        $.ajax({
            url: "../php/gather_session_data.php",
            context: document.body,
            method: "POST",
            data: {'table_name': table_name,
                   'interface': interface,
                   'phase': phase
                  }
        }).done(function (response) {

            $('#session_data').html(response);
        });

    }

</script>