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

// --- 1. GLOBAL VARIABLES ---
let moveX = 0; // Will hold our left/right tilt value
let isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// --- 2. SETUP EVENT LISTENERS ---

// Logic: If user tilts right (gamma > 0), stars move left. 
// We smooth the value to prevent jitter.
function handleOrientation(event) {
    const tilt = event.gamma; // Gamma is left/right tilt (-90 to 90)
    
    // Limits: Clamp tilt to -45 and 45 degrees so extreme tilting doesn't break it
    const clampedTilt = Math.max(-45, Math.min(45, tilt));
    
    // Normalize: Convert -45...45 to -1...1
    // We reverse the sign (-) so tilting Right makes stars move Left (opposite way)
    moveX = -(clampedTilt / 45); 
}

// --- 3. iOS PERMISSION HANDLER ---
// iOS 13+ requires a button click to access motion sensors.
function requestMotionPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    hidePermissionButton(); // Helper to remove button
                }
            })
            .catch(console.error);
    } else {
        // Android or older iOS (No permission needed)
        window.addEventListener('deviceorientation', handleOrientation);
        hidePermissionButton();
    }
}

// --- 4. INTEGRATE INTO YOUR ANIMATION LOOP ---
// Find your existing animate() function and add the 'moveX' logic

/* 
   EXAMPLE ANIMATION LOOP 
   (Copy the logic inside this function to your actual loop)
*/
function animate() {
    requestAnimationFrame(animate);

    // Existing rotation or movement...
    // starSystem.rotation.y += 0.001; 

    // --- NEW: APPLY TILT ---
    if (isMobile) {
        // 'moveX' is between -1 and 1.
        // Multiply by a speed factor (e.g., 0.05)
        
        // Option A: Rotate the whole system (Best for "looking around")
        starSystem.rotation.y += moveX * 0.02; 
        
        // Option B: Slide stars sideways (Best for "parallax")
        // starSystem.position.x += moveX * 0.1;
    }

    renderer.render(scene, camera);
}
