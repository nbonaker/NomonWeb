import * as cie from './clock_inference_engine.js';
import * as config from './config.js';

/**
 * Handles the
 * @param {Keyboard} parent - the parent class, usually an instance of the Keyboard class
 */
export class BroderClocks {

    constructor(parent) {
        this.parent = parent;
        this.parent.bc_init = true;
        this.clock_inf = new cie.ClockInference(this.parent, this, this.parent.prev_data);
        this.is_undo = false;
        this.is_equalize = false;
        this.is_win = this.clock_inf.is_winner();
        this.is_start = false;

        this.latest_time = Date.now() / 1000;
        this.last_press_time = Date.now() / 1000;
        this.last_gap_time_li = [];
        this.last_press_time_li = [];

        this.abs_click_times = [];
        this.rel_click_times = [];

        this.time_rotate = this.parent.time_rotate;
        this.clock_inf.clock_util.change_period(this.time_rotate);
    }

    /**
     * triggered by a switch-press event in the main keyboard class. Updates the clock posteriors and the histogram
     * given the information in the new click.
     * @param {float} time_in - The epoch-timestamp in ms that the user clicked their switch.
     */
    select(time_in) {

        this.clock_inf.update_scores(time_in - this.latest_time);
        if (config.is_learning) {
            this.clock_inf.update_history(time_in - this.latest_time);
        }

        var top_score_clock = this.clock_inf.sorted_inds[0];
        var ind_in_histo = this.clock_inf.reverse_index_gsi(this.clock_inf.cscores[top_score_clock]);

        this.abs_click_times.push(time_in);
        // this.rel_click_times.push(ind_in_histo);

        var last_gap_time = (time_in - this.last_press_time) % this.time_rotate;

        if (this.clock_inf.is_winner() && !this.parent.in_tutorial) {
            console.log(this.parent.clockgrid.clocks[top_score_clock].text);

            this.clock_inf.win_history[0] = this.clock_inf.sorted_inds[0];

            this.clock_inf.entropy.update_bits();
            this.parent.make_choice(this.clock_inf.sorted_inds[0]);

        } else {
            this.init_round(false, false, []);
        }
    }

    /**
     * Continues the select process after the word cache promise has loaded
     * @param results {Array} - array of length 5 specifying the setup for the new round:
     * @param {Array<number>} results.0 - the clocks turned on given the new word predictions
     * @param {Array<number>} results.1 - the clocks turned off given the new word predictions
     * @param {Array<number>} results.2 - the prior distribution for the clocks_on given the new lm results
     * @param {Boolean} results.3 - whether the undo clock was selected in the last selection round
     * @param {Boolean} results.4 - ? holdover from an obsolete corrective character
     * @param {Boolean} results.5 - ? need to figure this out
     */
    continue_select(results) {
        this.clock_inf.clocks_on = results[0];
        this.clock_inf.clocks_off = results[1];
        var clock_score_prior = results[2];
        this.is_undo = results[3];
        this.is_equalize = results[4];
        var skip_hist = results[5];

        if (skip_hist) {
            this.init_round(true, true, clock_score_prior);
        } else {
            if (!this.parent.in_tutorial) {
                this.clock_inf.learn_scores(this.is_undo);
            }

            this.init_round(true, false, clock_score_prior);
        }
    }

    /**
     * re-initializes variables at the beginning of a new selection round
     */
    init_bits() {
        this.bits_per_select = Math.log(this.clock_inf.clocks_on.length) / Math.log(2);

        this.start_time = Date.now() / 1000;

        this.last_win_time = this.start_time;
        this.num_bits = 0;
        this.num_selects = 0;
    }

    /**
     * re-initializes variables at the beginning of a new selection round.
     * @param {Array<number>} clock_score_prior - the prior probabilities from the language model of the clocks currently on.
     */
    init_follow_up(clock_score_prior) {
        this.init_round(false, false, clock_score_prior);

        this.clock_inf.clock_history = [[]];
        this.clock_inf.win_history = [-1];

        this.just_undid = false;

        this.init_bits();
    }

    /**
     * Sets up the inference aspects for a new round following a switch event
     * @param {Boolean} is_win - Whether a clock is selected after the switch event.
     * @param {Boolean} is_start - Whether this is the first round after a switch event.
     * @param {Array<number>} clock_score_prior - The prior probabilities over the active clocks before the switch event.
     */
    init_round(is_win, is_start, clock_score_prior) {
        this.clock_inf.clock_util.init_round(this.clock_inf.clocks_li);
        this.clock_inf.clock_util.init_round(this.clock_inf.clocks_on);
        var clock;
        var clock_ind;
        var top_score;

        if (is_win || is_start) {
            if (is_win) {
                var win_clock = this.clock_inf.sorted_inds[0];
            }
            var count = 0;
            if (this.is_undo && !this.is_equalize) {
                for (clock_ind in this.clock_inf.clocks_on) {
                    clock = this.clock_inf.clocks_on[clock_ind];
                    this.clock_inf.cscores[clock] = 0;
                    count += 1;
                }
                top_score = 0;
            } else {
                for (clock_ind in this.clock_inf.clocks_on) {
                    clock = this.clock_inf.clocks_on[clock_ind];
                    this.clock_inf.cscores[clock] = clock_score_prior[count];
                    count += 1;
                }
                top_score = 0;
            }
        }

        this.clock_inf.update_sorted_inds();

        this.clock_inf.clock_util.update_curhours(this.clock_inf.sorted_inds);

        this.clock_inf.handicap_cscores(is_win, is_start);
        top_score = this.clock_inf.cscores[this.clock_inf.sorted_inds[0]];

        var bound_score;
        if (this.clock_inf.clock_history[0].length == 0) {
            bound_score = top_score - config.max_init_diff;
        } else {
            bound_score = top_score - this.parent.win_diffs[this.clock_inf.sorted_inds[0]];
        }

        for (var i in this.clock_inf.clocks_on) {
            clock_ind = this.clock_inf.clocks_on[i];
            clock = this.parent.clockgrid.clocks[clock_ind];

            if (this.clock_inf.cscores[clock_ind] > bound_score) {
                clock.highlighted = true;
                clock.draw_face();
            } else {
                clock.highlighted = false;
                clock.draw_face();
            }
        }
    }
}