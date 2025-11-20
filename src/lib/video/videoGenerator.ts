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
 * 生成默认讲解文案
 */
function generateDefaultCaptions(imageCount: number): string[] {
  const defaultCaptions = [
    '欢迎了解我们的产品',
    '产品特点展示',
    '多场景应用',
    '优质材质保证',
    '立即购买享优惠',
  ];
  
  return defaultCaptions.slice(0, imageCount);
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
