export var period_li = [];
for (var i=0; i < 21; i++){
    period_li.push(4*Math.exp((-i)/10));
}

export var default_rotate_ind = 1;

export var num_divs_click = 80;
export var ideal_wait_s = 0.04;

export var frac_period = 4.0 / 8.0;
export var theta0 = frac_period * 2.0 * Math.PI;


export var win_diff_base = Math.log(99);
export var win_diff_high = Math.log(999);
export var max_init_diff = win_diff_base - Math.log(4);

export var is_learning = true;
export var is_pre_learning = true;

export var is_write_data = true;
export var undo_index = 5;
export var learn_delay = 1;

export var mu0 = 0.05 ;
export var sigma0 = 0.18;
export var sigma0_sq = sigma0 * sigma0;
export var range0 = 2;