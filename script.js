const firebaseConfig = { databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const vp = document.getElementById('pixel-viewport');
const cv = document.getElementById('mainCanvas');
const ctx = cv.getContext('2d');
cv.width = 5000; cv.height = 2000;
let scale = 0.2, pX = 0, pY = 0, isD = false, sX, sY, pixels = {};

// --- ফায়ার ইফেক্ট কোড ---
const fCv = document.getElementById('fireCanvas');
const fCtx = fCv.getContext('2d');
fCv.width = window.innerWidth; fCv.height = 100;
let particles = [];
class Particle {
    constructor(x, y) { this.x = x; this.y = y; this.size = Math.random() * 5 + 2; this.speedY = Math.random() * 3 + 1; this.color = `hsl(${Math.random() * 30 + 10}, 100%, 50%)`; this.opacity = 1; }
    update() { this.y -= this.speedY; this.opacity -= 0.02; }
    draw() { fCtx.globalAlpha = this.opacity; fCtx.fillStyle = this.color; fCtx.beginPath(); fCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2); fCtx.fill(); }
}
window.addEventListener('mousemove', (e) => { if(e.pageY < 200) for(let i=0; i<5; i++) particles.push(new Particle(e.pageX, 80)); });
function animateFire() {
    fCtx.clearRect(0,0,fCv.width, fCv.height);
    particles.forEach((p, i) => { p.update(); p.draw(); if(p.opacity <= 0) particles.splice(i, 1); });
    requestAnimationFrame(animateFire);
}
animateFire();

// --- ম্যাপ ও গ্রিড কোড ---
function update() { document.getElementById('canvas-mover').style.transform = `translate(${pX}px, ${pY}px) scale(${scale})`; }
function drawGrid() {
    ctx.strokeStyle = "rgba(0, 0, 255, 0.4)"; // গাঢ় নীল গ্রিড
    ctx.lineWidth = 0.8;
    for(let x=0; x<=5000; x+=10){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,2000); ctx.stroke(); }
    for(let y=0; y<=2000; y+=10){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(5000,y); ctx.stroke(); }
}
function searchPixel() {
    const id = document.getElementById('searchInput').value.trim();
    if(pixels[id]) { scale = 2.5; pX = (vp.clientWidth/2) - (pixels[id].x * scale); pY = (vp.clientHeight/2) - (pixels[id].y * scale); update(); }
    else alert("ID Not Found!");
}
db.ref('pixels').on('value', s => { pixels = s.val() || {}; render(); });
function render() { ctx.clearRect(0,0,5000,2000); drawGrid(); }
vp.onwheel = (e) => { e.preventDefault(); scale *= (e.deltaY > 0) ? 0.9 : 1.1; scale = Math.max(0.1, 5); update(); };
vp.onmousedown = (e) => { isD = true; sX = e.clientX-pX; sY = e.clientY-pY; };
window.onmouseup = () => isD = false;
window.onmousemove = (e) => { if(isD){ pX = e.clientX-sX; pY = e.clientY-sY; update(); } };
update();
