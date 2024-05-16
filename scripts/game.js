this.player = null;
this.debug = true;

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
    // Load image assets here
    this.load.image('player', '/images/ship.png');
    this.load.image('bullet', '/images/bullet.png');

    // Load sound assets here
    this.load.audio('fire', 'sounds/fire.wav');
}

function create () {
    this.physics.world.setBounds(0,0,800,600);

    // Create game objects here
    player = this.physics.add.sprite(400, 300, 'player');
    player.setDamping(true);  // This smooths out the stopping behavior when thrust is no longer applied.
    player.setDrag(0.9);     // Drag affects the deceleration, making the ship slow down gradually.
    player.setMaxVelocity(200);  // Limits the maximum speed to prevent the sprite from becoming uncontrollable.

    // Enable keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    key_spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    key_spacebar.on('down', ()=> {
        fire.call(this)
    });

    this.bullets = this.physics.add.group();

    // Sounds
    this.fire_snd = this.sound.add('fire', { volume: 0.5, loop: false });
}

function update () {
    // Update game information, object states...etc
    if(this.cursors.left.isDown){
        player.angle -= 2;
    }
    else if(this.cursors.right.isDown){
        player.angle += 2;
    }
    else if(this.cursors.up.isDown){
       // Calculate acceleration vector based on player's current angle
       const acceleration = this.physics.velocityFromAngle(player.angle, 100);
       player.body.acceleration.set(acceleration.x, acceleration.y);
    }
    else if(this.cursors.down.isDown){
        // Apply reverse thrust
        const acceleration = this.physics.velocityFromAngle(player.angle, -100);
        player.body.acceleration.set(acceleration.x, acceleration.y);
    }
    else {
        player.body.acceleration.set(0,0);
    }

    this.bullets.children.iterate((bullet)=>{
        if(!bullet) return;
        if(bullet.x < 0 || bullet.x > this.sys.game.config.width || bullet.y < 0 || bullet.y > this.sys.game.config.height){
            bullet.destroy();
        }
    }); // pass 'this' context to the callback

    this.physics.world.wrap(player,0);

}

function fire() {
    if(this.bullets.getChildren().length < 4) {
        // Calculate the tip of the ship
        const tipPosition = getTipPosition(player, 10); // adjust 30 to the correct distance from center to tip
        // Create a bullet at the tip position
        var bullet = this.bullets.create(tipPosition.x, tipPosition.y, 'bullet');
        this.physics.velocityFromAngle(player.angle, 200, bullet.body.velocity); // adjust 200 to desired bullet speed
        this.fire_snd.play();
    }
     
}


function getTipPosition(ship, distanceFromCenter) {
    const radians = Phaser.Math.DegToRad(ship.angle);
    return {
        x: ship.x + distanceFromCenter * Math.cos(radians),
        y: ship.y + distanceFromCenter * Math.sin(radians)
    };
}
