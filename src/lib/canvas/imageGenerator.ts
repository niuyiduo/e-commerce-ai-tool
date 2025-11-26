/**
 * 图片生成工具
 * 用于生成带文案和装饰元素的电商宣传图
 */

// 在线素材库配置
const ONLINE_STICKERS = {
  // Emoji 表情（支持直接绘制）- 扩充到 100+ 种
  emojis: [
    // 庆祝类
    { emoji: '🎉', name: '庆祝' },
    { emoji: '🎊', name: '彩球' },
    { emoji: '🎈', name: '气球' },
    { emoji: '🎁', name: '礼物' },
    { emoji: '💝', name: '心形礼物' },
    { emoji: '🎀', name: '蝴蝶结' },
    { emoji: '🎗️', name: '丝带' },
    { emoji: '🏆', name: '奖杯' },
    { emoji: '🥇', name: '金牌' },
    { emoji: '🥈', name: '银牌' },
    { emoji: '🥉', name: '铜牌' },
    { emoji: '🎯', name: '靶心' },
    
    // 星星闪光类
    { emoji: '⭐', name: '星星' },
    { emoji: '🌟', name: '发光星' },
    { emoji: '✨', name: '闪光' },
    { emoji: '💫', name: '流星' },
    { emoji: '⚡', name: '闪电' },
    { emoji: '🔥', name: '火焰' },
    { emoji: '💥', name: '爆炸' },
    { emoji: '💢', name: '愤怒' },
    { emoji: '💨', name: '疾风' },
    { emoji: '🌈', name: '彩虹' },
    
    // 宝石钻石类
    { emoji: '💎', name: '钻石' },
    { emoji: '💍', name: '戒指' },
    { emoji: '👑', name: '皇冠' },
    { emoji: '🔱', name: '三叉戟' },
    { emoji: '🎖️', name: '军功章' },
    
    // 金钱购物类
    { emoji: '💰', name: '钱袋' },
    { emoji: '💸', name: '飞钱' },
    { emoji: '💴', name: '钞票' },
    { emoji: '💵', name: '美元' },
    { emoji: '💶', name: '欧元' },
    { emoji: '💷', name: '英镑' },
    { emoji: '💳', name: '信用卡' },
    { emoji: '🛍️', name: '购物袋' },
    { emoji: '🛒', name: '购物车' },
    { emoji: '🏪', name: '商店' },
    { emoji: '🏬', name: '百货商场' },
    
    // 评分点赞类
    { emoji: '💯', name: '100分' },
    { emoji: '👍', name: '点赞' },
    { emoji: '👏', name: '鼓掌' },
    { emoji: '🙌', name: '举手' },
    { emoji: '✌️', name: '胜利' },
    { emoji: '🤝', name: '握手' },
    { emoji: '💪', name: '肌肉' },
    { emoji: '🤩', name: '星星眼' },
    { emoji: '😍', name: '爱心眼' },
    { emoji: '🥰', name: '笑脸爱心' },
    
    // 爱心类
    { emoji: '❤️', name: '红心' },
    { emoji: '💕', name: '两颗心' },
    { emoji: '💗', name: '成长的心' },
    { emoji: '💖', name: '闪亮的心' },
    { emoji: '💓', name: '跳动的心' },
    { emoji: '💞', name: '旋转的心' },
    { emoji: '💘', name: '丘比特之箭' },
    { emoji: '💌', name: '情书' },
    { emoji: '💋', name: '唇印' },
    
    // 食物类
    { emoji: '🍰', name: '蛋糕' },
    { emoji: '🎂', name: '生日蛋糕' },
    { emoji: '🧁', name: '纸杯蛋糕' },
    { emoji: '🍪', name: '饼干' },
    { emoji: '🍩', name: '甜甜圈' },
    { emoji: '🍭', name: '棒棒糖' },
    { emoji: '🍬', name: '糖果' },
    { emoji: '🍫', name: '巧克力' },
    { emoji: '🍿', name: '爆米花' },
    { emoji: '🍕', name: '披萨' },
    { emoji: '🍔', name: '汉堡' },
    { emoji: '🍟', name: '薯条' },
    { emoji: '☕', name: '咖啡' },
    { emoji: '🍹', name: '饮料' },
    { emoji: '🍦', name: '冰淇淋' },
    
    // 自然类
    { emoji: '🌸', name: '樱花' },
    { emoji: '🌺', name: '扶桑花' },
    { emoji: '🌻', name: '向日葵' },
    { emoji: '🌹', name: '玫瑰' },
    { emoji: '🌷', name: '郁金香' },
    { emoji: '🌼', name: '小花' },
    { emoji: '🌿', name: '草' },
    { emoji: '🍀', name: '四叶草' },
    { emoji: '🦋', name: '蝴蝶' },
    { emoji: '🐝', name: '蜜蜂' },
    
    // 表情符号类
    { emoji: '😊', name: '微笑' },
    { emoji: '😄', name: '大笑' },
    { emoji: '🤗', name: '拥抱' },
    { emoji: '😎', name: '酷' },
    { emoji: '🥳', name: '派对' },
    { emoji: '🤑', name: '发财' },
  ],
  
  // Twemoji CDN - Twitter 官方 Emoji
  twemoji: [
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f389.png', // 🎉
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/2b50.png',  // ⭐
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f525.png', // 🔥
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f4af.png', // 💯
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f48e.png', // 💎
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f451.png', // 👑
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3c6.png', // 🏆
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f4b0.png', // 💰
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f381.png', // 🎁
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f49d.png', // 💝
  ],
  
  // OpenMoji - 开源彩色 Emoji（SVG 转 PNG）
  openmoji: [
    'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/72x72/1F389.png', // 🎉
    'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/72x72/2B50.png',  // ⭐
    'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/72x72/1F525.png', // 🔥
    'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/72x72/1F4AF.png', // 💯
    'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/72x72/1F48E.png', // 💎
  ],
  
  // Iconify API - 150,000+ 免费图标
  iconify: [
    // 促销标签
    'https://api.iconify.design/noto:glowing-star.svg',
    'https://api.iconify.design/noto:fire.svg',
    'https://api.iconify.design/noto:party-popper.svg',
    'https://api.iconify.design/noto:shopping-bags.svg',
    'https://api.iconify.design/noto:money-bag.svg',
    'https://api.iconify.design/noto:gem-stone.svg',
    'https://api.iconify.design/noto:crown.svg',
    'https://api.iconify.design/noto:trophy.svg',
    'https://api.iconify.design/noto:sparkles.svg',
    'https://api.iconify.design/noto:dizzy.svg',
    // 电商图标
    'https://api.iconify.design/fluent-emoji-flat:shopping-cart.svg',
    'https://api.iconify.design/fluent-emoji-flat:credit-card.svg',
    'https://api.iconify.design/fluent-emoji-flat:gift.svg',
    'https://api.iconify.design/fluent-emoji-flat:ribbon.svg',
    'https://api.iconify.design/fluent-emoji-flat:fire.svg',
  ],
  
  // 备用图标库（如果上述失败）
  icons: [
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f389.png',
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/2b50.png',
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f525.png',
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f4af.png',
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f48e.png',
  ],
};

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

// 新增：智能装饰图生成选项（两步式）
interface SmartDecorativeOptions {
  baseImage: string; // base64 图片
  productName?: string; // 商品名称（AI生成）
  origin?: string; // 产地（AI生成）
  highlight?: string; // 卖点（AI生成）
  description?: string; // 简短说明（AI生成）
  addBorder?: boolean; // 是否添加边框
  borderStyle?: 'simple' | 'guochao' | 'gradient' | 'luxury'; // 边框风格
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
 * 同时集成在线素材库
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
    
    img.onload = async () => {
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

      // ✨ 新增：添加在线 Emoji 贴纸
      drawOnlineEmojis(ctx, canvas.width, canvas.height);

      // ✨ 新增：异步加载在线图标
      try {
        await drawOnlineIcons(ctx, canvas.width, canvas.height);
      } catch (error) {
        console.warn('在线图标加载失败，继续使用本地装饰', error);
      }

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
 * 绘制在线 Emoji 贴纸（扩充版）
 */
function drawOnlineEmojis(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // 随机选择 8-12 个 Emoji（增加数量）
  const emojiCount = 8 + Math.floor(Math.random() * 5);
  const selectedEmojis = [];
  
  for (let i = 0; i < emojiCount; i++) {
    const emoji = ONLINE_STICKERS.emojis[Math.floor(Math.random() * ONLINE_STICKERS.emojis.length)];
    selectedEmojis.push(emoji);
  }

  // 扩展位置，覆盖更多区域
  const positions = [
    // 四角
    { x: 60, y: 150 },
    { x: width - 60, y: 150 },
    { x: 60, y: height - 150 },
    { x: width - 60, y: height - 150 },
    // 顶部
    { x: width / 2 - 100, y: 100 },
    { x: width / 2, y: 80 },
    { x: width / 2 + 100, y: 100 },
    // 底部
    { x: 100, y: height - 200 },
    { x: width - 100, y: height - 200 },
    { x: width / 2, y: height - 180 },
    // 中间
    { x: 80, y: height / 2 },
    { x: width - 80, y: height / 2 },
  ];

  selectedEmojis.forEach((emojiObj, index) => {
    if (index < positions.length) {
      const pos = positions[index];
      // 随机大小：40-60px
      const size = 40 + Math.floor(Math.random() * 20);
      
      ctx.save();
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.fillText(emojiObj.emoji, pos.x, pos.y);
      ctx.restore();
    }
  });
}

/**
 * 绘制在线图标（异步加载）- 多来源支持
 */
async function drawOnlineIcons(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): Promise<void> {
  const iconPositions = [
    { x: 100, y: 120, size: 60 },
    { x: width - 100, y: 120, size: 60 },
    { x: width / 2, y: 100, size: 70 },
    { x: 150, y: height - 120, size: 55 },
    { x: width - 150, y: height - 120, size: 55 },
  ];

  // 组合多个图标库
  const allIcons = [
    ...ONLINE_STICKERS.twemoji,
    ...ONLINE_STICKERS.iconify,
  ];

  // 随机选择图标（增加到 5 个）
  const selectedIcons = [];
  for (let i = 0; i < Math.min(5, iconPositions.length); i++) {
    const icon = allIcons[Math.floor(Math.random() * allIcons.length)];
    selectedIcons.push(icon);
  }

  // 异步加载并绘制图标
  const promises = selectedIcons.map((iconUrl, index) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // 设置超时
      const timeout = setTimeout(() => {
        resolve(); // 超时也继续
      }, 3000);
      
      img.onload = () => {
        clearTimeout(timeout);
        const pos = iconPositions[index];
        if (pos) {
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 10;
          ctx.drawImage(img, pos.x - pos.size / 2, pos.y - pos.size / 2, pos.size, pos.size);
          ctx.restore();
        }
        resolve();
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.warn('图标加载失败:', iconUrl);
        resolve(); // 加载失败也继续
      };
      
      img.src = iconUrl;
    });
  });

  await Promise.all(promises);
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

/**
 * 智能装饰图生成（两步式）
 * 第一步：添加AI生成的文字说明 + 简洁贴图
 * 第二步：可选添加边框装饰
 */
export async function generateSmartDecorativeImage(
  options: SmartDecorativeOptions
): Promise<string> {
  const {
    baseImage,
    productName = '',
    origin = '',
    highlight = '',
    description = '',
    addBorder = false,
    borderStyle = 'simple',
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

      // 第一步：只添加AI真正识别到的信息（过滤无效内容）
      const validProductName = productName && !isGenericText(productName) ? productName : '';
      const validOrigin = origin && !isGenericText(origin) ? origin : '';
      const validHighlight = highlight && !isGenericText(highlight) ? highlight : '';
      const validDescription = description && !isGenericText(description) ? description : '';

      if (validProductName) {
        // 左侧竖排大字（商品名）
        drawVerticalProductName(ctx, validProductName, canvas.width, canvas.height);
      }

      if (validOrigin) {
        // 产地标签
        drawOriginLabel(ctx, validOrigin, canvas.width, canvas.height);
      }

      if (validHighlight) {
        // 卖点标签
        drawHighlightLabel(ctx, validHighlight, canvas.width, canvas.height);
      }

      if (validDescription) {
        // 右下角简短说明（不与水印重叠）
        drawDescription(ctx, validDescription, canvas.width, canvas.height);
      }

      // 添加少量精致贴图（不过多）
      drawMinimalStickers(ctx, canvas.width, canvas.height);

      // 第二步：可选边框
      if (addBorder) {
        drawBorder(ctx, canvas.width, canvas.height, borderStyle);
      }

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
 * 判断是否为通用/无效文本
 */
function isGenericText(text: string): boolean {
  const genericTerms = [
    '优质商品', '精选供应', '品质保障', '精选好物', '值得拥有',
    '暂无', '未知', '无', 'XXX', 'xxx', '待定'
  ];
  return genericTerms.some(term => text.includes(term)) || text.trim().length === 0;
}

/**
 * 绘制竖排商品名称（左侧）- 智能调节字体大小
 */
function drawVerticalProductName(
  ctx: CanvasRenderingContext2D,
  name: string,
  width: number,
  height: number
) {
  ctx.save();

  // 智能计算字体大小和背景尺寸
  const nameLength = name.length;
  let fontSize = nameLength <= 3 ? 52 : nameLength <= 5 ? 42 : 34;
  let charSpacing = fontSize + 8;
  const barWidth = fontSize * 2.2;
  const barHeight = Math.min(nameLength * charSpacing + 80, height - 100);
  const x = 30;
  const y = (height - barHeight) / 2;

  // 渐变背景
  const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
  gradient.addColorStop(0, 'rgba(255, 87, 34, 0.9)');
  gradient.addColorStop(1, 'rgba(255, 152, 0, 0.85)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x, y, barWidth, barHeight, 15);
  ctx.fill();

  // 添加边框
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 绘制文字（竖排）
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${fontSize}px "Microsoft YaHei", Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 5;

  // 逐字绘制
  const chars = name.split('');
  const startY = y + 60;

  chars.forEach((char, index) => {
    const charY = startY + index * charSpacing;
    if (charY < y + barHeight - 40) {
      ctx.fillText(char, x + barWidth / 2, charY);
    }
  });

  ctx.restore();
}

/**
 * 绘制产地标签 - 智能调节宽度和字体
 */
function drawOriginLabel(
  ctx: CanvasRenderingContext2D,
  origin: string,
  width: number,
  height: number
) {
  ctx.save();

  // 智能计算宽度
  const textLength = origin.length;
  let fontSize = textLength <= 4 ? 20 : textLength <= 6 ? 18 : 16;
  const labelWidth = Math.max(100, textLength * fontSize + 50);
  const labelHeight = 50;
  const x = 150;
  const y = 50;

  // 渐变背景
  const gradient = ctx.createLinearGradient(x, y, x + labelWidth, y + labelHeight);
  gradient.addColorStop(0, 'rgba(139, 69, 19, 0.85)');
  gradient.addColorStop(1, 'rgba(160, 82, 45, 0.85)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x, y, labelWidth, labelHeight, 10);
  ctx.fill();

  // 边框
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 图标：地点
  ctx.font = '24px Arial';
  ctx.fillText('📍', x + 15, y + labelHeight / 2);

  // 产地文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${fontSize}px "Microsoft YaHei", Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 3;
  
  ctx.fillText(origin, x + 40, y + labelHeight / 2);

  ctx.restore();
}

/**
 * 绘制卖点标签 - 智能调节宽度和字体
 */
function drawHighlightLabel(
  ctx: CanvasRenderingContext2D,
  highlight: string,
  width: number,
  height: number
) {
  ctx.save();

  // 智能计算宽度和字体
  const textLength = highlight.length;
  let fontSize = textLength <= 6 ? 18 : textLength <= 10 ? 16 : 14;
  const labelWidth = Math.max(150, textLength * fontSize + 60);
  const labelHeight = 45;
  const x = 150;
  const y = 120;

  // 渐变背景（绿色系）
  const gradient = ctx.createLinearGradient(x, y, x + labelWidth, y + labelHeight);
  gradient.addColorStop(0, 'rgba(76, 175, 80, 0.9)');
  gradient.addColorStop(1, 'rgba(139, 195, 74, 0.85)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x, y, labelWidth, labelHeight, 10);
  ctx.fill();

  // 边框
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 图标：勾
  ctx.font = '22px Arial';
  ctx.fillText('✔️', x + 12, y + labelHeight / 2);

  // 卖点文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${fontSize}px "Microsoft YaHei", Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 3;
  
  ctx.fillText(highlight, x + 40, y + labelHeight / 2);

  ctx.restore();
}

/**
 * 绘制右下角简短说明（不与水印重叠）- 智能调节字体和背景
 */
function drawDescription(
  ctx: CanvasRenderingContext2D,
  description: string,
  width: number,
  height: number
) {
  ctx.save();

  // 智能字体大小
  const textLength = description.length;
  let fontSize = textLength <= 20 ? 15 : textLength <= 35 ? 13 : 11;
  let maxCharsPerLine = Math.floor(width * 0.35 / fontSize);
  
  // 处理文本换行
  const words = description.split('');
  let line = '';
  const lines: string[] = [];

  for (const char of words) {
    const testLine = line + char;
    if (testLine.length > maxCharsPerLine && line.length > 0) {
      lines.push(line);
      line = char;
    } else {
      line = testLine;
    }
  }
  if (line) {
    lines.push(line);
  }

  // 只显示前2行
  const displayLines = lines.slice(0, 2);
  const lineHeight = fontSize + 5;
  const bgHeight = displayLines.length * lineHeight + 20;
  const bgWidth = Math.max(...displayLines.map(l => l.length)) * fontSize + 30;
  
  // 位置：右下角，但留出水印空间
  const x = width - bgWidth - 20;
  const y = height - bgHeight - 60; // 预留水印空间

  // 半透明背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.roundRect(x - 10, y - 8, bgWidth, bgHeight, 8);
  ctx.fill();

  // 文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${fontSize}px "Microsoft YaHei", Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 2;

  displayLines.forEach((textLine, index) => {
    ctx.fillText(textLine, x, y + index * lineHeight);
  });

  ctx.restore();
}

/**
 * 绘制少量精致贴图（不过多）
 */
function drawMinimalStickers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // 只添加2-3个小型装饰
  const stickers = [
    { emoji: '✨', x: width - 80, y: 60, size: 30 },
    { emoji: '🔥', x: width - 120, y: height / 2, size: 28 },
    { emoji: '⭐', x: 70, y: height - 90, size: 26 },
  ];

  stickers.forEach(({ emoji, x, y, size }) => {
    ctx.save();
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.fillText(emoji, x, y);
    ctx.restore();
  });
}

/**
 * 绘制边框（多种风格）
 */
function drawBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: string
) {
  ctx.save();

  const borderWidth = 15;

  switch (style) {
    case 'simple':
      // 简约边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);
      break;

    case 'guochao':
      // 国潮边框（红金色）
      const guochaoGradient = ctx.createLinearGradient(0, 0, width, height);
      guochaoGradient.addColorStop(0, '#D32F2F');
      guochaoGradient.addColorStop(0.5, '#FFD700');
      guochaoGradient.addColorStop(1, '#D32F2F');
      
      ctx.strokeStyle = guochaoGradient;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);
      
      // 内层装饰
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.lineWidth = 3;
      ctx.strokeRect(borderWidth + 5, borderWidth + 5, width - borderWidth * 2 - 10, height - borderWidth * 2 - 10);
      break;

    case 'gradient':
      // 渐变边框
      const gradientBorder = ctx.createLinearGradient(0, 0, width, 0);
      gradientBorder.addColorStop(0, '#FF5722');
      gradientBorder.addColorStop(0.5, '#9C27B0');
      gradientBorder.addColorStop(1, '#2196F3');
      
      ctx.strokeStyle = gradientBorder;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);
      break;

    case 'luxury':
      // 豪华边框（金色双线）
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);
      
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
      ctx.lineWidth = 8;
      ctx.strokeRect(borderWidth + 8, borderWidth + 8, width - borderWidth * 2 - 16, height - borderWidth * 2 - 16);
      
      // 角落装饰
      drawLuxuryCorners(ctx, width, height, borderWidth);
      break;
  }

  ctx.restore();
}

/**
 * 绘制豪华边框角落装饰
 */
function drawLuxuryCorners(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  borderWidth: number
) {
  ctx.save();
  ctx.fillStyle = '#FFD700';
  const cornerSize = 20;
  const offset = borderWidth + 5;

  // 四个角
  const corners = [
    { x: offset, y: offset }, // 左上
    { x: width - offset - cornerSize, y: offset }, // 右上
    { x: offset, y: height - offset - cornerSize }, // 左下
    { x: width - offset - cornerSize, y: height - offset - cornerSize }, // 右下
  ];

  corners.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x + cornerSize / 2, y + cornerSize / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}
