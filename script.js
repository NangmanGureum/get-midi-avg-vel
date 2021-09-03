let midi_log = document.querySelector(".midi-log");
let span_avg_vel = document.querySelector(".avg-vel");
let span_re_vel = document.querySelector(".re-vel");
let tb_note_num = document.querySelector("#tb-note-num");
let tb_vel = document.querySelector("#tb-vel");
let send_btn = document.querySelector(".send-button");
let not_support = document.querySelector(".not-support");
let div_midi_config = document.querySelector(".midi-config__content");
let select_device_select = document.querySelector("#device-select");



const IS_CHOROME = navigator.userAgent.indexOf("Chrome") !== -1;
let vel_list = [];
// Thanks for:
// https://deeplify.dev/front-end/js/min-max-avg-in-array
const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

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
        midi_log.removeChild(midi_log.lastElementChild);
    }
    vel_list.push(Number(vel));
    let vel_avg = average(vel_list);
    span_avg_vel.textContent = vel_avg;
    span_re_vel.textContent = vel;

    let new_span = document.createElement("span");
    new_span.textContent = text_content;
    midi_log.prepend(new_span);
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

function main() {
    send_btn.addEventListener("click", sendMidi);
    // Thanks for:
    // https://wookim789.tistory.com/28
    if (!navigator.requestMIDIAccess) {
        onMIDIFailure();
    } else {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    }
}

main()