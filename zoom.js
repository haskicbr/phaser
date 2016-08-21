/**
 * Created by haskicbr on 13.6.16.
 * Phaser 2.0.4 camera zoom
 * Use cursors to move the camera, Q to zoom in, A to zoom out
 */

var preload = function(game) {
    game.time.advancedTiming = true;
};

var worldScale = 1;
var player;
var bgGroup;
var viewRect;
var boundsPoint;

var create = function(game) {
    // create a reusable point for bounds checking later
    boundsPoint = new Phaser.Point(0, 0);
    // create our reusable view rectangle
    viewRect = new Phaser.Rectangle(0, 0, game.width, game.height);

    // create a group for the clippable world objects
    bgGroup = game.add.group();

    // create a crapload of squares in the world to show movement/zooming
    var sqr, size;
    for (var i = 0; i < 2500; i++) {
        size = game.rnd.integerInRange(5, 20);
        sqr = game.add.graphics(game.rnd.integerInRange(-1000, 1000), game.rnd.integerInRange(-1000, 1000), bgGroup);
        sqr.beginFill(0x666666);
        sqr.drawRect(size * -0.5, size * -0.5, size, size); // center the square on its position
        sqr.endFill();
    }

    // add a player sprite to give context to the movement
    player = game.add.graphics(-15, -15);
    player.beginFill(0x00ff00);
    player.drawCircle(0, 0, 30);
    player.endFill();

    // set our world size to be bigger than the window so we can move the camera
    game.world.setBounds(-1000, -1000, 2000, 2000);

    // move our camera half the size of the viewport back so the pivot point is in the center of our view
    game.camera.x = (game.width * -0.5);
    game.camera.y = (game.height * -0.5);
};

var update = function(game) {
    // movement
    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        game.world.pivot.y -= 5;
        player.y -= 5;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
        game.world.pivot.y += 5;
        player.y += 5;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        game.world.pivot.x -= 5;
        player.x -= 5;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        game.world.pivot.x += 5;
        player.x += 5;
    }

    // zoom
    if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
        worldScale += 0.05;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
        worldScale -= 0.05;
    }

    // set a minimum and maximum scale value
    worldScale = Phaser.Math.clamp(worldScale, 0.25, 2);

    // set our world scale as needed
    game.world.scale.set(worldScale);

    // do some rudimentary bounds checking and clipping on each object
    // TODO: improve with a quadtree or similar batched approach?
    bgGroup.forEachExists(function(circ) {
        // our simplistic bounds checking; just see if the object's screen position is inside the view rectangle
        // NOTE: this does not use getBounds() as this does not work when setting visible to false
        boundsPoint.setTo(
            ((circ.x - game.world.pivot.x) * game.world.scale.x) + (game.width * 0.5),
            ((circ.y - game.world.pivot.y) * game.world.scale.y) + (game.height * 0.5)
        );
        if (Phaser.Rectangle.containsPoint(viewRect, boundsPoint)) {
            //we can see this object, so show it
            circ.visible = true;
        }
        else {
            // we can't see this object, so hide it
            circ.visible = false;
        }
    });
};

var render = function(game) {
    game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
};

var game = new Phaser.Game(500, 400, Phaser.AUTO, 'test', { preload: preload, create: create, update: update, render: render });