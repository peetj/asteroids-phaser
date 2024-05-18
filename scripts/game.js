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
    this.physics.world.enable(playerContainer);
    playerContainer.body.setMaxVelocity(200);

    // Enable keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.bullets = this.physics.add.group({
        classType: Phaser.GameObjects.Graphics,
        maxSize: 4, // limit to 4 bullets
        runChildUpdate: true
    });

    // Sounds
    this.fire_snd = this.sound.add('fire', { volume: 0.5, loop: false });
    this.thrust_snd = this.sound.add('thrust', { volume: 0.1, loop: false });

    // Starfield
    createStarfield.call(this);

    // TEST
    //drawAsteroid(this.add.graphics(), 400, 100);
}

function update() {

    let thrusting = false;

    // Handle rotation
    if (this.cursors.left.isDown) {
        playerContainer.body.setAngularVelocity(-150); // Rotate left
    } else if (this.cursors.right.isDown) {
        playerContainer.body.setAngularVelocity(150); // Rotate right
    }
    else {
        playerContainer.body.setAngularVelocity(0);
    }

    // Handle thrust
    if (this.cursors.up.isDown) {
        thrusting = true;
        this.physics.velocityFromRotation(playerContainer.rotation - Phaser.Math.DegToRad(90), 200, playerContainer.body.acceleration);
    } else if (this.cursors.down.isDown) {
        this.physics.velocityFromRotation(playerContainer.rotation + Phaser.Math.DegToRad(90), 100, playerContainer.body.acceleration);
    }
    else {
        playerContainer.body.setAcceleration(0, 0);

        // Apply manual deceleration
        const deceleration = 0.25;
        if (playerContainer.body.velocity.length() > 0) {
            playerContainer.body.velocity.scale(1 - deceleration / playerContainer.body.velocity.length());
        }
    }

    // Redraw the ship with or without thrust tail
    drawShip(playerContainer.list[0], thrusting);

    // Handle shooting
    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
        fire.call(this);
    }

    // Reuse bullets that go offscreen
    this.bullets.children.each((bullet) => {
        if (bullet.active && (bullet.x < 0 || bullet.x > this.physics.world.bounds.width || bullet.y < 0 || bullet.y > this.physics.world.bounds.height)) {
            bullet.setActive(false);
            bullet.setVisible(false);
        }
    });

    this.physics.world.wrap(playerContainer,0);
}

function fire() {
    let bullet = this.bullets.get();

    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);

        // Draw the bullet as a simple vector line
        bullet.clear();
        bullet.lineStyle(2, 0xffffff, 0.8);
        bullet.beginPath();
        bullet.moveTo(0, 0);
        bullet.lineTo(0, 2); // Bullet length
        bullet.strokePath();

        // Position the bullet at the top middle of the ship
        const bulletOffset = this.physics.velocityFromRotation(playerContainer.rotation - Phaser.Math.DegToRad(90), 12);
        bullet.setPosition(playerContainer.x + bulletOffset.x, playerContainer.y + bulletOffset.y);

        // Set the bullet velocity in the direction of the ship's rotation
        this.physics.velocityFromRotation(playerContainer.rotation - Phaser.Math.DegToRad(90), 250, bullet.body.velocity);
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

function drawShip(graphics, thrusting = false) {
    graphics.clear();
    graphics.lineStyle(2, 0xffffff, 0.6);
    graphics.beginPath();
    graphics.moveTo(0, -12);  // Top of the A
    graphics.lineTo(10, 12);  // Bottom right of the A
    graphics.lineTo(4, 4);    // Inner right
    graphics.lineTo(-4, 4);   // Inner left
    graphics.lineTo(-10, 12); // Bottom left of the A
    graphics.lineTo(0, -12);  // Top left to top
    graphics.closePath();
    graphics.strokePath();

    // Draw thrust tail if thrusting
    if (thrusting) {
        graphics.fillStyle(0xffffff, 0.7); // Solid white fill for thrust
        graphics.beginPath();
        graphics.moveTo(-4, 4);
        graphics.lineTo(0, 8); // Smaller tail middle
        graphics.lineTo(4, 4);
        graphics.lineTo(-4, 4); // Close the thrust triangle
        graphics.closePath();
        graphics.fillPath();
    }
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