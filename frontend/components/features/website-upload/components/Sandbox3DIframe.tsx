import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface Sandbox3DIframeProps {
  jsCode: string | null;
  parameters: Record<string, any>;
  onParametersExtracted: (params: any[]) => void;
  onError: (err: string) => void;
}

interface WindowWithTHREE extends Window {
  THREE: any;
}

declare const window: WindowWithTHREE;

const Sandbox3DIframe = forwardRef<HTMLIFrameElement, Sandbox3DIframeProps>(
  ({ jsCode, parameters, onParametersExtracted, onError }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => {
      if (!iframeRef.current) throw new Error('iframe not initialized');
      return iframeRef.current;
    });

    useEffect(() => {
      if (!iframeRef.current) return;
      
      const html = `
        <!DOCTYPE html>
        <html lang='en'>
        <head>
          <meta charset='UTF-8' />
          <title>3D Sandbox</title>
          <style>html,body{margin:0;padding:0;overflow:hidden;width:100vw;height:100vh;background:#000;}</style>
        </head>
        <body>
          <div id='container' style='width:100vw;height:100vh;'></div>
          <script type="importmap">
          {
            "imports": {
              "three": "https://unpkg.com/three@0.153.0/build/three.module.js",
              "three/addons/": "https://unpkg.com/three@0.153.0/examples/jsm/"
            }
          }
          </script>
          <script type="module">
            import * as THREE from 'three';
            import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

            let userModule = null;
            let mesh = null;
            let scene, camera, renderer, controls;

            function clearScene() {
              if (mesh && scene) {
                console.log('Clearing scene');
                scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                mesh = null;
              }
            }

            function renderScene(params) {
              console.log('renderScene called with params:', params);
              if (!userModule || typeof userModule.generate !== 'function') {
                console.error('Invalid userModule:', userModule);
                return;
              }
              try {
                clearScene();
                console.log('Calling generate with params:', params);
                mesh = userModule.generate(scene, params);
                console.log('Generated mesh:', mesh);
                
                if (mesh) {
                  scene.add(mesh);
                  console.log('Mesh added to scene');
                  
                  const box = new THREE.Box3().setFromObject(mesh);
                  const center = box.getCenter(new THREE.Vector3());
                  const size = box.getSize(new THREE.Vector3());
                  console.log('Mesh bounds:', { center, size });
                  
                  const maxDim = Math.max(size.x, size.y, size.z);
                  const fov = camera.fov * (Math.PI / 180);
                  const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2) / 2);
                  
                  camera.position.set(
                    center.x + cameraDistance,
                    center.y + cameraDistance,
                    center.z + cameraDistance
                  );
                  camera.lookAt(center);
                  controls.target.copy(center);
                  controls.update();
                  
                  console.log('Camera adjusted:', {
                    position: camera.position.toArray(),
                    target: controls.target.toArray()
                  });
                }
                renderer.render(scene, camera);
              } catch (err) {
                console.error('Error in renderScene:', err);
                window.parent.postMessage({ type: 'ERROR', error: err.message }, '*');
              }
            }

            function setupThree() {
              console.log('Setting up Three.js scene');
              scene = new THREE.Scene();
              scene.background = new THREE.Color(0x000000);
              
              camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
              camera.position.set(5, 5, 5);
              
              renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true
              });
              renderer.setSize(window.innerWidth, window.innerHeight);
              renderer.setPixelRatio(window.devicePixelRatio);
              document.getElementById('container').appendChild(renderer.domElement);
              
              controls = new OrbitControls(camera, renderer.domElement);
              controls.enableDamping = true;
              controls.dampingFactor = 0.05;
              
              const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
              scene.add(ambientLight);
              
              const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
              directionalLight.position.set(5, 5, 5);
              scene.add(directionalLight);

              const axesHelper = new THREE.AxesHelper(5);
              scene.add(axesHelper);
              
              window.addEventListener('resize', () => {
                const width = window.innerWidth;
                const height = window.innerHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
              });
              
              function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
              }
              
              console.log('Starting animation loop');
              animate();
            }

            window.addEventListener('message', async (event) => {
              const { type, code, params } = event.data;
              console.log('Received message:', { type, params });
              
              if (type === 'LOAD_JS') {
                try {
                  userModule = {};
                  clearScene();
                  
                  const threeContext = {
                    ...THREE,
                    Scene: THREE.Scene,
                    Mesh: THREE.Mesh,
                    BoxGeometry: THREE.BoxGeometry,
                    SphereGeometry: THREE.SphereGeometry,
                    BufferGeometry: THREE.BufferGeometry,
                    Float32BufferAttribute: THREE.Float32BufferAttribute,
                    MeshStandardMaterial: THREE.MeshStandardMaterial,
                    MeshPhysicalMaterial: THREE.MeshPhysicalMaterial,
                    Vector3: THREE.Vector3,
                    Box3: THREE.Box3,
                    Color: THREE.Color,
                    DoubleSide: THREE.DoubleSide,
                    Math: THREE.Math,
                    PI: Math.PI
                  };

                  console.log('Available THREE context:', Object.keys(threeContext));
                  
                  const moduleExports = {};
                  const moduleObj = { exports: moduleExports };
                  
                  const wrappedCode = \`
                    (function(THREE, scene, module, exports) {
                      "use strict";
                      const window = undefined;
                      const document = undefined;
                      let parameters, generate;
                      
                      \${code}
                      
                      if (typeof parameters !== 'undefined') {
                        module.parameters = parameters;
                      }
                      if (typeof generate !== 'undefined') {
                        module.generate = generate;
                      }
                      return module;
                    })(globalThis.THREE, globalThis.scene, globalThis.moduleObj, globalThis.moduleExports);
                  \`;
                  
                  // 設置全局變數
                  globalThis.THREE = threeContext;
                  globalThis.scene = scene;
                  globalThis.moduleObj = moduleObj;
                  globalThis.moduleExports = moduleExports;
                  
                  console.log('Executing wrapped code:', wrappedCode);
                  eval(wrappedCode);
                  
                  userModule = moduleObj;
                  console.log('User module after execution:', userModule);
                  
                  if (userModule.parameters) {
                    console.log('Parameters extracted:', userModule.parameters);
                    window.parent.postMessage({ type: 'PARAMETERS', parameters: userModule.parameters }, '*');
                  }
                  
                  if (params) {
                    console.log('Initial render with params:', params);
                    renderScene(params);
                  }
                } catch (err) {
                  console.error('Error in code execution:', err);
                  window.parent.postMessage({ type: 'ERROR', error: err.message }, '*');
                }
              } else if (type === 'UPDATE_PARAMS') {
                try {
                  console.log('Updating scene with params:', params);
                  renderScene(params);
                } catch (err) {
                  console.error('Error updating params:', err);
                  window.parent.postMessage({ type: 'ERROR', error: err.message }, '*');
                }
              }
            });

            window.onerror = function(message, source, lineno, colno, error) {
              const errorMessage = message + (lineno ? ' (line ' + lineno + ', col ' + colno + ')' : '');
              console.error('Global error:', errorMessage, error);
              window.parent.postMessage({ type: 'ERROR', error: errorMessage }, '*');
              return true;
            };

            console.log('Setting up Three.js...');
            setupThree();
          </script>
        </body>
        </html>
      `;

      iframeRef.current.srcdoc = html;
    }, []);

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe || !jsCode) return;
      iframe.contentWindow?.postMessage({ type: 'LOAD_JS', code: jsCode }, '*');
    }, [jsCode]);

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe || !jsCode) return;
      iframe.contentWindow?.postMessage({ type: 'UPDATE_PARAMS', params: parameters }, '*');
    }, [parameters, jsCode]);

    useEffect(() => {
      function handleMessage(event: MessageEvent) {
        if (event.data?.type === 'PARAMETERS') {
          onParametersExtracted(event.data.parameters);
        } else if (event.data?.type === 'ERROR') {
          onError(event.data.error);
        }
      }
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [onParametersExtracted, onError]);

    return (
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-scripts"
        title="3D Preview"
      />
    );
  }
);

Sandbox3DIframe.displayName = 'Sandbox3DIframe';

export default Sandbox3DIframe; 