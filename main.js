import Gameboard from './Gameboard.js';

const gameboard = new Gameboard(400, 400, 40);

const turdCount = 10 + Math.ceil(Math.random() * 12);

const init = () => {
    gameboard.startGame(turdCount);
}

init();

