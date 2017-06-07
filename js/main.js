var headset;  // Active VR headset info

// If a VR headset is connected, get its info
navigator.getVRDisplays().then(function (displays) {
    if (displays[0]) {
        headset = displays[0];
    }
});


window.addEventListener('DOMContentLoaded', function () {
    var scene;                    // 3D scene
    var camera;                   // The camera for the scene
    var ground;                   // The ground plane mesh
    var sphere;                   // The ball mesh


    // Connects an xbox controller has been plugged in and and a button/trigger moved,
    function onNewGamepadConnected(gamepad) {
        var xboxpad = gamepad;

        xboxpad.onbuttondown(function (buttonValue) {
            if (buttonValue == BABYLON.Xbox360Button.A) {
                // Bump the ball up 20 units
                sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 10, 20), sphere.getAbsolutePosition());
            }
        });
    }


    // Get all connected gamepads
    var gamepads = new BABYLON.Gamepads(function (gamepad) { onNewGamepadConnected(gamepad); });

    // Grab where we'll be displayed the game
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);


    // Creates and return the scene
    var createScene = function () {

        // Create the Babylon scene
        var scene = new BABYLON.Scene(engine);


        /////////// Cameras /////////////////////////////////////

        // Determine which camera to initially use
        if (headset) {
            // Create a WebVR camera 
            camera = new BABYLON.WebVRFreeCamera("vrcamera", new BABYLON.Vector3(0, 14, 0), scene, true, { trackPosition: true });
            camera.deviceScaleFactor = 1;
        } else {
            // Create a Universal camera for standard input
            camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 18, -45), scene);
        }


        // attach the camera to the canvas once the user clicks the window. Needed to activate webvr/headset connection
        scene.onPointerDown = function () {
            scene.onPointerDown = undefined;
            camera.attachControl(canvas, true);
        }

        /////////// Lights /////////////////////////////////////

        var light0 = new BABYLON.PointLight('light0', new BABYLON.Vector3(1, 10, 0), scene);
        light0.groundColor = new BABYLON.Color3(0, 0, 0);
        light0.position.x = 10;

        var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light1.diffuse = new BABYLON.Color3(.5, .5, .5);
        light1.specular = new BABYLON.Color3(.5, .5, .5);
        light1.intensity = 0.5;



        /////////// Meshes //////////////////////////////////////

        // Make sphere
        sphere = BABYLON.Mesh.CreateSphere("sphere", 30, 20, scene);
        sphere.rotation.y = -1.8;

        // Position sphere
        sphere.position.y = 20;
        sphere.position.z = 35;

        // Make material for ball
        var sphereMaterial = new BABYLON.StandardMaterial("smat", scene);
        sphereMaterial.diffuseTexture = new BABYLON.Texture("textures/jk.png", scene);
        sphere.material = sphereMaterial;

        // Make ground
        var ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 2, scene);
        // make the position low to accomodate VR experience
        ground.position.y = -10;


        /////////// Physics //////////////////////////////////////

        scene.enablePhysics();

        // Sphere has mass so it falls, high restitution gives it bounce 
        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: .9 }, scene);
        // Ground has no mass so doesn't move,  restitution at .9 gives a moderate amount of bounce back
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: .9 }, scene);


        /////////// Shadows ///////////////////////////////////////

        var shadowGenerator = new BABYLON.ShadowGenerator(1024, light0);
        shadowGenerator.getShadowMap().renderList.push(sphere);
        ground.receiveShadows = true;

        return scene;
    };

    // Create the scene
    var scene = createScene();
    // Do any animations/run render loop
    animate();



    // Run the render loop (fired every time a new frame is rendered)
    function animate() {

        engine.runRenderLoop(function () {
            // Determine which camera should be showing depending on whether or not the headset is presenting
            if (headset) {
                if (!(headset.isPresenting)) {
                    var camera2 = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 18, -45), scene);
                    scene.activeCamera = camera2;
                } else {
                    scene.activeCamera = camera;
                }
            }
            // Render the scene
            scene.render();
        });
    }

});
