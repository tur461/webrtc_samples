/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

console.log('ver 1.0')

// Put variables in global scope to make them available to the browser console.
const audio = document.querySelector('audio');

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
// var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList
// var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var recognize = new SpeechRecognition();

// var colors = [ 'aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];

console.log('recognizer:', recognize)

const constraints = window.constraints = {
  audio: true,
  video: false
};

const resolveByGPT = t => {
  let url = 'https://bc2e-27-63-21-108.ngrok-free.app/resolve'
  return fetch(
        url, {
      method: 'POST', 
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      mode: 'no-cors',
      body: JSON.stringify({
        query: t
      })
  })
}

const setupRecognizer = track => {
  console.log('recognizer setup, track_id:', track.id)
  // if (SpeechGrammarList) {
  //   // SpeechGrammarList is not currently available in Safari, and does not have any effect in any other browser.
  //   // This code is provided as a demonstration of possible capability. You may choose not to use it.
  //   var speechRecognitionList = new SpeechGrammarList();
  //   var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'
  //   speechRecognitionList.addFromString(grammar, 1);
  //   recognize.grammars = speechRecognitionList;
  // }

  
  recognize.MediaRecorder = track;
  recognize.lang = 'en-US'
  recognize.interimResults = false;
  recognize.maxAlternatives = 1;
  recognize.continuous = false;

  recognize.onresult = e => {
    const said = e.results[0][0].transcript;
    recognize.stop()
    insertTextSaid(said)
    
    resolveByGPT(said)
    .then(async r => {
      const resp = await r.json();
      console.log('response:', resp)
      insertTextReplied('check console!')

    })
    .catch(console.error)
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

const insertTextSaid = t => {
  document.getElementById('text_said').textContent = t;
}
const insertTextReplied = t => {
  document.getElementById('text_replied').textContent = t;
}

function handleSuccess(stream) {
  console.log('media success!!')
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
  console.log('media error!!', error)
  const errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
  document.getElementById('errorMsg').innerText = errorMessage;
  console.log(errorMessage);
}

document.getElementById('stop_recognizer').addEventListener('click', recStop);
document.getElementById('start_recognizer').addEventListener('click', recStart);

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
