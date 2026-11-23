import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const stage = document.querySelector('.flight');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if (!reduced.matches) start().catch(() => stage.classList.remove('rendering'));

async function start() {
  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, 1, .1, 90);
  const artwork = await new THREE.TextureLoader().loadAsync('./night-garden.png');
  artwork.colorSpace = THREE.SRGBColorSpace;
  const print = new THREE.Mesh(new THREE.PlaneGeometry(6,4), new THREE.MeshBasicMaterial({map:artwork, side:THREE.DoubleSide}));
  scene.add(print);
  const rings = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const points = Array.from({length:80}, (_, j) => {
      const angle = j / 80 * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle)*5.3, Math.sin(angle)*5.3, 0);
    });
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({color:i%3 ? 0x685d8d : 0xff6549, transparent:true, opacity:.36}));
    ring.position.z = 4 - i * 2.7;
    rings.add(ring);
  }
  scene.add(rings);
  const dust = new Float32Array(1800);
  for (let i = 0; i < dust.length; i+=3) {
    dust[i] = (Math.random()-.5)*24;
    dust[i+1] = (Math.random()-.5)*15;
    dust[i+2] = Math.random()*42-30;
  }
  const cloud = new THREE.BufferGeometry();
  cloud.setAttribute('position',new THREE.BufferAttribute(dust,3));
  const particles = new THREE.Points(cloud,new THREE.PointsMaterial({color:0xffc297,size:.045,transparent:true,opacity:.68}));
  scene.add(particles);
  stage.prepend(renderer.domElement);
  stage.classList.add('rendering');
  const resize = () => {
    const {width,height} = renderer.domElement.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    renderer.setSize(width,height,false);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize',resize);
  let cursor = 0, progress = 0;
  stage.addEventListener('pointermove',event => {cursor = event.clientX / innerWidth - .5;});
  stage.addEventListener('pointerleave',() => {cursor = 0;});
  renderer.setAnimationLoop(time => {
    if (reduced.matches) {stage.classList.remove('rendering');return;}
    stage.classList.add('rendering');
    const box = stage.getBoundingClientRect();
    if (box.bottom < 0 || box.top > innerHeight) return;
    const target = THREE.MathUtils.clamp(-box.top / Math.max(1,stage.offsetHeight-innerHeight),0,1);
    progress += (target-progress)*.075;
    const angle = -.46 + progress * 1.35;
    const distance = (camera.aspect<1 ? 14 : 10) - Math.sin(progress*Math.PI)*3;
    camera.position.set(Math.sin(angle)*distance+cursor, .6-progress*1.4, Math.cos(angle)*distance);
    camera.lookAt(0,0,0);
    print.rotation.z = -.08 + progress*.19;
    rings.rotation.z = time*.00006;
    particles.rotation.z = time*.000018;
    renderer.render(scene,camera);
  });
}
