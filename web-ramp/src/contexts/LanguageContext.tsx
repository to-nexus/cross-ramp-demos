'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'zh' | 'zh-Hant' | 'ko';

// Browser language detection and localStorage management utilities
const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'zh-Hant', 'ko'];
const DEFAULT_LANGUAGE: Language = 'en';
const LANGUAGE_STORAGE_KEY = 'preferred-language';

/**
 * Maps locale codes from DApp to supported languages
 * @param localeCode - Language-country code (e.g., 'en-US', 'zh-TW', 'zh-CN')
 * @returns Supported language code
 */
function mapLocaleToLanguage(localeCode: string): Language {
  const lower = localeCode.toLowerCase();
  
  // English variants → en
  if (lower.startsWith('en')) {
    return 'en';
  }
  
  // Traditional Chinese regions → zh-Hant
  const traditionalChineseRegions = ['zh-tw', 'zh-hk', 'zh-mo', 'zh-hant'];
  if (traditionalChineseRegions.some(region => lower.startsWith(region))) {
    return 'zh-Hant';
  }
  
  // All other Chinese variants → zh (Simplified)
  if (lower.startsWith('zh')) {
    return 'zh';
  }
  
  // Korean variants → ko
  if (lower.startsWith('ko')) {
    return 'ko';
  }
  
  // Default fallback
  return 'en';
}

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const browserLanguages = [
    navigator.language,
    ...(navigator.languages || [])
  ];

  for (const browserLang of browserLanguages) {
    const mappedLang = mapLocaleToLanguage(browserLang);
    if (SUPPORTED_LANGUAGES.includes(mappedLang)) {
      return mappedLang;
    }
  }

  return DEFAULT_LANGUAGE;
}

function getStoredLanguage(): Language | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
      return stored as Language;
    }
  } catch (error) {
    // console.warn('Failed to read language from localStorage:', error);
  }

  return null;
}

function setStoredLanguage(language: Language): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    // console.warn('Failed to save language to localStorage:', error);
  }
}

function getPreferredLanguage(): Language {
  const stored = getStoredLanguage();
  if (stored) {
    return stored;
  }
  return detectBrowserLanguage();
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  en: {
    'game.title': 'Pong Game',
    'game.paused': 'Game Paused',
    'game.player_win': 'Player Win!',
    'game.computer_win': 'Computer Win!',
    'game.player': 'Player',
    'game.computer': 'Computer',
    'game.pause': 'Pause',
    'game.resume': 'Resume',
    'game.reset': 'Reset',
    'game.mouse_control': 'Move your mouse to control the left paddle',
    'game.touch_control': 'Touch the game area to control the left paddle',
    'stats.balls': 'Balls',
    'stats.gems': 'Gems',
    'stats.energy': 'Energy',
    'welcome.title': 'Welcome to Sample Game!',
    'welcome.description': 'This is a sample web game that demonstrates CROSS RAMP integration. Click the CROSS RAMP button in the top right corner to exchange your game assets for blockchain tokens.',
    'welcome.ready': 'Ready to explore the world of Web3 gaming!',
    'button.play': '🎯 Play Game',
    'button.shop': '🏪 Shop',
    'instructions.title': 'How to Test CROSS RAMP',
    'instructions.step1.title': '1. Start CROSS RAMP Server',
    'instructions.step1.desc': `Make sure the CROSS RAMP server is running on ramp.crosstoken.io/demo`,
    'instructions.step2.title': '2. Click CROSS RAMP Button',
    'instructions.step2.desc': 'Click the CROSS RAMP button in the top right corner to open the exchange catalog',
    'instructions.step3.title': '3. Test Exchange Flow',
    'instructions.step3.desc': 'Try exchanging game assets for tokens and vice versa',
    'instructions.step4.title': '4. Test Popup Integration',
    'instructions.step4.desc': 'Verify that the popup integration works properly and closes correctly',
    'popup.blocked': 'Popup blocked. Please disable popup blocker and try again.',
    'language.en': 'English',
    'language.zh': '中文',
    'language.ko': '한국어',
  },
  zh: {
    'game.title': '乒乓球游戏',
    'game.paused': '游戏暂停',
    'game.player_win': '玩家胜利！',
    'game.computer_win': '电脑胜利！',
    'game.player': '玩家',
    'game.computer': '电脑',
    'game.pause': '暂停',
    'game.resume': '继续',
    'game.reset': '重置',
    'game.mouse_control': '移动鼠标控制左侧球拍',
    'game.touch_control': '触摸游戏区域控制左侧球拍',
    'stats.balls': '球',
    'stats.gems': '宝石',
    'stats.energy': '能量',
    'welcome.title': '欢迎来到示例游戏！',
    'welcome.description': '这是一个演示 CROSS RAMP 集成的示例网页游戏。点击右上角的 CROSS RAMP 按钮，将您的游戏资产兑换为区块链代币。',
    'welcome.ready': '准备探索 Web3 游戏世界！',
    'button.play': '🎯 开始游戏',
    'button.shop': '🏪 商店',
    'instructions.title': '如何测试 CROSS RAMP',
    'instructions.step1.title': '1. 启动 CROSS RAMP 服务器',
    'instructions.step1.desc': `确保 CROSS RAMP 服务器在 localhost:${process.env.NEXT_PUBLIC_RAMP_PORT || '8282'} 上运行`,
    'instructions.step2.title': '2. 点击 CROSS RAMP 按钮',
    'instructions.step2.desc': '点击右上角的 CROSS RAMP 按钮打开兑换目录',
    'instructions.step3.title': '3. 测试兑换流程',
    'instructions.step3.desc': '尝试将游戏资产兑换为代币，反之亦然',
    'instructions.step4.title': '4. 测试弹窗集成',
    'instructions.step4.desc': '验证弹窗集成是否正常工作并正确关闭',
    'popup.blocked': '弹窗被阻止。请禁用弹窗阻止器并重试。',
    'language.en': 'English',
    'language.zh': '中文',
    'language.ko': '한국어',
  },
  'zh-Hant': {
    'game.title': '乒乓球遊戲',
    'game.paused': '遊戲暫停',
    'game.player_win': '玩家勝利！',
    'game.computer_win': '電腦勝利！',
    'game.player': '玩家',
    'game.computer': '電腦',
    'game.pause': '暫停',
    'game.resume': '繼續',
    'game.reset': '重置',
    'game.mouse_control': '移動滑鼠控制左側球拍',
    'game.touch_control': '觸摸遊戲區域控制左側球拍',
    'stats.balls': '球',
    'stats.gems': '寶石',
    'stats.energy': '能量',
    'welcome.title': '歡迎來到範例遊戲！',
    'welcome.description': '這是一個演示 CROSS RAMP 整合的範例網頁遊戲。點擊右上角的 CROSS RAMP 按鈕，將您的遊戲資產兌換為區塊鏈代幣。',
    'welcome.ready': '準備探索 Web3 遊戲世界！',
    'button.play': '🎯 開始遊戲',
    'button.shop': '🏪 商店',
    'instructions.title': '如何測試 CROSS RAMP',
    'instructions.step1.title': '1. 啟動 CROSS RAMP 伺服器',
    'instructions.step1.desc': `確保 CROSS RAMP 伺服器在 ramp.crosstoken.io/demo 上運行`,
    'instructions.step2.title': '2. 點擊 CROSS RAMP 按鈕',
    'instructions.step2.desc': '點擊右上角的 CROSS RAMP 按鈕打開兌換目錄',
    'instructions.step3.title': '3. 測試兌換流程',
    'instructions.step3.desc': '嘗試將遊戲資產兌換為代幣，反之亦然',
    'instructions.step4.title': '4. 測試彈窗整合',
    'instructions.step4.desc': '驗證彈窗整合是否正常工作並正確關閉',
    'popup.blocked': '彈窗被阻止。請停用彈窗阻止器並重試。',
    'language.en': 'English',
    'language.zh': '中文',
    'language.ko': '한국어',
  },
  ko: {
    'game.title': '퐁 게임',
    'game.paused': '게임 일시정지',
    'game.player_win': '플레이어 승리!',
    'game.computer_win': '컴퓨터 승리!',
    'game.player': '플레이어',
    'game.computer': '컴퓨터',
    'game.pause': '일시정지',
    'game.resume': '재개',
    'game.reset': '초기화',
    'game.mouse_control': '마우스를 사용하여 왼쪽 패들을 제어하세요',
    'game.touch_control': '게임 영역을 터치하여 왼쪽 패들을 제어하세요',
    'stats.balls': '볼',
    'stats.gems': '보석',
    'stats.energy': '에너지',
    'welcome.title': '샘플 게임에 오신 것을 환영합니다!',
    'welcome.description': '이것은 CROSS RAMP 통합을 시연하는 샘플 웹 게임입니다. 우측 상단의 CROSS RAMP 버튼을 클릭하여 게임 자산을 블록체인 토큰으로 교환하세요.',
    'welcome.ready': 'Web3 게임의 세계를 탐험할 준비가 되었습니다!',
    'button.play': '🎯 게임 시작',
    'button.shop': '🏪 상점',
    'instructions.title': 'CROSS RAMP 테스트 방법',
    'instructions.step1.title': '1. CROSS RAMP 서버 시작',
    'instructions.step1.desc': `CROSS RAMP 서버가 ramp.crosstoken.io/demo에서 실행 중인지 확인하세요`,
    'instructions.step2.title': '2. CROSS RAMP 버튼 클릭',
    'instructions.step2.desc': '우측 상단의 CROSS RAMP 버튼을 클릭하여 교환 카탈로그를 엽니다',
    'instructions.step3.title': '3. 교환 플로우 테스트',
    'instructions.step3.desc': '게임 자산을 토큰으로 교환하고 그 반대도 시도해보세요',
    'instructions.step4.title': '4. 팝업 통합 테스트',
    'instructions.step4.desc': '팝업 통합이 제대로 작동하고 올바르게 닫히는지 확인하세요',
    'popup.blocked': '팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.',
    'language.en': 'English',
    'language.zh': '中文',
    'language.ko': '한국어',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Detect stored language or browser language on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && ['en', 'ko', 'zh', 'zh-Hant'].includes(savedLanguage)) {
          setLanguage(savedLanguage as Language);
        }
      } catch (error) {
        // localStorage access failed - ignore and use default
      }
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('language', lang);
      } catch (error) {
        // localStorage write failed - ignore
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 