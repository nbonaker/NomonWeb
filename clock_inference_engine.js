import * as clock_util from './clock_util.js';
import * as config from './config.js';

function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}
function argMin(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
}

export class Entropy{
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

export class KernelDensityEstimation{

    constructor(time_rotate, past_data=null){
        this.dens_li = [];
        this.Z = 0;
        this.ksigma =0;
        this.ksigma0 = 0;
        this.y_li = [];
        this.y_ksigma = [];
        this.damp = 0.96;
        this.n_ksigma = Math.max(5.0, Math.floor(1.0 / (1.0 - this.damp)));
        this.ns_factor = 1.06 / (this.n_ksigma ** 0.2);
        this.time_rotate = time_rotate;

        this.index_li = [];
        for (var i=0; i< config.num_divs_click; i++){
            this.index_li.push(i);
        }

        this.x_li = [];
        for (i in this.index_li){
            var index = this.index_li[i];
            this.x_li.push(index * this.time_rotate / config.num_divs_click - this.time_rotate / 2.0);
        }
        this.past_data = past_data;
        this.initialize_dens();
    }
    initialize_dens(){
        this.Z = 0;
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
        this.ksigma0 = 1.06*config.sigma0 / (this.n_ksigma**0.2);
        this.ksigma = this.ksigma0;
    }
    normal(x, mu, sig_sq){
        return Math.exp(-((x - mu) ** 2) / (2 * sig_sq)) / Math.sqrt(2 * Math.PI * sig_sq);
    }
    optimal_bandwith(things){
        var n = things.length;
        return 1.06 * (n ** -0.2) * Math.std(things);
    }
    ave_sigma_sq(eff_num_points, yLenEff){
        var ysum = 0;
        for (var y_ind = 0; y_ind < yLenEff; y_ind++){
            ysum += this.y_li[y_ind];
        }
        var y2sum = 0;
        for (var y_ind = 0; y_ind < yLenEff; y_ind++){
            ysum += this.y_li[y_ind]**2;
        }
        var ave_sigma_sq = (this.n_ksigma - yLenEff) * this.ksigma0 * this.ksigma0;
        if (yLenEff > 0) {
            ave_sigma_sq += y2sum - ysum * ysum / yLenEff;
        }
        ave_sigma_sq /= this.n_ksigma;

        return ave_sigma_sq;
    }
    calc_ksigma(eff_num_points, yLenEff){
        var ave_sigma_sq = this.ave_sigma_sq(eff_num_points, yLenEff);

        this.ksigma = this.ns_factor * Math.sqrt(Math.max(0.001, ave_sigma_sq));
        this.ksigma = this.ksigma0;
        // console.log(this.ksigma);
        // console.log(this.ksigma0);
        return this.ksigma;
    }
    increment_dens(yin, ksigma){
        this.Z = 0;
        var ksigma_sq = ksigma * ksigma;
        for (var i in this.index_li){
            var index = this.index_li[i];
            var diff = this.x_li[index] - yin;
            var dens = Math.exp(-1 / (2 * ksigma_sq) * diff * diff);
            dens /= Math.sqrt(2 * Math.PI * ksigma_sq);
            this.dens_li[index] = this.damp * this.dens_li[index] + dens;

            this.Z += this.dens_li[index];
        }
    }
}

export class ClockInference{
    constructor(parent, bc, past_data=null){
        this.parent = parent;
        this.bc = bc;
        this.clock_util = new clock_util.ClockUtil(this.parent, this.bc, this);
        this.clocks_li = [];
        var i;
        for (i in this.parent.clock_centers){
            this.clocks_li.push(i);
        }

        this.clocks_on = this.parent.words_on;
        this.cscores = [];
        for (i in this.parent.clock_centers){
            this.cscores.push(0);
        }
        this.clock_locs = [];
        this.prev_cscores = this.cscores.slice();

        this.clock_history = [[]];

        this.sorted_inds = this.clocks_on.slice();
        this.win_diffs = this.parent.win_diffs;

        this.time_rotate = this.parent.time_rotate;

        this.entropy = new Entropy(this);
        this.kde = new KernelDensityEstimation(this.time_rotate);

        this.n_hist = Math.min(200, Math.floor(Math.log(0.02) / Math.log(this.kde.damp)));

        this.past_data = past_data;
    }
    get_score_inc(yin){
        var index = Math.floor(config.num_divs_click * (yin / this.time_rotate + 0.5)) % config.num_divs_click;
        if (this.kde.Z != 0) {
            return Math.log(this.kde.dens_li[index] / this.kde.Z);
        }
        return 1;
    }
    reverse_index_gsi(log_dens_val){
        var dens_val = Math.exp(log_dens_val);

        var dens = [];
        for (var index in this.kde.dens_li){
            var x = this.kde.dens_li[index];
            dens.push(Math.abs(x - dens_val));
        }
        var most_likely_index = argMin(dens);
        return most_likely_index;
    }
    inc_score_inc(yin){
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
    update_scores(time_diff_in) {
        var clock_locs = [];
        for (var i in this.cscores){
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
    update_dens(new_time_rotate){
        this.time_rotate = new_time_rotate;

        this.kde.x_li = [];
        for(var i in this.kde.index_li){
            var index = this.kde.index_li[i];
            this.kde.x_li.push(index * this.time_rotate / config.num_divs_click - this.time_rotate / 2.0);
        }
        for (var n in this.kde.y_li){
            this.kde.increment_dens(this.kde.y_li[n], this.kde.y_ksigma[n]);
        }
        this.kde.calc_ksigma(this.n_hist, Math.min(this.kde.n_ksigma, this.kde.y_li.length));
    }
    update_history(time_diff_in){
        var clock_history_temp = [];

        var clocks_on_cursor = 0;
        for (var i in this.clocks_li){
            if (i == this.clocks_on[clocks_on_cursor]){
                var click_time = (this.clock_util.cur_hours[i] * this.time_rotate / this.clock_util.num_divs_time +
                    time_diff_in - this.time_rotate * config.frac_period + 0.5) % 1 - 0.5;

                clock_history_temp.push(click_time);
                clocks_on_cursor += 1;
            }
            else {
                clock_history_temp.push(0);
            }
        }
        this.clock_history[0].push(clock_history_temp);
    }
    compare_score(index) {
        return -this.cscores[index];
    }
    update_sorted_inds(){
        this.sorted_inds = [];
        var index;
        for (index in this.clocks_on){
            var clock_index = this.clocks_on[index];
            this.sorted_inds.push([this.compare_score(clock_index), clock_index]);
        }

        this.sorted_inds.sort(function(a, b) {return a[0] -  b[0];});

        for (index in this.sorted_inds){
            this.sorted_inds[index] = this.sorted_inds[index][1];
        }
    }
    is_winner(){
        var loc_win_diff = this.win_diffs[this.sorted_inds[0]];
        if (this.clocks_on.length <= 1){
            return true;
        }
        else if (this.cscores[this.sorted_inds[0]] - this.cscores[this.sorted_inds[1]] > loc_win_diff) {
            return true;
        }
        return false;
    }
    learn_scores(is_undo){
        var n_hist = this.clock_history.length;
        if (is_undo){
            if (n_hist > 1){
                this.clock_history.shift();
                this.clock_history.shift();
                this.win_history.shift();
                this.win_history.shift();
            }
            else {
                this.win_history.shift().clock_history = [];
                this.win_history.shift().win_history = [];
            }
        }
        else if (n_hist > config.learn_delay){
            var num_selections = this.clock_history.length;
            var selection_index = -config.learn_delay;
            var n_press = this.clock_history[-selection_index].length;
            var win_index = this.win_history[-selection_index];
            for (var press = 0; press < n_press; press++) {
                var value = this.clock_history[-selection_index][press][win_index];
                this.inc_score_inc(this.clock_history[-selection_index][press][win_index]);
            }

            for (var index = n_hist - 1; index < config.learn_delay - 1; index--) {
                this.clock_history.splice(index, 1);
                this.win_history.splice(index, 1);
            }
        }

        this.clock_history.splice(0, 0, []);
        this.win_history.splice(0, 0, -1);
    }
    handicap_cscores(is_win, is_start){
        if (is_win || is_start){
            if (this.cscores[this.sorted_inds[0]] - this.cscores[this.sorted_inds[1]] > config.max_init_diff) {
                this.cscores[this.sorted_inds[0]] = this.cscores[this.sorted_inds[1]] + config.max_init_diff;
            }
        }
    }

}