let midi_log = document.querySelector(".midi-log");
let span_avg_vel = document.querySelector(".avg-vel");
let tb_note_num = document.querySelector("#tb-note-num");
let tb_vel = document.querySelector("#tb-vel");
let send_btn = document.querySelector(".send-button");
let not_support = document.querySelector(".not-support");


const IS_CHOROME = navigator.userAgent.indexOf("Chrome") !== -1;
let vel_list = [];
// Thanks for:
// https://deeplify.dev/front-end/js/min-max-avg-in-array
const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;


function checkMidiAvailable() {
    if (IS_CHOROME) {
        not_support.classList.add("unsee");
    }
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

    let new_span = document.createElement("span");
    new_span.textContent = text_content;
    midi_log.prepend(new_span);
}

function sendMidi() {
    let note = tb_note_num.value;
    let vel = tb_vel.value;

    paintMidiLog(note, vel);
}

function main() {
    send_btn.addEventListener("click", sendMidi);
    checkMidiAvailable();
}

main()