'use client';

import { useState } from 'react';
import { addWatermark, generateDecorativeImage, generateSmartDecorativeImage } from '@/lib/canvas/imageGenerator';
import { generateVideo, downloadVideo } from '@/lib/video/videoGenerator';

interface Message {
  role: string;
  content: string;
  type?: 'text' | 'image';
  imageUrl?: string;
}

export default function Home() {
  const [productImage, setProductImage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  
  // 视频生成相关状态
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [videoTransition, setVideoTransition] = useState<'fade' | 'slide' | 'none'>('fade');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>('');
  const [videoCaptions, setVideoCaptions] = useState<string[]>([]); // 视频字幕
  const [useCustomCaptions, setUseCustomCaptions] = useState(false); // 是否自定义字幕
  const [voiceType, setVoiceType] = useState<'male' | 'female'>('female'); // 配音音色
  const [enableVoice, setEnableVoice] = useState(false); // 是否启用配音
  const [enableAvatar, setEnableAvatar] = useState(false); // 是否启用虚拟形象
  const [avatarStyle, setAvatarStyle] = useState<'female' | 'male' | 'robot' | 'cute'>('female'); // 形象风格
  const [avatarPosition, setAvatarPosition] = useState<'bottom-left' | 'bottom-right' | 'top-right'>('bottom-right'); // 形象位置
  const [useAdvancedAvatar, setUseAdvancedAvatar] = useState(false); // 是否使用高级 3D 形象
  const [usePremiumAvatar, setUsePremiumAvatar] = useState(false); // 新增：是否使用顶级 VRoid 形象
  
  // 功能模式：'image' 或 'video'
  const [mode, setMode] = useState<'image' | 'video'>('image');
  
  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [isMultipleDragging, setIsMultipleDragging] = useState(false);
  
  // AI 模型配置
  const [selectedModel, setSelectedModel] = useState<string>('Doubao-1.5-pro-32k');
  
  // 新增：两步式装饰图状态
  const [showDecorativeDialog, setShowDecorativeDialog] = useState(false); // 显示装饰模式选择对话框
  const [decorativeMode, setDecorativeMode] = useState<'normal' | 'advanced'>('normal'); // 装饰模式
  const [stepOneImage, setStepOneImage] = useState<string>(''); // 第一步生成的图片
  const [showBorderDialog, setShowBorderDialog] = useState(false); // 显示边框选择对话框
  const [selectedBorderStyle, setSelectedBorderStyle] = useState<'simple' | 'guochao' | 'gradient' | 'luxury'>('simple');
  const [productInfo, setProductInfo] = useState<{
    name: string;
    origin: string;
    highlight: string;
    description: string;
  }>({ name: '', origin: '', highlight: '', description: '' });
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false); // 显示升级模型对话框
  const [dissatisfactionCount, setDissatisfactionCount] = useState(0); // 不满意次数计数
  const [userFeedback, setUserFeedback] = useState(''); // 用户反馈内容
  const [hasBorderAdded, setHasBorderAdded] = useState(false); // 🔥 记录是否已添加边框
  
  // 可用的豆包模型列表
  const availableModels = [
    { id: 'Doubao-1.5-pro-32k', name: 'Doubao-1.5-pro-32k', description: '高性能版本，适合复杂任务' },
    { id: 'Doubao-1.5-pro-4k', name: 'Doubao-1.5-pro-4k', description: '标准版本，快速响应' },
    { id: 'Doubao-lite-32k', name: 'Doubao-lite-32k', description: '轻量版本，经济实惠' },
    { id: 'Doubao-lite-4k', name: 'Doubao-lite-4k', description: '基础版本，快速处理' },
    { id: 'Doubao-1.5-vision-pro', name: 'Doubao-vision', description: '多模态模型，支持图文理解' },
    { id: 'Doubao-1.5-vision-thinking-pro', name: 'Doubao-thinking-vision', description: '思维链多模态，更强推理能力' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductImage(event.target?.result as string);
        // 重置所有相关状态（新图片 = 新一轮）
        setDissatisfactionCount(0);
        setProductInfo({ name: '', origin: '', highlight: '', description: '' });
        setGeneratedImage('');
        setStepOneImage('');
        setHasBorderAdded(false); // 🔥 重置边框状态
      };
      reader.readAsDataURL(file);
    }
  };

  // 单图拖拽上传（AI 图片生成模式）
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 设置 dropEffect 提高兼容性
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    setIsDragging(true);
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 防止子元素触发 dragLeave
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // 兼容性更好的文件获取方式
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) {
      alert('未检测到文件，请重试！');
      return;
    }
    
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductImage(event.target?.result as string);
        // 重置所有相关状态（新图片 = 新一轮）
        setDissatisfactionCount(0);
        setProductInfo({ name: '', origin: '', highlight: '', description: '' });
        setGeneratedImage('');
        setStepOneImage('');
        setHasBorderAdded(false); // 🔥 重置边框状态
      };
      reader.readAsDataURL(file);
    } else {
      alert('请上传图片文件！');
    }
  };

  // 处理多图片上传（用于视频生成）
  const handleMultipleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // 计算还能上传多少张
    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) {
      alert('最多只能上传 5 张图片！');
      e.target.value = ''; // 清空输入框
      return;
    }
    
    const fileArray = Array.from(files).slice(0, remainingSlots); // 只取剩余可上传数量
    const readers = fileArray.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(readers).then(newImages => {
      setUploadedImages(prev => [...prev, ...newImages]); // 追加到现有图片数组
      e.target.value = ''; // 清空输入框，允许重复选择文件
    });
  };

  // 移除已上传的图片
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 多图拖拽上传（视频生成模式）
  const handleMultipleImagesDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 设置 dropEffect 提高兼容性
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    setIsMultipleDragging(true);
  };
  
  const handleMultipleImagesDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMultipleDragging(true);
  };
  
  const handleMultipleImagesDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 防止子元素触发 dragLeave
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsMultipleDragging(false);
    }
  };

  const handleMultipleImagesDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMultipleDragging(false);
    
    // 兼容性更好的文件获取方式
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) {
      alert('未检测到文件，请重试！');
      return;
    }
    
    // 计算还能上传多少张
    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) {
      alert('最多只能上传 5 张图片！');
      return;
    }
    
    const fileArray = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, remainingSlots);
    
    if (fileArray.length === 0) {
      alert('请拖拽图片文件！');
      return;
    }
    
    const readers = fileArray.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(readers).then(newImages => {
      setUploadedImages(prev => [...prev, ...newImages]);
    });
  };

  // 生成视频
  const handleGenerateVideo = async () => {
    if (uploadedImages.length === 0) {
      alert('请至少上传一张图片');
      return;
    }
    
    setIsGeneratingVideo(true);
    
    try {
      const videoBlob = await generateVideo({
        images: uploadedImages,
        duration: videoDuration,
        transition: videoTransition,
        fps: 30,
        captions: useCustomCaptions && videoCaptions.length > 0 ? videoCaptions : undefined,
        autoGenerateCaptions: !useCustomCaptions || videoCaptions.length === 0,
        // 配音参数
        enableVoice,
        voiceType,
        // 虚拟形象参数
        enableAvatar,
        avatarStyle,
        avatarPosition,
        useAdvancedAvatar, // 高级 VRM 3D 形象
        usePremiumAvatar,  // 顶级 VRoid 形象
      });
      
      const url = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(url);
      
      alert('✅ 视频生成成功！');
    } catch (error) {
      console.error('视频生成失败:', error);
      alert('❌ 视频生成失败，请重试');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // 下载生成的视频
  const handleDownloadVideo = () => {
    if (!generatedVideoUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedVideoUrl;
    link.download = `电商视频_${Date.now()}.webm`;
    link.click();
  };

  // 新增：提取信息的辅助函数（过滤无效内容）
  const extractInfo = (text: string, keywords: string[]): string => {
    // 🔥 防御性检查：确保text是字符串
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:：「]?\\s*([^。，；」\n]{1,50})`, 'i');
      const match = text.match(regex);
      if (match) {
        let extracted = match[1].trim();
        
        // 处理"保持不变"等标记，提取括号前的内容
        const keepAsIsMatch = extracted.match(/^(.+?)[（(]保持|不变|无需修改|仅需调整/);
        if (keepAsIsMatch) {
          extracted = keepAsIsMatch[1].trim();
        }
        
        // 过滤无效内容（但不过滤"保持"、"不变"等保留指令）
        const invalidTerms = ['未显示', '暂无', '未知', '不明确', '不清楚', 'XXX', '待定', '无法确定', '无法识别'];
        const isInvalid = invalidTerms.some(term => extracted === term || extracted.startsWith(term));
        if (isInvalid) {
          return ''; // 返回空字符串，不显示装饰框
        }
        return extracted;
      }
    }
    return '';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !productImage) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 🔥 优化1：限制对话历史长度，只保留最近6轮（用户+助手各3条）
      const recentMessages = messages.slice(-6);
      
      // 🔥 优化2：根据模型类型设置不同的超时时间
      const isThinkingModel = selectedModel === 'Doubao-1.5-vision-thinking-pro';
      const timeoutDuration = isThinkingModel ? 90000 : 30000; // thinking模型90秒，普通模型30秒
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          productImage,
          history: recentMessages, // 使用精简后的历史记录
          model: selectedModel, // 传递选择的模型
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      
      // 判断是否需要生成装饰图
      if (inputValue.includes('装饰图') || inputValue.includes('宣传图') || inputValue.includes('贴图')) {
        // 显示装饰模式选择对话框
        setShowDecorativeDialog(true);
      } else {
        // 普通文字回复
        setMessages((prev) => [...prev, { role: 'assistant', content: data.content, type: 'text' }]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 🔥 优化2：超时错误的友好提示
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? '⏱️ 请求超时（超过30秒），可能是服务器繁忙。\n\n💡 建议：\n1. 刷新页面清空对话历史后重试\n2. 选择轻量级模型（Doubao-lite-4k）\n3. 稍后再试'
        : '抱歉，生成素材时出现错误，请重试。';
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage, type: 'text' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `氛围图_${Date.now()}.png`;
    link.click();
  };

  // 新增：处理普通装饰模式
  const handleNormalDecorative = async () => {
    setShowDecorativeDialog(false);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `🎨 正在生成普通装饰宣传图...`, type: 'text' }
    ]);

    try {
      const decorativeImage = await generateDecorativeImage({
        baseImage: productImage,
        productInfo: '',
        style: 'promotional',
        addStickers: true,
        addBadges: true,
        addPriceTag: true,
      });

      const finalImage = await addWatermark(decorativeImage);
      setGeneratedImage(finalImage);

      // 💾 保存到数据库（普通装饰）
      try {
        console.log('💾 正在保存普通装饰图到数据库...');
        const saveResponse = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: '普通装饰图生成',
            material_type: 'atmosphere',
            title: '普通装饰宣传图',
            selling_points: '促销徽章+装饰贴纸+价格标签',
            atmosphere_text: '包含促销元素、100+装饰贴纸、四角边框、光效装饰',
            atmosphere_image_url: finalImage,
            raw_response: '普通装饰模式生成'
          })
        });

        const saveData = await saveResponse.json();
        if (saveData.success) {
          console.log('✅ 普通装饰图已保存到数据库！');
        } else {
          console.error('⚠️ 数据库保存失败:', saveData.error);
        }
      } catch (saveError) {
        console.error('⚠️ 数据库保存失败:', saveError);
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: `✅ 普通装饰宣传图生成成功！

已添加：
🏷️ 促销徽章（新品/热卖/特价）
✨ 100+种装饰贴纸
🌟 价格标签
🔶 四角边框
☀️ 光效装饰`, 
          type: 'image',
          imageUrl: finalImage 
        }
      ]);
    } catch (error) {
      console.error('生成装饰图失败:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '装饰图生成失败，请重试。', type: 'text' }
      ]);
    }
  };

  // 新增：处理高级定制装饰模式（两步式：文字说明 + 边框选择）
  const handleAdvancedDecorative = async () => {
    // 检查当前模型是否支持图文理解
    const isVisionModel = selectedModel.includes('vision');
    
    if (!isVisionModel) {
      // 当前模型不支持，提示切换
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: `⚠️ 高级定制装饰需要使用支持图文理解的多模态模型。

当前模型：**${selectedModel}**（仅支持文本）

请切换到以下模型之一：
🔹 **Doubao-vision** - 多模态模型
🔸 **Doubao-thinking-vision** - 思维链多模态（推荐）`, 
          type: 'text' 
        }
      ]);
      setShowDecorativeDialog(false);
      return;
    }

    setShowDecorativeDialog(false);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `🤖 正在启动高级AI分析（${selectedModel === 'Doubao-1.5-vision-thinking-pro' ? 'Doubao-thinking-vision 思维链模型' : 'Doubao-vision 多模态模型'}）...`, type: 'text' }
    ]);

    try {
      // 🔥 优化1：限制对话历史长度
      const recentMessages = messages.slice(-6);
      
      // 🔥 优化2：根据模型类型设置不同的超时时间
      const useThinkingModel = selectedModel === 'Doubao-1.5-vision-thinking-pro';
      const timeoutDuration = useThinkingModel ? 90000 : 30000; // thinking模型90秒，普通模型30秒
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      // 第一步：调用当前选择的多模态模型分析图片
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `请仔细分析这张商品图片，提供以下信息：

1. 商品名称（如果图片中明确显示或可以准确识别）
2. 产地/来源（如果图片中有相关信息）
3. 主要卖点（根据图片内容提取）
4. 简短说明（不超过50字，**请用自然语言描述，不要带"说明："等标签**）

重要规则：
- 如果某个信息在图片中没有明确显示或无法确定，请回答"未显示"
- 不要编造或猜测信息，只描述图片中真实存在的内容
- 如果图片上有文字，优先使用图片上的文字

请用清晰的格式回答：
商品名：XXX
产地：XXX或未显示
卖点：XXX
说明：这是一款...（直接写描述文字，不要重复"说明："）`,
          productImage,
          history: recentMessages, // 使用精简后的历史记录
          model: selectedModel, // 使用当前选择的模型
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      const aiResponse = data.content;
      
      // 提取结构化信息
      const parsedInfo = {
        name: extractInfo(aiResponse, ['商品名', '名称', '产品']) || '优质商品',
        origin: extractInfo(aiResponse, ['产地', '来源', '供应']) || '精选供应',
        highlight: extractInfo(aiResponse, ['卖点', '特点', '优势']) || '品质保障',
        description: extractInfo(aiResponse, ['说明', '简介']) || aiResponse.substring(0, 50) || '精选好物，值得拥有'
      };
      
      setProductInfo(parsedInfo);

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: `🧠 AI分析完成！

🏷️ 商品名称：${parsedInfo.name}
📍 产地信息：${parsedInfo.origin}
✨ 主要卖点：${parsedInfo.highlight}
📝 简短说明：${parsedInfo.description.substring(0, 30)}...

正在生成第一步装饰图（文字说明 + 少量贴图）...`, 
          type: 'text'
        }
      ]);

      // 生成第一步：带文字说明的装饰图（不加边框）
      const smartImage = await generateSmartDecorativeImage({
        baseImage: productImage,
        productName: parsedInfo.name,
        origin: parsedInfo.origin,
        highlight: parsedInfo.highlight,
        description: parsedInfo.description,
        addBorder: false,
      });

      const finalImage = await addWatermark(smartImage);
      setStepOneImage(finalImage);
      setGeneratedImage(finalImage);

      // 💾 保存到数据库（第一步：无边框）
      try {
        console.log('💾 正在保存高级定制装饰图（无边框）到数据库...');
        const saveResponse = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `高级定制装饰：${parsedInfo.name}`,
            material_type: 'atmosphere_advanced',
            title: parsedInfo.name,
            selling_points: parsedInfo.highlight,
            atmosphere_text: parsedInfo.description,
            atmosphere_image_url: finalImage,
            raw_response: aiResponse
          })
        });

        const saveData = await saveResponse.json();
        if (saveData.success) {
          console.log('✅ 高级定制装饰图（无边框）已保存到数据库！');
        } else {
          console.error('⚠️ 数据库保存失败:', saveData.error);
        }
      } catch (saveError) {
        console.error('⚠️ 数据库保存失败:', saveError);
      }

      // 🔥 区分模型：普通Vision模型不显示边框选项，直接完成（复用上面的useThinkingModel变量）
      
      if (useThinkingModel) {
        // Thinking模型：显示边框选择对话框
        setMessages((prev) => [
          ...prev,
          { 
            role: 'assistant', 
            content: `✅ 第一步完成！

已添加：
🏷️ 左侧竖排商品名
📍 产地标签
✔️ 卖点标签
📝 右下角简要说明
✨ 少量精致贴纸

是否需要添加边框装饰？`, 
            type: 'image',
            imageUrl: finalImage 
          }
        ]);
        setShowBorderDialog(true); // 显示边框选择对话框
      } else {
        // 普通Vision模型：直接完成，不显示边框选项，但显示不满意反馈区域
        setMessages((prev) => [
          ...prev,
          { 
            role: 'assistant', 
            content: `✅ 高级定制装饰图完成！

已添加：
🏷️ 左侧竖排商品名
📍 产地标签
✔️ 卖点标签
📝 右下角简要说明
✨ 少量精致贴纸

💡 提示：升级到 Doubao-thinking-vision 模型后，可以使用更多边框装饰选项！

💬 对结果不满意？点击下方“🔄 重新生成”按钮告诉我需要调整的地方。`, 
            type: 'image',
            imageUrl: finalImage 
          }
        ]);
        setShowBorderDialog(false); // 不显示边框选择对话框
        // 显示不满意反馈区域（通过在消息中提示用户）
      }
      
      // 首次生成高级装饰时重置计数（新一轮高级装饰生成）
      if (!stepOneImage) {
        setDissatisfactionCount(0);
      }

    } catch (error) {
      console.error('生成高级装饰图失败:', error);
      
      // 🔥 优化2：超时错误的友好提示
      const useThinkingModel = selectedModel === 'Doubao-1.5-vision-thinking-pro';
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? `⏱️ AI分析超时（超过${useThinkingModel ? '90' : '30'}秒）。

💡 ${useThinkingModel ? 'Thinking模型推理复杂' : '服务器繁忙'}，建议：
1. ${useThinkingModel ? '切换到普通 Doubao-vision 模型（更快）' : '选择轻量级模型'}
2. 刷新页面后重试
3. 检查网络连接`
        : '高级装饰图生成失败，请重试。';
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage, type: 'text' }
      ]);
    }
  };

  // 新增：添加边框的处理函数
  const handleAddBorder = async () => {
    if (!stepOneImage) return;

    setShowBorderDialog(false);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `🖌️ 正在添加${getBorderStyleName(selectedBorderStyle)}边框...`, type: 'text' }
    ]);

    try {
      // 生成第二步图片（带边框）
      const borderedImage = await generateSmartDecorativeImage({
        baseImage: productImage,
        productName: productInfo.name,
        origin: productInfo.origin,
        highlight: productInfo.highlight,
        description: productInfo.description,
        addBorder: true,
        borderStyle: selectedBorderStyle,
      });

      const finalImage = await addWatermark(borderedImage);
      setGeneratedImage(finalImage);
      setHasBorderAdded(true); // 🔥 标记已添加边框

      // 💾 保存到数据库（第二步：有边框）
      try {
        console.log('💾 正在保存高级定制装饰图（带边框）到数据库...');
        const saveResponse = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `高级定制装饰+${getBorderStyleName(selectedBorderStyle)}边框：${productInfo.name}`,
            material_type: 'atmosphere_advanced_bordered',
            title: productInfo.name,
            selling_points: productInfo.highlight,
            atmosphere_text: productInfo.description,
            atmosphere_image_url: finalImage,
            raw_response: `边框风格: ${selectedBorderStyle}`
          })
        });

        const saveData = await saveResponse.json();
        if (saveData.success) {
          console.log('✅ 高级定制装饰图（带边框）已保存到数据库！');
        } else {
          console.error('⚠️ 数据库保存失败:', saveData.error);
        }
      } catch (saveError) {
        console.error('⚠️ 数据库保存失败:', saveError);
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: `✅ 高级定制装饰图完成！\n\n已添加${getBorderStyleName(selectedBorderStyle)}边框装饰。`, 
          type: 'image',
          imageUrl: finalImage 
        }
      ]);
      // 注意：不重置计数，保持对当前图片的修改次数记录
    } catch (error) {
      console.error('添加边框失败:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '边框添加失败，请重试。', type: 'text' }
      ]);
    }
  };

  // 新增：获取边框风格名称
  const getBorderStyleName = (style: string): string => {
    const names: Record<string, string> = {
      simple: '简约',
      guochao: '国潮',
      gradient: '渐变',
      luxury: '豪华',
    };
    return names[style] || '简约';
  };

  // 新增：跳过边框，直接完成
  const handleSkipBorder = () => {
    setShowBorderDialog(false);
    setHasBorderAdded(false); // 🔥 确认没有添加边框
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '✅ 高级定制装饰图已完成，可以下载使用了！', type: 'text' }
    ]);
    // 注意：不重置计数，关闭对话框不影响当前图片的修改次数
  };

  // 新增：升级到思维链模型重新分析
  const handleUpgradeModel = async () => {
    setShowUpgradeDialog(false);
    setShowBorderDialog(false);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `🧠 正在升级到 Doubao-thinking-vision 模型，进行更深入的分析...`, type: 'text' }
    ]);

    try {
      // 🔥 优化1：限制对话历史长度
      const recentMessages = messages.slice(-6);
      
      // 🔥 优化2：thinking模型需要更长的超时时间（90秒）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90秒超时
      
      // 使用思维链模型重新分析
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '请更深入分析这张商品图片，提供更详细的信息：1.精确的商品名称 2.详细的产地信息 3.多个卖点（分点列举） 4.更具吸引力的说明（不超过80字）。请用清晰的格式回答。',
          productImage,
          history: recentMessages, // 使用精简后的历史记录
          model: 'Doubao-1.5-vision-thinking-pro', // 使用思维链模型
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      const aiResponse = data.content;
      
      // 提取更详细的信息
      const parsedInfo = {
        name: extractInfo(aiResponse, ['商品名', '名称', '产品']) || '优质商品',
        origin: extractInfo(aiResponse, ['产地', '来源', '供应']) || '精选供应',
        highlight: extractInfo(aiResponse, ['卖点', '特点', '优势']) || '品质保障',
        description: extractInfo(aiResponse, ['说明', '简介']) || aiResponse.substring(0, 80) || '精选好物，值得拥有'
      };
      
      setProductInfo(parsedInfo);

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: `🌟 思维链模型分析完成！

🏷️ 商品名称：${parsedInfo.name}
📍 产地信息：${parsedInfo.origin}
✨ 主要卖点：${parsedInfo.highlight}
📝 详细说明：${parsedInfo.description}

正在生成更精美的装饰图...`, 
          type: 'text'
        }
      ]);

      // 生成更精美的装饰图
      const smartImage = await generateSmartDecorativeImage({
        baseImage: productImage,
        productName: parsedInfo.name,
        origin: parsedInfo.origin,
        highlight: parsedInfo.highlight,
        description: parsedInfo.description,
        addBorder: true, // 默认添加边框
        borderStyle: 'luxury', // 使用豪华边框
      });

      const finalImage = await addWatermark(smartImage);
      setGeneratedImage(finalImage);
      setHasBorderAdded(true); // 🔥 升级后默认添加了边框
      setSelectedBorderStyle('luxury'); // 🔥 记录边框风格

      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: `✨ 思维链模型生成完成！\n\n基于更深入的AI分析，已为您生成更精美、更详细的装饰图（自动添加豪华边框）。`, 
          type: 'image',
          imageUrl: finalImage 
        }
      ]);

    } catch (error) {
      console.error('升级模型生成失败:', error);
      
      // 🔥 优化2：超时错误的友好提示
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? '⏱️ Thinking模型分析超时（超过90秒）。\n\n💡 建议：\n1. 刷新页面后重试\n2. 或切换到普通的Doubao-vision模型（更快）\n3. 稍后再试'
        : '升级模型生成失败，请重试。';
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage, type: 'text' }
      ]);
    }
  };

  // 新增：取消升级
  const handleCancelUpgrade = () => {
    setShowUpgradeDialog(false);
  };

  // 新增：处理用户不满意反馈
  const handleDissatisfaction = async () => {
    const newCount = dissatisfactionCount + 1;
    setDissatisfactionCount(newCount);

    // 判断当前模型类型
    const isThinkingVision = selectedModel === 'Doubao-1.5-vision-thinking-pro';
    
    // 如果是普通 vision 模型且已经3次不满意，提示升级
    if (!isThinkingVision && newCount >= 3) {
      setShowUpgradeDialog(true);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `不满意原因：${userFeedback}` },
        { 
          role: 'assistant', 
          content: `💡 检测到您已连续3次对结果不满意。\n\n建议升级到 **Doubao-thinking-vision** 思维链模型，获得更好的效果！`, 
          type: 'text' 
        }
      ]);
      return;
    }

    // 前3次，根据用户反馈重新生成
    if (!userFeedback.trim()) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '请告诉我哪里需要修改，我会为您重新生成。', type: 'text' }
      ]);
      return;
    }

    // 将用户反馈添加到对话历史
    const userMessage = { role: 'user' as const, content: `我对当前的装饰图不满意，需要修改：${userFeedback}。请根据我的要求重新分析图片并生成。` };
    setMessages((prev) => [...prev, userMessage]);

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `🔄 好的，我明白了。正在根据您的要求“${userFeedback}”重新分析和生成...`, type: 'text' }
    ]);

    try {
      // 🔥 优化1：限制对话历史长度
      const recentHistory = messages.slice(-6);
      
      // 🔥 优化2：根据模型类型设置不同的超时时间
      const useThinkingModel = selectedModel === 'Doubao-1.5-vision-thinking-pro';
      const timeoutDuration = useThinkingModel ? 90000 : 30000; // thinking模型90秒，普通模型30秒
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      // 重新调用AI分析，带上对话历史
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `根据用户的修改要求重新分析图片。

用户要求：${userFeedback}

请仔细观察图片，并根据用户的具体要求调整以下信息：
1.商品名称
2.产地/来源
3.主要卖点
4.简短说明（**请用自然语言描述，不要带“说明：”等标签**）

重要规则：
- **只修改用户明确要求修改的部分**
- 如果用户只是要求调整格式、字体大小、位置等**样式问题**，请保持原内容不变，在回答中说明"内容保持不变"
- 如果用户要求修改某项内容，才修改该项的文字
- 如果某个信息在图片中没有显示，请回答"未显示"
- 不要编造或猜测，只描述图片中真实存在的内容

请用清晰的格式回答：
- 如果内容不变："商品名：[原内容]（保持不变）"
- 如果内容修改："商品名：[新内容]"
- 如果没有该信息："产地：未显示"
- **说明字段**：直接写自然语言描述，例如"说明：这是一款新鲜的柠檬精蔬菜..."

示例：
用户说"商品名的字太大了" → 回答"商品名：雪莲果（保持不变，仅需调整显示样式）"
用户说"商品名改成云南雪莲果" → 回答"商品名：云南雪莲果"`,
          productImage,
          history: [...recentHistory, userMessage], // 使用精简后的历史记录
          model: selectedModel, // 使用当前选择的模型
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      const aiResponse = data.content;
      
      // 🔥 防御性检查：如果AI响应为空，直接报错
      if (!aiResponse || typeof aiResponse !== 'string') {
        throw new Error('服务器返回的数据格式错误或为空');
      }
      
      const parsedInfo = {
        name: extractInfo(aiResponse, ['商品名', '名称', '产品']) || productInfo.name || '优质商品',
        origin: extractInfo(aiResponse, ['产地', '来源', '供应']) || productInfo.origin || '精选供应',
        highlight: extractInfo(aiResponse, ['卖点', '特点', '优势']) || productInfo.highlight || '品质保障',
        description: extractInfo(aiResponse, ['说明', '简介']) || aiResponse.substring(0, 50) || productInfo.description || '精选好物，值得拥有'
      };
      
      setProductInfo(parsedInfo);

      // 🔥 重新生成装饰图，保留边框设置
      const smartImage = await generateSmartDecorativeImage({
        baseImage: productImage,
        productName: parsedInfo.name,
        origin: parsedInfo.origin,
        highlight: parsedInfo.highlight,
        description: parsedInfo.description,
        addBorder: hasBorderAdded, // 🔥 保留用户的边框选择
        borderStyle: selectedBorderStyle, // 🔥 保留边框风格
      });

      const finalImage = await addWatermark(smartImage);
      setStepOneImage(finalImage);
      setGeneratedImage(finalImage);

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: `✅ 已根据您的要求重新生成！（第${newCount}次修改${isThinkingVision ? '' : ' / 共3次'}）

📝 修改内容：
🏷️ 商品名称：${parsedInfo.name || '未识别到'}
📍 产地信息：${parsedInfo.origin || '未识别到'}
✨ 主要卖点：${parsedInfo.highlight || '未识别到'}
📝 图片说明：${parsedInfo.description || '未识别到'}

${userFeedback.includes('字') || userFeedback.includes('大小') || userFeedback.includes('位置') ? '🖌️ 样式调整已应用，系统自动调整了显示样式。\n\n' : ''}如果仍不满意，请继续告诉我需要调整的地方。`, 
          type: 'image',
          imageUrl: finalImage 
        }
      ]);

      // 清空用户反馈
      setUserFeedback('');

    } catch (error) {
      console.error('重新生成失败:', error);
      
      // 🔥 优化2：超时错误的友好提示
      const useThinkingModel = selectedModel === 'Doubao-1.5-vision-thinking-pro';
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? `⏱️ 请求超时（超过${useThinkingModel ? '90' : '30'}秒）。

💡 Thinking模型推理复杂，建议：
1. ${useThinkingModel ? '切换到普通 Doubao-vision 模型（更快）' : '稍后再试'}
2. 刷新页面后重试
3. 检查网络连接是否稳定`
        : `重新生成失败：${error instanceof Error ? error.message : '请重试'}`;
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage, type: 'text' }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* 顶部装饰条 */}
      <div className="h-1 bg-gradient-to-r from-[#FE2C55] via-[#00D4FF] to-[#FE2C55]"></div>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-[#FE2C55] to-[#00D4FF] bg-clip-text text-transparent">
          ⚡ 抖音电商素材智造
        </h1>

        {/* 模式切换 */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 inline-flex gap-2">
            <button
              onClick={() => setMode('image')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                mode === 'image'
                  ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF6B95] text-white shadow-lg shadow-[#FE2C55]/50'
                  : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🖼️ AI 图片生成
            </button>
            <button
              onClick={() => setMode('video')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                mode === 'video'
                  ? 'bg-gradient-to-r from-[#00D4FF] to-[#00A8E8] text-white shadow-lg shadow-[#00D4FF]/50'
                  : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🎬 视频生成
            </button>
          </div>
        </div>

        {/* AI 图片生成模式 */}
        {mode === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：图片上传区域 */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl backdrop-blur-sm p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <h2 className="text-xl font-semibold mb-4 text-white">📸 上传商品主图</h2>
                
                {!productImage ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg transition-colors ${
                      isDragging 
                        ? 'border-[#FE2C55] bg-[#FE2C55]/10' 
                        : 'border-white/20 bg-transparent hover:bg-white/5'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-64 cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-12 h-12 mb-3 text-[#00D4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-300">
                        <span className="font-semibold">点击上传</span> 或拖拽图片
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG (最大 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={productImage}
                      alt="商品主图"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setProductImage('')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {productImage && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-[#FE2C55]/10 to-[#00D4FF]/10 border border-[#FE2C55]/30 rounded-lg">
                    <p className="text-sm text-gray-300">✅ 图片上传成功！现在可以开始对话生成素材了。</p>
                  </div>
                )}
                
                {/* AI 模型选择 */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-white">🤖 AI 模型选择</h3>
                  <div className="space-y-2">
                    {availableModels.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          // 切换模型时重置计数（不同模型 = 新一轮）
                          setDissatisfactionCount(0);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedModel === model.id
                            ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF6B95] border-2 border-[#FE2C55]'
                            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{model.name}</span>
                              {selectedModel === model.id && (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{model.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-lg">
                    <p className="text-xs text-[#00D4FF]">
                      💡 <b>当前选择</b>：{availableModels.find(m => m.id === selectedModel)?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      不同模型适用于不同场景，pro 版本适合复杂任务，lite 版本响应更快
                    </p>
                  </div>
                </div>
              </div>
            </div>

          {/* 右侧：对话区域 */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl backdrop-blur-sm p-6 flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <h2 className="text-xl font-semibold mb-4 text-white">💬 AI 助手对话</h2>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4" style={{ minHeight: '400px' }}>
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4 font-medium">暂无对话,上传图片后开始聊天</p>
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                      {['生成商品标题', '生成商品卖点', '生成装饰宣传图'].map((text) => (
                        <button
                          key={text}
                          onClick={() => {
                            if (productImage) {
                              setInputValue(text);
                              setTimeout(() => handleSendMessage(), 100);
                            }
                          }}
                          disabled={!productImage}
                          className="px-4 py-2 bg-gradient-to-r from-[#FE2C55] to-[#FF6B95] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#FE2C55]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.type === 'image' && msg.imageUrl && (
                        <div className="mt-3">
                          <img 
                            src={msg.imageUrl} 
                            alt="生成的氛围图" 
                            className="rounded-lg max-w-full h-auto"
                          />
                          <button
                            onClick={handleDownloadImage}
                            className="mt-2 w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                          >
                            📥 下载图片
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-sm text-gray-600">
                          🧠 AI正在分析中，预计{selectedModel === 'Doubao-1.5-vision-thinking-pro' ? '60-90' : '30'}秒内完成...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 功能快捷按钮 - 每次对话后都显示 */}
                {messages.length > 0 && productImage && !isLoading && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                    <p className="text-sm text-gray-700 mb-3 font-medium">💡 您还可以尝试：</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['生成商品标题', '生成商品卖点', '生成装饰宣传图', '优化上述内容'].map((text) => (
                        <button
                          key={text}
                          onClick={() => {
                            setInputValue(text);
                            setTimeout(() => handleSendMessage(), 100);
                          }}
                          className="px-3 py-2 bg-white text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-200"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 输入框 */}
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={productImage ? '输入您的需求,或点击上方快捷按钮' : '请先上传商品图片'}
                  disabled={!productImage || isLoading}
                  className="flex-1 px-4 py-3 border border-white/20 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE2C55] disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder:text-gray-500"
                ></textarea>
                                <button
                  onClick={handleSendMessage}
                  disabled={!productImage || !inputValue.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#FE2C55] to-[#FF6B95] text-white rounded-lg hover:shadow-lg hover:shadow-[#FE2C55]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  发送
                </button>
              </div>

              {/* 🔥 新增：普通Vision模型的不满意反馈区域 - 移到对话框下方 */}
              {generatedImage && selectedModel !== 'Doubao-1.5-vision-thinking-pro' && stepOneImage && !isLoading && (
                <div className="mt-3 p-3 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg">
                  <p className="text-xs text-gray-300 mb-2 font-medium">💬 对结果不满意？请告诉我需要调整的地方：</p>
                  <textarea
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    placeholder="例如：商品名称不准确、卖点需要更突出、颜色太淡等..."
                    className="w-full px-3 py-2 border border-white/20 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-xs text-white placeholder:text-gray-500"
                    rows={2}
                  />
                  <button
                    onClick={handleDissatisfaction}
                    disabled={!userFeedback.trim()}
                    className="mt-2 w-full px-3 py-1.5 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8C00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                  >
                    🔄 重新生成 {dissatisfactionCount > 0 && `(${dissatisfactionCount}/3)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* 视频生成模式 */}
        {mode === 'video' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl backdrop-blur-sm p-6">
              <h2 className="text-2xl font-semibold mb-6 text-white">🎬 视频生成工作台</h2>

              {/* 图片上传区 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-white">📸 上传图片（最多 5 张）</h3>
                <div
                  onDragOver={handleMultipleImagesDragOver}
                  onDragEnter={handleMultipleImagesDragEnter}
                  onDragLeave={handleMultipleImagesDragLeave}
                  onDrop={handleMultipleImagesDrop}
                  className={`border-2 border-dashed rounded-lg transition-colors ${
                    isMultipleDragging 
                      ? 'border-[#00D4FF] bg-[#00D4FF]/10' 
                      : 'border-white/20 bg-transparent hover:bg-white/5'
                  }`}
                >
                  <label className="flex flex-col items-center justify-center w-full h-40 cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 mb-2 text-[#00D4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold">点击上传多张图片</span> 或拖拽
                    </p>
                    <p className="text-xs text-gray-500 mt-1">已上传 {uploadedImages.length} / 5</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImagesUpload}
                  />
                </label>
                </div>

                {/* 已上传图片预览 */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`图片 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-[#00D4FF]/30"
                        />
                        <div className="absolute top-1 right-1 bg-gradient-to-r from-[#FE2C55] to-[#FF6B95] text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                        <button
                          onClick={() => removeUploadedImage(index)}
                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 视频设置 */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⏱️ 视频时长（秒）
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-lg font-semibold text-[#FE2C55] mt-1">
                    {videoDuration} 秒
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ✨ 转场效果
                  </label>
                  <select
                    value={videoTransition}
                    onChange={(e) => setVideoTransition(e.target.value as 'fade' | 'slide' | 'none')}
                    className="w-full px-4 py-2 border border-white/20 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-white font-medium"
                  >
                    <option value="fade">淡入淡出</option>
                    <option value="slide">滑动</option>
                    <option value="none">无转场</option>
                  </select>
                </div>
              </div>

              {/* 讲解字幕设置 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white">
                    💬 讲解字幕（可选）
                  </label>
                  <button
                    onClick={() => setUseCustomCaptions(!useCustomCaptions)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      useCustomCaptions 
                        ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF6B95] text-white' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {useCustomCaptions ? '自定义字幕' : '自动生成'}
                  </button>
                </div>
                
                {useCustomCaptions ? (
                  <div className="space-y-2">
                    {uploadedImages.length === 0 ? (
                      <div className="p-3 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg">
                        <p className="text-sm text-gray-300">
                          ⚠️ 请先上传图片后再输入字幕内容
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-300 mb-2 font-medium">为每张图片输入讲解文案（每行一张）</p>
                        {Array.from({ length: uploadedImages.length }).map((_, index) => (
                          <input
                            key={index}
                            type="text"
                            placeholder={`第 ${index + 1} 张图片的讲解文案`}
                            value={videoCaptions[index] || ''}
                            onChange={(e) => {
                              const newCaptions = [...videoCaptions];
                              newCaptions[index] = e.target.value;
                              setVideoCaptions(newCaptions);
                            }}
                            className="w-full px-3 py-2 border border-white/20 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-white placeholder:text-gray-500"
                          />
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-lg">
                    <p className="text-sm text-[#00D4FF]">
                      ✨ 将自动生成默认讲解字幕，如“欢迎了解我们的产品”、“产品特点展示”等
                    </p>
                  </div>
                )}
              </div>

              {/* 配音设置 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white">
                    🎤 语音配音（可选）
                  </label>
                  <button
                    onClick={() => setEnableVoice(!enableVoice)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      enableVoice 
                        ? 'bg-gradient-to-r from-[#00D4FF] to-[#00A8E8] text-white' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {enableVoice ? '✅ 已启用' : '关闭'}
                  </button>
                </div>
                
                {enableVoice ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-300 mb-2 font-medium">选择配音音色（使用火山引擎 TTS）</p>
                    <div className="p-3 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-lg mb-3">
                      <p className="text-xs text-[#00D4FF]">
                        ✨ <strong>使用火山引擎语音合成</strong>：配音将<strong>直接录制到视频中</strong>，音色选择有效，生成的视频文件自带音频！
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          setVoiceType('male');
                          // 高级模式下自动匹配形象
                          if (useAdvancedAvatar && enableAvatar) {
                            setAvatarStyle('male');
                          }
                        }}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          voiceType === 'male'
                            ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF] font-semibold'
                            : 'border-white/20 hover:border-[#00D4FF]/50 text-gray-300'
                        }`}
                      >
                        👨 男声
                      </button>
                      <button
                        onClick={() => {
                          setVoiceType('female');
                          // 高级模式下自动匹配形象
                          if (useAdvancedAvatar && enableAvatar) {
                            setAvatarStyle('female');
                          }
                        }}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          voiceType === 'female'
                            ? 'border-[#FE2C55] bg-[#FE2C55]/10 text-[#FE2C55] font-semibold'
                            : 'border-white/20 hover:border-[#FE2C55]/50 text-gray-300'
                        }`}
                      >
                        👩 女声
                      </button>
                    </div>
                    <div className="p-3 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-lg">
                      <p className="text-sm text-[#00D4FF]">
                        ✨ 已启用 <span className="font-semibold">
                          {voiceType === 'male' && '男声（通用）'}
                          {voiceType === 'female' && '女声（通用）'}
                        </span> AI配音，将为字幕添加语音讲解
                      </p>
                      {useAdvancedAvatar && enableAvatar && (
                        <p className="text-xs text-[#FFD700] mt-2">
                          🎭 自动匹配到 <span className="font-semibold">
                            {voiceType === 'male' ? '男生' : '女生'} VRM 模型
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-sm text-gray-400">
                      🔇 当前未启用配音，视频将仅显示字幕无声音
                    </p>
                  </div>
                )}
              </div>

              {/* 虚拟形象设置 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white">
                    🤖 虚拟形象（可选）
                  </label>
                  <button
                    onClick={() => setEnableAvatar(!enableAvatar)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      enableAvatar 
                        ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF6B95] text-white' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {enableAvatar ? '✅ 已启用' : '关闭'}
                  </button>
                </div>
                
                {enableAvatar ? (
                  <div className="space-y-3">
                    {/* 顶级VRoid形象开关 */}
                    <div className="mb-3 p-3 bg-gradient-to-r from-[#FFD700]/10 to-[#FF6B00]/10 border border-[#FFD700]/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#FFD700]">⭐ 顶级 VRoid 形象</span>
                          <span className="text-xs bg-gradient-to-r from-[#FFD700] to-[#FF6B00] text-white px-2 py-0.5 rounded">男/女声</span>
                        </div>
                        <button
                          onClick={() => {
                            setUsePremiumAvatar(!usePremiumAvatar);
                            if (!usePremiumAvatar) {
                              setUseAdvancedAvatar(false); // 互斥
                            }
                          }}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            usePremiumAvatar
                              ? 'bg-[#FFD700] text-black font-bold'
                              : 'bg-white/10 text-gray-400 hover:bg-white/20'
                          }`}
                        >
                          {usePremiumAvatar ? '✅ 已启用' : '关闭'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {usePremiumAvatar 
                          ? `🎭 VRoid Studio ${voiceType === 'female' ? '女性' : '男性'}模型 + 真实表情 + 精确口型同步 + 配音动作同步` 
                          : '📌 开启后使用 VRoid Studio 创建的顶级模型（支持男/女形象，自动匹配声音）'
                        }
                      </p>
                      {usePremiumAvatar && (
                        <p className="text-xs text-[#00D4FF] mt-2 font-semibold">
                          🎵 当前形象：{voiceType === 'female' ? '👩 红裙女孩' : '👨 西装男生'}（根据{voiceType === 'female' ? '女声' : '男声'}自动匹配）
                        </p>
                      )}
                    </div>
                    
                    {/* 高级功能开关 */}
                    <div className="mb-3 p-3 bg-gradient-to-r from-[#FE2C55]/10 to-[#FFD700]/10 border border-[#FE2C55]/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#FE2C55]">🌟 高级 3D 形象</span>
                          <span className="text-xs bg-gradient-to-r from-[#FE2C55] to-[#FFD700] text-white px-2 py-0.5 rounded">VRM</span>
                        </div>
                        <button
                          onClick={() => {
                            setUseAdvancedAvatar(!useAdvancedAvatar);
                            if (!useAdvancedAvatar) setUsePremiumAvatar(false); // 互斥
                          }}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            useAdvancedAvatar
                              ? 'bg-[#FE2C55] text-white'
                              : 'bg-white/10 text-gray-400 hover:bg-white/20'
                          }`}
                        >
                          {useAdvancedAvatar ? '✅ 已启用' : '关闭'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {useAdvancedAvatar 
                          ? '🎭 使用 Q 版 3D 模型 + 智能口型同步 + 配饰环绕旋转' 
                          : '📌 开启后使用 Q 版 3D 模型（支持男/女形象）'
                        }
                      </p>
                    </div>

                    {!useAdvancedAvatar && !usePremiumAvatar && (
                      <>
                    <p className="text-xs text-gray-300 mb-2 font-medium">选择虚拟形象风格：</p>
                    <div className="grid grid-cols-4 gap-3">
                      <button
                        onClick={() => setAvatarStyle('female')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          avatarStyle === 'female'
                            ? 'border-[#FE2C55] bg-[#FE2C55]/10 text-[#FE2C55] font-semibold'
                            : 'border-white/20 hover:border-[#FE2C55]/50 text-gray-300'
                        }`}
                      >
                        👩 女生
                      </button>
                      <button
                        onClick={() => setAvatarStyle('male')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          avatarStyle === 'male'
                            ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF] font-semibold'
                            : 'border-white/20 hover:border-[#00D4FF]/50 text-gray-300'
                        }`}
                      >
                        👨 男生
                      </button>
                      <button
                        onClick={() => setAvatarStyle('robot')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          avatarStyle === 'robot'
                            ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00] font-semibold'
                            : 'border-white/20 hover:border-[#FF6B00]/50 text-gray-300'
                        }`}
                      >
                        🤖 机器人
                      </button>
                      <button
                        onClick={() => setAvatarStyle('cute')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          avatarStyle === 'cute'
                            ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700] font-semibold'
                            : 'border-white/20 hover:border-[#FFD700]/50 text-gray-300'
                        }`}
                      >
                        🐱 猫咪
                      </button>
                    </div>
                    
                    {!useAdvancedAvatar && !usePremiumAvatar && (
                      <>
                    <p className="text-xs text-gray-300 mb-2 font-medium mt-3">形象位置：</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setAvatarPosition('bottom-left')}
                        className={`px-4 py-2 rounded-lg border-2 transition-all text-xs ${
                          avatarPosition === 'bottom-left'
                            ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF] font-semibold'
                            : 'border-white/20 hover:border-[#00D4FF]/50 text-gray-300'
                        }`}
                      >
                        ↙️ 左下角
                      </button>
                      <button
                        onClick={() => setAvatarPosition('bottom-right')}
                        className={`px-4 py-2 rounded-lg border-2 transition-all text-xs ${
                          avatarPosition === 'bottom-right'
                            ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF] font-semibold'
                            : 'border-white/20 hover:border-[#00D4FF]/50 text-gray-300'
                        }`}
                      >
                        ↘️ 右下角
                      </button>
                      <button
                        onClick={() => setAvatarPosition('top-right')}
                        className={`px-4 py-2 rounded-lg border-2 transition-all text-xs ${
                          avatarPosition === 'top-right'
                            ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF] font-semibold'
                            : 'border-white/20 hover:border-[#00D4FF]/50 text-gray-300'
                        }`}
                      >
                        ↗️ 右上角
                      </button>
                    </div>
                      </>
                    )}
                    
                    <div className="p-3 bg-[#FE2C55]/10 border border-[#FE2C55]/30 rounded-lg mt-3">
                      <p className="text-sm text-[#FE2C55]">
                        ✨ 已启用 <span className="font-semibold">
                          {usePremiumAvatar && (voiceType === 'female' ? '👩 顶级VRoid女性形象' : '👨 顶级VRoid男性形象')}
                          {useAdvancedAvatar && !usePremiumAvatar && (avatarStyle === 'female' ? '中国风女娃娃' : '男生Q版') + ' VRM'}
                          {!useAdvancedAvatar && !usePremiumAvatar && (
                            <>
                              {avatarStyle === 'female' && '女生形象'}
                              {avatarStyle === 'male' && '男生形象'}
                              {avatarStyle === 'robot' && '机器人形象'}
                              {avatarStyle === 'cute' && '可爱猫咚'}
                            </>
                          )}
                        </span> 虚拟形象，将显示在视频
                        {!useAdvancedAvatar && !usePremiumAvatar && (avatarPosition === 'bottom-left' ? '左下角' : avatarPosition === 'bottom-right' ? '右下角' : '右上角')}
                        {(useAdvancedAvatar || usePremiumAvatar) && '右上角'}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        💡 当启用配音时，形象会在“说话”时有动画效果
                      </p>
                    </div>
                      </>
                    )}
                    
                    {useAdvancedAvatar && (
                      <div className="p-3 bg-gradient-to-r from-[#FFD700]/10 to-[#FE2C55]/10 border border-[#FFD700]/30 rounded-lg">
                        <p className="text-sm text-[#FFD700]">
                          🎭 已启用 <span className="font-semibold">
                            {avatarStyle === 'female' ? '中国风女娃娃' : '男生Q版'} VRM
                          </span> 3D 模型
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          ✨ 支持智能口型同步 + 配饰环绕旋转 + 多层次动画
                        </p>
                        <p className="text-xs text-[#FFD700] mt-2 font-semibold">
                          📍 默认显示位置：右上角
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-sm text-gray-400">
                      👤 当前未启用虚拟形象
                    </p>
                  </div>
                )}
              </div>

              {/* 生成按钮 */}
              <button
                onClick={handleGenerateVideo}
                disabled={uploadedImages.length === 0 || isGeneratingVideo}
                className="w-full py-4 bg-gradient-to-r from-[#00D4FF] to-[#00A8E8] text-white text-lg font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                {isGeneratingVideo ? '🔄 正在生成视频...' : '🎬 生成视频'}
              </button>

              {/* 视频预览 */}
              {generatedVideoUrl && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-white">✅ 视频预览</h3>
                  <video
                    src={generatedVideoUrl}
                    controls
                    className="w-full rounded-lg border-2 border-[#00D4FF]/30"
                  />
                  <button
                    onClick={handleDownloadVideo}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-[#00D4FF] to-[#00A8E8] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/50 transition-all"
                  >
                    📥 下载视频
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 装饰模式选择对话框 */}
      {showDecorativeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-white/20 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4 text-white">🎨 选择装饰模式</h3>
            <p className="text-gray-400 mb-6">请选择您想要的图片装饰模式</p>

            {/* 两种模式选择 */}
            <div className="space-y-4 mb-6">
              {/* 普通装饰 */}
              <div
                onClick={handleNormalDecorative}
                className="border-2 border-white/20 rounded-lg p-6 cursor-pointer hover:border-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎨</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">普通装饰</h4>
                    <p className="text-sm text-gray-400">快速添加促销徽章、贴纸、价格标签等常规装饰元素</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs bg-[#00D4FF]/20 text-[#00D4FF] px-2 py-1 rounded">快速生成</span>
                      <span className="text-xs bg-[#00D4FF]/20 text-[#00D4FF] px-2 py-1 rounded">100+贴纸</span>
                      <span className="text-xs bg-[#FE2C55]/20 text-[#FE2C55] px-2 py-1 rounded">促销风格</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 高级定制 */}
              <div
                onClick={handleAdvancedDecorative}
                className="border-2 border-white/20 rounded-lg p-6 cursor-pointer hover:border-[#FE2C55] hover:bg-[#FE2C55]/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">✨</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">高级定制 <span className="text-xs bg-gradient-to-r from-[#FE2C55] to-[#FF6B95] text-white px-2 py-1 rounded ml-2">AI驱动</span></h4>
                    <p className="text-sm text-gray-400">AI智能分析商品信息，生成带文字说明的装饰图，可选边框风格</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs bg-[#FE2C55]/20 text-[#FE2C55] px-2 py-1 rounded">AI提取信息</span>
                      <span className="text-xs bg-[#FF6B00]/20 text-[#FF6B00] px-2 py-1 rounded">文字装饰</span>
                      <span className="text-xs bg-[#00D4FF]/20 text-[#00D4FF] px-2 py-1 rounded">边框选择</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 取消按钮 */}
            <button
              onClick={() => setShowDecorativeDialog(false)}
              className="w-full px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 边框选择对话框 */}
      {showBorderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-white/20 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4 text-white">🖌️ 选择边框风格</h3>
            <p className="text-gray-400 mb-6">请选择您想要的边框风格</p>

            {/* 三种边框选择 */}
            <div className="space-y-4 mb-6">
              {/* 简约边框 */}
              <div
                onClick={() => setSelectedBorderStyle('simple')}
                className={`border-2 rounded-lg p-6 cursor-pointer hover:border-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all ${
                  selectedBorderStyle === 'simple' ? 'border-[#00D4FF] bg-[#00D4FF]/10' : 'border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔲</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">简约边框</h4>
                    <p className="text-sm text-gray-400">简洁大方的四角边框</p>
                  </div>
                </div>
              </div>

              {/* 国潮边框 */}
              <div
                onClick={() => setSelectedBorderStyle('guochao')}
                className={`border-2 rounded-lg p-6 cursor-pointer hover:border-[#FE2C55] hover:bg-[#FE2C55]/10 transition-all ${
                  selectedBorderStyle === 'guochao' ? 'border-[#FE2C55] bg-[#FE2C55]/10' : 'border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏮</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">国潮边框</h4>
                    <p className="text-sm text-gray-400">充满中国风的边框装饰</p>
                  </div>
                </div>
              </div>

              {/* 渐变边框 */}
              <div
                onClick={() => setSelectedBorderStyle('gradient')}
                className={`border-2 rounded-lg p-6 cursor-pointer hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all ${
                  selectedBorderStyle === 'gradient' ? 'border-[#FF6B00] bg-[#FF6B00]/10' : 'border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🌈</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">渐变边框</h4>
                    <p className="text-sm text-gray-400">绚丽多彩的渐变效果</p>
                  </div>
                </div>
              </div>

              {/* 豪华边框 */}
              <div
                onClick={() => setSelectedBorderStyle('luxury')}
                className={`border-2 rounded-lg p-6 cursor-pointer hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all ${
                  selectedBorderStyle === 'luxury' ? 'border-[#FFD700] bg-[#FFD700]/10' : 'border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💎</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">豪华边框</h4>
                    <p className="text-sm text-gray-400">奢华精致的边框装饰</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleSkipBorder}
                className="flex-1 px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
              >
                不需要，直接完成
              </button>
              <button
                onClick={handleAddBorder}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FE2C55] to-[#FF6B95] text-white rounded-lg hover:shadow-lg hover:shadow-[#FE2C55]/50 transition-all"
              >
                ✅ 添加边框
              </button>
            </div>

            {/* 不满意反馈区域 */}
            <div className="pt-4 border-t border-white/20">
              <p className="text-sm text-gray-300 mb-3">💬 对结果不满意？请告诉我需要调整的地方：</p>
              <textarea
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="例如：商品名称不准确、卖点需要更突出、颜色太淡等..."
                className="w-full px-3 py-2 border border-white/20 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE2C55] text-sm text-white placeholder:text-gray-500"
                rows={3}
              />
              <button
                onClick={handleDissatisfaction}
                disabled={!userFeedback.trim()}
                className="mt-3 w-full px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8C00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                🔄 重新生成 {selectedModel !== 'Doubao-1.5-vision-thinking-pro' && dissatisfactionCount > 0 && `(${dissatisfactionCount}/3)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 升级模型提示对话框 */}
      {showUpgradeDialog && (
        <div className="fixed bottom-6 right-6 bg-[#1a1a1a] border-2 border-[#FE2C55] rounded-xl shadow-2xl p-6 max-w-md z-50 animate-bounce">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🧠</div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-2">升级到更强大的AI模型？</h4>
              <p className="text-sm text-gray-300 mb-4">
                当前使用 <span className="font-semibold text-[#00D4FF]">{selectedModel === 'Doubao-1.5-vision-pro' ? 'Doubao-vision' : selectedModel}</span> 模型。<br/>
                升级到 <span className="font-semibold text-[#FE2C55]">Doubao-thinking-vision</span> 思维链模型，可以：
              </p>
              <ul className="text-sm text-gray-300 mb-4 space-y-1">
                <li>✨ 更深入分析商品特点</li>
                <li>📝 提供更详细的产品信息</li>
                <li>🎨 生成更精美的装饰效果</li>
                <li>💎 自动添加豪华边框</li>
                <li>♾️ 无限次修改，直到满意</li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelUpgrade}
                  className="flex-1 px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors text-sm"
                >
                  不用了
                </button>
                <button
                  onClick={handleUpgradeModel}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm font-semibold"
                >
                  🚀 立即升级
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}