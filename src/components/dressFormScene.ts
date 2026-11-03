/* ── The dress form's three.js scene ──
   Loaded only through a dynamic import in DressForm3D, so `three` stays in
   its own chunk and ships only to wide screens that have the model. The scene
   draws nothing on its own: the component's one animation loop calls
   render() with the angle it wants. */
import {
  ACESFilmicToneMapping,
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Material, Mesh, Texture } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FOV, FRAME } from "./dressFormFrame";

export type DressFormScene = {
  /** Resolves once the model is in the scene */
  ready: Promise<void>;
  resize: (width: number, height: number, dpr: number) => void;
  /** Draws one frame: turned `angle` radians, tipped `tilt` radians toward the viewer */
  render: (angle: number, tilt?: number) => void;
  dispose: () => void;
};

export function createDressFormScene(canvas: HTMLCanvasElement, url: string, preserve = false): DressFormScene {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: preserve,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  // Soft studio light: sky and floor fill, a warm key, a cool rim from behind
  // (a strong fill, since the model turns under fixed lights and its sides must not go dark)
  scene.add(new HemisphereLight(0xffffff, 0xd9d9d6, 1.7));
  const key = new DirectionalLight(0xfff0dc, 2.3);
  key.position.set(1.5, 2.5, 4);
  scene.add(key);
  const rim = new DirectionalLight(0xcfe0ff, 1.6);
  rim.position.set(-3, 2.5, -3.5);
  scene.add(rim);

  // The model hangs from a pivot at its centre line, so turning it spins in place
  const pivot = new Group();
  scene.add(pivot);
  let disposed = false;

  const draco = new DRACOLoader().setDecoderPath("/draco/");
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const ready = loader
    .loadAsync(url)
    .then((gltf) => {
      if (disposed) return;
      // Centre it, stand it on y = 0 and scale it to a height of 1
      const model = gltf.scene;
      const box = new Box3().setFromObject(model);
      const size = box.getSize(new Vector3());
      const centre = box.getCenter(new Vector3());
      const s = 1 / size.y;
      model.scale.setScalar(s);
      model.position.set(-centre.x * s, -box.min.y * s, -centre.z * s);
      pivot.add(model);
      const distance = FRAME / (2 * Math.tan((FOV * Math.PI) / 360));
      camera.position.set(0, 0.5, distance);
      camera.lookAt(0, 0.5, 0);
    })
    .finally(() => draco.dispose());

  return {
    ready,
    resize(width, height, dpr) {
      renderer.setPixelRatio(Math.min(dpr, 1.75));
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    },
    render(angle, tilt = 0) {
      pivot.rotation.set(tilt, angle, 0);
      renderer.render(scene, camera);
    },
    dispose() {
      disposed = true;
      scene.traverse((object) => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const material of ([] as Material[]).concat(mesh.material)) {
          for (const value of Object.values(material)) if ((value as Texture | null)?.isTexture) (value as Texture).dispose();
          material.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
