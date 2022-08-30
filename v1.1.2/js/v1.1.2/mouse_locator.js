export class MouseLocator {
    constructor(parent, keygrid_canvas) {
        this.parent = parent;
        this.keygrid_canvas = keygrid_canvas;

        this.mouse_x = 0;
        this.mouse_y = 0;

        this.data_buffer = [];

        document.onmousemove = function(event) {
            var rect = this.keygrid_canvas.canvas.getBoundingClientRect();

            this.mouse_x = parseInt(event.clientX - rect.left);
            this.mouse_y = parseInt(event.clientY - rect.top);
        }.bind(this);
    }
    save_mouse_loc(cur_time, target_clock){
        var target_x = parseInt(target_clock.x_pos /2 *0.989);
        var target_y = parseInt(target_clock.y_pos /2 *0.989);
        var radius = parseInt(target_clock.radius / 2);


        // console.log(cur_time, this.mouse_x, this.mouse_y, target_x, target_y );
        this.data_buffer.push({"timestamp": cur_time, "mousex": this.mouse_x, "mousey": this.mouse_y,
                                "targetx": target_x, "targety": target_y, "radius": radius});

    }
    post_mouse_buffer(){

        var mouse_data = JSON.stringify(this.data_buffer);

        var post_data = {
            "user_id": this.parent.user_id.toString(),
            "session": this.parent.study_manager.session_number.toString(),
            "mouse_data": mouse_data
        };

        console.log(post_data);
        console.log(this.data_buffer.length);

        // noinspection JSAnnotator
        function send_mouse_data() { // jshint ignore:line
            $.ajax({
                method: "POST",
                url: "../php/send_mouse_data.php",
                data: post_data
            }).done(function (data) {
                var result = data;
                console.log(result);
            });
        }

        send_mouse_data();

        this.data_buffer = [];
        this.filenum += 1;
    }

}
