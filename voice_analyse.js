let hzlist = [];
const calcRato = 1.059463094;
const startHZ = 27.5;
let num = 1;
for (let i = 0; i < 90; i++) {
  hzlist[i] = startHZ * num;
  num *= calcRato;
}

// クロスブラウザ定義
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

// 変数定義
var localMediaStream = null;
var localScriptProcessor = null;
var audioContext;
var bufferSize = 1024;
var recordingFlg = false;

// 描画用定数
const AUDIO_ThRESHOLD = 180;
const SCREEN = {
  width: 1400,
  height: 875,
};

// スプライト用
let app = null;
let objList = [];
let buttonObj = null;
let audioSizeObj = null;
let state = false;
let animationFlg = false;
let playNoteList = [];

let VolMax = 0;

let nextAddLocation = 0;

// 音声解析
var audioAnalyser = null;

// pixi
window.onload = function () {
  app = new PIXI.Application({
    width: SCREEN.width,
    height: SCREEN.height,
    backgroundColor: 0x000000,
  });
  let el = document.getElementById("app");
  el.appendChild(app.view);

  audioSizeObj = new Perticle(100, 100);
  //
  audioSizeObj.pixi.visible = false;
  //
  app.stage.addChild(audioSizeObj.pixi);
  buttonObj = new ButtonP(SCREEN.width - 10, SCREEN.height - 10);
  buttonObj.pixi.on("pointertap", function () {
    if (!buttonObj.state) {
      startRecording();
    } else {
      endRecording();
    }
    buttonObj.ChangeState();
  });
  app.stage.addChild(buttonObj.pixi);
};

// 描画関数
function animate() {
  audioSizeObj.Scale(VolMax / 10);
  for (let i = 0; i < playNoteList.length; i++) {
    if (playNoteList[i] > 0) playNoteList[i]--;
  }
  for (let i = 0; i < objList.length; i++) {
    if (objList[i].animationStatus == -1) continue;
    objList[i].update();
  }
  if (animationFlg) {
    // アニメーション停止
  } else {
    window.requestAnimationFrame(animate);
  }
}

// 描画の初期化処理
function viewInit() {
  playNoteList = [];
  for (let i = 0; i < 90; i++) {
    playNoteList[i] = 0;
  }
}

function addObj(noteNum, scale) {
  if (playNoteList[noteNum] > 0) return;

  playNoteList[noteNum] = 20; // TODO:適切な数値を見つける
  // HACK:noteの再利用できない？
  if (
    nextAddLocation < objList.length &&
    objList[nextAddLocation].animationState == -1
  ) {
    // nextAddLocationを使う
    objList[nextAddLocation].Init(
      (noteNum / 88) * SCREEN.width,
      SCREEN.height - 100 + rand(100)
    );
    objList[nextAddLocation].Scale((scale - AUDIO_ThRESHOLD) / 15 + 0.4);
    nextAddLocation++;
  } else if (objList.length > 0 && objList[0].animationState == -1) {
    // 0を使う
    objList[0].Init(
      (noteNum / 88) * SCREEN.width,
      SCREEN.height - 100 + rand(100)
    );
    objList[0].Scale((scale - AUDIO_ThRESHOLD) / 20 + 0.5);
    nextAddLocation = 1;
  } else {
    // push
    const pert = new Perticle(
      (noteNum / 88) * SCREEN.width,
      SCREEN.height - 100 + rand(100)
    );
    pert.Scale((scale - AUDIO_ThRESHOLD) / 20 + 0.5);
    objList.push(pert);
    app.stage.addChild(pert.pixi);
  }
}
// 以下オーディオの処理

// 録音バッファ作成（録音中自動で繰り返し呼び出される）
var onAudioProcess = function (e) {
  if (!recordingFlg) return;

  // 音声のバッファを作成
  var input = e.inputBuffer.getChannelData(0);
  var bufferData = new Float32Array(bufferSize);
  for (var i = 0; i < bufferSize; i++) {
    bufferData[i] = input[i];
  }

  // 波形を解析
  analyseVoice();
};

// 解析用処理
var analyseVoice = function () {
  var fsDivN = audioContext.sampleRate / audioAnalyser.fftSize;
  var spectrums = new Uint8Array(audioAnalyser.frequencyBinCount);
  audioAnalyser.getByteFrequencyData(spectrums);

  let nowNoteNum = 0;
  VolMax = Math.max.apply(null, spectrums);
  for (var i = 0, len = spectrums.length; i < len; i++) {
    var f = Math.floor(i * fsDivN); // index -> frequency;

    if (f > 5000) break;
    while (hzlist[nowNoteNum] + 1 < f) {
      nowNoteNum++;
      if (nowNoteNum >= 88) return;
    }
    if (spectrums[i] > AUDIO_ThRESHOLD) {
      // y over
      addObj(nowNoteNum, spectrums[i]);
    }
  }
};

// 解析開始
var startRecording = function () {
  console.log("---running---");
  animationFlg = false;
  viewInit();
  animate();

  audioContext = new AudioContext();
  recordingFlg = true;
  navigator.getUserMedia(
    { audio: true },
    function (stream) {
      // 録音関連
      localMediaStream = stream;
      var scriptProcessor = audioContext.createScriptProcessor(
        bufferSize,
        1,
        1
      );
      localScriptProcessor = scriptProcessor;
      var mediastreamsource = audioContext.createMediaStreamSource(stream);
      mediastreamsource.connect(scriptProcessor);
      scriptProcessor.onaudioprocess = onAudioProcess;
      scriptProcessor.connect(audioContext.destination);

      // 音声解析関連
      audioAnalyser = audioContext.createAnalyser();
      audioAnalyser.fftSize = 2048;
      frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount);
      timeDomainData = new Uint8Array(audioAnalyser.frequencyBinCount);
      mediastreamsource.connect(audioAnalyser);
    },
    function (e) {
      console.log(e);
    }
  );
};

// 解析終了
var endRecording = function () {
  console.log("---stoping---");
  console.log(objList.length);
  recordingFlg = false;
  animationFlg = true;
};
