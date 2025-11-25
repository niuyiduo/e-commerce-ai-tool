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
 * 绘制促销徽章（扩充多种类型）
 */
function drawPromotionalBadges(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: string
) {
  // 随机选择多种徽章组合
  const badges = [
    { text: '新品', color: '#FF5722', position: 'topLeft' },
    { text: '热卖', color: '#F44336', position: 'topRight' },
    { text: '限时', color: '#E91E63', position: 'topLeft' },
    { text: '优惠', color: '#9C27B0', position: 'topRight' },
    { text: '爆款', color: '#FF6F00', position: 'topLeft' },
    { text: '特价', color: '#D32F2F', position: 'topRight' },
  ];

  // 随机选择2个徽章
  const selectedBadges = [
    badges[Math.floor(Math.random() * 3)],
    badges[3 + Math.floor(Math.random() * 3)],
  ];

  selectedBadges.forEach((badge, index) => {
    const isLeft = badge.position === 'topLeft';
    const x = isLeft ? 70 : width - 70;
    const y = 70;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(isLeft ? -Math.PI / 6 : Math.PI / 6);
    
    // 绘制圆形徽章
    ctx.fillStyle = badge.color;
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 徽章文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Microsoft YaHei", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(badge.text, 0, 0);
    ctx.restore();
  });

  // 添加中间位置的带形徽章
  drawRibbonBadge(ctx, width, height);
}

/**
 * 绘制贴纸装饰（大幅扩充）
 */
function drawStickers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: string
) {
  // 1. 左下角星星贴纸群
  const starPositions = [
    { x: 80, y: height - 80, size: 35, color: '#FFD700' },
    { x: 140, y: height - 110, size: 25, color: '#FFC107' },
    { x: 50, y: height - 140, size: 28, color: '#FFEB3B' },
    { x: 110, y: height - 150, size: 20, color: '#FFD700' },
  ];

  starPositions.forEach(star => {
    drawStar(ctx, star.x, star.y, star.size, star.color);
  });

  // 2. 右下角闪电贴纸
  drawLightning(ctx, width - 80, height - 110, '#FF9800');
  drawLightning(ctx, width - 120, height - 140, '#FF5722');

  // 3. 添加爱心贴纸
  drawHeart(ctx, width - 100, 120, 30, '#E91E63');
  drawHeart(ctx, 90, 130, 25, '#F06292');

  // 4. 添加火焰贴纸
  drawFlame(ctx, width / 2 - 60, 80, '#FF5722');
  drawFlame(ctx, width / 2 + 60, 80, '#FF6F00');

  // 5. 添加钻石贴纸
  drawDiamond(ctx, width - 140, height - 180, '#00BCD4');
  drawDiamond(ctx, 120, height - 160, '#9C27B0');

  // 6. 添加点赞贴纸
  drawThumbsUp(ctx, width - 90, height - 250, '#4CAF50');

  // 7. 添加礼物盒贴纸
  drawGiftBox(ctx, 70, height - 220, '#9C27B0');
}

/**
 * 绘制价格标签（多种样式）
 */
function drawPriceTag(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // 样式1：左上角折角标签
  drawCornerTag(ctx, 0, 0, '特价', '#FF5722');

  // 样式2：右下角促销标签
  const tagWidth = 160;
  const tagHeight = 65;
  const x = width - tagWidth - 25;
  const y = height - tagHeight - 150;

  // 绘制标签背景（渐变色）
  const gradient = ctx.createLinearGradient(x, y, x + tagWidth, y + tagHeight);
  gradient.addColorStop(0, '#FF5722');
  gradient.addColorStop(1, '#FF6F00');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x, y, tagWidth, tagHeight, 12);
  ctx.fill();

  // 添加边框
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 标签文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px "Microsoft YaHei", Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText('限时促销', x + tagWidth / 2, y + tagHeight / 2);
  ctx.shadowBlur = 0;

  // 样式3：中间位置的打折标签
  drawDiscountBadge(ctx, width / 2, height - 100);
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
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  
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

// ==========  以下是新增的装饰元素绘制函数 ==========

/**
 * 绘制爱心
 */
function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  
  ctx.beginPath();
  ctx.moveTo(x, y + size / 4);
  ctx.bezierCurveTo(x, y, x - size / 2, y - size / 2, x - size, y + size / 4);
  ctx.bezierCurveTo(x - size, y + size, x, y + size * 1.5, x, y + size * 1.5);
  ctx.bezierCurveTo(x, y + size * 1.5, x + size, y + size, x + size, y + size / 4);
  ctx.bezierCurveTo(x + size / 2, y - size / 2, x, y, x, y + size / 4);
  ctx.fill();
  
  ctx.restore();
}

/**
 * 绘制火焰
 */
function drawFlame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) {
  ctx.save();
  
  // 外层火焰
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - 15, y - 20, x - 10, y - 40, x, y - 50);
  ctx.bezierCurveTo(x + 10, y - 40, x + 15, y - 20, x, y);
  ctx.fill();
  
  // 内层火焰
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(x, y - 5);
  ctx.bezierCurveTo(x - 8, y - 18, x - 5, y - 28, x, y - 35);
  ctx.bezierCurveTo(x + 5, y - 28, x + 8, y - 18, x, y - 5);
  ctx.fill();
  
  ctx.restore();
}

/**
 * 绘制钻石
 */
function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x + 15, y);
  ctx.lineTo(x, y + 25);
  ctx.lineTo(x - 15, y);
  ctx.closePath();
  ctx.fill();
  
  // 添加高光
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 10);
  ctx.lineTo(x + 5, y - 10);
  ctx.lineTo(x, y + 5);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

/**
 * 绘制点赞
 */
function drawThumbsUp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  
  // 拇指
  ctx.beginPath();
  ctx.roundRect(x - 8, y - 25, 16, 15, 5);
  ctx.fill();
  
  // 手掌
  ctx.beginPath();
  ctx.roundRect(x - 15, y - 10, 30, 30, 5);
  ctx.fill();
  
  // 高光
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(x - 5, y - 15, 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

/**
 * 绘制礼物盒
 */
function drawGiftBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) {
  ctx.save();
  
  // 盒子
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(x - 20, y, 40, 35, 4);
  ctx.fill();
  
  // 蝴蝶结
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.roundRect(x - 25, y - 8, 50, 8, 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 15, 8, 15, 2);
  ctx.fill();
  
  // 装饰线
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 35);
  ctx.stroke();
  
  ctx.restore();
}

/**
 * 绘制带形徽章
 */
function drawRibbonBadge(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const x = width - 100;
  const y = height / 3;
  
  ctx.save();
  
  // 带子主体
  const gradient = ctx.createLinearGradient(x - 60, y - 20, x + 60, y + 20);
  gradient.addColorStop(0, '#E91E63');
  gradient.addColorStop(1, '#F06292');
  
  ctx.fillStyle = gradient;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  
  ctx.beginPath();
  ctx.moveTo(x - 60, y - 20);
  ctx.lineTo(x + 60, y - 20);
  ctx.lineTo(x + 60, y + 20);
  ctx.lineTo(x + 50, y + 20);
  ctx.lineTo(x + 45, y + 35);
  ctx.lineTo(x + 40, y + 20);
  ctx.lineTo(x - 40, y + 20);
  ctx.lineTo(x - 45, y + 35);
  ctx.lineTo(x - 50, y + 20);
  ctx.lineTo(x - 60, y + 20);
  ctx.closePath();
  ctx.fill();
  
  // 带子文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px "Microsoft YaHei", Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 0;
  ctx.fillText('限量折扣', x, y);
  
  ctx.restore();
}

/**
 * 绘制折角标签
 */
function drawCornerTag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8;
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 100, y);
  ctx.lineTo(x + 120, y + 20);
  ctx.lineTo(x + 100, y + 40);
  ctx.lineTo(x, y + 40);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px "Microsoft YaHei", Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 0;
  ctx.fillText(text, x + 50, y + 20);
  
  ctx.restore();
}

/**
 * 绘制打折徽章
 */
function drawDiscountBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.save();
  
  // 外圈
  ctx.fillStyle = '#FF5722';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, 50, 0, Math.PI * 2);
  ctx.fill();
  
  // 内圈
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x, y, 42, 0, Math.PI * 2);
  ctx.fill();
  
  // 文字
  ctx.fillStyle = '#FF5722';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 0;
  ctx.fillText('8', x, y - 8);
  
  ctx.font = 'bold 16px Arial';
  ctx.fillText('折', x, y + 12);
  
  ctx.restore();
}
