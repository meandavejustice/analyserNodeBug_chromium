var context, sourceJs, analyser, buffer;
var url = '/wizard.mp3';
var array = new Array();
var infoEl = document.getElementById('info');
infoEl.innerText = 'Loading...';

var withAnalyser = {
  el: document.getElementById('with')
};

var noAnalyser = {
  el: document.getElementById('out')
};

try {
  if(typeof webkitAudioContext === 'function') {
    context = new webkitAudioContext();
  }
  else {
    context = new AudioContext();
  }
}
catch(e) {
  infoEl.innerText = 'Web Audio API is not supported';
}

function makeReq(url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  request.onload = function() {
    context.decodeAudioData(
      request.response,
      function(buffer) {
        if(!buffer) {
          infoEl.innerText = 'Error decoding file data';
          return;
        }
        var aSource = context.createBufferSource();

        sourceJs = context.createScriptProcessor(2048);
        sourceJs.buffer = buffer;
        sourceJs.connect(context.destination);

        analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.6;
        analyser.fftSize = 512;

        aSource = context.createBufferSource();
        aSource.buffer = buffer;

        analyser.connect(sourceJs);
        aSource.connect(analyser);
        aSource.connect(context.destination);

        withAnalyser.source = aSource;

        sourceJs.onaudioprocess = function(e) {
          array = new Uint8Array(analyser.frequencyBinCount);
        };

        // bind without.
        var naSource = context.createBufferSource();
        naSource.buffer = buffer;
        naSource.connect(context.destination);
        noAnalyser.source = naSource;

        infoEl.innerText = 'READY';
      },
      function(error) {
        infoEl.innerText = 'Decoding error:' + error;
      }
    );
  };

  request.onerror = function() {
    infoEl.innerText = 'buffer: XHR error';
  };

  request.send();
}

function playSound(source) {
  // noAnalyser.source.stop(0);
  // withAnalyser.source.stop(0);
  source.start(0);
}


withAnalyser.el.addEventListener('click', function() {
  playSound(withAnalyser.source);
}, false);

noAnalyser.el.addEventListener('click', function() {
  playSound(noAnalyser.source);
}, false);

makeReq(url);
