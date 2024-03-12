/**
 * Array specifying the length of time in seconds for the available clock rotation periods
 * @type {Array<number>}
 */
export var period_li = [];
for (var i=0; i < 21; i++){
    period_li.push(6*Math.exp((-i)/10));
}

/**
 * Specifies the default rotation period on first load.
 * @type {number}
 */
export var default_rotate_ind = 5;

/**
 * Specifies the number of histogram bins to use in the Kernel Density Estimation of the user's click-time-distribution estimate.
 * @type {number}
 */
export var num_divs_click = 80;

/**
 * Specifies the ideal time in seconds between frame updates.
 * @type {number}
 */
export var ideal_wait_s = 0.04;

export var frac_period = 4.0 / 8.0;
export var theta0 = frac_period * 2.0 * Math.PI;

/**
 * Specifies the difference in probability that an option needs to be selected.
 * @type {number}
 */
export var win_diff_base = Math.log(99);
/**
 * Specifies difference in probability that the undo option needs to be selected.
 * @type {number}
 */
export var win_diff_high = Math.log(999);
export var max_init_diff = win_diff_base - Math.log(4);

/**
 * Whether the user's click-time-distribution should be learned.
 * @type {boolean}
 */
export var is_learning = true;

/**
 * The number of selections to wait before adding prior clicks to the KDE.
 * @type {number}
 */
export var learn_delay = 1;

export var mu0 = 0.05 ;
export var sigma0 = 0.12;
export var sigma0_sq = sigma0 * sigma0;
export var range0 = 2;