/**
 * 文字转语音（TTS）服务
 * 使用浏览器原生 Web Speech API 实现免费语音合成
 */

/**
 * 支持的音色类型
 */
export type VoiceType = 'male' | 'female' | 'child';

/**
 * TTS 配置选项
 */
interface TTSOptions {
  voice: VoiceType;        // 音色类型
  rate?: number;           // 语速 (0.1 - 10, 默认 1)
  pitch?: number;          // 音调 (0 - 2, 默认 1)
  volume?: number;         // 音量 (0 - 1, 默认 1)
}

/**
 * 生成语音文件（使用 Web Speech API）
 * 
 * @param text - 要转换的文字内容
 * @param options - TTS配置选项
 * @returns Promise<Blob> - 音频Blob对象
 * 
 * @example
 * ```typescript
 * // 生成女声音频
 * const audioBlob = await generateVoice('欢迎了解我们的产品', { voice: 'female' });
 * 
 * // 生成快速男声
 * const audioBlob = await generateVoice('这是产品介绍', { 
 *   voice: 'male', 
 *   rate: 1.2 
 * });
 * ```
 */
export async function generateVoice(
  text: string,
  options: TTSOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 检查浏览器支持
      if (!('speechSynthesis' in window)) {
        throw new Error('浏览器不支持 Web Speech API');
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // 设置音色参数
      utterance.lang = 'zh-CN';
      utterance.rate = options.rate || 0.9; // 语速，稍慢一点更清晰
      utterance.pitch = options.pitch || (options.voice === 'child' ? 1.5 : 1); // 童声音调高
      utterance.volume = options.volume || 1;
      
      // 选择音色（根据类型选择合适的音色）
      const voices = speechSynthesis.getVoices();
      const voiceFilter = {
        male: (v: SpeechSynthesisVoice) => 
          v.lang.includes('zh') && (v.name.includes('Male') || v.name.includes('男') || v.name.includes('Yunxi')),
        female: (v: SpeechSynthesisVoice) => 
          v.lang.includes('zh') && (v.name.includes('Female') || v.name.includes('女') || v.name.includes('Xiaoxiao')),
        child: (v: SpeechSynthesisVoice) => 
          v.lang.includes('zh') && v.name.includes('小') // 童声通常带"小"字
      };
      
      const selectedVoice = voices.find(voiceFilter[options.voice]) || voices.find(v => v.lang.includes('zh')) || voices[0];
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // 监听语音合成事件
      utterance.onend = () => {
        // Web Speech API 不直接返回音频数据，这里返回空 Blob
        // 实际配音通过 speechSynthesis.speak() 播放
        resolve(new Blob([], { type: 'audio/wav' }));
      };

      utterance.onerror = (event) => {
        reject(new Error(`语音合成失败: ${event.error}`));
      };

      // 开始语音合成
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('TTS生成失败:', error);
      reject(new Error(`语音生成失败: ${error instanceof Error ? error.message : '未知错误'}`));
    }
  });
}



/**
 * 批量生成多段字幕的语音（顺序播放）
 * 
 * @param captions - 字幕文本数组
 * @param voice - 音色类型
 * @param onProgress - 进度回调
 * 
 * @example
 * ```typescript
 * const captions = [
 *   '欢迎了解我们的产品',
 *   '产品特点展示',
 *   '感谢观看'
 * ];
 * await speakCaptions(captions, 'female', (index) => {
 *   console.log(`正在播放第 ${index + 1} 条字幕`);
 * });
 * ```
 */
export async function speakCaptions(
  captions: string[],
  voice: VoiceType,
  options?: Partial<TTSOptions>,
  onProgress?: (index: number) => void
): Promise<void> {
  // 清空之前的语音
  speechSynthesis.cancel();
  
  for (let i = 0; i < captions.length; i++) {
    if (onProgress) onProgress(i);
    await generateVoice(captions[i], { voice, ...options });
    // 等待上一条播放完成
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}



/**
 * 获取所有可用的音色列表
 * 
 * @returns 音色信息数组
 */
export function getAvailableVoices() {
  const voices = speechSynthesis.getVoices();
  const chineseVoices = voices.filter(v => v.lang.includes('zh'));
  
  return chineseVoices.map(v => ({
    name: v.name,
    lang: v.lang,
    default: v.default,
    localService: v.localService,
  }));
}

