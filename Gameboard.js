import Cell from './Cell.js';

export default class Gameboard {
    constructor (width, height, resolution, bgColor = 'lime') {
        this.gameInProgress = false;
        this.bgColor = bgColor;
        this.width = width;
        this.height = height;
        this.resolution = resolution;

        this.turdCount = 10;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        let id = 1;
        while (document.getElementById('canvas' + id) !== null) id++;
        this.canvas.id = id+'';

        this.context = this.canvas.getContext('2d');

        this.message = '';

    }

    clearCanvas() {
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.width, this.height);
    }

    setupGrid() {
        this.cols = Math.floor(this.width / this.resolution);
        this.rows = Math.floor(this.height / this.resolution);

        this.grid = new Array(this.cols);
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = new Array(this.rows);
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = new Cell(i, j, this.resolution, false);
            }
        }
    }

    drawGrid() {
        this.cycleGrid(cell => { 
            cell.render(this.context);
        });
    }

    cycleGrid(func) {
        this.grid.forEach(row => row.forEach(cell => func(cell)));
    }

    cycleNeighbors(cell, func) {
        for (let offsetX = -1; offsetX < 2; offsetX++) {
            for (let offsetY = -1; offsetY < 2; offsetY++) {
                const posX = cell.posX + offsetX;
                const posY = cell.posY + offsetY;
                if (posX > -1 && posX < this.grid[0].length && posY > -1 && posY < this.grid.length && !this.grid[posX][posY].isPlayed) {
                    func.call(this, this.grid[posX][posY]);
                }
            }
        }
    }

    addTurds(count) {
        if (count) { this.turdCount = count;}
        const options = [];
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                options.push([x,y]);
            }
        }

        if (this.turdCount > options.length) { this.turdCount = options.length; }

        for (let i = 0; i < this.turdCount; i++) {
            const index = Math.floor(Math.random() * options.length);
            const pos = options.splice(index, 1);
            this.grid[pos[0][0]][pos[0][1]].isTurd = true;
        }

        this.updateNeighboringTurdCounts();
    }
    
    updateNeighboringTurdCounts() {
        this.cycleGrid(cell => {
            if (cell.isTurd) {
                cell.neighborTurdCount = -1;
                return;
            }
    
            for (let offsetX = -1; offsetX < 2; offsetX++) {
                for (let offsetY = -1; offsetY < 2; offsetY++) {
                    const posX = cell.posX + offsetX;
                    const posY = cell.posY + offsetY;
                    if (posX > -1 && posX < this.grid[0].length && posY > -1 && posY < this.grid.length) {
                        if (this.grid[posX][posY].isTurd) {
                            cell.neighborTurdCount++;
                        }
                    }
                }
            }
        });
    }

    getCellFromCoords(x,y) {
        return this.grid[Math.floor(x / this.resolution)][Math.floor(y / this.resolution)];
    }

    toggleFlag(cell) {
        cell.isFlagged = !cell.isFlagged;
    }

    revealCell(cell) {
        cell.isPlayed = true;
        if (cell.neighborTurdCount === 0) {
            this.cycleNeighbors(cell, this.revealCell);
        }
    }

    startPlayerInteraction() {
        this.canvas.addEventListener('click', evt => {
            evt.preventDefault();
            if (!this.gameInProgress) { return; }
            const cell = this.getCellFromCoords(evt.offsetX, evt.offsetY);
            switch (evt.button) {
                case 0:
                    if (cell.isFlagged) { return; }
                    if (cell.isTurd) {
                        this.gameOver(false);
                    } else {
                        this.revealCell(cell);
                        this.drawGrid();
                        if (!this.grid.some(row => row.some(cell => !cell.isTurd && !cell.isPlayed))) {
                            this.gameOver(true);
                        }
                    }
                    break;
                case 2:
                    this.toggleFlag(cell);
                    this.drawGrid();
            }
        });

        this.canvas.addEventListener('contextmenu', evt => {
            evt.preventDefault();
            if (!this.gameInProgress) { return; }
            const cell = this.getCellFromCoords(evt.offsetX, evt.offsetY);
            this.toggleFlag(cell);
            this.drawGrid();
        });
    }

    gameOver(win) {
        this.gameInProgress = false;
        this.cycleGrid(cell => cell.isPlayed = true);
        this.drawGrid();
        if (win) {
            this.setMessage('HOORAY! No more hidden turds!');
        } else {
            this.setMessage('EEEEeeeww! Wash your shoes!');
        }
    }

    draw() {
        this.drawMessage();
        document.querySelector('body').appendChild(this.canvas);
        this.clearCanvas();

        this.drawGrid();
        this.drawToolbox();
    }

    drawMessage() {
        const messageDisplay = document.createElement('div');
        messageDisplay.classList.add('message');
        messageDisplay.innerHTML = this.message;
        document.querySelector('body').appendChild(messageDisplay);
    }

    drawToolbox() {
        const toolBox = document.createElement('div');
        toolBox.classList.add('toolbox');
        
        const startButton = document.createElement('button');
        startButton.type = 'button';
        startButton.id = 'startButton';
        startButton.innerHTML = '✨ Start new game';
        startButton.addEventListener('click', () => this.restartGame());
        
        toolBox.appendChild(startButton);
        document.querySelector('body').appendChild(toolBox);        
    }

    setMessage(text) {
        this.message = text;
        const messageDisplay = document.querySelector('.message');
        if (messageDisplay === null) {
            this.drawMessage();
        } else {
            messageDisplay.innerHTML = this.message;
        }
    }

    startGame(turdCount) {
        this.setupGrid();
        this.addTurds(turdCount);
        this.draw();
        this.setMessage('Find the turds (' + this.turdCount + ')');
        this.startPlayerInteraction();
        this.gameInProgress = true;
    }
    
    restartGame() {
        this.clearCanvas();
        this.setMessage('Find the turds (' + this.turdCount + ')');
        this.setupGrid();
        this.addTurds();
        this.drawGrid();
        this.gameInProgress = true;
    }

}