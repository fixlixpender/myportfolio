// background.js - Updated with Warp Speed Logic

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
        opacity: 0.6,
    });

    const starField = new THREE.Points(geometry, material);
    scene.add(starField);

    // --- 3. MOUSE INTERACTION VARIABLES ---
    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // --- 4. SPEED CONTROL VARIABLES (NEW) ---
    let currentSpeed = 2;    // Default cruising speed
    let targetSpeed = 2;     // The speed we want to reach
    const normalSpeed = 2;
    const warpSpeed = 40;    // How fast is "Engines On"?

    // EXPOSE GLOBAL FUNCTION TO CHANGE SPEED
    window.setWarpSpeed = (isActive) => {
        if (isActive) {
            targetSpeed = warpSpeed;
        } else {
            targetSpeed = normalSpeed;
        }
    };

    // --- 5. ANIMATION LOOP ---
    const animate = () => {
        requestAnimationFrame(animate);

        // A. Smooth Acceleration/Deceleration
        // Lerp current speed towards target speed (0.02 is the acceleration factor)
        currentSpeed += (targetSpeed - currentSpeed) * 0.02;

        // B. Move Stars Forward
        const positions = starField.geometry.attributes.position.array;
        for (let i = 2; i < count * 3; i += 3) {
            
            positions[i] += currentSpeed; // Use dynamic speed
            
            if (positions[i] > 1000) {
                positions[i] = -1000;
            }
        }
        starField.geometry.attributes.position.needsUpdate = true;

        // C. Mouse Follow Rotation (Reduced slightly at high speeds for stability)
        const targetX = mouseX * 0.0001;
        const targetY = mouseY * 0.0001;

        starField.rotation.y += 0.05 * (targetX - starField.rotation.y);
        starField.rotation.x += 0.05 * (targetY - starField.rotation.x);

        // Optional: Stretch stars slightly when moving fast (Warp effect)
        // This requires custom shaders usually, but we can simulate intensity by opacity
        if (currentSpeed > 5) {
             material.opacity = 0.8;
             material.color.setHex(0xFFFFFF); // Turn stars white at warp
        } else {
             material.opacity = 0.6;
             material.color.setHex(0x00f0ff); // Back to blue
        }

        renderer.render(scene, camera);
    };

    animate();

    // --- 6. HANDLE RESIZE ---
    window.addEventListener('resize', () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

window.addEventListener('load', initThreeJS);
