/**
 * VRM 3D 虚拟形象加载器
 * 支持高级虚拟形象功能（3D 模型 + 口型同步）
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

/**
 * VRM 模型配置
 */
export interface VRMConfig {
  modelPath: string;        // VRM 模型文件路径
  fallbackImage?: string;   // 降级图片（加载失败时使用）
  position: { x: number; y: number; z: number };
  scale: number;
}

/**
 * 加载 VRM 模型
 */
export async function loadVRM(config: VRMConfig): Promise<VRM | null> {
  try {
    const loader = new GLTFLoader();
    loader.register((parser: any) => new VRMLoaderPlugin(parser));

    const gltf = await loader.loadAsync(config.modelPath);
    const vrm = gltf.userData.vrm as VRM;

    if (!vrm) {
      throw new Error('VRM data not found in the loaded file');
    }

    // 设置位置和缩放
    vrm.scene.position.set(config.position.x, config.position.y, config.position.z);
    vrm.scene.scale.setScalar(config.scale);

    // 禁用视锥剔除（确保始终渲染）
    vrm.scene.traverse((obj: any) => {
      obj.frustumCulled = false;
    });

    // 旋转模型使其面向摄像机
    VRMUtils.rotateVRM0(vrm);

    console.log('VRM 模型加载成功:', vrm);
    return vrm;
  } catch (error) {
    console.error('VRM 模型加载失败:', error);
    return null;
  }
}

/**
 * 创建 3D 渲染场景
 */
export function createVRMScene(canvasWidth: number, canvasHeight: number) {
  // 场景
  const scene = new THREE.Scene();
  scene.background = null; // 透明背景

  // 摄像机
  const camera = new THREE.PerspectiveCamera(
    35,  // 视野角度稍大
    canvasWidth / canvasHeight,
    0.1,
    20
  );
  camera.position.set(0, 1.2, 2); // 调整位置：正面、稍高、更近

  // 光源（增强正面光照）
  const light = new THREE.DirectionalLight(0xffffff, 1.5); // 增强亮度
  light.position.set(0, 1, 2).normalize(); // 正面打光
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // 增强环境光
  scene.add(ambientLight);

  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  // Three.js r152+ 使用 outputColorSpace 代替 outputEncoding
  (renderer as any).outputColorSpace = THREE.SRGBColorSpace;

  return { scene, camera, renderer };
}

/**
 * 口型同步控制
 * 根据音频频率调整表情变形（Blendshape）
 */
export function updateLipSync(vrm: VRM, audioLevel: number, isSpeaking: boolean) {
  if (!vrm.expressionManager) return;

  if (isSpeaking && audioLevel > 0.1) {
    // 根据音量调整嘴巴开合程度
    const mouthOpenValue = Math.min(audioLevel * 2, 1); // 0-1 范围
    
    // 设置口型表情（不同 VRM 模型可能有不同的表情名称）
    try {
      vrm.expressionManager.setValue('aa', mouthOpenValue * 0.8);  // 啊
      vrm.expressionManager.setValue('ih', mouthOpenValue * 0.3);  // 伊
      vrm.expressionManager.setValue('ou', mouthOpenValue * 0.2);  // 欧
    } catch (error) {
      // 如果模型没有这些表情，忽略错误
      console.warn('部分表情不可用');
    }
  } else {
    // 闭嘴状态
    try {
      vrm.expressionManager.setValue('aa', 0);
      vrm.expressionManager.setValue('ih', 0);
      vrm.expressionManager.setValue('ou', 0);
    } catch (error) {
      // 忽略
    }
  }

  // 更新表情状态
  vrm.expressionManager?.update();
}

/**
 * 渲染 VRM 模型到 Canvas
 */
export function renderVRMToCanvas(
  vrm: VRM,
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  targetCanvas: HTMLCanvasElement,
  position: 'bottom-left' | 'bottom-right' | 'top-right',
  avatarSize: number = 200
) {
  // 渲染到临时 Canvas
  renderer.render(scene, camera);

  // 将渲染结果复制到目标 Canvas
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const padding = 20;
  let x: number, y: number;

  switch (position) {
    case 'bottom-left':
      x = padding;
      y = targetCanvas.height - avatarSize - padding;
      break;
    case 'bottom-right':
      x = targetCanvas.width - avatarSize - padding;
      y = targetCanvas.height - avatarSize - padding;
      break;
    case 'top-right':
      x = targetCanvas.width - avatarSize - padding;
      y = padding;
      break;
  }

  // 绘制渲染结果
  ctx.drawImage(
    renderer.domElement,
    0, 0, renderer.domElement.width, renderer.domElement.height,
    x, y, avatarSize, avatarSize
  );
}

/**
 * 分析音频获取音量级别（用于口型同步）
 */
export function analyzeAudioLevel(audioContext: AudioContext, audioData: Float32Array): number {
  // 计算 RMS（均方根）音量
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  const rms = Math.sqrt(sum / audioData.length);
  return rms;
}
