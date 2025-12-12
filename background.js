// background.js

const initThreeJS = () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // --- 1. SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- 2. CREATE PARTICLES ---
    const geometry = new THREE.BufferGeometry();
    const count = 6000; 
    const positions = new Float32Array(count * 3); 

    for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 2000;
        positions[i + 1] = (Math.random() - 0.5) * 2000;
        positions[i + 2] = (Math.random() - 0.5) * 2000;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 2,
        transparent: true,
        opacity: 0.6, // Adjust transparency here
    });

    const starField = new THREE.Points(geometry, material);
    scene.add(starField);

    // --- 3. MOUSE INTERACTION VARIABLES ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Center of the screen
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // --- 4. ANIMATION LOOP ---
    const animate = () => {
        requestAnimationFrame(animate);

        // A. Move Stars Forward (Z-Axis)
        const positions = starField.geometry.attributes.position.array;
        for (let i = 2; i < count * 3; i += 3) {
            positions[i] += 2; // SPEED: Change this number to go faster/slower
            
            if (positions[i] > 1000) {
                positions[i] = -1000;
            }
        }
        starField.geometry.attributes.position.needsUpdate = true;

        // B. Mouse Follow Rotation
        targetX = mouseX * 0.0001;
        targetY = mouseY * 0.0001;

        // Smoothly rotate towards mouse position
        starField.rotation.y += 0.09 * (targetX - starField.rotation.y);
        starField.rotation.x += 0.09 * (targetY - starField.rotation.x);

        renderer.render(scene, camera);
    };

    animate();

    // --- 5. HANDLE RESIZE ---
    window.addEventListener('resize', () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Run when page loads
window.addEventListener('load', initThreeJS);
