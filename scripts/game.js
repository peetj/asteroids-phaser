let player = null;

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var game = new Phaser.Game(config);

function preload () {
    // Load assets here
    this.load.image('player', '/images/ship.png');
}

function create () {
    // Create game objects here
    player = this.add.image(400,300,'player');

    // Enable keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
}

function update () {
    // Update game information, object states...etc
    if(this.cursors.left.isDown){
        player.angle -= 1;
    }
    else if(this.cursors.right.isDown){
        player.angle += 1;
    }
}
