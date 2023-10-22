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

console.log('recognizer:', recognize)

const constraints = window.constraints = {
  audio: true,
  video: false
};

const setupRecognizer = track => {
  console.log('recognizer setup, track_id:', track.id)
  recognize.MediaRecorder = track;
  recognize.lang = 'en-US'
  recognize.interimResults = true;
  // recognize.maxAlternatives = 1;
  recognize.continuous = true;

  recognize.onresult = e => {
      const transcript = e.results[e.results.length - 1][0].transcript;
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
