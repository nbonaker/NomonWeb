import * as ff from './facefinder.js';
import * as pup from './puploc.js';

export class FaceFinder{
    constructor(webcam_canvas) {
        this.face_coords = [-1, -1, -1];
        var initialized = false;

        var update_memory = pico.instantiate_detection_memory(5); // we will use the detecions of the last 5 frames
        var facefinder_classify_region = function (r, c, s, pixels, ldim) {
            return -1.0;
        };
        var proxyUrl = "https://cors-anywhere.herokuapp.com/";

        var json_obj = ff.face_finder_bytes;

        var arr = [];
        for(var p in Object.getOwnPropertyNames(json_obj)) {
            arr[p] = json_obj[p];
        }
        var bytes = new Int8Array(arr);

        facefinder_classify_region = pico.unpack_cascade(bytes);

        // var cascadeurl = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';
        // fetch(cascadeurl).then(function (response) {
        //     response.arrayBuffer().then(function (buffer) {
        //         var bytes = new Int8Array(buffer);
        //         facefinder_classify_region = pico.unpack_cascade(bytes);
        //         console.log('* facefinder loaded');
        //     })
        // })

        // (2) initialize the lploc.js library with a pupil localizer
        // var do_puploc = function (r, c, s, nperturbs, pixels, nrows, ncols, ldim) {
        //     return [-1.0, -1.0];
        // };
        //var puplocurl = '../puploc.bin';
        //
        // var puploc_obj = pup.puploc_bytes;
        //
        // var arr = [];
        // for(var p in Object.getOwnPropertyNames(puploc_obj)) {
        //     arr[p] = json_obj[p];
        // }
        // var bytes = new Int8Array(arr);
        // do_puploc = lploc.unpack_localizer(bytes);

        // var puplocurl = 'https://f002.backblazeb2.com/file/tehnokv-www/posts/puploc-with-trees/demo/puploc.bin'
        // fetch(proxyUrl + puplocurl).then(function (response) {
        //     response.arrayBuffer().then(function (buffer) {
        //         var bytes = new Int8Array(buffer);
        //         do_puploc = lploc.unpack_localizer(bytes);
        //         console.log('* puploc loaded');
        //     })
        // })

        // (3) get the drawing context on the canvas and define a function to transform an RGBA image to grayscale

        var ctx = webcam_canvas.getContext("2d");

        function rgba_to_grayscale(rgba, nrows, ncols) {
            var gray = new Uint8Array(nrows * ncols);
            for (var r = 0; r < nrows; ++r)
                for (var c = 0; c < ncols; ++c)
                        // gray = 0.2*red + 0.7*green + 0.1*blue
                    gray[r * ncols + c] = (2 * rgba[r * 4 * ncols + 4 * c + 0] + 7 * rgba[r * 4 * ncols + 4 * c + 1] + 1 * rgba[r * 4 * ncols + 4 * c + 2]) / 10;
            return gray;
        }


        // (4) this function is called each time a video frame becomes available

        var processfn = function (video, dt) {
            // render the video frame to the canvas element and extract RGBA pixel data
            ctx.drawImage(video, 0, 0);
            console.log(dt);

            var rgba = ctx.getImageData(0, 0, 640, 480).data;
            // prepare input to `run_cascade`
            var image = {
                "pixels": rgba_to_grayscale(rgba, 480, 640),
                "nrows": 480,
                "ncols": 640,
                "ldim": 640
            }
            var params = {
                "shiftfactor": 0.1, // move the detection window by 10% of its size
                "minsize": 100,     // minimum size of a face
                "maxsize": 1000,    // maximum size of a face
                "scalefactor": 1.1  // for multiscale processing: resize the detection window by 10% when moving to the higher scale
            }
            // run the cascade over the frame and cluster the obtained detections
            // dets is an array that contains (r, c, s, q) quadruplets
            // (representing row, column, scale and detection score)
            var dets = pico.run_cascade(image, facefinder_classify_region, params);
            dets = update_memory(dets);
            dets = pico.cluster_detections(dets, 0.2); // set IoU threshold to 0.2
            // draw detections
            for (var i = 0; i < dets.length; ++i) {
                if (dets[i][3] > 50.0) {
                    this.face_coords = [dets[i][1] / 640, dets[i][0] / 480, dets[i][2] / 2 / 640];
                }
            }
        }.bind(this);
        this.mycamvas = new camvas(ctx, processfn);

        initialized = true;
    }
}