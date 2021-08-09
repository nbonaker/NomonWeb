export class OptionsManager{
    constructor(options_array, scan_delay = 1, parent=null, own_keyevent=true) {
        this.options_array = options_array;
        this.scan_delay = scan_delay;
        this.scan_abort_count = 2;
        this.parent=parent;

        this.num_rows = options_array.length;
        this.row_lengths = [];
        for(var row in this.options_array) {
            this.row_lengths.push(this.options_array[row].length);
        }

        this.row_scan = -1;
        this.col_scan = -2;
        this.col_scan_count = 0;
        this.next_scan_time = Infinity;
        this.prev_scan_time = Infinity;

        if (own_keyevent) {
            window.addEventListener('keydown', function (e) {
                if (e.keyCode === 32) {
                    e.preventDefault();
                    this.update_scan_time(true);
                }
            }.bind(this), false);
            this.skip_next_press = false;
        } else {
            this.skip_next_press = true;
        }

        this.update_scan_time(false);
        this.update_highlights();
    }
    update_scan_time(press){
        var time_in = Date.now()/1000;

        if (this.skip_next_press && press){
            this.skip_next_press = false;
            return
        }
        if (this.parent && !this.parent.allow_input && press){
            if (!this.parent.allow_rcom_input(this.row_scan, this.col_scan)) {
                return;
            }
        }

        if (press) {
            if (this.col_scan == -2) { // in row scan
                this.col_scan = -1;
                this.next_scan_time = time_in;
            } else { // in col scan
                var selection = this.options_array[this.row_scan][this.col_scan];
                this.col_scan = -2;
                this.row_scan = -1;
                this.next_scan_time = Infinity;

                this.make_choice(selection);
                this.update_scan_time(false);
                this.update_highlights();
            }

        } else {
            this.prev_scan_time = this.next_scan_time;

            if (this.col_scan == -2) { // in row scan
                this.col_scan_count = 0;
                this.row_scan += 1;

                if (this.row_scan >= this.num_rows) {
                    this.row_scan = 0;
                }

                this.next_scan_time = time_in + this.scan_delay;

            } else { // in col scan
                this.col_scan += 1;

                if (this.col_scan >= this.row_lengths[this.row_scan]) {
                    this.col_scan = 0;
                    this.col_scan_count += 1;
                }
                this.next_scan_time = time_in + this.scan_delay;
            }

            if (this.col_scan_count > this.scan_abort_count){
                this.row_scan = 0;
                this.col_scan = -2;
                this.col_scan_count = 0;
            }
        }

        console.log(this.row_scan, this.col_scan, press, this.next_scan_time);
    }
    update_highlights(){
        for(var row_num = 0; row_num < this.num_rows; row_num += 1){
            if(row_num === this.row_scan){
                for(var col_num = 0; col_num <this.row_lengths[row_num]; col_num += 1){
                    if (col_num === this.col_scan){
                        this.options_array[row_num][col_num].darkhighlight();
                    }else{
                        this.options_array[row_num][col_num].highlight();
                    }
                }
            } else {
                for(var col_num = 0; col_num <this.row_lengths[row_num]; col_num += 1){
                    this.options_array[row_num][col_num].unhighlight();
                }
            }

        }
    }
    make_choice(selection){
        selection.select();
        this.parent = null
    }
    animate() {
        var time_in = Date.now() / 1000;
        if (time_in >= this.next_scan_time) {
            this.update_scan_time(false);
            this.update_highlights();
        }
    }
}

