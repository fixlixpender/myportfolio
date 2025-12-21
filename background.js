// background.js - With Mobile Gyro Support

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

    // --- 3. INPUT VARIABLES ---
    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    // Desktop Mouse
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // --- 4. MOBILE GYRO LOGIC (NEW) ---
    function handleOrientation(event) {
        // Gamma: Left/Right tilt (-90 to 90)
        // Beta: Front/Back tilt (-180 to 180)
        
        // We amplify the tilt so you don't have to turn your phone too much
        const tiltX = event.gamma * 4; 
        const tiltY = (event.beta - 45) * 4; // Subtract 45 to account for holding phone at angle

        // Map to mouse coordinates
        mouseX = tiltX * 5;
        mouseY = tiltY * 5;
    }

    // Expose function to enable sensors (Must be called on Click)
    window.enableStarfieldGyro = () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requires explicit permission
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                })
                .catch(console.error);
        } else {
            // Android / Older devices allow it automatically
            window.addEventListener('deviceorientation', handleOrientation);
        }
    };

    // --- 5. SPEED CONTROL ---
    let currentSpeed = 2;    
    let targetSpeed = 2;     
    const normalSpeed = 2;
    const warpSpeed = 40;    

    window.setWarpSpeed = (isActive) => {
        targetSpeed = isActive ? warpSpeed : normalSpeed;
    };

    // --- 6. ANIMATION LOOP ---
    const animate = () => {
        requestAnimationFrame(animate);

        // Smooth Acceleration
        currentSpeed += (targetSpeed - currentSpeed) * 0.02;

        // Move Stars
        const positions = starField.geometry.attributes.position.array;
        for (let i = 2; i < count * 3; i += 3) {
            positions[i] += currentSpeed; 
            if (positions[i] > 1000) positions[i] = -1000;
        }
        starField.geometry.attributes.position.needsUpdate = true;

        // Rotation Logic (Works with both Mouse and Gyro)
        const targetX = mouseX * 0.0001;
        const targetY = mouseY * 0.0001;

        starField.rotation.y += 0.05 * (targetX - starField.rotation.y);
        starField.rotation.x += 0.05 * (targetY - starField.rotation.x);

        // Warp Visuals
        if (currentSpeed > 5) {
             material.opacity = 0.8;
             material.color.setHex(0xFFFFFF); 
        } else {
             material.opacity = 0.6;
             material.color.setHex(0x00f0ff); 
        }

        renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

window.addEventListener('load', initThreeJS);