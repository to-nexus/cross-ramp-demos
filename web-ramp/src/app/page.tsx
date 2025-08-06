'use client';

import { useState, useEffect } from 'react';
import { CrossRampButton } from '../components/CrossRampButton';
import { LanguageToggle } from '../components/LanguageToggle';
import { PongGame } from '../components/PongGame';
import { useLanguage } from '../contexts/LanguageContext';

export default function SampleGamePage() {
  const { t } = useLanguage();
  const [gameSize, setGameSize] = useState({ width: 600, height: 400 });
  const projectId = process.env.NEXT_PUBLIC_CROSS_PROJECT_ID || 'nexus-ramp-v1';
  
  // 데모앱에서만 토큰 2종을 정의 (최초 정의)
  // 이 토큰들은 램프앱으로 전달되어 세션 인증에 사용됩니다
  const [tokens] = useState(() => {
    const timestamp = Date.now();
    return {
      accessToken: `demo-access-${timestamp}`, // 데모 액세스 토큰
      sessionId: `demo-session-${timestamp}`   // 데모 세션 ID
    };
  });

  useEffect(() => {
    const updateGameSize = () => {
      // Calculate available width considering actual padding
      const padding = window.innerWidth < 640 ? 24 : window.innerWidth < 1024 ? 32 : 64; // px-3=24, px-4=32, lg:px-8=64
      const availableWidth = window.innerWidth - padding;
      const containerWidth = Math.min(availableWidth, 600); // max 600px, but never exceed available space
      
      if (containerWidth < 600) {
        const height = Math.round(containerWidth * (400 / 600)); // maintain aspect ratio
        setGameSize({ width: containerWidth, height });
      } else {
        setGameSize({ width: 600, height: 400 });
      }
    };

    updateGameSize();
    window.addEventListener('resize', updateGameSize);
    return () => window.removeEventListener('resize', updateGameSize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 relative z-50">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-base sm:text-lg md:text-2xl">🎮</span>
              </div>
              <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white">{t('game.title')}</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              <LanguageToggle />
              <CrossRampButton 
                projectId={projectId} 
                accessToken={tokens.accessToken}
                sessionId={tokens.sessionId}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Game Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-white/20">
            <div className="flex items-center justify-between sm:justify-between">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm sm:text-lg md:text-xl">⚽</span>
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm text-gray-300">{t('stats.balls')}</span>
              </div>
              <span className="text-xs sm:text-base md:text-lg lg:text-xl font-bold text-white">1,250</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-white/20">
            <div className="flex items-center justify-between sm:justify-between">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm sm:text-lg md:text-xl">💎</span>
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm text-gray-300">{t('stats.gems')}</span>
              </div>
              <span className="text-xs sm:text-base md:text-lg lg:text-xl font-bold text-white">85</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-white/20">
            <div className="flex items-center justify-between sm:justify-between">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm sm:text-lg md:text-xl">⚡</span>
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm text-gray-300">{t('stats.energy')}</span>
              </div>
              <span className="text-xs sm:text-base md:text-lg lg:text-xl font-bold text-white">120/150</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10">
          <div className="text-center">
            <p className="text-gray-300 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
              {t('welcome.description')}
            </p>
            
            {/* Pong Game */}
            <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
              <div className="w-full flex justify-center">
                <PongGame 
                  width={gameSize.width} 
                  height={gameSize.height} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 sm:mt-8 bg-blue-900/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{t('instructions.title')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-semibold text-blue-300 mb-1 sm:mb-2 text-sm sm:text-base">{t('instructions.step1.title')}</h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                {t('instructions.step1.desc')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-1 sm:mb-2 text-sm sm:text-base">{t('instructions.step2.title')}</h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                {t('instructions.step2.desc')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-1 sm:mb-2 text-sm sm:text-base">{t('instructions.step3.title')}</h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                {t('instructions.step3.desc')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-1 sm:mb-2 text-sm sm:text-base">{t('instructions.step4.title')}</h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                {t('instructions.step4.desc')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 