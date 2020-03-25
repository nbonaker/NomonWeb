import * as config from './config.js';

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
    update_curhours(update_clocks_list){
        var count = 0;
        for (var sind_index in update_clocks_list) {
            var sind = update_clocks_list[sind_index];
            this.cur_hours[sind] = this.spaced.arr[count % this.num_divs_time];
            count ++;
        }
    }
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