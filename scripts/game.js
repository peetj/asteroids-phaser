this.player = null;
this.debug = true;
var playerContainer;

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
    this.load.image('bullet', '/images/bullet.png');

    // Load sound assets here
    this.load.audio('fire', 'sounds/fire.wav');
    this.load.audio('thrust', 'sounds/thrust.wav');
}

function create () {
    this.physics.world.setBounds(0, 0, 800, 600);

        // Create ship container to hold the graphics
    playerContainer = this.add.container(400, 300);
    playerContainer.setSize(30, 30); // Set the size of the container

    // Create ship using Graphics
    player = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff } });
    drawShip(player);
    playerContainer.add(player);
    // Enable physics on the container
    this.physics.world.enable(playerContainer);
    playerContainer.body.setDamping(true);
    playerContainer.body.setDrag(0.9);
    playerContainer.body.setMaxVelocity(200);

    // Enable keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    key_spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    key_spacebar.on('down', ()=> {
        fire.call(this)
    });

    this.bullets = this.physics.add.group();

    // Sounds
    this.fire_snd = this.sound.add('fire', { volume: 0.5, loop: false });
    this.thrust_snd = this.sound.add('thrust', { volume: 0.1, loop: false });

    // Starfield
    createStarfield.call(this);

    // TEST
    //drawAsteroid(this.add.graphics(), 400, 100);
}

function update () {
    // Handle rotation
    if (this.cursors.left.isDown) {
        playerContainer.body.setAngularVelocity(-150); // Rotate left
    } else if (this.cursors.right.isDown) {
        playerContainer.body.setAngularVelocity(150); // Rotate right
    }
    else if(this.cursors.up.isDown){
       // Calculate acceleration vector based on player's current angle
       const acceleration = this.physics.velocityFromAngle( playerContainer.body.angle, 100);
        playerContainer.body.acceleration.set(acceleration.x, acceleration.y);
        this.thrust_snd.play();
    }
    else if(this.cursors.down.isDown){
        // Apply reverse thrust
        const acceleration = this.physics.velocityFromAngle(player.angle, -100);
        player.body2.acceleration.set(acceleration.x, acceleration.y);
    }
    else {
        //player.body.acceleration.set(0, 0);
        //player.setTexture('player');
        playerContainer.body.setAngularVelocity(0);
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

function createStarfield() {
    // Create a Graphics object
    let graphics = this.add.graphics();

    // Generate stars
    for (let i = 0; i<100; i++) {
        let x = Phaser.Math.Between(0, 800);
        let y = Phaser.Math.Between(0, 600);
        let alpha = Phaser.Math.FloatBetween(0.3, 0.6);
        let size = Phaser.Math.Between(1, 2); // Randomize star size
        graphics.fillStyle(0xffffff, alpha);
        graphics.fillRect(x, y, size, size);
    }
}

function drawShip(graphics) {
    graphics.clear();
    graphics.lineStyle(2, 0xffffff, 0.6);
    graphics.beginPath();
    graphics.moveTo(0, -12);  // Top of the A
    graphics.lineTo(10, 12);  // Bottom right of the A
    graphics.lineTo(4, 4);    // Inner right
    graphics.lineTo(-4, 4);   // Inner left
    graphics.lineTo(-10, 12); // Bottom left of the A
    graphics.closePath();
    graphics.strokePath();
}

function drawAsteroid(graphics, centerX, centerY) {
    // Define the vertices of the asteroid shape
    let vertices = [
        { x: 30, y: 0 },
        { x: 60, y: 20 },
        { x: 70, y: 50 },
        { x: 50, y: 70 },
        { x: 20, y: 80 },
        { x: -10, y: 70 },
        { x: -30, y: 40 },
        { x: -20, y: 10 },
        { x: 0, y: -10 }
    ];

    // Move to the first vertex
    graphics.lineStyle(2, 0xffffff, 0.6);
    graphics.beginPath();
    graphics.moveTo(vertices[0].x + centerX, vertices[0].y + centerY);

    // Draw lines to each subsequent vertex
    for (let i = 1; i<vertices.length; i++) {
        graphics.lineTo(vertices[i].x + centerX, vertices[i].y + centerY);
    }

    // Close the shape by connecting the last vertex to the first
    graphics.closePath();
    graphics.strokePath();
}