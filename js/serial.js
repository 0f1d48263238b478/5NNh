/*
 *  Author: Anonymous
 *  
 *  Date:   2024-07-16
 */

var G_cont = 0;
var G_roll  = 0;
var G_pitch = 0;
var G_yaw   = 0;
var G_interval = null;
var G_dev_alpha = null;
var G_dev_beta  = null;
var G_dev_gamma = null;
var G_dev_alpha_offset  = null;
var G_have_orientation_listener = false;



if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // need to request permission after user interaction ('Demo' Button')
    
} else if (!G_have_orientation_listener) {
    // can directly add listener
    window.addEventListener("deviceorientation", animateOrientation, true);
    G_have_orientation_listener = true;
}

async function connect() {
    if (typeof navigator.serial === 'undefined') {
        alert("navigator.serial is undefined.\nPlease use a WebSerial compatible browser (e.g., Google Chrome)");
        return;
    }
    
    navigator.serial.getPorts().then((ports) => {
        console.log(ports)
      // Initialize the list of available ports with `ports` on page load.
    });

    const port = await navigator.serial.requestPort();
    console.log(port)
    document.getElementById("serials").innerHTML = "Connected";
    await port.open({baudRate: 115200});
    console.log("port opened")
    
    const textDecoder = new TextDecoderStream();
    console.log("textDecoder");
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    console.log("readableStreamClosed");
    const reader = textDecoder.readable.getReader();
    console.log("reader");
    G_cont     = 1;
    if (G_interval) {
        clearInterval(G_interval);
        G_interval = null;
    }
    var buffer = "";

    // Listen to data coming from the serial device.
    while (true) {
      const { value, done } = await reader.read();
      if (!G_cont || done) {
        break;
      }
      // value is a string.
      buffer     += value;
      const lines = buffer.split('\n');
      const full_last_line = buffer[buffer.length-1] == '\n';
      
      for (var i = 0; i < (full_last_line ? lines.length : (lines.length - 1)); i++) {
          if (lines[i].length) {
              document.getElementById("raw").innerHTML = lines[i];
          }
          m = lines[i].match(/^ROLL=([- ]?[0-9.]+) PITCH=([- ]?[0-9.]+) YAW=([- ]?[0-9.]+)$/);
          if (m && m.length>=4) {
              G_roll  = parseFloat(m[1]);
              G_pitch = parseFloat(m[2]);
              G_yaw   = parseFloat(m[3]);
              document.getElementById("roll").innerHTML  = G_roll.toFixed(2)+"&deg;";
              document.getElementById("pitch").innerHTML = G_pitch.toFixed(2)+"&deg;";
              document.getElementById("yaw").innerHTML   = G_yaw.toFixed(2)+"&deg;";
          }
      }
      
      if (full_last_line) {
        buffer = "";
      } else {
        buffer = lines[lines.length-1];
      }
    }
    
    /* cf. https://stackoverflow.com/a/71263127 */
    reader.cancel();
    await readableStreamClosed.catch(() => { /* Ignore the error */ });

    await port.close();
    console.log("done");
    document.getElementById("roll").innerHTML  = "N/A";
    document.getElementById("pitch").innerHTML = "N/A";
    document.getElementById("yaw").innerHTML   = "N/A";
    
    G_roll  = 0;
    G_pitch = 0;
    G_yaw   = 0;
    
}

async function disconnect() {
    G_cont = 0;
    document.getElementById("serials").innerHTML = "Disconnected";
    if (G_interval) {
        clearInterval(G_interval);
        G_interval = null;
        G_dev_alpha_offset = null;
    }
}

async function demo() {
    G_cont = 0;
    
    if (!G_have_orientation_listener) {
    
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
          // need to request permission
          
          const response = await DeviceOrientationEvent.requestPermission();
          
          if (response == 'granted') {
              window.addEventListener("deviceorientation", animateOrientation, true);
              G_have_orientation_listener = true;
          }
        }
    }
    if (!G_interval) {
        document.getElementById("serials").innerHTML = "Demo";
        G_interval = setInterval(animate,50);
        G_dev_alpha_offset = null;
    }
}

function animateOrientation(event) {
  const absolute = event.absolute;
  if (!absolute) {
      G_dev_beta = event.beta;
      G_dev_gamma = event.gamma;
      
      if (G_dev_alpha_offset === null) {
        G_dev_alpha_offset = event.alpha;
      }
      
      G_dev_alpha = event.alpha - G_dev_alpha_offset;
  }
}

function animate() {
    if ( G_dev_beta !== null ) {
        G_yaw   = G_dev_alpha;
        G_roll  = G_dev_gamma;
        G_pitch = -G_dev_beta;
        document.getElementById("raw").innerHTML = '[Device Orientation]';
        
    } else {
        G_yaw   = (G_yaw   + 2    );
        G_roll  = (G_roll  + 0.5  );
        G_pitch = (G_pitch + 0.75 );
        
        document.getElementById("raw").innerHTML = '[Simulated Orientation]';
    }
    if (G_yaw > 180)   G_yaw   = G_yaw - 360;
    if (G_roll > 180)  G_roll  = G_roll - 360;
    if (G_pitch > 180) G_pitch = G_pitch - 360;
    
    document.getElementById("roll").innerHTML  = G_roll.toFixed(2)+"&deg;";
    document.getElementById("pitch").innerHTML = G_pitch.toFixed(2)+"&deg;";
    document.getElementById("yaw").innerHTML   = G_yaw.toFixed(2)+"&deg;";
    
}

const url = window.location.search;
const urlParams = new URLSearchParams(url);
console.log(url);

if (urlParams.has('demo')) {
    console.log('Have demo');
    demo();
}



