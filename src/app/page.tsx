'use client';

import { useState } from 'react';
import { addWatermark, generateDecorativeImage } from '@/lib/canvas/imageGenerator';
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
  
  // 功能模式：'image' 或 'video'
  const [mode, setMode] = useState<'image' | 'video'>('image');
  
  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [isMultipleDragging, setIsMultipleDragging] = useState(false);
  
  // AI 模型配置
  const [selectedModel, setSelectedModel] = useState<string>('Doubao-1.5-pro-32k');
  
  // 可用的豆包模型列表
  const availableModels = [
    { id: 'Doubao-1.5-pro-32k', name: 'Doubao-1.5-pro-32k', description: '高性能版本，适合复杂任务' },
    { id: 'Doubao-1.5-pro-4k', name: 'Doubao-1.5-pro-4k', description: '标准版本，快速响应' },
    { id: 'Doubao-lite-32k', name: 'Doubao-lite-32k', description: '轻量版本，经济实惠' },
    { id: 'Doubao-lite-4k', name: 'Doubao-lite-4k', description: '基础版本，快速处理' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductImage(event.target?.result as string);
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !productImage) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          productImage,
          history: messages,
          model: selectedModel, // 传递选择的模型
        }),
      });

      const data = await response.json();
      
      // 判断是否需要生成装饰图
      if (inputValue.includes('装饰图') || inputValue.includes('宣传图') || inputValue.includes('贴图')) {
        // 生成装饰性电商宣传图
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `🎨 正在生成装饰性宣传图...`, type: 'text' }
        ]);

        try {
          const decorativeImage = await generateDecorativeImage({
            baseImage: productImage,
            productInfo: data.content,
            style: 'promotional',
            addStickers: true,
            addBadges: true,
            addPriceTag: true,
          });

          const finalImage = await addWatermark(decorativeImage);
          setGeneratedImage(finalImage);

          setMessages((prev) => [
            ...prev.slice(0, -1),
            { 
              role: 'assistant', 
              content: `✅ 装饰宣传图生成成功！\n\n已添加多种装饰元素提升宣传效果。`, 
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
      } else {
        // 普通文字回复
        setMessages((prev) => [...prev, { role: 'assistant', content: data.content, type: 'text' }]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，生成素材时出现错误，请重试。', type: 'text' },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-900">
          🎨 电商商品素材智能生成工具
        </h1>

        {/* 模式切换 */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-2 inline-flex gap-2">
            <button
              onClick={() => setMode('image')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                mode === 'image'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🖼️ AI 图片生成
            </button>
            <button
              onClick={() => setMode('video')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                mode === 'video'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">📸 上传商品主图</h2>
                
                {!productImage ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg transition-colors ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-100' 
                        : 'border-indigo-300 bg-white hover:bg-indigo-50'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-64 cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-12 h-12 mb-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">点击上传</span> 或拖拽图片
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG (最大 10MB)</p>
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
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">✅ 图片上传成功！现在可以开始对话生成素材了。</p>
                  </div>
                )}
                
                {/* AI 模型选择 */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">🤖 AI 模型选择</h3>
                  <div className="space-y-2">
                    {availableModels.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedModel === model.id
                            ? 'bg-indigo-100 border-2 border-indigo-500'
                            : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">{model.name}</span>
                              {selectedModel === model.id && (
                                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡 <b>当前选择</b>：{availableModels.find(m => m.id === selectedModel)?.name}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      不同模型适用于不同场景，pro 版本适合复杂任务，lite 版本响应更快
                    </p>
                  </div>
                </div>
              </div>
            </div>

          {/* 右侧：对话区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-[600px]">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">💬 AI 助手对话</h2>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4 font-medium">暂无对话,上传图片后开始聊天</p>
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
                          className="px-4 py-2 bg-indigo-100 text-indigo-800 font-medium rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={productImage ? '输入您的需求,或点击上方快捷按钮' : '请先上传商品图片'}
                  disabled={!productImage || isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 placeholder:text-gray-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!productImage || !inputValue.trim() || isLoading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* 视频生成模式 */}
        {mode === 'video' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">🎬 视频生成工作台</h2>

              {/* 图片上传区 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">📸 上传图片（最多 5 张）</h3>
                <div
                  onDragOver={handleMultipleImagesDragOver}
                  onDragEnter={handleMultipleImagesDragEnter}
                  onDragLeave={handleMultipleImagesDragLeave}
                  onDrop={handleMultipleImagesDrop}
                  className={`border-2 border-dashed rounded-lg transition-colors ${
                    isMultipleDragging 
                      ? 'border-indigo-500 bg-indigo-100' 
                      : 'border-indigo-300 bg-white hover:bg-indigo-50'
                  }`}
                >
                  <label className="flex flex-col items-center justify-center w-full h-40 cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 mb-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">点击上传多张图片</span> 或拖拽
                    </p>
                    <p className="text-xs text-gray-400 mt-1">已上传 {uploadedImages.length} / 5</p>
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
                          className="w-full h-32 object-cover rounded-lg border-2 border-indigo-200"
                        />
                        <div className="absolute top-1 right-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
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
                  <div className="text-center text-lg font-semibold text-indigo-600 mt-1">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 font-medium"
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
                  <label className="block text-sm font-medium text-gray-700">
                    💬 讲解字幕（可选）
                  </label>
                  <button
                    onClick={() => setUseCustomCaptions(!useCustomCaptions)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      useCustomCaptions 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {useCustomCaptions ? '自定义字幕' : '自动生成'}
                  </button>
                </div>
                
                {useCustomCaptions ? (
                  <div className="space-y-2">
                    {uploadedImages.length === 0 ? (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700">
                          ⚠️ 请先上传图片后再输入字幕内容
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-600 mb-2 font-medium">为每张图片输入讲解文案（每行一张）</p>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder:text-gray-500"
                          />
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      ✨ 将自动生成默认讲解字幕，如“欢迎了解我们的产品”、“产品特点展示”等
                    </p>
                  </div>
                )}
              </div>

              {/* 生成按钮 */}
              <button
                onClick={handleGenerateVideo}
                disabled={uploadedImages.length === 0 || isGeneratingVideo}
                className="w-full py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                {isGeneratingVideo ? '🔄 正在生成视频...' : '🎬 生成视频'}
              </button>

              {/* 视频预览 */}
              {generatedVideoUrl && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">✅ 视频预览</h3>
                  <video
                    src={generatedVideoUrl}
                    controls
                    className="w-full rounded-lg border-2 border-indigo-200"
                  />
                  <button
                    onClick={handleDownloadVideo}
                    className="mt-4 w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📥 下载视频
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
