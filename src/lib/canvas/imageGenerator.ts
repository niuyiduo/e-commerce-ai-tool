/**
 * 图片生成工具
 * 用于生成带文案和装饰元素的电商宣传图
 */

interface AtmosphereImageOptions {
  baseImage: string; // base64 图片
  text: string; // 氛围文案
  position?: 'top' | 'bottom' | 'center';
  style?: 'modern' | 'classic' | 'minimal';
}

// 新增：装饰图生成选项
interface DecorativeImageOptions {
  baseImage: string; // base64 图片
  productInfo?: string; // 商品信息（AI 生成的描述）
  style?: 'promotional' | 'minimal' | 'festive'; // 装饰风格
  addStickers?: boolean; // 是否添加贴纸
  addBadges?: boolean; // 是否添加徽章
  addPriceTag?: boolean; // 是否添加价格标签
}

/**
 * 生成氛围图
 */
export async function generateAtmosphereImage(
  options: AtmosphereImageOptions
): Promise<string> {
  const { baseImage, text, position = 'bottom', style = 'modern' } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制底图
      ctx.drawImage(img, 0, 0);

      // 根据风格设置样式
      const styles = getTextStyle(style);

      // 添加半透明背景条
      const barHeight = 80;
      const yPosition = position === 'top' 
        ? 0 
        : position === 'bottom' 
        ? canvas.height - barHeight 
        : (canvas.height - barHeight) / 2;

      ctx.fillStyle = styles.backgroundColor;
      ctx.fillRect(0, yPosition, canvas.width, barHeight);

      // 绘制文字
      ctx.fillStyle = styles.textColor;
      ctx.font = styles.font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 处理长文本换行
      const lines = wrapText(ctx, text, canvas.width - 40);
      const lineHeight = 40;
      const startY = yPosition + barHeight / 2 - (lines.length - 1) * lineHeight / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
      });

      // 添加装饰元素（可选）
      if (style === 'modern') {
        drawModernDecoration(ctx, canvas.width, yPosition, barHeight);
      }

      // 转换为 base64
      const result = canvas.toDataURL('image/png', 0.95);
      resolve(result);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = baseImage;
  });
}

/**
 * 获取文字样式
 */
function getTextStyle(style: string) {
  const styles = {
    modern: {
      backgroundColor: 'rgba(255, 87, 34, 0.85)',
      textColor: '#ffffff',
      font: 'bold 32px "Microsoft YaHei", sans-serif',
    },
    classic: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      textColor: '#FFD700',
      font: 'bold 36px "KaiTi", serif',
    },
    minimal: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      textColor: '#333333',
      font: 'bold 28px "Microsoft YaHei", sans-serif',
    },
  };

  return styles[style as keyof typeof styles] || styles.modern;
}

/**
 * 文本换行处理
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split('');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * 绘制现代风格装饰
 */
function drawModernDecoration(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  height: number
) {
  // 左侧装饰线
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(20, y + height / 2 - 2, 60, 4);
  
  // 右侧装饰线
  ctx.fillRect(width - 80, y + height / 2 - 2, 60, 4);
}

/**
 * 添加水印
 */
export async function addWatermark(
  baseImage: string,
  watermarkText: string = '抖音电商前端训练营'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制底图
      ctx.drawImage(img, 0, 0);

      // 设置水印样式（加深颜色提升可见度）
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';  // 从 0.8 提高到 0.9，更明显
      ctx.font = 'bold 24px "Microsoft YaHei", Arial';  // 24px 适中大小
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      
      // 添加文字阴影，增强对比度
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // 绘制水印（右下角）
      ctx.fillText(watermarkText, canvas.width - 25, canvas.height - 25);

      const result = canvas.toDataURL('image/png', 0.95);
      resolve(result);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = baseImage;
  });
}

/**
 * 生成装饰性电商宣传图
 * 根据商品信息自动添加装饰元素（贴纸、徽章、标签等）
 */
export async function generateDecorativeImage(
  options: DecorativeImageOptions
): Promise<string> {
  const {
    baseImage,
    productInfo = '',
    style = 'promotional',
    addStickers = true,
    addBadges = true,
    addPriceTag = true,
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制底图
      ctx.drawImage(img, 0, 0);

      // 添加装饰元素
      if (addBadges) {
        drawPromotionalBadges(ctx, canvas.width, canvas.height, style);
      }

      if (addStickers) {
        drawStickers(ctx, canvas.width, canvas.height, style);
      }

      if (addPriceTag && productInfo.includes('价格')) {
        drawPriceTag(ctx, canvas.width, canvas.height);
      }

      // 添加角标装饰
      drawCornerDecorations(ctx, canvas.width, canvas.height, style);

      // 添加光效
      drawGlowEffects(ctx, canvas.width, canvas.height);

      const result = canvas.toDataURL('image/png', 0.95);
      resolve(result);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = baseImage;
  });
}

/**
 * 绘制促销徽章
 */
function drawPromotionalBadges(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: string
) {
  // 左上角“新品”徽章
  ctx.save();
  ctx.translate(60, 60);
  ctx.rotate(-Math.PI / 6);
  
  // 绘制圆形徽章
  ctx.fillStyle = '#FF5722';
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();
  
  // 忽章文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('新品', 0, 0);
  ctx.restore();

  // 右上角“热卖”徽章
  ctx.save();
  ctx.translate(width - 60, 60);
  ctx.rotate(Math.PI / 6);
  
  ctx.fillStyle = '#F44336';
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('热卖', 0, 0);
  ctx.restore();
}

/**
 * 绘制贴纸装饰
 */
function drawStickers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: string
) {
  // 左下角星星贴纸
  const starPositions = [
    { x: 80, y: height - 80, size: 30, color: '#FFD700' },
    { x: 140, y: height - 100, size: 20, color: '#FFC107' },
    { x: 50, y: height - 130, size: 25, color: '#FFEB3B' },
  ];

  starPositions.forEach(star => {
    drawStar(ctx, star.x, star.y, star.size, star.color);
  });

  // 右下角闪电贴纸
  drawLightning(ctx, width - 80, height - 100, '#FF9800');
}

/**
 * 绘制价格标签
 */
function drawPriceTag(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const tagWidth = 150;
  const tagHeight = 60;
  const x = width - tagWidth - 20;
  const y = height - tagHeight - 20;

  // 绘制标签背景
  ctx.fillStyle = 'rgba(255, 87, 34, 0.9)';
  ctx.beginPath();
  ctx.roundRect(x, y, tagWidth, tagHeight, 10);
  ctx.fill();

  // 标签文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('限时促销', x + tagWidth / 2, y + tagHeight / 2);
}

/**
 * 绘制角标装饰
 */
function drawCornerDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: string
) {
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
  ctx.lineWidth = 3;

  // 左上角
  ctx.beginPath();
  ctx.moveTo(20, 80);
  ctx.lineTo(20, 20);
  ctx.lineTo(80, 20);
  ctx.stroke();

  // 右上角
  ctx.beginPath();
  ctx.moveTo(width - 80, 20);
  ctx.lineTo(width - 20, 20);
  ctx.lineTo(width - 20, 80);
  ctx.stroke();

  // 左下角
  ctx.beginPath();
  ctx.moveTo(20, height - 80);
  ctx.lineTo(20, height - 20);
  ctx.lineTo(80, height - 20);
  ctx.stroke();

  // 右下角
  ctx.beginPath();
  ctx.moveTo(width - 80, height - 20);
  ctx.lineTo(width - 20, height - 20);
  ctx.lineTo(width - 20, height - 80);
  ctx.stroke();
}

/**
 * 绘制光效
 */
function drawGlowEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // 添加微妙的光晕效果
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) / 2
  );
  
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * 绘制星星
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? size : size / 2;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

/**
 * 绘制闪电
 */
function drawLightning(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  
  ctx.beginPath();
  ctx.moveTo(x, y - 30);
  ctx.lineTo(x - 10, y);
  ctx.lineTo(x + 5, y);
  ctx.lineTo(x - 5, y + 30);
  ctx.lineTo(x + 15, y - 5);
  ctx.lineTo(x + 5, y - 5);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}
