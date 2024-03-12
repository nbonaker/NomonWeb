import * as clock_util from './clock_util.js';
import * as config from './config.js';

/**
 * @private
 * @param array
 * @returns {*}
 */
function argMax(array) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

/**
 * @private
 * @param array
 * @returns {*}
 */
function argMin(array) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
}

/**
 * @private
 * @param {ClockInference} clock_inf -
 */
export class Entropy {
    constructor(clock_inf) {
        this.clock_inf = clock_inf;
        this.num_bits = 0;
        this.bits_per_select = Math.log(this.clock_inf.clocks_on.length) / Math.log(2);
    }

    update_bits() {
        var K = this.clock_inf.clocks_on.length;
        this.bits_per_select = Math.log(K) / Math.log(2);
        this.num_bits += this.bits_per_select;
        return this.num_bits;
    }
}

/**
 * Helper class for the main ClockInference class. Initializes and maintains the kernel density estimation of the user's click-time distribution.
 * @param {number} time_rotate - The rotation period in seconds of the clocks.
 * @param {Object|null} past_data - Object containing previous data from the KDE from the prior session, if no past data then null.
 * @param {Array<number>} past_data.click_dist - The saved dens_li from the prior session.
 * @param {number} past_data.Z - The saved Z from the prior session.
 * @param {number} past_data.ksigma - The saved ksigma from the prior session.
 * @param {number} past_data.ksigma0 - The saved ksigma0 from the prior session.
 * @property {Array<number>} index_li - Indexing array of [0,1,...,80] (config.num_divs_click is set at 80 as default in the config file).
 * @property {Array<number>} x_li - Array defining the locations of the histogram bins around the clock. It is the index_li
 * mapped into discrete seconds between [−T/2, T/2] where T is the rotation period. For example, if config.num divs click = 80 and
 * T = 2, then x li = [-1, ..., 0.975] (list of length 80).
 * @property {Array<number>} dens_li - Array containing the current histogram, represented as a list of length 80 where each value is the 'height' for that bin.
 * @property {number} Z - The sum of the dens_li, used for normalization.
 * @property {Array<number>} y_li - Array of timestamps for the most recent click times fed into the KDE.
 * @property {Array<number>} y_ksigma - Array of the optimal bandwidths used up until so far; y_ksigma[i] is the optimal bandwidth used for kde at the i-th recent press.
 * @property {number} damp - The dampening factor used to weight more recent click times more heavily (default = 0.96).
 */
export class KernelDensityEstimation {

    constructor(time_rotate, past_data = null) {
        this.dens_li = [];
        this.Z = 0;
        this.ksigma = 0;
        this.ksigma0 = 0;
        this.y_li = [];
        this.y_ksigma = [];
        this.damp = 0.96;
        this.n_ksigma = Math.max(5.0, Math.floor(1.0 / (1.0 - this.damp)));
        this.ns_factor = 1.06 / (this.n_ksigma ** 0.2);
        this.time_rotate = time_rotate;

        this.index_li = [];
        for (var i = 0; i < config.num_divs_click; i++) {
            this.index_li.push(i);
        }

        this.x_li = [];
        for (i in this.index_li) {
            var index = this.index_li[i];
            this.x_li.push(index * this.time_rotate / config.num_divs_click - this.time_rotate / 2.0);
        }
        this.past_data = past_data;
        this.initialize_dens();
    }

    /**
     * Initializes the KDE with the past data, if available, or uses an initial normal distribution.
     */
    initialize_dens() {
        this.Z = 0;

        if (this.past_data !== null && this.past_data.click_dist !== null && this.past_data.Z !== null &&
            this.past_data.ksigma !== null && this.past_data.ksigma0 !== null) {
            this.dens_li = this.past_data.click_dist;
            this.Z = this.past_data.Z;
            this.ksigma = this.past_data.ksigma;
            this.ksigma0 = this.past_data.ksigma0;
        } else {
            this.dens_li = [];

            for (var i in this.x_li) {
                var x = this.x_li[i];
                var diff = x - config.mu0;

                var dens = Math.exp(-1 / (2 * config.sigma0_sq) * diff * diff);
                dens /= Math.sqrt(2 * Math.PI * config.sigma0_sq);
                dens *= this.n_ksigma;
                this.dens_li.push(dens);
                this.Z += dens;
            }
            this.ksigma0 = 1.06 * config.sigma0 / (this.n_ksigma ** 0.2);
            this.ksigma = this.ksigma0;
        }
    }

    /**
     * Helper function for calculating the optimal bandwidth.
     * @param eff_num_points
     * @param yLenEff
     * @returns {number}
     */
    ave_sigma_sq(eff_num_points, yLenEff) {
        var ysum = 0;
        for (var y_ind = 0; y_ind < yLenEff; y_ind++) {
            ysum += this.y_li[y_ind];
        }
        var y2sum = 0;
        for (var y_ind = 0; y_ind < yLenEff; y_ind++) {
            ysum += this.y_li[y_ind] ** 2;
        }
        var ave_sigma_sq = (this.n_ksigma - yLenEff) * this.ksigma0 * this.ksigma0;
        if (yLenEff > 0) {
            ave_sigma_sq += y2sum - ysum * ysum / yLenEff;
        }
        ave_sigma_sq /= this.n_ksigma;

        return ave_sigma_sq;
    }

    /**
     * Returns the optimal bandwidth for kernel density estimation. When overlapping normal distributions centered around each
     * sample, the optimal bandwidth w is given by w = 1.06σN^(−1/5), where N is the number of samples and σ is the standard deviation of the samples.
     * @param eff_num_points
     * @param yLenEff
     * @returns {number}
     */
    calc_ksigma(eff_num_points, yLenEff) {
        var ave_sigma_sq = this.ave_sigma_sq(eff_num_points, yLenEff);

        this.ksigma = this.ns_factor * Math.sqrt(Math.max(0.001, ave_sigma_sq));
        this.ksigma = this.ksigma0;
        // console.log(this.ksigma);
        // console.log(this.ksigma0);
        return this.ksigma;
    }

    /**
     * When a new yin (relative click-time) comes in, include that new point in Kernel density estimation.
     * @param {number} yin - The new relative click-time in seconds.
     * @param {number} ksigma - The new calculated optimal bandwidth.
     */
    increment_dens(yin, ksigma) {
        this.Z = 0;
        var ksigma_sq = ksigma * ksigma;
        for (var i in this.index_li) {
            var index = this.index_li[i];
            var diff = this.x_li[index] - yin;
            var dens = Math.exp(-1 / (2 * ksigma_sq) * diff * diff);
            dens /= Math.sqrt(2 * Math.PI * ksigma_sq);
            this.dens_li[index] = this.damp * this.dens_li[index] + dens;

            this.Z += this.dens_li[index];
        }
    }
}

/**
 * This is the main class of the script. It applies and adjusts the KernelDensityEstimation to the clock interfaces of Nomon.
 * @param {Keyboard} parent - The instance of the main Keyboard Class.
 * @param {BroderClocks} bc - The instance of the BroderClocks class.
 * @param {Object|null} past_data - Object containing previous data from the KDE from the prior session, if no past data then null. Details in the KernelDensityEstimation class documentation.
 * @property {KernelDensityEstimation} kde - The instance of the KernelDensityEstimation class.
 * @property {Array<number>} clocks_li - Array of all the active clocks on the screen.
 * @property {Array<number>} cscores - Array of scores for the likelihood that the user intended to choose
 * a particular clock at the current round of selection, for all clocks on the screen. This is a list of scores for only the current round of selection.
 * @property {Array<Array<number>>} clock_history - 2D Array where each sub-array lists the relative angles around each clock at the
 * click times so far. For example, if the user has clicked twice so far, clock history would be a length-2 Array where each of the two
 * elements is an Array of the relative angles around each clock for all the clocks. Note that the most recent press corresponds to clock history[0].
 * @property {Array<number>} clock_locs - The relative angles around each clock at the press times only
 * for the most recent press. It is equivalent to clock history[0].
 *
 */
export class ClockInference {
    constructor(parent, bc, past_data = null) {
        this.past_data = past_data;
        this.parent = parent;
        this.bc = bc;
        this.clock_util = new clock_util.ClockUtil(this.parent, this.bc, this);
        this.clocks_li = [];
        var i;
        for (i in this.parent.clock_centers) {
            this.clocks_li.push(i);
        }

        this.clocks_on = this.parent.words_on;
        this.cscores = [];
        for (i in this.parent.clock_centers) {
            this.cscores.push(0);
        }
        this.clock_locs = [];

        this.clock_history = [[]];

        this.sorted_inds = this.clocks_on.slice();
        this.win_diffs = this.parent.win_diffs;

        this.time_rotate = this.parent.time_rotate;

        this.entropy = new Entropy(this);

        this.kde = new KernelDensityEstimation(this.time_rotate, this.past_data);

        this.n_hist = Math.min(200, Math.floor(Math.log(0.02) / Math.log(this.kde.damp)));

    }

    /**
     * Calculates the likelihood that a clock will be chosen, given the
     * relative click angle around that clock. Note that the input is the click time
     * converted into the relative angle around the clock, not the actual click time
     * itself.
     * @param yin {number} - The relative click time in seconds
     * @returns {number} - returns the likelihood that a clock will be chosen.
     */
    get_score_inc(yin) {
        var index = Math.floor(config.num_divs_click * (yin / this.time_rotate + 0.5)) % config.num_divs_click;
        if (this.kde.Z != 0) {
            return Math.log(this.kde.dens_li[index] / this.kde.Z);
        }
        return 1;
    }

    /**
     *
     * @param log_dens_val
     * @returns {*}
     */
    reverse_index_gsi(log_dens_val) {
        var dens_val = Math.exp(log_dens_val);

        var dens = [];
        for (var index in this.kde.dens_li) {
            var x = this.kde.dens_li[index];
            dens.push(Math.abs(x - dens_val));
        }
        var most_likely_index = argMin(dens);
        return most_likely_index;
    }

    /**
     * Note that the density calculation only involves the most recent
     * n hist samples. When a new yin comes in, decide if we need to throw away
     * any old yin in y list (anything past n hist), and do increment dens. Also
     * update ksigma calculation.
     * @param {number} yin - The relative click time in seconds.
     */
    inc_score_inc(yin) {
        console.log("yin:", yin);
        if (this.kde.y_li.length > this.n_hist) {
            this.kde.y_li.pop();
            this.kde.y_ksigma.pop();
        }
        this.kde.y_li.splice(0, 0, yin);
        this.kde.y_ksigma.splice(0, 0, this.kde.ksigma);

        this.kde.increment_dens(yin, this.kde.ksigma);
        this.kde.calc_ksigma(this.n_hist, Math.min(this.kde.n_ksigma, this.kde.y_li.length));
        this.parent.histogram.update(this.kde.dens_li);
    }

    /**
     * Update the posterior estimates for the clocks (cscores) every time yin come in.
     * @param {number} time_diff_in - The relative click time in seconds.
     */
    update_scores(time_diff_in) {
        var clock_locs = [];
        for (var i in this.cscores) {
            clock_locs.push(0);
        }
        for (var index in this.clocks_on) {
            var clock = this.clocks_on[index];
            var time_in = this.clock_util.cur_hours[clock] * this.time_rotate /
                this.clock_util.num_divs_time + time_diff_in - this.time_rotate * config.frac_period;

            this.cscores[clock] += this.get_score_inc(time_in);
            clock_locs[clock] = time_in;
        }
        this.clock_locs.push(clock_locs);
        this.update_sorted_inds();
    }

    /**
     * Update the histogram (kde.dens li) if the rotation period
     * changes. Note that this function is only used when the rotation period changes,
     * and the kde.dens li when a new press time comes in happens at inc score inc.
     * @param {number} new_time_rotate - The new clock rotation period in seconds.
     */
    update_dens(new_time_rotate) {
        this.time_rotate = new_time_rotate;

        this.kde.x_li = [];
        for (var i in this.kde.index_li) {
            var index = this.kde.index_li[i];
            this.kde.x_li.push(index * this.time_rotate / config.num_divs_click - this.time_rotate / 2.0);
        }
        for (var n in this.kde.y_li) {
            this.kde.increment_dens(this.kde.y_li[n], this.kde.y_ksigma[n]);
        }
        this.kde.calc_ksigma(this.n_hist, Math.min(this.kde.n_ksigma, this.kde.y_li.length));
    }

    /**
     * Given a new click time, update clock_history.
     * @param {number} time_diff_in - The relative click time in seconds.
     */
    update_history(time_diff_in) {
        var clock_history_temp = [];

        var clocks_on_cursor = 0;
        for (var i in this.clocks_li) {
            if (i == this.clocks_on[clocks_on_cursor]) {
                var click_time = this.clock_util.cur_hours[i] * this.time_rotate / this.clock_util.num_divs_time +
                    time_diff_in - this.time_rotate * config.frac_period;


                clock_history_temp.push(click_time);
                clocks_on_cursor += 1;
            } else {
                clock_history_temp.push(0);
            }
        }
        this.clock_history[0].push(clock_history_temp);
    }

    /**
     * Helper function to sort the cscores.
     * @private
     * @param {number} index
     * @returns {number}
     */
    compare_score(index) {
        return -this.cscores[index];
    }

    /**
     * Updates the list of clocks sorted by highest cscore (the largest posterior probability).
     */
    update_sorted_inds() {
        this.sorted_inds = [];
        var index;
        for (index in this.clocks_on) {
            var clock_index = this.clocks_on[index];
            this.sorted_inds.push([this.compare_score(clock_index), clock_index]);
        }

        this.sorted_inds.sort(function (a, b) {
            return a[0] - b[0];
        });

        for (index in this.sorted_inds) {
            this.sorted_inds[index] = this.sorted_inds[index][1];
        }
    }

    /**
     * Determine if the highest-probability clock is the winner and should be selected. if its
     * posterior probability is higher than 1−P(error) (There is a winner iff this is met).
     * Refer to page 17, section “Selection Decisions” of Prof. Broderick’s Nomon Tech Report
     * for more detail.
     * @returns {boolean} - Whether the top-score clock should be selected.
     */
    is_winner() {
        var loc_win_diff = this.win_diffs[this.sorted_inds[0]];


        if (this.clocks_on.length <= 1) {
            return true;
        } else if (this.cscores[this.sorted_inds[0]] - this.cscores[this.sorted_inds[1]] > loc_win_diff) {
            return true;
        }
        return false;
    }

    /**
     * While this function has a very similar name with update scores,
     * they serve quite different functionalities. Instead of doing something directly
     * related with scores, this function updates all history-related attributes, such as
     * win history, clock history, and calls inc score inc
     * @param {boolean} is_undo - Whether the previously selected clock was undo.
     */
    learn_scores(is_undo) {
        var n_hist = this.clock_history.length;
        if (is_undo) {
            if (n_hist > 1) {
                this.clock_history.shift();
                this.clock_history.shift();
                this.win_history.shift();
                this.win_history.shift();
            } else {
                this.clock_history = [[]];
                this.win_history = [];
            }
        } else if (n_hist > config.learn_delay) {
            var num_selections = this.clock_history.length;
            var selection_index = -config.learn_delay;
            var n_press = this.clock_history[-selection_index].length;
            var win_index = this.win_history[-selection_index];

            for (var press = 0; press < n_press; press++) {
                var value = this.clock_history[-selection_index][press][win_index];
                this.bc.rel_click_times.push(value);
                this.inc_score_inc(this.clock_history[-selection_index][press][win_index]);
            }

            // this.save_click_dist();

            for (var index = n_hist - 1; index < config.learn_delay - 1; index--) {
                this.clock_history.splice(index, 1);
                this.win_history.splice(index, 1);
            }
        }

        this.clock_history.splice(0, 0, []);
        this.win_history.splice(0, 0, -1);
    }

    /**
     * If the highest scoring clock is above a certain threshold,
     * force the highest score to be that threshold.
     * @param {boolean} is_win - Was the top-score clock selected in the current round.
     * @param {boolean} is_start - Is this the first round before any clicks.
     */
    handicap_cscores(is_win, is_start) {
        if (is_win || is_start) {
            if (this.cscores[this.sorted_inds[0]] - this.cscores[this.sorted_inds[1]] > config.max_init_diff) {
                this.cscores[this.sorted_inds[0]] = this.cscores[this.sorted_inds[1]] + config.max_init_diff;
            }
        }
    }

}