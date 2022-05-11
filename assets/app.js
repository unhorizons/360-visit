const app = document.body;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// mouvement de la camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(-10, 0, 0);
controls.rotateSpeed = 0.3;
controls.enableZoom = false;
controls.update();


// creation de la sphere 360
const geometry = new THREE.SphereGeometry(50, 32, 32);
const sphereTexture = new THREE.TextureLoader().load('../images/test/3.jpg')
sphereTexture.wrapS = THREE.RepeatWrapping;
sphereTexture.repeat.x = -1; // on inverse l'image dans la sphere

const material = new THREE.MeshBasicMaterial({
    map: sphereTexture,
    side: THREE.DoubleSide
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);



// affichage à l'écran
(function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
})();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})
