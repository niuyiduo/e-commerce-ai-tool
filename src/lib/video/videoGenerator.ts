/**
 * 视频生成工具
 * 用于生成产品讲解视频（将多张图片合成为短视频）
 */

interface VideoGeneratorOptions {
  images: string[]; // base64 图片数组（最多5张）
  duration?: number; // 视频总时长（秒），范围 3-10
  transition?: 'fade' | 'slide' | 'none'; // 转场效果
  fps?: number; // 帧率，默认 30
  captions?: string[]; // 每张图片对应的讲解文案（可选）
  autoGenerateCaptions?: boolean; // 是否自动生成默认讲解
  enableVoice?: boolean; // 是否启用语音配音（可选）
  voiceType?: 'male' | 'female' | 'child'; // 配音音色（可选）
  enableAvatar?: boolean; // 是否启用虚拟形象
  avatarStyle?: 'female' | 'male' | 'robot' | 'cute'; // 虚拟形象风格
  avatarPosition?: 'bottom-left' | 'bottom-right' | 'top-right'; // 形象位置
}

/**
 * 生成视频
 * @param options 视频生成配置
 * @returns Promise<Blob> 视频 Blob 对象
 */
export async function generateVideo(
  options: VideoGeneratorOptions
): Promise<Blob> {
  const { 
    images, 
    duration = 5, 
    transition = 'fade',
    fps = 30,
    captions = [],
    autoGenerateCaptions = true,
    enableVoice = false,  // 新增：是否启用配音
    voiceType = 'female',  // 新增：配音音色
    enableAvatar = false,  // 新增：是否启用虚拟形象
    avatarStyle = 'female',  // 新增：形象风格
    avatarPosition = 'bottom-right'  // 新增：形象位置
  } = options;

  // 验证参数
  if (images.length === 0 || images.length > 5) {
    throw new Error('图片数量必须在 1-5 张之间');
  }

  if (duration < 3 || duration > 10) {
    throw new Error('视频时长必须在 3-10 秒之间');
  }

  // 计算每张图片的显示时长
  const durationPerImage = duration / images.length;
  const transitionDuration = 0.5; // 转场时长 0.5 秒

  // 生成默认讲解文案
  const finalCaptions = captions.length > 0 
    ? captions 
    : autoGenerateCaptions 
    ? generateDefaultCaptions(images.length)
    : [];

  // 创建 Canvas 用于绘制帧
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // 加载所有图片
  const loadedImages = await Promise.all(
    images.map(src => loadImage(src))
  );

  // 加载虚拟形象（如果启用）
  let avatarImage: HTMLImageElement | null = null;
  if (enableAvatar) {
    try {
      avatarImage = await loadAvatarImage(avatarStyle);
    } catch (error) {
      console.warn('虚拟形象加载失败，将不显示形象:', error);
    }
  }

  // 设置画布尺寸（使用第一张图片的尺寸）
  const firstImg = loadedImages[0];
  canvas.width = firstImg.width;
  canvas.height = firstImg.height;

  // 生成视频帧
  const frames: ImageData[] = [];
  const totalFrames = Math.floor(duration * fps);

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const currentTime = frameIndex / fps;
    
    // 确定当前应该显示哪张图片
    const imageIndex = Math.floor(currentTime / durationPerImage);
    const nextImageIndex = Math.min(imageIndex + 1, loadedImages.length - 1);
    
    // 计算在当前图片中的进度
    const progressInImage = (currentTime % durationPerImage) / durationPerImage;
    
    // 绘制帧
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (transition === 'fade' && progressInImage > (1 - transitionDuration / durationPerImage) && imageIndex < loadedImages.length - 1) {
      // 淡入淡出转场
      const fadeProgress = (progressInImage - (1 - transitionDuration / durationPerImage)) / (transitionDuration / durationPerImage);
      
      // 绘制当前图片
      ctx.globalAlpha = 1 - fadeProgress;
      ctx.drawImage(loadedImages[imageIndex], 0, 0, canvas.width, canvas.height);
      
      // 绘制下一张图片
      ctx.globalAlpha = fadeProgress;
      ctx.drawImage(loadedImages[nextImageIndex], 0, 0, canvas.width, canvas.height);
      
      ctx.globalAlpha = 1;
    } else if (transition === 'slide' && progressInImage > (1 - transitionDuration / durationPerImage) && imageIndex < loadedImages.length - 1) {
      // 滑动转场
      const slideProgress = (progressInImage - (1 - transitionDuration / durationPerImage)) / (transitionDuration / durationPerImage);
      const offset = canvas.width * slideProgress;
      
      // 绘制当前图片（向左移出）
      ctx.drawImage(loadedImages[imageIndex], -offset, 0, canvas.width, canvas.height);
      
      // 绘制下一张图片（从右侧移入）
      ctx.drawImage(loadedImages[nextImageIndex], canvas.width - offset, 0, canvas.width, canvas.height);
    } else {
      // 无转场或正常显示
      ctx.drawImage(loadedImages[imageIndex], 0, 0, canvas.width, canvas.height);
    }
    
   // 添加讲解字幕（如果有）
    if (finalCaptions.length > imageIndex && finalCaptions[imageIndex]) {
      drawCaption(ctx, canvas.width, canvas.height, finalCaptions[imageIndex]);
    }
    
    // 添加虚拟形象（如果启用）
    if (enableAvatar && avatarImage) {
      const isSpeaking = !!(enableVoice && finalCaptions[imageIndex]); // 判断是否在"说话"
      drawAvatar(ctx, canvas.width, canvas.height, avatarImage, avatarPosition, currentTime, isSpeaking);
    }
    
    // 保存帧数据
    frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  // 使用 MediaRecorder 生成视频（带配音）
  const videoBlob = await createVideoFromFrames(
    frames, 
    canvas.width, 
    canvas.height, 
    fps,
    enableVoice ? { captions: finalCaptions, voiceType } : undefined
  );
  
  return videoBlob;
}

/**
 * 加载图片
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    
    img.src = src;
  });
}

/**
 * 加载虚拟形象图片（使用 Emoji/SVG 作为占位符）
 */
async function loadAvatarImage(style: 'female' | 'male' | 'robot' | 'cute'): Promise<HTMLImageElement> {
  // 不同风格的虚拟形象 Emoji
  const avatarEmojis = {
    female: '👩',     // 女性形象
    male: '👨',       // 男性形象
    robot: '🤖',     // 机器人（中性）
    cute: '🐱',      // 可爱猫咪（中性）
  };

  const emoji = avatarEmojis[style];
  
  // 创建一个 Canvas 来渲染 Emoji
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
  
  // 绘制圆形背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(100, 100, 90, 0, Math.PI * 2);
  ctx.fill();
  
  // 绘制边框
  ctx.strokeStyle = '#FE2C55';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // 绘制 Emoji
  ctx.font = '120px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 100, 110);
  
  // 转换为 Image
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create avatar blob'));
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load avatar image'));
      img.src = URL.createObjectURL(blob);
    });
  });
}

/**
 * 绘制虚拟形象
 */
function drawAvatar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  avatarImage: HTMLImageElement,
  position: 'bottom-left' | 'bottom-right' | 'top-right',
  currentTime: number,
  isSpeaking: boolean
) {
  const avatarSize = 120; // 形象大小
  const padding = 20; // 边距
  
  // 计算位置
  let x: number, y: number;
  switch (position) {
    case 'bottom-left':
      x = padding;
      y = height - avatarSize - padding;
      break;
    case 'bottom-right':
      x = width - avatarSize - padding;
      y = height - avatarSize - padding;
      break;
    case 'top-right':
      x = width - avatarSize - padding;
      y = padding;
      break;
  }
  
  // 说话动画：缩放效果（模拟呼吸）
  let scale = 1;
  if (isSpeaking) {
    const breatheSpeed = 3; // 呼吸速度
    const breatheAmount = 0.05; // 呼吸幅度
    scale = 1 + Math.sin(currentTime * breatheSpeed * Math.PI) * breatheAmount;
  }
  
  // 保存当前状态
  ctx.save();
  
  // 移动到形象中心点
  ctx.translate(x + avatarSize / 2, y + avatarSize / 2);
  
  // 应用缩放
  ctx.scale(scale, scale);
  
  // 绘制形象（从中心点绘制）
  ctx.drawImage(
    avatarImage,
    -avatarSize / 2,
    -avatarSize / 2,
    avatarSize,
    avatarSize
  );
  
  // 添加发光效果（说话时）
  if (isSpeaking) {
    ctx.strokeStyle = 'rgba(254, 44, 85, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, avatarSize / 2 + 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // 恢复状态
  ctx.restore();
}

/**
 * 从帧数据创建视频（带音频支持）
 */
async function createVideoFromFrames(
  frames: ImageData[],
  width: number,
  height: number,
  fps: number,
  voiceOptions?: { captions: string[]; voiceType: 'male' | 'female' | 'child' }
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  const videoStream = canvas.captureStream(fps);
  
  // 如果启用配音，生成音频流并合并
  let finalStream = videoStream;
  if (voiceOptions) {
    try {
      const audioStream = await generateAudioStream(voiceOptions.captions, voiceOptions.voiceType, frames.length / fps);
      if (audioStream) {
        // 合并视频流和音频流
        const videoTrack = videoStream.getVideoTracks()[0];
        const audioTrack = audioStream.getAudioTracks()[0];
        finalStream = new MediaStream([videoTrack, audioTrack]);
      }
    } catch (error) {
      console.warn('音频流生成失败，将生成无声视频:', error);
    }
  }
  
  // 创建 MediaRecorder
  const mimeType = finalStream.getAudioTracks().length > 0 
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm;codecs=vp9';
    
  const mediaRecorder = new MediaRecorder(finalStream, {
    mimeType: mimeType,
    videoBitsPerSecond: 2500000,
  });

  const chunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    mediaRecorder.onerror = (error) => {
      reject(error);
    };

    mediaRecorder.start();

    // 播放帧
    let frameIndex = 0;
    const frameDuration = 1000 / fps;

    const playFrame = () => {
      if (frameIndex < frames.length) {
        ctx.putImageData(frames[frameIndex], 0, 0);
        frameIndex++;
        setTimeout(playFrame, frameDuration);
      } else {
        // 等待语音播放完成
        setTimeout(() => {
          mediaRecorder.stop();
        }, 500);
      }
    };

    playFrame();
  });
}

/**
 * 下载视频
 */
export function downloadVideo(blob: Blob, filename: string = `video_${Date.now()}.webm`) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 生成默认讲解文案（智能随机，支持多种场景）
 */
function generateDefaultCaptions(imageCount: number): string[] {
  // 丰富的字幕话术库（按类型分类）
  const captionLibrary = {
    // 开场引导类（第1张图片）
    opening: [
      '欢迎了解我们的产品',
      '精选好物推荐',
      '新品首发，抢先看',
      '品质生活从这里开始',
      '发现更好的选择',
      '为您精心挑选',
      '一起探索精彩',
      '优选好物等你来',
      '匠心之作，值得拥有',
      '开启美好购物体验',
    ],
    
    // 产品特点类（中间图片）
    features: [
      '产品特点展示',
      '细节之处见品质',
      '匠心工艺，精益求精',
      '每一处都精心设计',
      '品质看得见',
      '严选优质材料',
      '专业品质保证',
      '设计独特，别具匠心',
      '功能强大，使用便捷',
      '精工细作，追求完美',
      '多重工艺，层层把关',
      '高端品质，亲民价格',
    ],
    
    // 场景应用类
    scenarios: [
      '多场景应用',
      '适合各种场合',
      '居家必备好物',
      '办公学习好帮手',
      '户外运动首选',
      '日常生活好伴侣',
      '送礼佳品',
      '全家人都喜欢',
      '满足多样需求',
      '随时随地都能用',
    ],
    
    // 材质工艺类
    materials: [
      '优质材质保证',
      '环保健康材料',
      '经久耐用不易坏',
      '精选天然原料',
      '安全无害放心用',
      '绿色环保新科技',
      '进口材质更放心',
      '通过国际认证',
      '匠人精神铸造',
      '传统工艺现代升级',
    ],
    
    // 用户体验类
    experience: [
      '用户好评如潮',
      '千万用户的选择',
      '五星好评推荐',
      '回购率超高',
      '口碑爆款',
      '买过都说好',
      '真实用户体验',
      '让生活更美好',
      '提升幸福感',
      '超出期待的惊喜',
    ],
    
    // 优惠促销类（结尾）
    promotion: [
      '立即购买享优惠',
      '限时特价，抢到就是赚到',
      '优惠多多，不容错过',
      '现在下单立减优惠',
      '今日特价，手慢无',
      '加购物车享折扣',
      '包邮到家，放心购买',
      '满减活动进行中',
      '新客专享超值价',
      '限时秒杀，先到先得',
    ],
    
    // 品牌信誉类
    brand: [
      '大品牌，值得信赖',
      '专业团队精心打造',
      '行业领先技术',
      '十年品质保证',
      '官方正品保障',
      '全国联保服务',
      '售后无忧',
      '品牌实力见证',
    ],
    
    // 效果承诺类
    results: [
      '效果看得见',
      '即刻体验惊喜',
      '轻松解决痛点',
      '改变从现在开始',
      '让生活更简单',
      '省时省力好帮手',
      '一用就爱上',
      '超预期的表现',
    ],
  };
  
  // 根据图片数量智能组合字幕
  const captions: string[] = [];
  
  if (imageCount === 1) {
    // 1张图：开场
    captions.push(randomPick(captionLibrary.opening));
  } else if (imageCount === 2) {
    // 2张图：开场 + 促销
    captions.push(randomPick(captionLibrary.opening));
    captions.push(randomPick(captionLibrary.promotion));
  } else if (imageCount === 3) {
    // 3张图：开场 + 特点 + 促销
    captions.push(randomPick(captionLibrary.opening));
    captions.push(randomPick(captionLibrary.features));
    captions.push(randomPick(captionLibrary.promotion));
  } else if (imageCount === 4) {
    // 4张图：开场 + 特点 + 场景/材质 + 促销
    captions.push(randomPick(captionLibrary.opening));
    captions.push(randomPick(captionLibrary.features));
    captions.push(randomPick([...captionLibrary.scenarios, ...captionLibrary.materials]));
    captions.push(randomPick(captionLibrary.promotion));
  } else {
    // 5张图：开场 + 特点 + 场景 + 体验/材质 + 促销
    captions.push(randomPick(captionLibrary.opening));
    captions.push(randomPick(captionLibrary.features));
    captions.push(randomPick(captionLibrary.scenarios));
    captions.push(randomPick([...captionLibrary.experience, ...captionLibrary.materials, ...captionLibrary.results]));
    captions.push(randomPick(captionLibrary.promotion));
  }
  
  return captions;
}

/**
 * 从数组中随机选择一个元素
 */
function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 绘制字幕
 */
function drawCaption(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string
) {
  // 字幕背景（较小的高度）
  const bgHeight = 50;
  const y = height - bgHeight - 20;  // 距离底部 20px
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(40, y, width - 80, bgHeight);
  
  // 字幕边框
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, y, width - 80, bgHeight);
  
  // 字幕文字（缩小到原来的一半）
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px "Microsoft YaHei", Arial';  // 从 24px 缩小到 14px
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, y + bgHeight / 2);
}

/**
 * 同步播放字幕配音（与视频录制同步）
 * 
 * @param captions - 字幕数组
 * @param voiceType - 音色类型
 * @param totalDuration - 总时长（秒）
 */
async function playSyncedVoice(
  captions: string[],
  voiceType: 'male' | 'female' | 'child',
  totalDuration: number
): Promise<void> {
  // 检查浏览器支持
  if (!('speechSynthesis' in window)) {
    console.warn('浏览器不支持 Web Speech API，跳过配音');
    return;
  }

  // 清空之前的语音
  speechSynthesis.cancel();

  // 计算每条字幕的时长
  const durationPerCaption = totalDuration / captions.length;

  // 逐条播放字幕配音
  for (const caption of captions) {
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(caption);
      
      // 设置音色参数
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9; // 语速
      utterance.pitch = voiceType === 'child' ? 1.5 : 1; // 童声音调高
      utterance.volume = 1;
      
      // 选择音色（根据 voiceType 参数）
      const voices = speechSynthesis.getVoices();
      let selectedVoice: SpeechSynthesisVoice | null = null;
      
      if (voiceType === 'male') {
        selectedVoice = voices.find(v => 
          v.lang.includes('zh') && (v.name.includes('Male') || v.name.includes('男') || v.name.toLowerCase().includes('male'))
        ) || null;
      } else if (voiceType === 'female') {
        selectedVoice = voices.find(v => 
          v.lang.includes('zh') && (v.name.includes('Female') || v.name.includes('女') || v.name.toLowerCase().includes('female'))
        ) || null;
      } else if (voiceType === 'child') {
        selectedVoice = voices.find(v => 
          v.lang.includes('zh') && v.name.includes('小')
        ) || null;
      }
      
      // 如果找不到指定类型，尝试找任何中文音色
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes('zh')) || voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // 播放结束后继续下一条
      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = () => {
        console.warn('语音合成失败，跳过当前字幕');
        resolve();
      };

      // 开始播放
      speechSynthesis.speak(utterance);
    });
  }
}

/**
 * 生成音频流（使用火山引擎 TTS + Web Audio API）
 * 
 * @param captions - 字幕数组
 * @param voiceType - 音色类型
 * @param totalDuration - 总时长（秒）
 * @returns MediaStream | null
 */
async function generateAudioStream(
  captions: string[],
  voiceType: 'male' | 'female' | 'child',
  totalDuration: number
): Promise<MediaStream | null> {
  try {
    console.log('开始生成音频流...');
    console.log('字幕:', captions);
    console.log('音色:', voiceType);
    
    // 创建音频上下文
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    
    // 合并所有字幕文本
    const fullText = captions.join('。 '); // 用句号分隔
    console.log('完整文本:', fullText);
    
    // 调用后端 TTS API
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: fullText,
        voiceType: voiceType,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('TTS API 错误:', errorData);
      throw new Error(`TTS API 调用失败: ${errorData.error} - ${errorData.details}`);
    }
    
    const responseData = await response.json();
    console.log('TTS API 响应:', responseData);
    
    if (!responseData.success || !responseData.audioData) {
      throw new Error('TTS API 返回数据格式错误');
    }
    
    const { audioData } = responseData;
    
    // 将 Base64 音频转换为 ArrayBuffer
    const audioBuffer = await base64ToArrayBuffer(audioData);
    console.log('ArrayBuffer 大小:', audioBuffer.byteLength);
    
    // 解码音频数据
    const decodedAudio = await audioContext.decodeAudioData(audioBuffer);
    console.log('音频时长:', decodedAudio.duration, '秒');
    
    // 创建音频源
    const source = audioContext.createBufferSource();
    source.buffer = decodedAudio;
    source.connect(destination);
    
    // 开始播放
    source.start(0);
    
    console.log('音频流生成成功！');
    // 返回音频流
    return destination.stream;
    
  } catch (error) {
    console.error('音频流生成失败:', error);
    alert(`配音生成失败: ${error instanceof Error ? error.message : '未知错误'}\n\n将生成无声视频`);
    return null;
  }
}

/**
 * 将 Base64 字符串转换为 ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    try {
      // 移除 data:audio/mp3;base64, 前缀（如果有）
      const base64Data = base64.replace(/^data:audio\/\w+;base64,/, '');
      
      // 解码 Base64
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      resolve(bytes.buffer);
    } catch (error) {
      reject(error);
    }
  });
}
