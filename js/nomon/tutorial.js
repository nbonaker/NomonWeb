import * as kconfig from './kconfig.js';
import * as widgets from "./widgets.js";

function subarray_includes(array, item, indicies=[], level=0){
    if (indicies.length <= level){
        indicies.push(0);
    }

    var in_array = false;
    for (var i in array){
        if (in_array){
            break;
        }
        indicies[level] = parseInt(i);

        var sub_element = array[i];
        if (sub_element instanceof Array){
            var sub_result = subarray_includes(sub_element, item, indicies.slice(0, level+1), level+1);
            in_array = sub_result[0];
            if (in_array){
                indicies = sub_result[1];
            }
        } else{
            if (sub_element === item){
                in_array = true;
                break;
            }
        }
    }
    return [in_array, indicies];
}

export class tutorialManager{
    constructor(parent){
        this.parent = parent;
        this.target_phrase = "calibrating ";
        this.target_text = null;
        this.target_clock = null;

        this.update_target();
        this.start_tutorial();
    }
    update_target(){
        var typed_text = this.parent.typed;
        var word_index = typed_text.split("_").length - 1;
        var char_index = typed_text.length;

        var target_words = this.target_phrase.split(" ");
        if (word_index <= target_words.length){
            if (char_index <= this.target_phrase.length){
                var cur_word = target_words[word_index];
                if (subarray_includes(this.parent.words_li, cur_word)[0]){
                    this.target_text = cur_word;
                } else {
                    this.target_text = this.target_phrase.charAt(char_index);
                }
            } else {
                this.target_text = null;
            }
        } else {
            this.target_text = null;
        }

        if(this.target_text === " "){
            this.target_text = "_";
        }
        console.log(this.target_text);

        if (this.target_text.length === 1){
            this.target_clock = kconfig.main_chars.indexOf(this.target_text)*4+3;
        } else {
            var word_li_index = subarray_includes(this.parent.words_li, this.target_text)[1];
            this.target_clock = word_li_index[0]*4 + word_li_index[1];
        }

        console.log(this.target_clock, this.parent.clockgrid.clocks[this.target_clock].text);
    }
    start_tutorial(){
        this.info_canvas = new widgets.KeyboardCanvas("info", 4);
        this.info_canvas.calculate_size(0);

        this.x_pos = 0;
        this.y_pos = 0;
        this.width = this.info_canvas.screen_width;
        this.height = this.info_canvas.screen_height;

        this.change_focus();

    }
    change_focus(){
        var clock = this.parent.clockgrid.clocks[this.target_clock];
        var circle_x = clock.x_pos;
        var circle_y = clock.y_pos;
        var circle_radius = clock.radius*6;

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.globalCompositeOperation = 'source-over';
        this.info_canvas.ctx.clearRect(0, 0, this.width, this.height);
        this.info_canvas.ctx.fillStyle = "rgba(232,232,232, 0.7)";
        this.info_canvas.ctx.rect(0, 0, this.width, this.height*0.8);
        this.info_canvas.ctx.fill();

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.globalCompositeOperation = 'destination-out';
        this.info_canvas.ctx.arc(circle_x, circle_y, circle_radius, 0, Math.PI*2, true);
        this.info_canvas.ctx.fill();

        this.info_canvas.ctx.beginPath();
        this.info_canvas.ctx.globalCompositeOperation = 'source-over';
        this.info_canvas.ctx.strokeStyle = "rgb(134,134,134)";
        this.info_canvas.ctx.lineWidth = this.radius / 5;
        this.info_canvas.ctx.arc(circle_x, circle_y, circle_radius, 0, Math.PI*2, true);
        this.info_canvas.ctx.stroke();

    }
}