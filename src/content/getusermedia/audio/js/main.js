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

const setupRecognizer = s => {
  console.log('recognizer setup..')
  recognize.MediaRecorder = s;
  recognize.lang = 'en-US'
  recognize.interimResults = false;
  recognize.maxAlternatives = 1;
  recognize.continuous = true;

  recognize.onresult = e => {
      const transcript = e.results[e.results.length - 1][0].transcript;
      // if(transcript.toLowerCase().includes("that's all.")) {

      // }
      console.log('transcript:', transcript)
      insertText(transcript)
  }

  recognize.onend = e => {
      console.log('on end..', e)
      if(!recognize.manualStop) {
          setTimeout(_ => {
              recognize.start()
              console.log('[100ms] recognizer restarted..')
          }, 100)
      }
  }
}

const recStart = _ => {
  recognize.start()
}

const recStop = _ => {
  recognize.stop()
}

const insertText = t => {
  document.getElementById('text_target').textContent = t;
}

function handleSuccess(stream) {
  setupRecognizer(stream)
  const audioTracks = stream.getAudioTracks();
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
