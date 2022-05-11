const container = document.body;
const tooltip = document.querySelector('.tooltip');
let currentSprite = false;

// icon et images
const icons = {
    info: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADBklEQVR42u2bP08UQRiHnzFaSYCI/xoksdBIqGwIiYWRUBISExpCQ0ej38FWOmlIKKhoMPEbaCxsrrHiYrQgOSlQEaICrT+LHSPZzNzt3s3c3Hn7lHvLzvv82L2dm30XKioqKgYY062BJF0HpoA7wARwBbhsPz4DjoEG8AnYNcZ8Sx1Op8IXJM1KWpdUV3nq9m9nJV1I7VNGfEzSM0mNNqR9NOwxx1L7NRMflbQm6SSgeJ4TO8Zoat+8/LKkg4jieQ4kLaf2RtKwpJ0uiufZkTScSn5S0l5C+b/sSZrstvyMpKPU5uc4kjTTjkvpeYCkaeA1/+7hvcIZMGuMqUULQNIU8Aa4ltrWwyHwyBizGzwASSPAe+B2assW7AH3jTE/i+xcZoa12Qfy2Bo3i+5cKABl99zF1GYlWFTBeULLS0DZrOsDcDNggTXgc27bLWA64BhfgHvGmB8dHUXZ1DM0S45xliKMs9bKr+klIOkqsBrwv9JtVq1DewEAT4Ch1BYdMGQdygeg7Df4SmqDAKyoyXpCszPgITCeuvoAjFuX0gE8jljUdv7bCtiOOJ7XpdUZ8L/gdXHOA5QtYH5NXXVgbrgWWn1nwFTqaiPgdPIFcDd1tRFwOl307DwRuZgXwLvctgfA04hjOp18AcReZ6sZY16e3yDpUuQxnU6+S2AkcjEpcDr1zxOXSPgCKLSa0mc4nXwB/EpdbQScTr4AGqmrjYDTyRfAx9TVRsDp5Aug8LJyH+F0cgZg58z11BUHpO5ruGh2G3ybuuqAeF2aBfAqddUB8bq0OgP2U1cegH3aOQOMMb+BrdTVB2DLupQLwLIOnKY26IBT6+ClaQDGmO/ARmqLDtiwDn7HVkcY+EdjNoTlCI+tYhO2iUppm6HKslPUq2qQKHpUe8AFsjaUXuUQWCgqXyoAG8IuME/WkNRrnAHzZfqDSgdgQ6gBc2Td3b3CMTBXtkOsIzTIjZLnQhjcVtlcEIPZLJ0LoVvt8s/Va+3yuSAG84UJRxB98cpM9dJURUVFxSDzBxKde4Lk3/h2AAAAAElFTkSuQmCC'
}

class Scene {
    constructor(image) {
        this.image = image;
        this.points = [];
        this.sprites = [];
        this.scene = null;
    }

    createScene(scene) {
        this.scene = scene;

        const geometry = new THREE.SphereGeometry(50, 32, 32);
        const sphereTexture = new THREE.TextureLoader().load(this.image)
        sphereTexture.wrapS = THREE.RepeatWrapping;
        sphereTexture.repeat.x = -1; // on inverse l'image dans la sphere

        const material = new THREE.MeshBasicMaterial({
            map: sphereTexture,
            side: THREE.DoubleSide,
            transparent: false
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);

        this.points.forEach(this.addTooltip.bind(this));
    }

    addPoint(point) {
        this.points.push(point);
        return this;
    }

    addTooltip(point) {
        const spriteMaterial = new THREE.SpriteMaterial({map: new THREE.TextureLoader().load(icons.info)});
        spriteMaterial.transparent = true;
        const sprite = new THREE.Sprite(spriteMaterial);
        
        sprite.name = point.name;
        sprite.position.copy(point.position.clone().normalize().multiplyScalar(40));
        sprite.scale.multiplyScalar(2);
        this.scene.add(sprite);
        this.sprites.push(sprite);

        sprite.onClick = () => {
            if (point.scene) {
                this.destroy()
                point.scene.createScene(this.scene);
                point.scene.appear();
            }
        };
    }

    destroy () {
        this.scene.remove(this.sphere)
        this.sprites.forEach(sprite => {
            TweenLite.to(sprite.scale, 0.3, {
                x: 0, 
                y: 0, 
                z: 0, 
                onComplete: () => this.scene.remove(sprite)
            });
        });
    }


    appear () {
        this.sprites.forEach(sprite => {
            sprite.scale.set(0, 0, 0);
            TweenLite.to(sprite.scale, 0.3, {x: 2, y: 2, z: 2});
        });
    }
}

// scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const rayCaster = new THREE.Raycaster();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// mouvement de la camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(-1, 0, 0);
controls.rotateSpeed = 0.4;
controls.enableZoom = true;
controls.update();


window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})

container.addEventListener('click', e => {
    intersections = rayCaster.intersectObjects(scene.children);
    intersections.forEach(intersection => {
        if (intersection.object.type === 'Sprite') {
            intersection.object.onClick();
        }
    })
});

container.addEventListener('mousemove', e => {
    let mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        - (e.clientY / window.innerHeight) * 2 + 1
    );

    foundSprite = false;
    rayCaster.setFromCamera(mouse, camera);
    intersections = rayCaster.intersectObjects(scene.children);
    intersections.forEach(intersection => {
        if (intersection.object.type === 'Sprite') {
            let p = intersection.object.position.clone().project(camera);
            tooltip.style.top = ((-1 * p.y + 1) * window.innerHeight / 2) + 'px';
            tooltip.style.left = ((p.x + 1) * window.innerWidth / 2) + 'px';
            tooltip.classList.add('is-active');
            tooltip.innerHTML = intersection.object.name;
            currentSprite = intersection.object;
            foundSprite = true;
        }
    });

    if (foundSprite === false && currentSprite) {
        tooltip.classList.remove('is-active');
        currentSprite = false;
    }
})

// navigation 360
let building = new Scene('../images/building.jpg');
let groundFloor = new Scene('../images/ground_floor.jpg');
let firstStage = new Scene('../images/first_stage.jpg');
let firstStageClassrooms = new Scene('../images/first_stage_classrooms.jpg');

building
    .addPoint({position: new THREE.Vector3(47.33136040872327, 2.519483092465857, 14.960382488102171), name: 'Entrée principale', scene: groundFloor})
    .addPoint({position: new THREE.Vector3(44.451650389036615, 1.8276682097440096, -22.204281428809807), name: 'Entrée étudiants'})
    .addPoint({position: new THREE.Vector3(-0.9711015127931042, 1.2145194921328875,-49.844689157364584), name: 'Entrée salle 401B'})
    .addPoint({position: new THREE.Vector3(-18.848850929854457, 7.12026109712192, -45.687766950154774), name: 'Bâtiment UNH 2'});
groundFloor
    .addPoint({position: new THREE.Vector3(49.60657164089393, -0.4804500526325468, 3.754901360621054), name: 'Sortie', scene: building})
    .addPoint({position: new THREE.Vector3(24.572397747766434, 2.260405137764802, 43.16187675205984), name: 'Réception'})
    .addPoint({position: new THREE.Vector3(-49.559082476994014, -0.28871401761632337, 4.332704956613618), name: 'Salle Justine'})
    .addPoint({position: new THREE.Vector3(-38.88110705826111, 30.86473835729667, 4.096521262446539), name: 'Premier niveau hall', scene: firstStage});
firstStage
    .addPoint({position: new THREE.Vector3(-48.66248183520141, -7.552783986529731, 7.141520447222128), name: 'Bibliothèque'})
    .addPoint({position: new THREE.Vector3(5.54584656687121, -1.3674026446842515, 49.38660598150729), name: 'Aile étudiants', scene: firstStageClassrooms})
    .addPoint({position: new THREE.Vector3(48.241518521238035, -11.899312519703532, 2.6449164103181038), name: 'Entrée principale', scene: groundFloor});
firstStageClassrooms
    .addPoint({position: new THREE.Vector3(26.08254009596839, -2.56156595489417, 42.33799470769219), name: 'Salle 411 A|B'})
    .addPoint({position: new THREE.Vector3(-19.114134423269356, 3.2156306635917375, -46.02642434373278), name: 'Salle 412 A|B'})
    .addPoint({position: new THREE.Vector3(28.420469966119455, 1.426800064709266, -40.956400074396356), name: 'Premier niveau hall', scene: firstStage});

building.createScene(scene);



/// recuperation des points
// container.addEventListener('click', e => {
//     let mouse = new THREE.Vector2(
//         (e.clientX / window.innerWidth) * 2 - 1,
//         - (e.clientY / window.innerHeight) * 2 + 1
//     );

//     rayCaster.setFromCamera(mouse, camera);
//     let intersections = rayCaster.intersectObject(groundFloor.sphere);

//     if (intersections.length > 0) {
//         console.log(intersections[0].point);
//     }
// });


// affichage à l'écran
(function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
})();
