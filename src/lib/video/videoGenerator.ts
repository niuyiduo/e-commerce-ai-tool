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
    autoGenerateCaptions = true
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
    
    // 保存帧数据
    frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  // 使用 MediaRecorder 生成视频
  const videoBlob = await createVideoFromFrames(frames, canvas.width, canvas.height, fps);
  
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
 * 从帧数据创建视频
 */
async function createVideoFromFrames(
  frames: ImageData[],
  width: number,
  height: number,
  fps: number
): Promise<Blob> {
  // 创建 Canvas Stream
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // 创建 MediaRecorder
  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2500000, // 2.5 Mbps
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
        mediaRecorder.stop();
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
