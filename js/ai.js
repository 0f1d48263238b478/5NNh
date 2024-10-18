/*
 *  Author: Anonymous
 *  
 *  Date:   2024-08-29
 */

// Draw an Attitude Indicator ("Artificial Horizon")

// animation

var ai_last_pitch = null;
var ai_last_yaw = null;
var ai_last_roll = null;

const ai_canvas = document.getElementById("canvas_ai");
const ai_ctx = ai_canvas.getContext("2d");
const animate_ai_interval = setInterval(animate_ai, 50);

function animate_ai() {

    if (G_pitch != ai_last_pitch || G_yaw != ai_last_yaw || G_roll != ai_last_roll) {
        var x = -G_pitch/180*Math.PI;
        var y = G_yaw/180*Math.PI;
        var z = -G_roll/180*Math.PI;
        var w = ai_canvas.width;
        var h = ai_canvas.height;
        
        /* clear the canvas */
        ai_ctx.clearRect(0, 0, ai_canvas.width, ai_canvas.height);

        /* set the clip (i.e. a circle out of the middle */
        ai_ctx.beginPath();
        ai_ctx.fillstyle="white";
        ai_ctx.arc(w/2,h/2, 0.9*h, 0, 2 * Math.PI, true);
        ai_ctx.clip();
        
        ai_ctx.fillstyle="blue";
        ai_ctx.fillRect(0,0,w,h);
        
        /* save the non-rotated context */
        ai_ctx.save();

        /* rotate & translate for attitude indication */
        ai_ctx.translate(w/2,h/2);
        ai_ctx.rotate(-z);
        ai_ctx.translate(0, Math.sin(x)*h);
        ai_ctx.translate(-w/2,-h/2);

        /* draw the blue */
        ai_ctx.fillStyle = "#13689b";
        ai_ctx.fillRect(-w, h/2, 3*w, -3*h)

        /* draw the brown */
        ai_ctx.fillStyle = "#7f5f38";
        ai_ctx.fillRect(-w, h/2, 3*w, 3*h)


        /* draw the angle indicator lines */
        ai_ctx.fillStyle = "white";
        ai_ctx.font = "12px sans-serif";

        
        for (var ofset = -180; ofset <= 180; ofset+=180) {
            for (var i = -900; i < 900; i += 25) {
                var pos = Math.round(( ((i/10.0)+25+ofset)*h/50.0 ));
                var length = 0;
                if (i%100 == 0) {
                    length = 0.35*w;
                    if (i!=0) {
                        if (ofset==0) {
                            ai_ctx.fillText(-i/10,Math.round((w/2)+(length/2)+(w*0.06)), pos+5)
                            ai_ctx.fillText(-i/10,Math.round((w/2)-(length/2)-(w*0.08)), pos+5)
                        } else {
                            ai_ctx.fillText(i/10, Math.round((w/2)+(length/2)+(w*0.06)), pos-5)
                            ai_ctx.fillText(i/10, Math.round((w/2)-(length/2)-(w*0.08)), pos-5)
                        }
                    }
                } else if (i%50 == 0) {
                    length = 0.2*w;
                } else {
                    length = 0.1*w;
                }
                ai_ctx.fillRect(Math.round((w/2)-(length/2)), pos, length, 2)
            }
        }
        ai_ctx.restore();
        
        /* draw the yaw (heading) text */
        ai_ctx.font = "12px sans-serif";
        ai_ctx.fillStyle = "#00000080";
        ai_ctx.fillRect(0,0,w,16);
        ai_ctx.fillStyle = "white"
        ai_ctx.textAlign = "center";
        var yy = -G_yaw;
        for (var ofset = -30; ofset <= 30; ofset++) {
            var hdg = ((Math.round(yy)|0)+ofset)%360; // we do (float | 0) here to convert to int
            if (hdg % 10 == 0) {
                ai_ctx.fillText(hdg, w/2+Math.sin(ofset/180*Math.PI)*w/2, 10);
            }
        }
        
        ai_last_pitch = G_pitch;
        ai_last_yaw   = G_yaw;
        ai_last_roll  = G_roll;
        
    }

}

