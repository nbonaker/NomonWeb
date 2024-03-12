import * as config from './config.js';

/**
 * Helper class to construct an array where the lowest-valued indices are spaced the farthest from one another. Used to
 * set the phases of the clocks such that the highest probability clocks have the most disparate phases.
 *
 * For example, SpacedArray(5).arr = [0, 4, 2, 5, 1, 3]. Note that adjacent numbers (such as 0 and 1, 1 and 2, ...) are pretty far from each other.
 *
 * The values 0, 4, 2, ... are the starting locations of each clock’s hour hands when there are 6 active clocks on the screen.
 *
 * @param {number} nels - The number of elements in the array. Equal to the number of unique hour hand phases (determined by rotation period and framerate).
 */
export class SpacedArray{
    constructor(nels){
        this.rev_arr = [];
        var insert_pt = 0;
        var level = 0;
        for (var index = 0; index < nels; index++) {
            this.rev_arr.splice(insert_pt, 0, index + 1);
            insert_pt += 2;
            if (insert_pt > 2 * (2 ** level - 1)) {
                insert_pt = 0;
                level += 1;
            }
        }
        this.rev_arr.splice(0, 0, 0);

        this.arr = [];
        for (index=0; index < nels + 1; index++) {
            this.arr.push(0);
        }
        for (index=0; index < nels + 1; index++) {
            this.arr[this.rev_arr[index]] = index;
        }
    }
}

/**
 * Helper class to define the unique phase locations available for the clock hour hands.
 * @param num_divs_time - The number of unique hour hand phases (determined by rotation period and framerate).
 */
export class HourLocs{

    constructor(num_divs_time){
        this.num_divs_time = num_divs_time;

        this.hour_locs = [];
        this.hl_base = [];
        for (var index=0; index < num_divs_time; index++){
            var base = -Math.PI / 2.0 + (2.0 * Math.PI * index) / num_divs_time;
            var theta = -config.theta0 + base;
            this.hour_locs.push([theta]);
            this.hl_base.push(base);
        }

    }
}

/**
 * This class is instantiated as the “backend” of the clocks defined in Widgets. This class is not for a single clock, but all
 * clocks on the screen. It orchestrates the phases assigned to each clock and the process of updating their hands on each animation frame.
 * @param {Keyboard} parent - The instance of the Keyboard class.
 * @param {BroderClocks} bc - The instance of the BroderClocks class.
 * @param {ClockInference} clock_inf - The instance of the ClockInference class.
 */
export class ClockUtil{

    constructor(parent, bc, clock_inf) {
        this.parent = parent;
        this.bc = bc;
        this.clock_inf = clock_inf;

        this.cur_hours = [];
        this.clock_angles = [];
        for (var i in this.parent.clock_centers){
            this.cur_hours.push(0.0);
            this.clock_angles.push(0.0);
        }

        this.time_rotate = this.parent.time_rotate;
        this.num_divs_time = Math.ceil(this.parent.time_rotate / config.ideal_wait_s);
        this.spaced = new SpacedArray(this.num_divs_time);
        this.hl = new HourLocs(this.num_divs_time);

        this.adt = [0, 0];
    }

    /**
     * Updates cur hours by one for all clocks: increment the index among [0,80] by 1 for where the clock hand exists.
     * @param {Array<number>} update_clocks_list - Array containing the indices of all active clocks to increment.
     */
    update_curhours(update_clocks_list){
        var count = 0;
        for (var sind_index in update_clocks_list) {
            var sind = update_clocks_list[sind_index];
            this.cur_hours[sind] = this.spaced.arr[count % this.num_divs_time];
            count ++;
        }
    }

    /**
     * Recalculates the clock hours and spacedArray given the new rotation period.
     * @param {number} new_period - The time in seconds of the new clock rotation period.
     */
    change_period(new_period) {
        this.clock_inf.time_rotate = new_period;
        this.clock_inf.update_dens(new_period);
        this.time_rotate = new_period;

        this.num_divs_time = Math.ceil(this.time_rotate / config.ideal_wait_s);

        this.wait_s = this.time_rotate / this.num_divs_time;

        this.hl = new HourLocs(this.num_divs_time);

        this.spaced = new SpacedArray(this.num_divs_time);

        this.init_round(this.clock_inf.clocks_on);
    }
    init_round(clock_index_list){
        this.update_curhours(clock_index_list);
    }
    /**
     * Updates the cur hours by 1, and update both the screen and the parameters of the clocks.
     * @param {Array<number>} clock_index_list - Array containing the indices of all active clocks to increment.
     */
    increment(clock_index_list){
        this.bc.latest_time = Date.now()/1000;
        var clock;
        var clock_ind;
        for (clock_ind in clock_index_list){
            clock = clock_index_list[clock_ind];
            this.cur_hours[clock] = (this.cur_hours[clock] + 1) % this.num_divs_time;
            this.clock_angles[clock] = this.hl.hour_locs[this.cur_hours[clock]];
        }

        var clocks = this.bc.parent.clockgrid.clocks;
        for (clock_ind in clock_index_list){
            var clock_index = clock_index_list[clock_ind];
            clock = clocks[clock_index];
            var angle = this.hl.hour_locs[this.cur_hours[clock_index]];
            clock.angle = angle[0];
            clock.draw_hand();
        }

    }
}