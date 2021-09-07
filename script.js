let midi_log = document.querySelector(".midi-log");
let span_avg_vel = document.querySelector(".avg-vel");
let span_re_vel = document.querySelector(".re-vel");
let span_max_vel = document.querySelector(".max-vel");
let span_min_vel = document.querySelector(".min-vel");
let tb_note_num = document.querySelector("#tb-note-num");
let tb_vel = document.querySelector("#tb-vel");
let send_btn = document.querySelector(".send-button");
let log_save_btn = document.querySelector(".log-save");
let log_remove_btn = document.querySelector(".remove-log");
let reset_btn = document.querySelector(".reset-button");
let not_support = document.querySelector(".not-support");
let div_midi_config = document.querySelector(".midi-config__content");
let select_device_select = document.querySelector("#device-select");

let ls_data = [];
// JSON

let vel_list = [];
let vel_avgs = [];
let control_group = [];
// Thanks for:
// https://deeplify.dev/front-end/js/min-max-avg-in-array
const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

function paintGraph() {
    let list_len = Array.from({length: vel_list.length}, (_, i) => i + 1)

    let trace_vel_avg = {
      x: list_len,
      y: vel_avgs,
      type: 'scatter',
      mode: 'lines',
      name: 'Average of Velocity',
      line: {
          dash: 'dashdot'
      }
      };
      
    let trace_vel = {
      x: list_len,
      y: vel_list,
      type: 'scatter',
      mode: 'markers',
      name: 'Note Velocity',
      };
    
    let layout = {
      title: 'MIDI Log in Graph',
      xaxis: {
        title: 'MIDI Events Count',
        zeroline: false,
        range: [1, 30],
        autorange: true
      },
      yaxis: {
        title: 'MIDI Velocity',
        zeroline: false,
        range: [1, 128],
        autorange: false
      }
    };
      
    let data = [trace_vel, trace_vel_avg];
      
    Plotly.newPlot('midi-graph', data, layout);
}

function clear() {
    // Thanks for:
    // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
    // The answer which written by Mason Freed
    midi_log.replaceChildren();
    vel_list = [];

    span_avg_vel.textContent = "";
    span_re_vel.textContent = "";
    span_max_vel.textContent = "";
    span_min_vel.textContent = "";

    paintGraph();
}

function paintMIDIOption(value, text) {
    let option_object = document.createElement("option");
    option_object.value = value;
    option_object.textContent = text;

    select_device_select.add(option_object);
}

function paintMidiLog(note, vel) {
    let note_test = /^\d+$/.test(note);
    let vel_test = /^\d+$/.test(vel);
    if (!(note_test && vel_test)) {
        alert("It's not a number!");
        return 0;
    } else if ((Number(note) > 127) || (Number(vel) > 127)) {
        alert("It's not right number(s)!");
        return 0;
    }

    let text_content = "Note: " + String(note) + ", Vel: " + String(vel);
    if (vel_list.length >= 30) {
        vel_list.shift();
        vel_avgs.shift();
        midi_log.removeChild(midi_log.lastElementChild);
    }
    let vel_avg = average(vel_list);
    let vel_max = Math.max(...vel_list);
    let vel_min = Math.min(...vel_list);
    
    vel_list.push(Number(vel));
    vel_avgs.push(Number(vel_avg));

    span_avg_vel.textContent = vel_avg;
    span_re_vel.textContent = vel;
    span_max_vel.textContent = vel_max;
    span_min_vel.textContent = vel_min;

    let new_span = document.createElement("span");
    new_span.textContent = text_content;
    midi_log.prepend(new_span);
    paintGraph();
}

function sendMidi() {
    let note = tb_note_num.value;
    let vel = tb_vel.value;

    paintMidiLog(note, vel);
}

// Thanks for:
// https://wookim789.tistory.com/28
function onMIDIFailure() {
    div_midi_config.classList.add("unsee");
}

function onMIDISuccess(midiAccess) {
    not_support.classList.add("unsee");
    console.log(midiAccess);
    console.log(midiAccess.inputs.values());
    const inputs = midiAccess.inputs;
    for (let input of inputs.values()) {
        // Device Status
        console.log("====================================");
        console.log("ID: " + input.id);
        console.log("Manufacturer: " + input.manufacturer);
        console.log("Name: " + input.name);
        console.log("Type: " + input.type);
        console.log("Version: " + input.version);
        console.log("State: " + input.state);
        console.log("Connection: " + input.connection);

        // Paint Option
        let option_text = input.name + "(" + input.manufacturer + ")";
        paintMIDIOption(input.id, option_text)

        input.onmidimessage = getMIDIMsg;
      }
}

function getMIDIMsg(event) {
    const data = event.data;
    console.log(data);

    // // Debug
    // if (data[0] >= 144 && data[0] < 160){
    //     const channel = (data[0] - 144) + 1
    //     console.log("=============");
    //     console.log("Note On Ch. " + channel);
    //     console.log("Note: " + data[1]);
    //     console.log("Velocity: " + data[2]);
    // }

    // If note on
    // It should be like this:
    // if (data[0] == 144 && data[2] > 0) {
    //     paintMidiLog(data[1], data[2])
    // }
    // 
    // But the web MIDI API(Chrome, Other browsers which based on chromium)
    // has a problem which is
    // both Note on and Note off messages are recognized
    // as 144 (= Note on Channel 1).
    // So I write:
    if (data[0] == 144 && data[2] > 0) {
        paintMidiLog(data[1], data[2])
    }
}

function paintLogListItem(id, content) {
    
}

function saveLog() {
    const today_date = new Date();

    const date_year = String(today_date.getFullYear());
    const date_month = String(today_date.getMonth() + 1);
    const date_day = String(today_date.getDate());

    const date_hr = String(today_date.getHours());
    const date_min = String(today_date.getMinutes());
    const date_sec = String(today_date.getSeconds());

    const timestamp = date_year + "-" + date_month + "-" + date_day + " " +
                      date_hr + ":" + date_min + ":" + date_sec;

    const log_obj = {
        timestamp,
        velocities: vel_list,
        avg_logs: vel_avgs
    };

    console.log(log_obj);
}


function loadLS() {
    const raw_data = localStorage.getItem('saved-log');
    ls_data = JSON.parse(raw_data);

}

function main() {
    loadLS()
    reset_btn.addEventListener("click", clear);

    log_save_btn.addEventListener("click",saveLog);
    // log_remove_btn

    send_btn.addEventListener("click", sendMidi);
    paintGraph();
    // Thanks for:
    // https://wookim789.tistory.com/28
    if (!navigator.requestMIDIAccess) {
        onMIDIFailure();
    } else {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    }
}

main()