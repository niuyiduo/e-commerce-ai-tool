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

    // 旋转模型使其面向摄像机（VRM标准旋转）
    VRMUtils.rotateVRM0(vrm);
    
    // 修正模型朝向：让模型正面朝向摄像机（Z轴正方向）
    // 尝试270度旋转（-90度）
    vrm.scene.rotation.y = -Math.PI / 2;

    // 修复手臂姿势：从T-pose改为自然垂放
    if (vrm.humanoid) {
      try {
        console.log('🦴 开始调整手臂姿势...');
        
        // 尝试多种骨骼命名方式（VRM标准 + VRoid可能的命名）
        const leftArmNames = ['leftUpperArm', 'LeftUpperArm', 'leftShoulder', 'LeftShoulder'];
        const rightArmNames = ['rightUpperArm', 'RightUpperArm', 'rightShoulder', 'RightShoulder'];
        
        let leftArmAdjusted = false;
        let rightArmAdjusted = false;
        
        // 左臂自然垂放（反转Z轴方向）
        for (const name of leftArmNames) {
          const leftUpperArm = vrm.humanoid.getNormalizedBoneNode(name as any);
          if (leftUpperArm) {
            leftUpperArm.rotation.z = 1.2; // 反转：之前-1.2导致朝上
            leftUpperArm.rotation.x = 0.2; // 向前微倾
            leftArmAdjusted = true;
            console.log(`✅ 左臂调整成功(向下): ${name}`);
            break;
          }
        }
        
        // 右臂自然垂放（反转Z轴方向）
        for (const name of rightArmNames) {
          const rightUpperArm = vrm.humanoid.getNormalizedBoneNode(name as any);
          if (rightUpperArm) {
            rightUpperArm.rotation.z = -1.2; // 反转：之前1.2导致朝上
            rightUpperArm.rotation.x = 0.2;
            rightArmAdjusted = true;
            console.log(`✅ 右臂调整成功(向下): ${name}`);
            break;
          }
        }
        
        if (!leftArmAdjusted || !rightArmAdjusted) {
          console.warn('⚠️ 部分手臂无法调整，VRoid模型可能使用自定义骨骼命名');
          console.log('可用骨骼节点:', Object.keys(vrm.humanoid.humanBones || {}));
        }
      } catch (error) {
        console.warn('❌ 手臂姿势调整失败:', error);
      }
    }

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

  // 摄像机（调整到能看到全身正面）
  const camera = new THREE.PerspectiveCamera(
    30,  // FOV 30度，看到更完整的身体
    canvasWidth / canvasHeight,
    0.1,
    20
  );
  camera.position.set(0, 0.8, 3.5); // 拉远摄像机，提高视角，看到全身
  camera.lookAt(0, 0.8, 0); // 看向模型中心点（腰部附近）

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
