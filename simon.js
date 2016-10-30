/*
User Story: I am presented with a random series of button presses.

User Story: Each time I input a series of button presses correctly, I see the same series of button presses but with an additional step.

User Story: I hear a sound that corresponds to each button both when the series of button presses plays, and when I personally press a button.

User Story: If I press the wrong button, I am notified that I have done so, and that series of button presses starts again to remind me of the pattern so I can try again.

User Story: I can see how many steps are in the current series of button presses.

User Story: If I want to restart, I can hit a button to do so, and the game will return to a single step.

User Story: I can play in strict mode where if I get a button press wrong, it notifies me that I have done so, and the game restarts at a new random series of button presses.

User Story: I can win the game by getting a series of 20 steps correct. I am notified of my victory, then the game starts over.
*/

const updateLED = function updateLED(content = gameState.currentRound) {
  $('#led').text(content);
}

const soundPlayer = function(color) {
  const greenSound = new Audio('assets/audio/simonSound1.mp3');
  const redSound = new Audio('assets/audio/simonSound2.mp3');
  const blueSound = new Audio('assets/audio/simonSound3.mp3');
  const yellowSound = new Audio('assets/audio/simonSound4.mp3');
  switch (color) {
    case 'green':
      greenSound.play();
      break;
    case 'red':
      redSound.play();
      break;
    case 'blue':
      blueSound.play();
      break;
    case 'yellow':
      yellowSound.play();
      break;
    default:
  }
};

const pickRandom = function() {
  let pick = Math.floor((Math.random() * (optionsArr.length)));
  return optionsArr[pick];
};

// controlling the light button change of color and playing it's sound
const playField = function(fieldToPlay, delay = 500) {
  soundPlayer(fieldToPlay.id);
  $(fieldToPlay).toggleClass('active');
  setTimeout(function() {
    $(fieldToPlay).toggleClass('active');
  }, delay);
};

const gameState = {
  optionsArr: [],
  givenSeries: [],
  currentRound: 0,
  strict: false,
  gameOn: false,
  expectUserInput: false,
  pressedSeries: [],
  checkPressingComplete() {
    return this.givenSeries.length === this.pressedSeries.length;
  },
  correctValuePressed() {
    let pressCount = this.pressedSeries.length;
    let result = gameState.givenSeries[pressCount - 1] === gameState.pressedSeries[pressCount - 1];
    return result;
  },
  addToSeries() {
    gameState.givenSeries.push(pickRandom());
  },
  resetPressedSeries() {
    this.pressedSeries = [];
    console.log('pressedSeries reset ' + this.pressedSeries);
  },
  switchOnOff() {
    this.gameOn = !this.gameOn;
    updateLED();
    if (this.gameOn === false) {
      updateLED(''); // making LED look turned off
    }
  },
};

const gameController = {
  initGame() {
    gameState.expectUserInput = false;
    gameState.currentRound = 0;
    gameState.givenSeries = [];
    gameState.pressedSeries = [];
    gameState.pressCount = 0;
    updateLED(0);
    this.playRound();
  },
  playRound() {
    if (gameState.currentRound < 20) {
      gameState.currentRound += 1;
      updateLED();
      gameState.addToSeries();
      this.playSequence(gameState.givenSeries);
    } else {
      this.winSequence();
    }
  },
  repeatRound() {
    this.playSequence(gameState.givenSeries);
    setTimeout(updateLED, 500);
  },
  playSequence(arr) {
    for (var i = 0; i < arr.length; i += 1) {
      (function(ind) {
        setTimeout(function() {
          playField(arr[ind]);
        }, 800 * (ind + 1));
      })(i);
    }
    setTimeout(function() {
      return gameController.toggleExpectUserInput();
    }, 800 * arr.length);
  },
  playerMove(field) {
    gameState.pressedSeries.push(field);
    if (gameState.correctValuePressed()) {
      playField(field);
      console.log('correct value');
      if (gameState.checkPressingComplete()) {
        gameController.toggleExpectUserInput();
        console.log('pressing complete');
        gameState.resetPressedSeries();
        setTimeout(function() {
          gameController.playRound();
        }, 800);
      }
    } else {
      console.log('failsequence coming');
      this.failSequence();
    }
  },
  failSequence() {
    updateLED('!!');
    if (gameState.strict) {
      console.log('failed strict');
      this.errorFlash();
      updateLED('!!');
      setTimeout(function() {
        gameController.initGame();
      }, 1000);
    } else {
      console.log('failed not strict');
      gameController.toggleExpectUserInput();
      this.errorFlash();
      updateLED('!!');
      gameState.resetPressedSeries();
      this.repeatRound();
    }
  },
  winSequence() {
    console.log('WINNER WINNER WINNER');
  },
  setStrict() {
    gameState.strict = !gameState.strict;
    console.log(`game is strict: ${gameState.strict}`);
  },
  errorFlash() {
    const lastLight = gameState.pressedSeries[gameState.pressedSeries.length - 1];
    playField(lastLight, 100);
    playField(lastLight, 200);
    playField(lastLight, 300);
  },
  toggleExpectUserInput() {
    gameState.expectUserInput = !gameState.expectUserInput;
    console.log('expected user input set to: ' + gameState.expectUserInput);
  },
};

$(document).ready(function() {

  const greenButton = $('#green').get(0);
  const redButton = $('#red').get(0);
  const yellowButton = $('#yellow').get(0);
  const blueButton = $('#blue').get(0);
  optionsArr = [greenButton, redButton, yellowButton, blueButton];

  $('#myonoffswitch').on('click', function() {
    gameState.switchOnOff();
  });

  $('#strictBtn').on('click', function() {
    if (gameState.gameOn) {
      gameController.setStrict();
      $('.strictLamp').toggleClass('active');
    }
  });

  $(".light").on('click', function() {
    if (gameState.gameOn && gameState.expectUserInput)
      gameController.playerMove(this);
    }
  );

  $(".start").on('click', function() {
    if (gameState.gameOn) {
      gameController.initGame();
    }
  });
});
