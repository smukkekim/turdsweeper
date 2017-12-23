export default class Cell {
    constructor(col, row, size, state) {
        if (state === undefined) { state = Math.random() >= 0.5; }
        this.isTurd = state;
        this.isPlayed = false;
        this.isFlagged = false;
        this.size = size;
        this.posX = col;
        this.posY = row;
        this.x = this.posX * this.size;
        this.y = this.posY * this.size;
        this.neighborTurdCount = 0;
    }

    render(context) {
        context.strokeStyle = 'black';
        if (this.isPlayed || this.isFlagged) {
            const color = this.isFlagged ? 'pink' : this.isTurd ? 'burlywood' : '#dedede';
            context.fillStyle = color;
            context.fillRect(this.x, this.y, this.size, this.size);
            context.strokeRect(this.x, this.y, this.size, this.size);
            
            context.fillStyle = 'black';
            context.textBaseline = 'middle';
            context.textAlign = 'center';
            context.font = '20px arial';
            if (this.isFlagged) {
                context.fillText('🚩', this.x + this.size / 2, this.y + this.size / 2);
            } else if (this.isTurd) {
                context.fillText('💩', this.x + this.size / 2, this.y + this.size / 2);
            } else {
                context.fillText(this.neighborTurdCount + '', this.x + this.size / 2, this.y + this.size / 2);
            }
        } else {
            context.fillStyle = 'papayawhip';
            context.fillRect(this.x, this.y, this.size, this.size);
            context.strokeRect(this.x, this.y, this.size, this.size);
        }

    }
}
