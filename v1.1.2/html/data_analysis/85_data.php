<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User 85 Data Analysis</title>

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
    #wrap    { }

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

<body>

<h1>User 85 Data Analysis</h1>

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
                        <th  style="text-align: right">
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
<table class="table table-striped" style="width:100%"
<tr>
    <th style="width: 10%">
        Situation Notes
    </th>
    <th style="width: 15%">
        Primary Switch (for study)
    </th>
    <th style="width: 15%">
        Other Switches
    </th>
    <th style="width: 15%">
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
        <td>Yes</td>
    </tr>
    <tr>
        <td>Do you consider yourself to be fast at reading English text?</td>
        <td>Yes</td>
    </tr>
    <tr>
        <td>Do you consider yourself a fast typist using my method of choice?</td>
        <td>No</td>
    </tr>
    <tr>
        <td>Do feel that you have entered text accurately using Nomon?</td>
        <td>Yes</td>
    </tr>
    <tr>
        <td>Do feel that you have entered text accurately using Row Column Scanning?</td>
        <td>No</td>
    </tr>
    <tr>
        <td>Do feel that it was easy to correct any erroneous selections in Nomon?</td>
        <td>No</td>
    </tr>
    <tr>
        <td>Do feel that it was easy to correct any erroneous selections in Row Column Scanning?</td>
        <td>No</td>
    </tr>
    <tr>

        <td>Which interface did you enjoy most Row Column Scanning / Nomon, and why?</td>
        <td>Nomon - due to the increased predictive power it has over Row Column Scanning</td>
    </tr>
    <tr>
        <td>Did you feel any fatigue during any part of the study?</td>
        <td>Some as it took a higher level of concentration compared to the grid 2. Also long periods of pressing a
            single switch will result in wrist pain which is why I prefer joystick
        </td>
    </tr>
    <tr>
        <td>Were there specific things that bothered you during the use of Nomon?</td>
        <td>Often needed multiple clicks to select targets even when I felt my accuracy was good however I think that
            this is inevitable in order for the algorithm to accommodate a full alphabet. Frustrating to undo mistakes
            and edit text
        </td>
    </tr>
    <tr>
        <td>Do you have any recommendations to improve Nomon?</td>
        <td>Could rearrange letters so that most commonly used letters are together. Also increase the number of
            word predictions. Could have the function to enter text into a different window
        </td>
    </tr>
    <tr>
        <td>Would you be willing to try out any improvements to the current version of Nomon based on our study
            results?
        </td>
        <td>Yes</td>
    </tr>
    <tr>
        <td>Do you have any experience with gaze tracking interfaces? We have future plans to incorporate limited
            eye-gaze information to make Nomon more efficient.
        </td>
        <td> In my experience eye gaze was more accessible to me around 10 years ago and since then I have been
            increasingly frustrated with it. If eye gaze were improved and Nomon incorporated with it I would be
            interested in trying the combination.
        </td>
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
            <th colspan="2">
                Picture Selection Task Learning Curve Plot
            </th>
            <th>
                Text Entry Task Evaluation Results
            </th>

        </tr>
        <tr>
            <td>
                <img src="85_figures/claire_picture_boxplot.svg" width="100%">
            </td>
            <td colspan="2">
                <img src="85_figures/claire_picture_selection_longform-1.svg" width="100%">
            </td>
            <td>
                <img src="85_figures/claire_text_boxplot.svg" width="100%">
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
            <td colspan="2">
<!--            construct editable form-->
                <?php $form_id = "picture_long_notes_form"; ?>
                <?php
                    include('editable_textarea.html');
                ?>
            </td>
            <td>
<!--            construct editable form-->
                <?php $form_id = "text_boxplot_notes_form"; ?>
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
                Picture Selection Task Comparison to Non--Switch-User Data
            </th>
            <th>
                Text Entry Task Comparison to Non--Switch-User Data
            </th>
        </tr>
        <tr>
            <td>
                <img src="85_figures/claire_picture_ab_comparison_mean.png" width="75%">
            </td>
            <td>
                <img src="85_figures/claire_text_ab_comparison_mean.png" width="75%">
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
                 src="85_figures/claire_click_analysis_vs_final_error.svg#svgView(viewBox(250, 0, 1750, 1050))"
                 width="100%"/>
            <img id="click_analy_cload"
                 src="85_figures/claire_click_analysis_vs_click_load.svg#svgView(viewBox(250, 0, 1750, 1050))"
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
                <img src="85_figures/claire_click_var_vs_click_load.png" width="100%">
            </td>
            <td>
                <img src="85_figures/claire_click_var_vs_entry_rate.png" width="100%">
            </td>
            <td>
                <img src="85_figures/claire_click_var_vs_error.png" width="100%">
            </td>
            <td>
                <img src="85_figures/claire_click_var_vs_session.png" width="100%">
            </td>
            <td>
                <img src="85_figures/claire_click_var_vs_phrase.png" width="100%">
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
    <thead>
    <tr style="text-align: right; position: sticky; background-color: white; top: 0;">
        <th></th>
        <th>Session Number</th>
        <th>Phrase Number</th>
        <th>Phrase Target</th>
        <th>Final Typed</th>
        <th>Time Rotate</th>
        <th>Entry Rate (selections/min)</th>
        <th>Click Load (clicks/selection)</th>
        <th>Correction Rate</th>
        <th>Final Error Rate</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <th>0</th>
        <td>1</td>
        <td>1</td>
        <td>break go big where bumpy</td>
        <td>break go big where bumpy</td>
        <td>5.0</td>
        <td>3.99</td>
        <td>4.00</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>1</th>
        <td>1</td>
        <td>2</td>
        <td>with now what scared break</td>
        <td>with now what see break</td>
        <td>5.0</td>
        <td>4.00</td>
        <td>4.40</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>2</th>
        <td>1</td>
        <td>3</td>
        <td>bad work do excited who</td>
        <td>bad work do excited hard</td>
        <td>5.0</td>
        <td>3.06</td>
        <td>5.80</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>3</th>
        <td>1</td>
        <td>4</td>
        <td>mine read here work turn</td>
        <td>mine on here work something_different .excited</td>
        <td>5.0</td>
        <td>2.25</td>
        <td>7.33</td>
        <td>0.0</td>
        <td>0.600</td>
    </tr>
    <tr>
        <th>4</th>
        <td>2</td>
        <td>1</td>
        <td>make again bumpy i what</td>
        <td>away again bumpy i what</td>
        <td>5.0</td>
        <td>2.30</td>
        <td>8.00</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>5</th>
        <td>2</td>
        <td>2</td>
        <td>now what read this is</td>
        <td>now what read this is</td>
        <td>5.0</td>
        <td>4.57</td>
        <td>4.40</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>6</th>
        <td>2</td>
        <td>3</td>
        <td>is bumpy sick sad play</td>
        <td>is put sick sad big .i</td>
        <td>5.0</td>
        <td>2.13</td>
        <td>10.50</td>
        <td>0.0</td>
        <td>0.600</td>
    </tr>
    <tr>
        <th>7</th>
        <td>2</td>
        <td>4</td>
        <td>play happy all_gone hard this</td>
        <td>play happy all_gone hard this in</td>
        <td>5.0</td>
        <td>2.83</td>
        <td>8.50</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>8</th>
        <td>2</td>
        <td>5</td>
        <td>on don8t mad scared excited</td>
        <td>on don8t mad scared</td>
        <td>5.0</td>
        <td>3.64</td>
        <td>7.50</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>9</th>
        <td>3</td>
        <td>1</td>
        <td>where put sad bumpy me</td>
        <td>where put sad bumpy here</td>
        <td>5.0</td>
        <td>4.10</td>
        <td>5.60</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>10</th>
        <td>3</td>
        <td>2</td>
        <td>me easy again where feel</td>
        <td>me easy again where feel</td>
        <td>5.0</td>
        <td>3.07</td>
        <td>6.80</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>11</th>
        <td>3</td>
        <td>3</td>
        <td>happy it scared get okay</td>
        <td>happy it scared get okay</td>
        <td>5.0</td>
        <td>3.70</td>
        <td>6.40</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>12</th>
        <td>3</td>
        <td>4</td>
        <td>break bad again now here</td>
        <td>break bad again now here</td>
        <td>5.0</td>
        <td>3.51</td>
        <td>6.20</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>13</th>
        <td>3</td>
        <td>5</td>
        <td>mad who mad see turn</td>
        <td>mad who mad see turn</td>
        <td>5.0</td>
        <td>3.65</td>
        <td>5.40</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>14</th>
        <td>3</td>
        <td>6</td>
        <td>away make what soft on</td>
        <td>away make what hard me</td>
        <td>5.0</td>
        <td>3.09</td>
        <td>11.40</td>
        <td>0.0</td>
        <td>0.400</td>
    </tr>
    <tr>
        <th>15</th>
        <td>3</td>
        <td>7</td>
        <td>bumpy soft what you get</td>
        <td>bumpy soft i</td>
        <td>5.0</td>
        <td>3.83</td>
        <td>6.33</td>
        <td>0.0</td>
        <td>0.333</td>
    </tr>
    <tr>
        <th>16</th>
        <td>4</td>
        <td>1</td>
        <td>don8t sick get less is</td>
        <td>don8t sick get less is</td>
        <td>5.0</td>
        <td>2.16</td>
        <td>13.20</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>17</th>
        <td>4</td>
        <td>2</td>
        <td>is less see like soft</td>
        <td>is less see like soft</td>
        <td>5.0</td>
        <td>3.66</td>
        <td>5.20</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>18</th>
        <td>4</td>
        <td>3</td>
        <td>get i now is who</td>
        <td>get i now is who</td>
        <td>5.0</td>
        <td>2.78</td>
        <td>7.00</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>19</th>
        <td>4</td>
        <td>4</td>
        <td>something_different in more excited big</td>
        <td>something_different in more excited big</td>
        <td>5.0</td>
        <td>4.43</td>
        <td>5.00</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>20</th>
        <td>4</td>
        <td>5</td>
        <td>scared happy make like put</td>
        <td>scared happy make bumpy put</td>
        <td>5.0</td>
        <td>3.83</td>
        <td>5.20</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>21</th>
        <td>4</td>
        <td>6</td>
        <td>what all_gone it see in</td>
        <td>what all_gone it see in</td>
        <td>5.0</td>
        <td>4.20</td>
        <td>5.40</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>22</th>
        <td>4</td>
        <td>7</td>
        <td>eat sick sad soft with</td>
        <td>see sick sad</td>
        <td>5.0</td>
        <td>5.92</td>
        <td>4.67</td>
        <td>0.0</td>
        <td>0.333</td>
    </tr>
    <tr>
        <th>23</th>
        <td>5</td>
        <td>1</td>
        <td>excited less play i excited</td>
        <td>excited less play i excited</td>
        <td>5.0</td>
        <td>4.16</td>
        <td>4.80</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>24</th>
        <td>5</td>
        <td>2</td>
        <td>do read big who drink</td>
        <td>do read big who drink</td>
        <td>5.0</td>
        <td>4.11</td>
        <td>5.00</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>25</th>
        <td>5</td>
        <td>3</td>
        <td>read have excited see stop</td>
        <td>read have excited see stop</td>
        <td>5.0</td>
        <td>3.61</td>
        <td>5.40</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>26</th>
        <td>5</td>
        <td>4</td>
        <td>less bad now is easy</td>
        <td>less bad now is easy</td>
        <td>5.0</td>
        <td>4.60</td>
        <td>4.60</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>27</th>
        <td>5</td>
        <td>5</td>
        <td>good sad i on break</td>
        <td>good sad i okay break</td>
        <td>5.0</td>
        <td>4.15</td>
        <td>4.60</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>28</th>
        <td>5</td>
        <td>6</td>
        <td>turn have see mad give</td>
        <td>turn have see mad give</td>
        <td>5.0</td>
        <td>4.11</td>
        <td>5.80</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>29</th>
        <td>5</td>
        <td>7</td>
        <td>soft bad hard you okay</td>
        <td>soft bad hard you okay</td>
        <td>5.0</td>
        <td>4.60</td>
        <td>4.40</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>30</th>
        <td>5</td>
        <td>8</td>
        <td>it i less is who</td>
        <td>it i less is don8t</td>
        <td>5.0</td>
        <td>5.66</td>
        <td>4.40</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>31</th>
        <td>6</td>
        <td>1</td>
        <td>help get want do where</td>
        <td>help get want do where</td>
        <td>5.0</td>
        <td>3.65</td>
        <td>4.80</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>32</th>
        <td>6</td>
        <td>2</td>
        <td>hard what happy bad again</td>
        <td>hard what happy bad again</td>
        <td>5.0</td>
        <td>3.65</td>
        <td>5.00</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>33</th>
        <td>6</td>
        <td>3</td>
        <td>break go drink turn now</td>
        <td>break go drink turn now now</td>
        <td>5.0</td>
        <td>3.60</td>
        <td>5.17</td>
        <td>0.1</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>34</th>
        <td>6</td>
        <td>4</td>
        <td>now again take mine read</td>
        <td>now again take mine read</td>
        <td>5.0</td>
        <td>3.67</td>
        <td>4.60</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>35</th>
        <td>6</td>
        <td>5</td>
        <td>work okay eat work help</td>
        <td>work okay eat work help</td>
        <td>5.0</td>
        <td>3.68</td>
        <td>4.40</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>36</th>
        <td>6</td>
        <td>6</td>
        <td>get excited get now who</td>
        <td>get excited get now who</td>
        <td>5.0</td>
        <td>4.10</td>
        <td>5.60</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>37</th>
        <td>6</td>
        <td>7</td>
        <td>make on bad soft mine</td>
        <td>make on bad soft mine excited want</td>
        <td>5.0</td>
        <td>6.48</td>
        <td>3.43</td>
        <td>0.0</td>
        <td>0.400</td>
    </tr>
    <tr>
        <th>38</th>
        <td>7</td>
        <td>1</td>
        <td>less me don8t scared bumpy</td>
        <td>less me turn scared bumpy</td>
        <td>5.0</td>
        <td>4.23</td>
        <td>5.20</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>39</th>
        <td>7</td>
        <td>2</td>
        <td>little read more here away</td>
        <td>little read more here away</td>
        <td>5.0</td>
        <td>3.92</td>
        <td>5.00</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>40</th>
        <td>7</td>
        <td>3</td>
        <td>break put excited want break</td>
        <td>break put excited want break</td>
        <td>5.0</td>
        <td>4.13</td>
        <td>4.40</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>41</th>
        <td>7</td>
        <td>4</td>
        <td>give have finished scared soft</td>
        <td>feel have finished scared soft</td>
        <td>5.0</td>
        <td>4.31</td>
        <td>4.20</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>42</th>
        <td>7</td>
        <td>5</td>
        <td>here it on don8t where</td>
        <td>here it on don8t where read what</td>
        <td>5.0</td>
        <td>4.09</td>
        <td>5.86</td>
        <td>0.0</td>
        <td>0.400</td>
    </tr>
    <tr>
        <th>43</th>
        <td>7</td>
        <td>6</td>
        <td>something_different sick here get me</td>
        <td>something_different happy here get me</td>
        <td>5.0</td>
        <td>3.50</td>
        <td>6.60</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>44</th>
        <td>7</td>
        <td>7</td>
        <td>soft all_gone make play take</td>
        <td>soft all_gone make play take</td>
        <td>5.0</td>
        <td>4.67</td>
        <td>5.20</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>45</th>
        <td>7</td>
        <td>8</td>
        <td>excited finished bumpy sick this</td>
        <td>excited finished bumpy</td>
        <td>5.0</td>
        <td>7.58</td>
        <td>3.33</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>46</th>
        <td>8</td>
        <td>1</td>
        <td>stop there excited sad me</td>
        <td>stop there excited sad me</td>
        <td>5.0</td>
        <td>4.42</td>
        <td>4.20</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>47</th>
        <td>8</td>
        <td>2</td>
        <td>on drink something_different finished excited</td>
        <td>on drink something_different finished excited</td>
        <td>5.0</td>
        <td>4.30</td>
        <td>4.00</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>48</th>
        <td>8</td>
        <td>3</td>
        <td>on something_different put sad here</td>
        <td>on something_different put sad here</td>
        <td>5.0</td>
        <td>3.69</td>
        <td>4.40</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>49</th>
        <td>9</td>
        <td>1</td>
        <td>me what go hard big</td>
        <td>me what go hard big</td>
        <td>5.0</td>
        <td>4.07</td>
        <td>4.20</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>50</th>
        <td>9</td>
        <td>2</td>
        <td>happy drink feel me sick</td>
        <td>happy drink feel me sick</td>
        <td>5.0</td>
        <td>4.61</td>
        <td>4.40</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>51</th>
        <td>9</td>
        <td>3</td>
        <td>turn say with easy away</td>
        <td>turn say with easy away</td>
        <td>5.0</td>
        <td>4.87</td>
        <td>4.60</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>52</th>
        <td>9</td>
        <td>4</td>
        <td>is less give in on</td>
        <td>is less give in on .stop</td>
        <td>5.0</td>
        <td>4.23</td>
        <td>5.83</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>53</th>
        <td>9</td>
        <td>5</td>
        <td>stop get again make more</td>
        <td>little get again make more</td>
        <td>5.0</td>
        <td>2.99</td>
        <td>8.20</td>
        <td>0.0</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>54</th>
        <td>9</td>
        <td>6</td>
        <td>say with i i say</td>
        <td>say with i i say</td>
        <td>5.0</td>
        <td>4.18</td>
        <td>5.20</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>55</th>
        <td>9</td>
        <td>7</td>
        <td>where easy okay now bumpy</td>
        <td>where easy okay now bumpy</td>
        <td>5.0</td>
        <td>4.22</td>
        <td>4.60</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>56</th>
        <td>9</td>
        <td>8</td>
        <td>have finished little drink with</td>
        <td>have finished in mine</td>
        <td>5.0</td>
        <td>6.10</td>
        <td>3.50</td>
        <td>0.0</td>
        <td>0.500</td>
    </tr>
    </tbody>
</table>

<h4 id="nomon_picture_eval_head">Picture Selection Task (Evaluation) Raw Data</h4>
<table id="nomon_picture_eval" class="table table-striped" style="width:100%">
    <thead>
    <tr style="text-align: right; position: sticky; background-color: white; top: 0;">
        <th></th>
        <th>Session Number</th>
        <th>Phrase Number</th>
        <th>Phrase Target</th>
        <th>Final Typed</th>
        <th>Time Rotate</th>
        <th>Entry Rate (selections/min)</th>
        <th>Click Load (clicks/selection)</th>
        <th>Correction Rate</th>
        <th>Final Error Rate</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <th>57</th>
        <td>10</td>
        <td>1</td>
        <td>stop feel you work turn</td>
        <td>stop feel you take turn</td>
        <td>5.0</td>
        <td>3.21</td>
        <td>5.60</td>
        <td>0.000</td>
        <td>0.2</td>
    </tr>
    <tr>
        <th>58</th>
        <td>10</td>
        <td>2</td>
        <td>okay mine away there now</td>
        <td>okay mine away there now .you</td>
        <td>5.0</td>
        <td>2.64</td>
        <td>7.33</td>
        <td>0.091</td>
        <td>0.2</td>
    </tr>
    <tr>
        <th>59</th>
        <td>10</td>
        <td>3</td>
        <td>have go sad excited there</td>
        <td>have go sad excited there</td>
        <td>5.0</td>
        <td>2.80</td>
        <td>7.00</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>60</th>
        <td>10</td>
        <td>4</td>
        <td>see little play feel sad</td>
        <td>see little play feel sad</td>
        <td>5.0</td>
        <td>4.03</td>
        <td>5.40</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>61</th>
        <td>10</td>
        <td>5</td>
        <td>more turn soft scared all_gone</td>
        <td>more turn soft scared all_gone</td>
        <td>5.0</td>
        <td>4.84</td>
        <td>5.00</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>62</th>
        <td>10</td>
        <td>6</td>
        <td>read do hard help drink</td>
        <td>read do hard help drink</td>
        <td>5.0</td>
        <td>4.21</td>
        <td>4.80</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>63</th>
        <td>11</td>
        <td>1</td>
        <td>happy again where go mad</td>
        <td>happy again where go mad</td>
        <td>5.0</td>
        <td>3.73</td>
        <td>4.80</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>64</th>
        <td>11</td>
        <td>2</td>
        <td>go sad in bumpy work</td>
        <td>go sad in bumpy work</td>
        <td>5.0</td>
        <td>3.60</td>
        <td>5.40</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>65</th>
        <td>11</td>
        <td>3</td>
        <td>turn sick now this who</td>
        <td>turn sick now this who</td>
        <td>5.0</td>
        <td>3.94</td>
        <td>4.80</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>66</th>
        <td>11</td>
        <td>4</td>
        <td>easy read me away again</td>
        <td>easy read me away again</td>
        <td>5.0</td>
        <td>3.29</td>
        <td>5.40</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>67</th>
        <td>11</td>
        <td>5</td>
        <td>have little it less break</td>
        <td>have little it less break</td>
        <td>5.0</td>
        <td>4.41</td>
        <td>4.60</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>68</th>
        <td>11</td>
        <td>6</td>
        <td>bad hard more read this</td>
        <td>bad hard more read this</td>
        <td>5.0</td>
        <td>4.26</td>
        <td>5.00</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>69</th>
        <td>11</td>
        <td>7</td>
        <td>big eat something_different more get</td>
        <td>big eat something_different help something_different</td>
        <td>5.0</td>
        <td>5.10</td>
        <td>4.40</td>
        <td>0.000</td>
        <td>0.4</td>
    </tr>
    <tr>
        <th>70</th>
        <td>11</td>
        <td>8</td>
        <td>bumpy excited soft what i</td>
        <td>bumpy excited soft</td>
        <td>5.0</td>
        <td>5.82</td>
        <td>3.00</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>71</th>
        <td>12</td>
        <td>1</td>
        <td>now put want now you</td>
        <td>now put want now you .break</td>
        <td>5.0</td>
        <td>3.87</td>
        <td>5.50</td>
        <td>0.000</td>
        <td>0.2</td>
    </tr>
    <tr>
        <th>72</th>
        <td>12</td>
        <td>2</td>
        <td>mad eat get want again</td>
        <td>mad eat get want again</td>
        <td>5.0</td>
        <td>4.13</td>
        <td>5.00</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>73</th>
        <td>12</td>
        <td>3</td>
        <td>don8t stop do hard take</td>
        <td>don8t stop do hard you take</td>
        <td>5.0</td>
        <td>5.18</td>
        <td>4.50</td>
        <td>0.000</td>
        <td>0.2</td>
    </tr>
    <tr>
        <th>74</th>
        <td>12</td>
        <td>4</td>
        <td>work eat make mine little</td>
        <td>work something_different mine mine little .see</td>
        <td>5.0</td>
        <td>3.72</td>
        <td>6.17</td>
        <td>0.000</td>
        <td>0.6</td>
    </tr>
    <tr>
        <th>75</th>
        <td>12</td>
        <td>5</td>
        <td>turn what now in who</td>
        <td>turn what now in who .less .work</td>
        <td>5.0</td>
        <td>3.26</td>
        <td>5.71</td>
        <td>0.000</td>
        <td>0.4</td>
    </tr>
    <tr>
        <th>76</th>
        <td>12</td>
        <td>6</td>
        <td>mine little now play more</td>
        <td>mine little now play more</td>
        <td>5.0</td>
        <td>3.69</td>
        <td>5.00</td>
        <td>0.000</td>
        <td>0.0</td>
    </tr>
    </tbody>
</table>

<h4 id="nomon_text_head">Text Entry Task Raw Data</h4>
<table id="nomon_text" class="table table-striped" style="width:100%">
    <thead>
    <tr style="text-align: right; position: sticky; background-color: white; top: 0;">
        <th></th>
        <th>Session Number</th>
        <th>Phrase Number</th>
        <th>Phrase Target</th>
        <th>Final Typed</th>
        <th>is_oov</th>
        <th>Time Rotate</th>
        <th>Entry Rate (wpm)</th>
        <th>Click Load (clicks/char)</th>
        <th>Correction Rate</th>
        <th>Final Error Rate</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <th>77</th>
        <td>14</td>
        <td>1</td>
        <td>i love it out here</td>
        <td>i love it out here</td>
        <td>IV</td>
        <td>5.0</td>
        <td>1.73</td>
        <td>1.44</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>78</th>
        <td>14</td>
        <td>2</td>
        <td>i8m coming to the show</td>
        <td>im coming to the show</td>
        <td>IV</td>
        <td>5.0</td>
        <td>2.52</td>
        <td>1.48</td>
        <td>0.0</td>
        <td>0.045</td>
    </tr>
    <tr>
        <th>79</th>
        <td>14</td>
        <td>3</td>
        <td>the corner of the old gallowgate</td>
        <td>the corner of the old galloway</td>
        <td>OOV</td>
        <td>5.0</td>
        <td>1.67</td>
        <td>1.73</td>
        <td>0.0</td>
        <td>0.094</td>
    </tr>
    <tr>
        <th>80</th>
        <td>14</td>
        <td>4</td>
        <td>that is how you do it</td>
        <td>this is how you do it</td>
        <td>IV</td>
        <td>5.0</td>
        <td>2.00</td>
        <td>1.38</td>
        <td>0.0</td>
        <td>0.095</td>
    </tr>
    <tr>
        <th>81</th>
        <td>15</td>
        <td>1</td>
        <td>i do recommend your book</td>
        <td>i do recommend your book</td>
        <td>IV</td>
        <td>5.0</td>
        <td>1.83</td>
        <td>1.42</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>82</th>
        <td>15</td>
        <td>2</td>
        <td>wait until you get to haast</td>
        <td>wait until you get to haast</td>
        <td>OOV</td>
        <td>5.0</td>
        <td>1.49</td>
        <td>2.33</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>83</th>
        <td>15</td>
        <td>3</td>
        <td>but this love is ours</td>
        <td>but this love is ours</td>
        <td>IV</td>
        <td>5.0</td>
        <td>1.55</td>
        <td>1.86</td>
        <td>0.0</td>
        <td>0.000</td>
    </tr>
    </tbody>
</table>


<br>
<br>

<h3 id="rowcol_data">Row Column Scanning</h3>

<h4 id="rowcol_picture_prac_head">Picture Selection Task (Practice) Raw Data</h4>
<table id="rowcol_picture_prac" class="table table-striped" style="width:100%">
    <thead>
    <tr style="text-align: right; position: sticky; background-color: white; top: 0;">
        <th></th>
        <th>Session Number</th>
        <th>Phrase Number</th>
        <th>Phrase Target</th>
        <th>Final Typed</th>
        <th>Scan Delay</th>
        <th>Extra Delay</th>
        <th>Entry Rate (selections/min)</th>
        <th>Click Load (clicks/selection)</th>
        <th>Correction Rate</th>
        <th>Final Error Rate</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <th>84</th>
        <td>1</td>
        <td>1</td>
        <td>do again what again me</td>
        <td>do again what again me</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>3.12</td>
        <td>2.8</td>
        <td>0.0</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>85</th>
        <td>1</td>
        <td>2</td>
        <td>it here in take on</td>
        <td>it here in take on</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.39</td>
        <td>2.8</td>
        <td>0.0</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>86</th>
        <td>1</td>
        <td>3</td>
        <td>do play with it stop</td>
        <td>do here with it stop</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.59</td>
        <td>2.8</td>
        <td>0.0</td>
        <td>0.2</td>
    </tr>
    <tr>
        <th>87</th>
        <td>1</td>
        <td>4</td>
        <td>here sad take sad less</td>
        <td>here sad take sad less</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.51</td>
        <td>2.8</td>
        <td>0.0</td>
        <td>0.0</td>
    </tr>
    <tr>
        <th>88</th>
        <td>1</td>
        <td>5</td>
        <td>mad sad work there on</td>
        <td>mad sad work</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>3.27</td>
        <td>2.0</td>
        <td>0.0</td>
        <td>0.0</td>
    </tr>
    </tbody>
</table>

<h4 id="rowcol_picture_eval_head">Picture Selection Task (Evaluation) Raw Data</h4>
<table id="rowcol_picture_eval" class="table table-striped" style="width:100%">
    <thead>
    <tr style="text-align: right; position: sticky; background-color: white; top: 0;">
        <th></th>
        <th>Session Number</th>
        <th>Phrase Number</th>
        <th>Phrase Target</th>
        <th>Final Typed</th>
        <th>Scan Delay</th>
        <th>Extra Delay</th>
        <th>Entry Rate (selections/min)</th>
        <th>Click Load (clicks/selection)</th>
        <th>Correction Rate</th>
        <th>Final Error Rate</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <th>89</th>
        <td>2</td>
        <td>1</td>
        <td>want sick do happy me</td>
        <td>want sick do happy me</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.45</td>
        <td>2.80</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>90</th>
        <td>2</td>
        <td>2</td>
        <td>stop something_different okay soft less</td>
        <td>drink something_different okay soft less</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.48</td>
        <td>2.80</td>
        <td>0.000</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>91</th>
        <td>2</td>
        <td>3</td>
        <td>away okay me this sick</td>
        <td>away okay me this sick</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.54</td>
        <td>2.80</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>92</th>
        <td>2</td>
        <td>4</td>
        <td>hard finished give good give</td>
        <td>hard finished give good give</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.49</td>
        <td>2.80</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>93</th>
        <td>2</td>
        <td>5</td>
        <td>see stop read eat read</td>
        <td>like stop play drink</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>3.83</td>
        <td>2.00</td>
        <td>0.000</td>
        <td>0.750</td>
    </tr>
    <tr>
        <th>94</th>
        <td>3</td>
        <td>1</td>
        <td>stop want sad with break</td>
        <td>stop want sad with turn</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.76</td>
        <td>2.80</td>
        <td>0.000</td>
        <td>0.200</td>
    </tr>
    <tr>
        <th>95</th>
        <td>3</td>
        <td>2</td>
        <td>more hard put don8t little</td>
        <td>more hard put don8t little</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.52</td>
        <td>2.80</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>96</th>
        <td>3</td>
        <td>3</td>
        <td>good again eat what read</td>
        <td>good again eat what read</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.83</td>
        <td>4.40</td>
        <td>0.182</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>97</th>
        <td>3</td>
        <td>4</td>
        <td>want here it what break</td>
        <td>want here it what break</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.85</td>
        <td>2.80</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>98</th>
        <td>3</td>
        <td>5</td>
        <td>who put get say good</td>
        <td>who put get say</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>3.31</td>
        <td>2.00</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>99</th>
        <td>4</td>
        <td>1</td>
        <td>me stop stop is eat</td>
        <td>me stop stop is eat</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.63</td>
        <td>2.80</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>100</th>
        <td>4</td>
        <td>2</td>
        <td>mine eat help finished good</td>
        <td>mine eat help finished good i like</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>3.34</td>
        <td>2.57</td>
        <td>0.000</td>
        <td>0.400</td>
    </tr>
    <tr>
        <th>101</th>
        <td>4</td>
        <td>3</td>
        <td>go big read have feel</td>
        <td>go big read have feel</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.07</td>
        <td>2.80</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>102</th>
        <td>4</td>
        <td>4</td>
        <td>there read feel go less</td>
        <td>there read feel go less</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.18</td>
        <td>2.80</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>103</th>
        <td>4</td>
        <td>5</td>
        <td>eat where it this want</td>
        <td>drink where it</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>5.74</td>
        <td>3.33</td>
        <td>0.200</td>
        <td>0.333</td>
    </tr>
    </tbody>
</table>

<h4 id="rowcol_text_head">Text Entry Task Raw Data</h4>
<table id="rowcol_text" class="table table-striped" style="width:100%">
    <thead>
    <tr style="text-align: right; position: sticky; background-color: white; top: 0;">
        <th></th>
        <th>Session Number</th>
        <th>Phrase Number</th>
        <th>Phrase Target</th>
        <th>Final Typed</th>
        <th>is_oov</th>
        <th>Scan Delay</th>
        <th>Extra Delay</th>
        <th>Entry Rate (wpm)</th>
        <th>Click Load (clicks/char)</th>
        <th>Correction Rate</th>
        <th>Final Error Rate</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <th>104</th>
        <td>5</td>
        <td>1</td>
        <td>i love it out here</td>
        <td>i love it out here. ._</td>
        <td>IV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.63</td>
        <td>1.180</td>
        <td>0.077</td>
        <td>0.167</td>
    </tr>
    <tr>
        <th>105</th>
        <td>5</td>
        <td>2</td>
        <td>i8m coming to the show</td>
        <td>i8m coming to the show</td>
        <td>IV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>2.90</td>
        <td>0.909</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>106</th>
        <td>5</td>
        <td>3</td>
        <td>the corner of the old gallowgate</td>
        <td>the corner of the old gallowgatand the the_</td>
        <td>OOV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.69</td>
        <td>1.210</td>
        <td>0.160</td>
        <td>0.312</td>
    </tr>
    <tr>
        <th>107</th>
        <td>6</td>
        <td>1</td>
        <td>i do recommend your book</td>
        <td>i do recommend your book</td>
        <td>IV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.48</td>
        <td>1.210</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>108</th>
        <td>6</td>
        <td>2</td>
        <td>wait until you get to haast</td>
        <td>wait until you get to haast</td>
        <td>OOV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.71</td>
        <td>1.300</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>109</th>
        <td>6</td>
        <td>3</td>
        <td>but this love is ours</td>
        <td>but this love is our s</td>
        <td>IV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.39</td>
        <td>1.270</td>
        <td>0.000</td>
        <td>0.048</td>
    </tr>
    <tr>
        <th>110</th>
        <td>7</td>
        <td>1</td>
        <td>i do recommend your book</td>
        <td>i do recommend your book</td>
        <td>IV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.38</td>
        <td>1.670</td>
        <td>0.150</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>111</th>
        <td>7</td>
        <td>2</td>
        <td>wait until you get to haast</td>
        <td>wait until you get to haast</td>
        <td>OOV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.85</td>
        <td>1.190</td>
        <td>0.062</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>112</th>
        <td>7</td>
        <td>3</td>
        <td>but this love is ours</td>
        <td>but this love is ours_</td>
        <td>IV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.26</td>
        <td>1.270</td>
        <td>0.077</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>113</th>
        <td>8</td>
        <td>1</td>
        <td>i do recommend your book</td>
        <td>i do recommend your book</td>
        <td>IV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.64</td>
        <td>1.170</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>114</th>
        <td>8</td>
        <td>2</td>
        <td>wait until you get to haast</td>
        <td>wait until you get to haast</td>
        <td>OOV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.91</td>
        <td>1.110</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>115</th>
        <td>8</td>
        <td>3</td>
        <td>but this love is ours</td>
        <td>but this love is ours</td>
        <td>IV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>1.62</td>
        <td>1.430</td>
        <td>0.000</td>
        <td>0.000</td>
    </tr>
    <tr>
        <th>116</th>
        <td>8</td>
        <td>4</td>
        <td>the difference between me and you</td>
        <td>the difference between you and_</td>
        <td>IV</td>
        <td>2.0</td>
        <td>2.0</td>
        <td>3.92</td>
        <td>0.484</td>
        <td>0.000</td>
        <td>0.212</td>
    </tr>
    </tbody>
</table>


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