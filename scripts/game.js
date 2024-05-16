let player = null;

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
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
    this.load.image('bullet', '/images/bullet.png');
}

function create () {
    // Create game objects here
    player = this.add.image(400,300,'player');

    // Enable keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    key_spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    key_spacebar.on('down', ()=> {
        fire.call(this)
    });

    this.bullets = this.physics.add.group();
}

function update () {
    // Update game information, object states...etc
    if(this.cursors.left.isDown){
        player.angle -= 2;
    }
    else if(this.cursors.right.isDown){
        player.angle += 2;
    }

}

function fire() {
    if(this.bullets.getChildren().length < 4) {
        // Calculate the tip of the ship
        const tipPosition = getTipPosition(player, 10); // adjust 30 to the correct distance from center to tip
        // Create a bullet at the tip position
        var bullet = this.bullets.create(tipPosition.x, tipPosition.y, 'bullet');
        this.physics.velocityFromAngle(player.angle, 200, bullet.body.velocity); // adjust 200 to desired bullet speed
    }


}


function getTipPosition(ship, distanceFromCenter) {
    const radians = Phaser.Math.DegToRad(ship.angle);
    return {
        x: ship.x + distanceFromCenter * Math.cos(radians),
        y: ship.y + distanceFromCenter * Math.sin(radians)
    };
}
