<?php $user_id = "77"; ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User <?php echo $user_id ?> Data Analysis</title>

</head>
<link rel="stylesheet" type="text/css"
      href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.1.3/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css">
<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'>

<script src="https://code.jquery.com/jquery-3.5.1.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>


<style>
    #inner {
        display: table;
        margin: 0 auto;
    }

    #wrap {
    }

    table, th, td {
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
        width: 10em;
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

    #toc_container {
        background: #f9f9f9 none repeat scroll 0 0;
        border: 1px solid #aaa;
        display: table;
        font-size: 85%;
        margin: 0 auto;
        padding: 20px;
        width: 30em;
    }

    .toc_title {
        font-weight: 700;
        text-align: center;
    }

    #toc_container li, #toc_container ul, #toc_container ul li {
        list-style: outside none none !important;
    }

    textarea {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }
</style>

<body style="width:97.5%; padding-left: 1.75%">
<div id="inner">
    <?php
    $path = '*_data.php';

    $filenames = glob($path);

    foreach ($filenames as $filename) {
        $cur_user_id = str_replace('_data.php', '', $filename);
        if ($cur_user_id !== $user_id){
        ?>
            <a href="./<?php echo $filename ;?>">
                <input class='btn clickable' id="user_<?php echo $cur_user_id ;?>_button"
                   type="button" value="<?php echo $cur_user_id ;?>"/>
            </a>
        <?php
        }

    }
    ?>
</div>

<h1>User <?php echo $user_id ?> Data Analysis</h1>

<table style="width: 100%; border: None">
    <tr style="border: None">
        <td style="width: 50%; border: None">
            <div id="toc_container">
                <p class="toc_title">Contents</p>
                <ul class="toc_list">
                    <li><a href="#time_sheet">1 Time Sheet</a></li>
                    <li><a href="#background_info">2 Background Info</a></li>
                    <li><a href="#final_questionnaire">3 Final Questionnaire Responses</a></li>
                    <li><a href="#entry_stat_analysis">4 Entry Statistic Analyses</a></li>
                    <li><a href="#click_dist_analysis">5 Click Distribution Analyses</a></li>
                    <ul>
                        <li><a href="#periodic_table_plot">5.1 Periodic Table Plot</a></li>
                        <li><a href="#click_var_plots">5.2 Click Variance vs Entry Stats</a></li>
                    </ul>
                    <li><a href="#raw_data">6 Raw User Data</a></li>
                    <ul>
                        <li><a href="#nomon_data">6.1 Nomon</a></li>
                        <ul>
                            <li><a href="#nomon_picture_prac_head">6.1.1 Picture Selection Task (Practice)</a></li>
                            <li><a href="#nomon_picture_eval_head">6.1.2 Picture Selection Task (Evaluation)</a></li>
                            <li><a href="#nomon_text_head">6.1.3 Text Entry Task</a></li>
                        </ul>
                        <li><a href="#rowcol_data">6.2 RCS</a></li>
                        <ul>
                            <li><a href="#rowcol_picture_prac_head">6.2.1 Picture Selection Task (Practice)</a></li>
                            <li><a href="#rowcol_picture_eval_head">6.2.2 Picture Selection Task (Evaluation)</a></li>
                            <li><a href="#rowcol_text_head">6.2.3 Text Entry Task</a></li>
                        </ul>
                    </ul>
                </ul>
            </div>
        </td>
        <td style="width: 50%; border: None">
            <div id="inner">
                <h2 id="time_sheet">Time Sheet</h2>

                <table class="table table-striped" style="width:100%">
                    <tr>
                        <th>
                            Item
                        </th>
                        <th style="text-align: right">
                            Time
                        </th>
                    </tr>
                    <tr>
                        <td>
                            Nov 29, 2021 – Meet and Greet
                        </td>
                        <td style="text-align: right">
                            01:00
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Dec 02, 2021 – Check-In
                        </td>
                        <td style="text-align: right">
                            00:30
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Jan 27, 2022 – Check-In
                        </td>
                        <td style="text-align: right">
                            00:30
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Apr 25, 2022 – Wrap-Up
                        </td>
                        <td style="text-align: right">
                            01:00
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Total Website Activity
                        </td>
                        <td style="text-align: right">
                            01:39 * (1.25 to offset setup times) = 2:03
                        </td>
                    </tr>
                    <tr>
                        <th>
                            Total Time
                        </th>
                        <th style="text-align: right">
                            05:03
                        </th>
                    </tr>
                </table>
            </div>
        </td>
    </tr>
</table>

<br>
<br>

<h2 id="background_info">Background Info</h2>
<table class="table table-striped" style="width:100%">
<tr>
    <th>
        Situation Notes
    </th>
    <th style="width: 35%">
        Primary Switch (for study)
    </th>
    <th>
        Other Switches
    </th>
    <th>
        Switch Software
    </th>
    <th>
        Other Notes
    </th>
</tr>
<tr>
    <td>
        <!--            construct editable form-->
        <?php $form_id = "background_situation_notes_form"; ?>
        <?php
            include('editable_textarea.html');
        ?>
    </td>
    <td>
        <!--            construct editable form-->
        <?php $form_id = "background_primary_switch_notes_form"; ?>
        <?php
            include('editable_textarea.html');
        ?>
    </td>
    <td>
        <!--            construct editable form-->
        <?php $form_id = "background_other_switches_notes_form"; ?>
        <?php
            include('editable_textarea.html');
        ?>
    </td>
    <td>
        <!--            construct editable form-->
        <?php $form_id = "background_software_notes_form"; ?>
        <?php
            include('editable_textarea.html');
        ?>
    </td>
    <td>
        <!--            construct editable form-->
        <?php $form_id = "background_other_notes_form"; ?>
        <?php
            include('editable_textarea.html');
        ?>
    </td>
</tr>
</table>

<br>
<br>

<h2 id="final_questionnaire">Final Questionnaire Responses</h2>

<table class="table table-striped" style="width:100%">
    <tr>
        <th>Question</th>
        <th>Response</th>
    </tr>
    <tr>
        <td>Do you consider yourself a fluent speaker of English?</td>
        <td></td>
    </tr>
    <tr>
        <td>Do you consider yourself to be fast at reading English text?</td>
        <td></td>
    </tr>
    <tr>
        <td>Do you consider yourself a fast typist using my method of choice?</td>
        <td></td>
    </tr>
    <tr>
        <td>Do feel that you have entered text accurately using Nomon?</td>
        <td></td>
    </tr>
    <tr>
        <td>Do feel that you have entered text accurately using Row Column Scanning?</td>
        <td></td>
    </tr>
    <tr>
        <td>Do feel that it was easy to correct any erroneous selections in Nomon?</td>
        <td></td>
    </tr>
    <tr>
        <td>Do feel that it was easy to correct any erroneous selections in Row Column Scanning?</td>
        <td></td>
    </tr>
    <tr>

        <td>Which interface did you enjoy most Row Column Scanning / Nomon, and why?</td>
        <td></td>
    </tr>
    <tr>
        <td>Did you feel any fatigue during any part of the study?</td>
        <td></td>
    </tr>
    <tr>
        <td>Were there specific things that bothered you during the use of Nomon?</td>
        <td></td>
    </tr>
    <tr>
        <td>Do you have any recommendations to improve Nomon?</td>
        <td></td>
    </tr>
    <tr>
        <td>Would you be willing to try out any improvements to the current version of Nomon based on our study
            results?
        </td>
        <td></td>
    </tr>
    <tr>
        <td>Do you have any experience with gaze tracking interfaces? We have future plans to incorporate limited
            eye-gaze information to make Nomon more efficient.
        </td>
        <td></td>
    </tr>

</table>
<br>
<br>

<h2 id="entry_stat_analysis">Entry Statistic Analyses</h2>
<div id="inner">
    <table>
        <tr>
            <th>
                Picture Selection Task Evaluation Results
            </th>
            <th colspan="3">
                Picture Selection Task Learning Curve Plot
            </th>

        </tr>
        <tr>
            <td>
                <img src="figures/<?php echo $user_id ?>/picture_boxplot.svg" width="100%">
            </td>
            <td colspan="3">
                <img src="figures/<?php echo $user_id ?>/picture_longform.svg" width="100%">
            </td>
        </tr>
        <tr>
            <td colspan="4">
                <h4>Notes:</h4>
            </td>
        </tr>
        <tr>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "picture_boxplot_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
            <td colspan="3">
                <!--            construct editable form-->
                <?php $form_id = "picture_long_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
        </tr>
        <tr>
            <th>
                Text Entry Task Evaluation Results
            </th>
            <th colspan="3">
                Text Entry Task Learning Curve Plot
            </th>

        </tr>
        <tr>
            <td>
                <img src="figures/<?php echo $user_id ?>/text_boxplot.svg" width="100%">
            </td>
            <td colspan="3">
                <img src="figures/<?php echo $user_id ?>/text_longform.svg" width="100%">
            </td>
        </tr>
        <tr>
            <td colspan="4">
                <h4>Notes:</h4>
            </td>
        </tr>
        <tr>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "text_boxplot_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
            <td colspan="3">
                <!--            construct editable form-->
                <?php $form_id = "text_long_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
        </tr>
    </table>

    </table>
    <br>
    <br>

    <table>
        <tr>
            <th>
                Picture Selection Task Comparison to Non--Switch-User Data
            </th>
            <th>
                Text Entry Task Comparison to Non--Switch-User Data
            </th>
        </tr>
        <tr>
            <td>
                <img src="figures/<?php echo $user_id ?>/picture_ab_comparison_mean.png" width="100%">
            </td>
            <td>
                <img src="figures/<?php echo $user_id ?>/text_ab_comparison_mean.png" width="100%">
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <h4>Notes:</h4>
            </td>
        </tr>
        <tr>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "picture_ab_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "text_ab_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
        </tr>

    </table>

    <br>
    <br>

    <table>
        <tr>
            <th>
                RCS Speed Over Sessions
            </th>
            <th>
                Nomon Speed Over Sessions
            </th>
            <th>
                Word Prediction Usage Over Sessions
            </th>
        </tr>
        <tr>
            <td>
                <img src="figures/<?php echo $user_id ?>/rcs_speed.png" width="100%">
            </td>
            <td>
                <img src="figures/<?php echo $user_id ?>/time_rotate.png" width="100%">
            </td>
            <td>
                <img src="figures/<?php echo $user_id ?>/word_prediction_long.png" width="100%">
            </td>
        </tr>
        <tr>
            <td colspan="1">
                <h4>Notes:</h4>
            </td>
        </tr>
        <tr>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "rce_speed_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "nomon_speed_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "word_prediction_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
        </tr>

    </table>
</div>
<br>
<br>
<div id="inner">
    <table id="speed_plots">
        <tr>
            <th>
                Nomon Entry Rate vs Speed
            </th>
            <th>
                Nomon Click Load vs Speed
            </th>
            <th>
                Nomon Correction Rate vs Speed
            </th>
            <th>
                Nomon Final Error Rate vs Speed
            </th>

        </tr>
        <tr>
            <td>
                <img src="figures/<?php echo $user_id ?>/entry_rate_vs_speed.png" width="100%">
            </td>
            <td>
                <img src="figures/<?php echo $user_id ?>/click_load_vs_speed.png" width="100%">
            </td>
            <td>
                <img src="figures/<?php echo $user_id ?>/correction_vs_speed.png" width="100%">
            </td>
            <td>
                <img src="figures/<?php echo $user_id ?>/error_vs_speed.png" width="100%">
            </td>
        </tr>
        <tr>
            <td colspan="5">
                <h4>Notes:</h4>
            </td>
        </tr>
        <tr>
            <td  colspan="5">
                <!--            construct editable form-->
                <?php $form_id = "nomon_speed_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
        </tr>
    </table>
</div>
<br>
<br>

<h2 id="click_dist_analysis">Click Distribution Analyses</h2>
<div id="inner">
    <h4 id="periodic_table_plot">Click Buttons to Change Between Statistics:</h4>
</div>
<div id="inner">
    <input class='btn clickable' id="click_analy_error_btn" type="button" value="Final Error Rate"/>
    <input class='btn unclickable' id="click_analy_cload_btn" type="button" value="Click Load"/>
</div>
<script>
    document.getElementById("click_analy_error_btn").onclick = function () {
        document.getElementById("click_analy_error").style.display = "inline-block";
        document.getElementById("click_analy_cload").style.display = "none";
        document.getElementById("click_analy_error_btn").className = "btn clickable";
        document.getElementById("click_analy_cload_btn").className = "btn unclickable";
    };

    document.getElementById("click_analy_cload_btn").onclick = function () {
        document.getElementById("click_analy_cload").style.display = "inline-block";
        document.getElementById("click_analy_error").style.display = "none";
        document.getElementById("click_analy_cload_btn").className = "btn clickable";
        document.getElementById("click_analy_error_btn").className = "btn unclickable";
    };
</script>
<table>
    <tr>
        <td colspan="2">
            <img id="click_analy_error"
                 src="figures/<?php echo $user_id ?>/click_analysis_vs_final_error.svg#svgView(viewBox(200, 0, 1500, 1400))"
                 width="100%"/>
            <img id="click_analy_cload"
                 src="figures/<?php echo $user_id ?>/click_analysis_vs_click_load.svg#svgView(viewBox(200, 0, 1500, 1400))"
                 width="100%" style="display: none;"/>
        </td>
    </tr>
    <tr>
        <td colspan="2">
            <h4>Legend:</h4>
            <strong>Layout:</strong><br>
            -- Each column represents the data from a single session using Nomon.<br>
            -- Each row entry represents the data from a single phrase in the corresponding session (column). <br>
            <br>
            <strong>Each Box contains:</strong><br>
            (1) The learned Click Distribution from Nomon (at the time of the current phrase) is shown by the black
            line.<br>
            (2) A Kernel Density Estimation of the user's presses (for the current phrase only) is shown by the thick,
            colored line. Color represents the value of the selected statistic (Click Load or Final Error Rate) with
            light blue being the lowest and pink being the highest value. A black color means the statistic was
            incalculable for the phrase.<br>
            (3) Clicks which are outliers from the currently learned click distribution (the black line) are plotted as
            red
            dashes below the x-axis. Outliers are defined as having value outside the 5th and 95th percentiles of the
            user's currently learned click distribution.
        </td>
    </tr>
    <tr>
        <td colspan="2">
            <h4>Notes:</h4>
        </td>
    </tr>
    <tr>
        <td>
            <!--            construct editable form-->
            <?php $form_id = "periodic_table_click_load_notes_form"; ?>
            <?php
                    include('editable_textarea.html');
                ?>
        </td>
        <td>
            <!--            construct editable form-->
            <?php $form_id = "periodic_table_error_notes_form"; ?>
            <?php
                    include('editable_textarea.html');
                ?>
        </td>
    </tr>
</table>
<br>
<br>
<div id="inner">
    <table id="click_var_plots">
        <tr>
            <th>
                Click Distribution Standard Dev vs Click Load
            </th>
            <th>
                Click Distribution Standard Dev vs Entry Rate
            </th>
            <th>
                Click Distribution Standard Dev vs Final Error Rate
            </th>
            <th>
                Click Distribution Standard Dev vs Session Number
            </th>
            <th>
                Click Distribution Standard Dev vs Phrase Number
            </th>

        </tr>
        <tr>
            <td>
                <img src="figures/<?php echo $user_id ?>/click_var_vs_click_load.png" width="100%">
            </td>
            <td>
                <img src="figures/<?php echo $user_id ?>/click_var_vs_entry_rate.png" width="100%">
            </td>
            <td>
                <img src="figures/<?php echo $user_id ?>/click_var_vs_error.png" width="100%">
            </td>
            <td>
                <img src="figures/<?php echo $user_id ?>/click_var_vs_session.png" width="100%">
            </td>
            <td>
                <img src="figures/<?php echo $user_id ?>/click_var_vs_phrase.png" width="100%">
            </td>
        </tr>
        <tr>
            <td colspan="5">
                <h4>Notes:</h4>
            </td>
        </tr>
        <tr>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "click_var_click_load_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "click_var_entry_rate_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "click_var_error_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "click_var_session_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
            <td>
                <!--            construct editable form-->
                <?php $form_id = "click_var_phrase_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
        </tr>
    </table>
</div>

<br>
<br>

<h2 id="raw_data">Raw User Data</h2>
<h3 id="nomon_data">Nomon</h3>

<h4 id="nomon_picture_prac_head">Picture Selection Task (Practice) Raw Data</h4>
<table id="nomon_picture_prac" class="table table-striped" style="width:100%">
<?php
    include('data_tables/'.$user_id.'/nomon_picture_practice.html');
?>

<h4 id="nomon_picture_eval_head">Picture Selection Task (Evaluation) Raw Data</h4>
<table id="nomon_picture_eval" class="table table-striped" style="width:100%">
<?php
    include('data_tables/'.$user_id.'/nomon_picture_eval.html');
?>

<h4 id="nomon_text_head">Text Entry Task Raw Data</h4>
<table id="nomon_text" class="table table-striped" style="width:100%">
<?php
    include('data_tables/'.$user_id.'/nomon_text.html');
?>

<br>
<br>

<h3 id="rowcol_data">Row Column Scanning</h3>
<h4 id="rowcol_picture_prac_head">Picture Selection Task (Practice) Raw Data</h4>
<table id="rowcol_picture_prac" class="table table-striped" style="width:100%">
<?php
    include('data_tables/'.$user_id.'/rcs_picture_practice.html');
?>

<h4 id="rowcol_picture_eval_head">Picture Selection Task (Evaluation) Raw Data</h4>
<table id="rowcol_picture_eval" class="table table-striped" style="width:100%">
<?php
    include('data_tables/'.$user_id.'/rcs_picture_eval.html');
?>

<h4 id="rowcol_text_head">Text Entry Task Raw Data</h4>
<table id="rowcol_text" class="table table-striped" style="width:100%">
<?php
    include('data_tables/'.$user_id.'/rcs_text.html');
?>


<script>
    $(document).ready(function () {
        $('#nomon_picture_prac').DataTable({
            "paging": false,
            // fixedHeader: true,
        });

        $('#nomon_picture_eval').DataTable({
            "paging": false,
        });

        $('#nomon_text').DataTable({
            "paging": false,
        });

        $('#rowcol_picture_prac').DataTable({
            "paging": false,
        });

        $('#rowcol_picture_eval').DataTable({
            "paging": false,
        });

        $('#rowcol_text').DataTable({
            "paging": false,
        });
    });

</script>


</body>
</html>