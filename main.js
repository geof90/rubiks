var locked = false;
var OPS = ["F", "L", "B", "R", "U", "D"];
var perspective = 0;

var solverInitialized = false;
var solvers = [];
solvers.push(new Cube());

Cube.asyncInit("lib/cubejs/worker.js", function() {
    solverInitialized = true;
});

window.onload = init;

function action(cubes, scene, operation, inverse, done) {
    if (locked) return;
    locked = true;
    
    solvers[solvers.length - 1].move(inverse ? (operation + "'") : operation);
    
    var axis = getAxis(operation, inverse);
    var group = groupAndSwap(cubes, scene, operation, inverse);
    
    var curRotationAmount = 0;
    var endRotationAmount = Math.PI / 2;
    var tween = new TWEEN.Tween({ theta: curRotationAmount })
        .to({ theta: endRotationAmount }, 100)
        .onUpdate(function() {
            group.rotateOnAxis(axis, this.theta - curRotationAmount);
            curRotationAmount = this.theta;
            if (this.theta === endRotationAmount) {
                setTimeout(function() {
                    scene.remove(group);
                    var rotatedCubes = [];
                    group.children.forEach(function(cube) {
                        var worldPos = group.localToWorld(cube.position);
                        cube.position.x = worldPos.x;
                        cube.position.y = worldPos.y;
                        cube.position.z = worldPos.z;
                        rotatedCubes.push(cube);
                    });
                    
                    rotatedCubes.forEach(function(cube) {
                        rotateAroundWorldAxis(cube, axis, endRotationAmount);
                        scene.add(cube);
                    });
                    
                    locked = false;
                    done && done();
                }, 1);
            }
        })
        .start();
    
    return tween;
}

function getAxis(operation, inverse) {
    var operationToAxisMap = {};
    operationToAxisMap[OPS[0]] = new THREE.Vector3(1, 0, 0);
    operationToAxisMap[OPS[1]] = new THREE.Vector3(0, 0, 1);
    operationToAxisMap[OPS[2]] = new THREE.Vector3(-1, 0, 0);
    operationToAxisMap[OPS[3]] = new THREE.Vector3(0, 0, -1);
    operationToAxisMap[OPS[4]] = new THREE.Vector3(0, -1, 0);
    operationToAxisMap[OPS[5]] = new THREE.Vector3(0, 1, 0);
    
    var axis = operationToAxisMap[operation];
    
    if (inverse) {
        return axis.multiplyScalar(-1);
    }
    
    return axis;
}

function createCubes(scene) {
    var cubes = [];
    var cubesEdges = [];
    for (var x = 0; x < 3; x++) {
        for (var y = 0; y < 3; y++) {
            for (var z = 0; z < 3; z++) {
                var materials = [
                    new THREE.MeshPhongMaterial({color: 0xff7800}), // orange
                    new THREE.MeshPhongMaterial({color: 0xd92b2c}), // red
                    new THREE.MeshPhongMaterial({color: 0xffffff}), // white
                    new THREE.MeshPhongMaterial({color: 0xe6e621}), // yellow
                    new THREE.MeshPhongMaterial({color: 0x2f55cf}), // blue
                    new THREE.MeshPhongMaterial({color: 0x26b143}), // green
                ];
                
                var faceMaterial = new THREE.MeshFaceMaterial(materials);
                var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
                var cube = new THREE.Mesh(cubeGeometry, faceMaterial);
                
                cube.position.x = (x - 1) * 4.1;
                cube.position.y = (y - 1) * 4.1;
                cube.position.z = (z - 1) * 4.1;
                
                var cubeEdges = new THREE.EdgesHelper(cube, 0x000000);
                cubeEdges.material.linewidth = 3;
                
                cubes.push(cube);
                cubesEdges.push(cubeEdges);
            }
        }
    }
    
    cubes.forEach(function(cube) {
        scene.add(cube);
    });
    
    cubesEdges.forEach(function(cubeEdges) {
        scene.add(cubeEdges);
    });
    
    return cubes;
}

function groupAndSwap(cubes, scene, operation, inverse) {
    var group = new THREE.Object3D();
    
    var repeat = inverse ? 3 : 1;
    for (var i = 0; i < repeat; i++) {
        var clone = cubes.map(function(cube) {
            return cube;
        });
        
        switch (operation) {
            case OPS[0]:
                for (var y = 0; y < 9; y += 3) {
                    for (var z = 0; z < 3; z++) {
                        scene.remove(cubes[y + z]);
                        group.add(cubes[y + z]);
                    }
                }
                
                cubes[0] = clone[2];
                cubes[1] = clone[5];
                cubes[2] = clone[8];
                cubes[3] = clone[1];
                cubes[5] = clone[7];
                cubes[6] = clone[0];
                cubes[7] = clone[3];
                cubes[8] = clone[6];
                break;
            case OPS[1]:
                for (var x = 0; x < 27; x += 9) {
                    for (var y = 0; y < 9; y += 3) {
                        scene.remove(cubes[x + y]);
                        group.add(cubes[x + y]);
                    }
                }
                
                cubes[0] = clone[6];
                cubes[3] = clone[15];
                cubes[6] = clone[24];
                cubes[9] = clone[3];
                cubes[15] = clone[21];
                cubes[18] = clone[0];
                cubes[21] = clone[9];
                cubes[24] = clone[18];
                break;
            case OPS[2]:
                var x = 18;
                for (var y = 0; y < 9; y += 3) {
                    for (var z = 0; z < 3; z ++) {
                        scene.remove(cubes[x + y + z]);
                        group.add(cubes[x + y + z]);
                    }
                }
                
                cubes[18] = clone[24];
                cubes[19] = clone[21];
                cubes[20] = clone[18];
                cubes[21] = clone[25];
                cubes[23] = clone[19];
                cubes[24] = clone[26];
                cubes[25] = clone[23];
                cubes[26] = clone[20];
                break;
            case OPS[3]:
                var z = 2;
                for (var x = 0; x < 27; x += 9) {
                    for (var y = 0; y < 9; y += 3) {
                        scene.remove(cubes[x + y + z]);
                        group.add(cubes[x + y + z]);
                    }
                }
                
                cubes[2] = clone[20];
                cubes[11] = clone[23];
                cubes[20] = clone[26];
                cubes[5] = clone[11];
                cubes[23] = clone[17];
                cubes[8] = clone[2];
                cubes[17] = clone[5];
                cubes[26] = clone[8];
                break;
            case OPS[4]:
                var y = 6;
                for (var x = 0; x < 27; x += 9) {
                    for (var z = 0; z < 3; z++) {
                        scene.remove(cubes[x + y + z]);
                        group.add(cubes[x + y + z]);
                    }
                }
                
                cubes[6] = clone[8];
                cubes[7] = clone[17];
                cubes[8] = clone[26];
                cubes[15] = clone[7];
                cubes[17] = clone[25];
                cubes[24] = clone[6];
                cubes[25] = clone[15];
                cubes[26] = clone[24];
                break;
            case OPS[5]:
                for (var x = 0; x < 27; x += 9) {
                    for (var z = 0; z < 3; z++) {
                        scene.remove(cubes[x + z]);
                        group.add(cubes[x + z]);
                    }
                }
                
                cubes[0] = clone[18];
                cubes[1] = clone[9];
                cubes[2] = clone[0];
                cubes[9] = clone[19];
                cubes[11] = clone[1];
                cubes[18] = clone[20];
                cubes[19] = clone[11];
                cubes[20] = clone[2];
                break;
        }
    }
    
    scene.add(group);
    return group;
}

function init() {
    document.getElementById("overlay").style.display = "none";
    
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / (window.innerHeight - 200), 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    var clock = new THREE.Clock();

    renderer.setClearColor(new THREE.Color(0xEEEEEE));
    renderer.setSize(window.innerWidth, window.innerHeight - 200);
    
    var cubes = createCubes(scene);
    
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-30, 20, 60);
    spotLight.castShadow = true;
    spotLight.intensity = 0.3;
    scene.add(spotLight);
    
    var ambientLight = new THREE.AmbientLight(0xeeeeee);
    scene.add(ambientLight);
    
    camera.position.x = -35;
    camera.position.y = 20;
    camera.position.z = 16;
    
    var orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControl.enablePan = false;
    
    document.getElementById("viewport").appendChild(renderer.domElement);
    
    var tweener;
    
    window.onkeypress = function (e) {
        switch (e.keyCode) {
            case 70 /* F */:
                tweener = action(cubes, scene, OPS[(0 + perspective) % 4]) || tweener;
                break;
            case 102 /* f */: 
                tweener = action(cubes, scene, OPS[(0 + perspective) % 4], true) || tweener;
                break;
            case 76 /* L */:
                tweener = action(cubes, scene, OPS[(1 + perspective) % 4]) || tweener;
                break;
            case 108 /* l */:
                tweener = action(cubes, scene, OPS[(1 + perspective) % 4], true) || tweener;
                break;
            case 66 /* B */:
                tweener = action(cubes, scene, OPS[(2 + perspective) % 4]) || tweener;
                break;
            case 98 /* b */:
                tweener = action(cubes, scene, OPS[(2 + perspective) % 4], true) || tweener;
                break;
            case 82 /* R */:
                tweener = action(cubes, scene, OPS[(3 + perspective) % 4]) || tweener;
                break;
            case 114 /* r */:
                tweener = action(cubes, scene, OPS[(3 + perspective) % 4], true) || tweener;
                break;
            case 85 /* U */:
                tweener = action(cubes, scene, OPS[4]) || tweener;
                break;
            case 117 /* u */:
                tweener = action(cubes, scene, OPS[4], true) || tweener;
                break;
            case 68 /* D */:
                tweener = action(cubes, scene, OPS[5]) || tweener;
                break;
            case 100 /* d */:
                tweener = action(cubes, scene, OPS[5], true) || tweener;
                break;
        }
    }

    render();
    function render() {
        var delta = clock.getDelta();
        orbitControl.update(delta);
        var azimuthAngle = orbitControl.getAzimuthalAngle();
        updatePerspective(azimuthAngle);
        tweener && TWEEN.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    
    OPS.forEach(function(op, index) {
        if (index < 4) {
            document.getElementById(op).onclick = function() { tweener = action(cubes, scene, OPS[(index + perspective) % 4]) || tweener; }
            document.getElementById(op.toLowerCase()).onclick = function() { tweener = action(cubes, scene, OPS[(index + perspective) % 4], true) || tweener; }
        } else {
            document.getElementById(op).onclick = function() { tweener = action(cubes, scene, op) || tweener; }
            document.getElementById(op.toLowerCase()).onclick = function() { tweener = action(cubes, scene, op, true) || tweener; }
        }
    });
        
    function shuffle(cubes, scene) {
        var randomOperations = [];
        for (var i = 0; i < 20; i++) {
            var rand = Math.random();
            var randomOperation = OPS[Math.floor(rand * 6)];
            randomOperations.push(randomOperation);
        }
        
        var nextAction = function() {
            randomOperations = randomOperations.splice(1);
            if (randomOperations.length) {
                tweener = action(cubes, scene, randomOperations[0], false, nextAction) || tweener;
            }
        };
        
        tweener = action(cubes, scene, randomOperations[0], false, nextAction);
    }
    
    document.getElementById("shuffle").onclick = function() { shuffle(cubes, scene); };
    document.getElementById("solve").onclick = function() {
        function doSolve() {
            document.getElementById("overlay").style.display = "";
            if (solverInitialized) {
                function solveOne() {
                    if (solvers[solvers.length - 1].isSolved()) {
                        if (solvers.length > 1) {
                            solvers.pop();
                            rotateWholeCube(cubes, scene, solveOne);
                        }
                    } else {
                        Cube.asyncSolve(solvers[solvers.length - 1], function(solutionString) {
                            document.getElementById("overlay").style.display = "none";
                            var solution = solutionString.split(" ");
                            var nextAction = function() {
                                if (solution.length) {
                                    if (solution[0].endsWith("'")) {
                                        tweener = action(cubes, scene, solution[0].charAt(0), true, nextAction);
                                    } else if (solution[0].endsWith("2")) {
                                        var move = solution[0].charAt(0);
                                        solution = solution.splice(1);
                                        solution.unshift(move);
                                        solution.unshift(move);
                                        tweener = action(cubes, scene, move, false, nextAction);
                                    } else {
                                        tweener = action(cubes, scene, solution[0], false, nextAction);
                                    }
                                    
                                    solution = solution.splice(1);
                                } else {
                                    if (solvers.length > 1) {
                                        solvers.pop();
                                        rotateWholeCube(cubes, scene, solveOne);
                                    }
                                }
                            };
                            
                            nextAction();
                        }); 
                    }
                }
                
                solveOne();
            } else {
                setTimeout(doSolve, 100);
            }
        }
        
        for (var i = 0; i < solvers.length; i++) {
            if (!solvers[i].isSolved()) {
                setTimeout(doSolve, 1);
                break;
            }
        }
    };
    
    document.getElementById("rotate").onclick = function() { tweener = rotateWholeCube(cubes, scene) || tweener; };
}
             
function rotateAroundWorldAxis(object, axis, radians) {
    var rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}

function rotateWholeCube(cubes, scene, done) {
    if (locked) return;
    locked = true;
    
    if (!done) solvers.push(new Cube());
    
    var axis = getAxis(OPS[0], true);
    var group = new THREE.Object3D();
    for (var i = 0; i < 2; i++) {
        var clone = cubes.map(function(cube) {
            group.add(cube);
            return cube;
        });
        for (var x = 0; x < 27; x += 9) {
            cubes[x + 0] = clone[x + 2];
            cubes[x + 1] = clone[x + 5];
            cubes[x + 2] = clone[x + 8];
            cubes[x + 3] = clone[x + 1];
            cubes[x + 5] = clone[x + 7];
            cubes[x + 6] = clone[x + 0];
            cubes[x + 7] = clone[x + 3];
            cubes[x + 8] = clone[x + 6];
        }
    }
    
    scene.add(group);
    
    var curRotationAmount = 0;
    var endRotationAmount = Math.PI;
    var tween = new TWEEN.Tween({ theta: curRotationAmount })
        .to({ theta: endRotationAmount }, 400)
        .onUpdate(function() {
            group.rotateOnAxis(axis, this.theta - curRotationAmount);
            curRotationAmount = this.theta;
            if (this.theta === endRotationAmount) {
                setTimeout(function() {
                    scene.remove(group);
                    var rotatedCubes = [];
                    group.children.forEach(function(cube) {
                        var worldPos = group.localToWorld(cube.position);
                        cube.position.x = worldPos.x;
                        cube.position.y = worldPos.y;
                        cube.position.z = worldPos.z;
                        rotatedCubes.push(cube);
                    });
                    
                    rotatedCubes.forEach(function(cube) {
                        rotateAroundWorldAxis(cube, axis, endRotationAmount);
                        scene.add(cube);
                    });
                    
                    locked = false;
                    done && done();
                }, 1);
            }
        })
        .start();
    
    return tween;
}

function updatePerspective(azimuthAngle) {
    if (azimuthAngle < -Math.PI / 4 * 3) {
        perspective = 1;
    } else if (azimuthAngle < -Math.PI / 4) {
        perspective = 0;
    } else if (azimuthAngle < Math.PI / 4) {
        perspective = 3;
    } else if (azimuthAngle < Math.PI / 4 * 3) {
        perspective = 2;
    } else {
        perspective = 1;
    }
}
