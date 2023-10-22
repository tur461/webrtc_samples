/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';


// Put variables in global scope to make them available to the browser console.
const audio = document.querySelector('audio');

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var recognize = new SpeechRecognition();

var colors = [ 'aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];

console.log('recognizer:', recognize)

const constraints = window.constraints = {
  audio: true,
  video: false
};

const setupRecognizer = track => {
  if (SpeechGrammarList) {
    // SpeechGrammarList is not currently available in Safari, and does not have any effect in any other browser.
    // This code is provided as a demonstration of possible capability. You may choose not to use it.
    var speechRecognitionList = new SpeechGrammarList();
    var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
  }

  console.log('recognizer setup, track_id:', track.id)
  recognize.MediaRecorder = track;
  recognize.lang = 'en-US'
  recognize.interimResults = true;
  recognize.maxAlternatives = 1;
  recognize.continuous = false;

  recognize.onresult = e => {
    console.log('you said: ', e.results[0][0].transcript);
      // const transcript = e.results[e.results.length - 1][0].transcript;
      // if(transcript.toLowerCase().includes("that's all.")) {

      // }
      var interimTranscript = '';
      var finalTranscript = '';
      for (var i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
              finalTranscript += e.results[i][0].transcript;
              insertCompleted(e.results[i][0].transcript)
              insertConfidence(e.results[i][0].confidence)
          } else {
              interimTranscript += e.results[i][0].transcript;
              insertIntermediate(interimTranscript);
          }
      }
      console.log('final transcript:', finalTranscript)
  }

  recognize.onend = e => {
      console.log('recognition ends..')
  }

  recognize.onstart = e => {
      console.log('recognition starts..')
  }
  recognize.onspeechend = _ => recognize.stop();

  recognize.onnomatch = _ => console.log("sorry! couldn't recognize.")

  recognize.onerror = e => console.log('[ERR] recognize error: ', e.error)
}

const recStart = _ => {
  recognize.start()
}

const recStop = _ => {
  recognize.stop()
}

const insertCompleted = t => {
  document.getElementById('text_target_comp').textContent = t;
}
const insertIntermediate = t => {
  document.getElementById('text_target_int').textContent = t;
}
const insertConfidence = t => {
  document.getElementById('text_target_conf').textContent = t;
}

function handleSuccess(stream) {
  const audioTracks = stream.getAudioTracks();
  setupRecognizer(audioTracks[0])
  console.log('Got stream with constraints:', constraints);
  console.log('Using audio device: ' + audioTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream ended');
  };
  window.stream = stream; // make variable available to browser console
  audio.srcObject = stream;
}

function handleError(error) {
  const errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
  document.getElementById('errorMsg').innerText = errorMessage;
  console.log(errorMessage);
}

document.getElementById('stop_recognizer').addEventListener('click', recStop);
document.getElementById('start_recognizer').addEventListener('click', recStart);

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
