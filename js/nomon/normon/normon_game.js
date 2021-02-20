
class NormonCanvas{
    constructor(canvas_id, layer_index) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.style.position = "absolute";
        this.canvas.style.left = "0px";
        this.ctx = this.canvas.getContext("2d");
        this.calculate_size();
        this.canvas.style.zIndex = layer_index;
    }
    calculate_size(){

        this.window_width = window.innerWidth;
        this.window_height = window.innerHeight;

        this.resolution_factor = 2;
        this.screen_fill_factor = 0.98;

        this.canvas.width = this.window_width * this.resolution_factor;
        this.canvas.height = this.window_height*this.resolution_factor;
        this.canvas.style.width = (this.window_width * this.screen_fill_factor).toString().concat("px");
        this.canvas.style.height = ((this.window_height) * this.screen_fill_factor).toString().concat("px");

        this.screen_width = this.window_width * this.resolution_factor;
        this.screen_height = (this.window_height) * this.resolution_factor;
    }
}

class Eye {
    constructor(canvas, x_rel, y_rel, size, parent, mass) {
        this.parent = parent;
        this.canvas = canvas;
        this.x_rel = x_rel;
        this.x_base = x_rel;

        this.y_rel = y_rel;
        this.y_base = y_rel;

        this.mass= mass;

        this.r_rel = 0;
        this.r_base = 0;

        this.x_vel = 0;
        this.y_vel = 0;
        this.r_vel = 0;

        this.size = size;
        this.redraw()
    }
    redraw(){
        this.canvas.ctx.lineWidth = this.size / 5;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.lineCap = "round";
        this.canvas.ctx.strokeStyle = "#000000";

        this.canvas.ctx.ellipse(this.parent.x_pos+this.x_rel, this.parent.y_pos+this.y_rel, this.size*0.14, this.size*0.2, this.r_rel, 0, 2 * Math.PI);
        this.canvas.ctx.fillStyle = "#000000";
        this.canvas.ctx.fill();

        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(this.parent.x_pos+this.x_rel-this.size*0.01, this.parent.y_pos+this.y_rel-this.size*0.05, this.size*0.07, 0, 2 * Math.PI);
        this.canvas.ctx.fillStyle = "#ffffff";
        this.canvas.ctx.fill();

    }
    compute_motion(){
        var rel_angle = Math.atan(this.y_rel/this.x_rel);
        var rad = Math.sqrt(this.x_rel**2 + this.y_rel**2);

        if (rad > this.size*0.69){
            // outer rotational vel
            if (this.x_rel > 0) {
                this.x_vel = -this.parent.r_vel * rad * Math.sin(rel_angle)*1.1/this.mass;
                this.y_vel = this.parent.r_vel * rad * Math.cos(rel_angle)*1.1/this.mass;
            } else {
                this.x_vel = this.parent.r_vel * rad * Math.sin(rel_angle)*1.1/this.mass;
                this.y_vel = -this.parent.r_vel * rad * Math.cos(rel_angle)*1.1/this.mass;
            }

            this.r_vel = this.parent.r_vel*1.5;

        }

        if (this.y_rel < Math.sqrt((this.size*0.7)**2-this.x_rel**2)){
            this.y_vel += this.parent.gravity;
        } else {
            this.x_vel += -this.parent.gravity*Math.sin(this.x_rel/(2*this.size*0.8)*2*Math.PI);
        }


        this.x_rel += this.x_vel - this.parent.x_vel*0.1/this.mass ;
        this.y_rel += this.y_vel - this.parent.y_vel*0.1/this.mass ;
        this.r_rel += this.r_vel;

        if (Math.sqrt(this.x_rel**2 + this.y_rel**2) > (this.size*0.7)){
            var scale = (this.size*0.7)/Math.sqrt(this.x_rel**2 + this.y_rel**2);
            this.x_rel *= scale;
            this.y_rel *= scale;
        }
    }
    compute_return(){
        this.x_vel = 0.2*(this.x_base-this.x_rel);
        this.y_vel = 0.2*(this.y_base-this.y_rel);
        this.r_vel = 0.2*(this.r_base-this.r_rel);

        this.x_rel += this.x_vel;
        this.y_rel += this.y_vel;
        this.r_rel += this.r_vel;
    }
}


class Eyebrow {
    constructor(canvas, x_rel, y_rel, size, left, parent, mass) {
        this.parent = parent;
        this.left = left;
        this.canvas = canvas;
        this.x_rel = x_rel;
        this.x_base = x_rel;

        this.mass=mass;

        this.y_rel = y_rel;
        this.y_base = y_rel;

        this.r_rel = 0;
        this.r_base = 0;

        this.x_vel = 0;
        this.y_vel = 0;
        this.r_vel = 0;

        this.size = size;
        this.redraw()
    }
    redraw(){
        this.canvas.ctx.lineWidth = this.size / 10;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.lineCap = "round";
        this.canvas.ctx.strokeStyle = "#000000";

        if (this.left) {
            this.canvas.ctx.arc(this.parent.x_pos + this.x_rel + this.size * 0.15, this.parent.y_pos + this.y_rel + this.size * 0.15, this.size * 0.25, -2.7, -1.7);
        }
        else {
            this.canvas.ctx.arc(this.parent.x_pos + this.x_rel - this.size * 0.15, this.parent.y_pos + this.y_rel + this.size * 0.15, this.size * 0.25, -1.5, -0.5);
        }
        this.canvas.ctx.stroke();

    }
    compute_motion(){
        var rel_angle = Math.atan(this.y_rel/this.x_rel);
        var rad = Math.sqrt(this.x_rel**2 + this.y_rel**2);

        if (rad > this.size*0.69){
            // outer rotational vel
            if (this.x_rel > 0) {
                this.x_vel = -this.parent.r_vel * rad * Math.sin(rel_angle)*1.1/this.mass;
                this.y_vel = this.parent.r_vel * rad * Math.cos(rel_angle)*1.1/this.mass;
            } else {
                this.x_vel = this.parent.r_vel * rad * Math.sin(rel_angle)*1.1/this.mass;
                this.y_vel = -this.parent.r_vel * rad * Math.cos(rel_angle)*1.1/this.mass;
            }

        }

        if (this.y_rel < Math.sqrt((this.size*0.7)**2-this.x_rel**2)){
            this.y_vel += this.parent.gravity;
        } else {
            this.x_vel += -this.parent.gravity*Math.sin(this.x_rel/(2*this.size*0.8)*2*Math.PI);
        }


        this.x_rel += this.x_vel - this.parent.x_vel*0.1/this.mass ;
        this.y_rel += this.y_vel - this.parent.y_vel*0.1/this.mass ;
        this.r_rel += this.r_vel;

        if (Math.sqrt(this.x_rel**2 + this.y_rel**2) > (this.size*0.7)){
            var scale = (this.size*0.7)/Math.sqrt(this.x_rel**2 + this.y_rel**2);
            this.x_rel *= scale;
            this.y_rel *= scale;
        }
    }
    compute_return(){
        this.x_vel = 0.3*(this.x_base-this.x_rel);
        this.y_vel = 0.3*(this.y_base-this.y_rel);
        this.r_vel = 0.3*(this.r_base-this.r_rel);

        this.x_rel += this.x_vel;
        this.y_rel += this.y_vel;
        this.r_rel += this.r_vel;
    }
}


class Normon {
    constructor(canvas, x_pos, y_pos, radius, hist) {
        this.canvas = canvas;
        this.x_pos = x_pos;
        this.y_pos = y_pos;
        this.y_base = y_pos;
        this.radius = radius;
        this.angle = 0.5;
        this.hist = hist;

        this.draw_face();
        this.draw_hand();
        this.left_eye = new Eye(canvas, -radius*0.35, -radius*0.3, radius, this, 1.5);
        this.right_eye = new Eye(canvas, +radius*0.35, -radius*0.3, radius, this, 1.7);

        this.left_eyebrow = new Eyebrow(canvas, -radius*0.47, -radius*0.55, radius, true, this, 1.3);
        this.right_eyebrow = new Eyebrow(canvas, radius*0.47, -radius*0.55, radius, false, this, 1);

        this.r_vel = 0.0;
        this.x_vel = 0.0;
        this.y_vel = 0.0;
        this.gravity = 1;

        this.target_coords = [800, 1000];

        this.start_time= Date.now();
        this.jump = false;
        this.period = 7000;

        window.addEventListener('keydown', function (e) {

            if (e.keyCode === 32) {
                e.preventDefault();
                this.on_press();
            }
        }.bind(this), false);
    }
    draw_face() {
        this.canvas.ctx.beginPath();
        this.canvas.ctx.clearRect(this.x_pos - this.radius*1.3, this.y_pos - this.radius*1.3,
                    this.radius * 2.6, this.radius * 2.6);

        this.canvas.ctx.arc(this.x_pos, this.y_pos, this.radius, 0, 2 * Math.PI);
        this.canvas.ctx.fillStyle = "#ffffff";
        this.canvas.ctx.fill();

        this.canvas.ctx.strokeStyle = "#0056ff";

        this.canvas.ctx.lineWidth = this.radius / 5;
        this.canvas.ctx.stroke();

    }
    draw_hand() {
        if (this.angle > Math.PI * 2) {
            this.angle = this.angle % Math.PI * 2;
        }
        this.canvas.ctx.beginPath();
        this.canvas.ctx.lineCap = "round";

        var angle_correction = 0;
        this.canvas.ctx.moveTo(this.x_pos + Math.cos(this.angle - angle_correction) * this.radius * 0.7,
            this.y_pos + Math.sin(this.angle - angle_correction) * this.radius * 0.7);
        this.canvas.ctx.lineTo(this.x_pos - Math.cos(this.angle - angle_correction) * this.radius * 0.0,
            this.y_pos - Math.sin(this.angle - angle_correction) * this.radius * 0.0);

        this.canvas.ctx.strokeStyle = "#0056ff";

        this.canvas.ctx.lineWidth = this.radius / 5;
        this.canvas.ctx.stroke();

        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.x_pos, this.y_pos);
        this.canvas.ctx.lineTo(this.x_pos, this.y_pos - this.radius * 0.925);

    }
    compute_motion(){

        var ideal_x_vel = 14;

        this.x_vel += (ideal_x_vel-this.x_vel)*0.1;

        if (this.jump){
            this.y_vel = -30;
            this.jump = false;
            this.y_pos -= 2;
        }

        if (this.y_pos < this.y_base){
            this.y_vel += 1;

        } else {
            this.y_vel *= -0.6;
            this.y_pos = this.y_base+1;
        }


        // this.x_pos += this.x_vel;
        this.y_pos += this.y_vel;
        this.hist.scroll_factor += this.x_vel/this.hist.bin_width;
        this.hist.generate_normal_values();
        this.hist.update(this.hist.dens_li);

        this.angle += this.r_vel;
        this.r_vel = Math.sign(this.x_vel)*Math.sqrt(this.x_vel**2 + this.y_vel**2)/this.radius;

        if (this.y_pos < this.y_base*0.9){
            this.compute_return();
        } else {
            this.left_eye.compute_motion();
            this.right_eye.compute_motion();

            this.left_eyebrow.compute_motion();
            this.right_eyebrow.compute_motion();
        }

    }
    compute_return(){
        // this.r_vel = 0;
        // this.x_vel = 0;
        // this.y_vel = 0;

        this.left_eye.compute_return();
        this.right_eye.compute_return();

        this.left_eyebrow.compute_return();
        this.right_eyebrow.compute_return();
    }
    update_target_coords(x_pos, y_pos){
        console.log(this.target_coords);
        this.target_coords = [x_pos, y_pos];
    }
    on_press(){
        this.jump = true;
    }
    animate(){

        this.compute_motion();

        this.draw_face();
        this.draw_hand();
        this.left_eye.redraw();
        this.right_eye.redraw();
        this.left_eyebrow.redraw();
        this.right_eyebrow.redraw();
    }
}

function normal(x, mu, sigma_sq){
    return 1 / Math.sqrt(2 * Math.PI * sigma_sq) * Math.E ** ( (-1 / 2)* ((x - mu)) ** 2 / sigma_sq);
}

export class Histogram{
    constructor(canvas) {
        this.canvas = canvas;
        this.text = "";
        this.calculate_size();
        this.num_bins = 80;
        this.scroll_factor=-40;

        this.generate_normal_values();
        this.update(this.dens_li);

    }
    calculate_size(){
        this.box_x_offset = 0;
        this.box_y_offset = this.canvas.screen_height * 9 / 10;
        this.box_width = this.canvas.screen_width ;
        this.box_height = this.canvas.screen_height/10;

        this.bin_width = (this.box_width - this.box_height*0.05) / (this.num_bins + 1);
    }
    update(dens_li){
        this.dens_li = [];
        for (var i in dens_li){
            this.dens_li.push(dens_li[i]);
        }
        this.draw_box();
        this.draw_histogram();
    }
    draw_box(){
        this.canvas.ctx.beginPath();
        this.canvas.ctx.fillStyle = "#eeeeee";
        this.canvas.ctx.rect(this.box_x_offset, this.box_y_offset, this.box_width, this.box_height);
        this.canvas.ctx.fill();

        this.canvas.ctx.beginPath();
        this.canvas.ctx.fillStyle = "#ffffff";
        this.canvas.ctx.strokeStyle = "#ffffff";
        this.canvas.ctx.rect(this.box_x_offset + this.box_height * 0.02, this.box_y_offset,
            this.box_width - this.box_height*0.05, this.box_height * 0.95);
        this.canvas.ctx.fill();
        this.canvas.ctx.stroke();
    }
    generate_normal_values(){
        this.dens_li = [];
        for (var i = 0; i <= this.num_bins; i++) {
            this.dens_li.push(normal(i, 40-this.scroll_factor, 10)*8);
        }
    }
    renormalize() {
        var normalizer = Math.max.apply(Math, this.dens_li);
        for (var i in this.dens_li) {
            this.dens_li[i] = this.dens_li[i] / normalizer;
        }
    }
    draw_histogram(){
        this.bin_width = (this.box_width - this.box_height*0.05) / (this.num_bins + 1);
        for (var i = 0; i <= this.num_bins; i++){
            this.canvas.ctx.beginPath();
            this.canvas.ctx.fillStyle = "#0067ff";
            this.canvas.ctx.strokeStyle = "#000000";
            var bin_x_offset = this.box_x_offset + this.box_height * 0.02 + this.bin_width*i;
            this.canvas.ctx.rect(bin_x_offset, this.box_y_offset+this.box_height,
                this.bin_width, -this.box_height*0.95*(this.dens_li[i]));
            this.canvas.ctx.fill();
            this.canvas.ctx.stroke();
        }
    }
}

let back_canvas = new NormonCanvas("back_canvas", 1);

let info_canvas = new NormonCanvas("normon_canvas", 2);

let hist = new Histogram(back_canvas);

let normon = new Normon(info_canvas, info_canvas.screen_width*0.2, info_canvas.screen_height*0.9,
    info_canvas.screen_height*0.09, hist);


setInterval(normon.animate.bind(normon), 20);
//
// document.addEventListener('mousemove', (event) => {
// 	normon.update_target_coords(event.clientX*2, event.clientY*2);
// });