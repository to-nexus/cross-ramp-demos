'use client';

import { useEffect, useRef, useState } from 'react';
import { useCrossRampStore } from '../stores/useCrossRampStore';
import { useLanguage } from '../contexts/LanguageContext';

interface PongGameProps {
  width?: number;
  height?: number;
}

export function PongGame({ width = 600, height = 400 }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused'>('playing');
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [winMessage, setWinMessage] = useState<{ show: boolean; text: string; color: string }>({ show: false, text: '', color: '' });
  const [manualResume, setManualResume] = useState(false); // Manual resume state

  // Cross ramp store
  const isCrossRampOpen = useCrossRampStore((state) => state.isOpen);
  
  // Language context
  const { t } = useLanguage();

  // Auto pause when cross ramp opens, but allow manual resume
  useEffect(() => {
    if (isCrossRampOpen && !manualResume) {
      setGameState('paused');
    } else if (!isCrossRampOpen) {
      setGameState('playing');
      setManualResume(false); // Reset manual resume when ramp closes
    }
  }, [isCrossRampOpen, manualResume]);

  // Game state
  const ball = useRef({ x: width / 2, y: height / 2, dx: 6, dy: 4, radius: 8 });
  const leftPaddle = useRef({ x: 20, y: height / 2 - 40, width: 10, height: 80 });
  const rightPaddle = useRef({ x: width - 30, y: height / 2 - 40, width: 10, height: 80 });
  const speedMultiplier = useRef(1);
  const waitingForReset = useRef(false);
  const ballSpawnEffect = useRef({ active: true, scale: 3, alpha: 0.3 });

  // Update game objects when dimensions change
  useEffect(() => {
    // Update ball position
    ball.current.x = width / 2;
    ball.current.y = height / 2;
    
    // Update paddle positions
    leftPaddle.current.x = 20;
    leftPaddle.current.y = height / 2 - 40;
    rightPaddle.current.x = width - 30;
    rightPaddle.current.y = height / 2 - 40;
  }, [width, height]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      if (gameState === 'paused') {
        // Don't draw anything when paused (freeze screen)
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Update ball - only if not in spawn effect
      if (!ballSpawnEffect.current.active) {
        ball.current.x += ball.current.dx * speedMultiplier.current;
        ball.current.y += ball.current.dy * speedMultiplier.current;
      }

      // Ball collision with walls
      if (ball.current.y <= ball.current.radius || ball.current.y >= height - ball.current.radius) {
        ball.current.dy = -ball.current.dy;
      }

      // Ball collision with paddles
      if (ball.current.x <= leftPaddle.current.x + leftPaddle.current.width && 
          ball.current.y >= leftPaddle.current.y && 
          ball.current.y <= leftPaddle.current.y + leftPaddle.current.height &&
          ball.current.x >= leftPaddle.current.x) {
        ball.current.dx = -ball.current.dx;
        const collisionPoint = (ball.current.y - leftPaddle.current.y) / leftPaddle.current.height;
        ball.current.dy = (collisionPoint - 0.5) * 4;
        speedMultiplier.current += 0.02;
      }

      if (ball.current.x >= rightPaddle.current.x - ball.current.radius && 
          ball.current.y >= rightPaddle.current.y && 
          ball.current.y <= rightPaddle.current.y + rightPaddle.current.height &&
          ball.current.x <= rightPaddle.current.x + rightPaddle.current.width) {
        ball.current.dx = -ball.current.dx;
        const collisionPoint = (ball.current.y - rightPaddle.current.y) / rightPaddle.current.height;
        ball.current.dy = (collisionPoint - 0.5) * 4;
        speedMultiplier.current += 0.02;
      }

      // Score points - only when not waiting for reset
      if (!waitingForReset.current) {
        if (ball.current.x < 0) {
          // Right player (computer) wins
          waitingForReset.current = true;
          setScore(prev => ({ ...prev, right: prev.right + 1 }));
          setWinMessage({ show: true, text: t('game.computer_win'), color: '#4ecdc4' });
          
          setTimeout(() => {
            setWinMessage({ show: false, text: '', color: '' });
            ball.current.x = width / 2;
            ball.current.y = height / 2;
            ball.current.dx = 6;
            ball.current.dy = 4;
            speedMultiplier.current = 1;
            waitingForReset.current = false;
            // Start spawn effect after win message disappears
            ballSpawnEffect.current = { active: true, scale: 3, alpha: 0.3 };
          }, 500);
        }

        if (ball.current.x > width) {
          // Left player (human) wins
          waitingForReset.current = true;
          setScore(prev => ({ ...prev, left: prev.left + 1 }));
          setWinMessage({ show: true, text: t('game.player_win'), color: '#ff6b6b' });
          
          setTimeout(() => {
            setWinMessage({ show: false, text: '', color: '' });
            ball.current.x = width / 2;
            ball.current.y = height / 2;
            ball.current.dx = -6;
            ball.current.dy = 4;
            speedMultiplier.current = 1;
            waitingForReset.current = false;
            // Start spawn effect after win message disappears
            ballSpawnEffect.current = { active: true, scale: 3, alpha: 0.3 };
          }, 500);
        }
      }

      // Update spawn effect
      if (ballSpawnEffect.current.active) {
        ballSpawnEffect.current.scale -= 0.1; // Black hole shrinks very quickly
        ballSpawnEffect.current.alpha += 0.05; // Gradually becomes more opaque
        
        if (ballSpawnEffect.current.scale <= 0.1) {
          ballSpawnEffect.current = { active: false, scale: 1, alpha: 1 };
        }
      }

      // Update AI paddle - balanced difficulty
      if (Math.random() > 0.4) {
        const paddleCenter = rightPaddle.current.y + rightPaddle.current.height / 2;
        const ballCenter = ball.current.y;
        
        const randomOffset = (Math.random() - 0.5) * 20;
        
        if (paddleCenter < ballCenter - 15 + randomOffset) {
          rightPaddle.current.y = Math.min(rightPaddle.current.y + 2.5, height - rightPaddle.current.height);
        } else if (paddleCenter > ballCenter + 15 + randomOffset) {
          rightPaddle.current.y = Math.max(rightPaddle.current.y - 2.5, 0);
        }
      }

      // Draw ball with spawn effect
      const effect = ballSpawnEffect.current;
      const ballRadius = ball.current.radius * effect.scale;
      const ballAlpha = effect.active ? effect.alpha : 1;
      
      ctx.save();
      ctx.globalAlpha = ballAlpha;
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(ball.current.x, ball.current.y, ballRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect during spawn
      if (effect.active) {
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(ball.current.x, ball.current.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Draw paddles
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(leftPaddle.current.x, leftPaddle.current.y, leftPaddle.current.width, leftPaddle.current.height);
      
      ctx.fillStyle = '#4ecdc4';
      ctx.fillRect(rightPaddle.current.x, rightPaddle.current.y, rightPaddle.current.width, rightPaddle.current.height);

      // Draw player/computer text (same color as paddle)
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff6b6b'; // Left paddle color
      ctx.fillText(t('game.player'), width / 4, 30);
      ctx.fillStyle = '#4ecdc4'; // Right paddle color
      ctx.fillText(t('game.computer'), (width * 3) / 4, 30);
      // Draw scores (white)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '32px Arial';
      ctx.fillText(score.left.toString(), width / 4, 75);
      ctx.fillText(score.right.toString(), (width * 3) / 4, 75);

      // Draw win message
      if (winMessage.show) {
        ctx.fillStyle = winMessage.color || '#ff6b6b';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(winMessage.text, width / 2, height / 2);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [width, height, gameState, score, winMessage, t]);

  // Mouse and Touch control
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleY = height / rect.height;
      const mouseY = (e.clientY - rect.top) * scaleY;
      
      leftPaddle.current.y = Math.max(0, Math.min(height - leftPaddle.current.height, mouseY - leftPaddle.current.height / 2));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canvasRef.current) return;
      e.preventDefault(); // Prevent scrolling
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleY = height / rect.height;
      const touch = e.touches[0];
      const touchY = (touch.clientY - rect.top) * scaleY;
      
      leftPaddle.current.y = Math.max(0, Math.min(height - leftPaddle.current.height, touchY - leftPaddle.current.height / 2));
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!canvasRef.current) return;
      e.preventDefault(); // Prevent scrolling
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleY = height / rect.height;
      const touch = e.touches[0];
      const touchY = (touch.clientY - rect.top) * scaleY;
      
      leftPaddle.current.y = Math.max(0, Math.min(height - leftPaddle.current.height, touchY - leftPaddle.current.height / 2));
    };

    const canvas = canvasRef.current;
    if (canvas) {
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove);
      
      // Touch events on canvas only
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [height]);

  return (
    <div className="flex flex-col items-center">
      <div style={{ position: 'relative', width, height }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border-2 border-white/20 rounded-lg bg-black/30"
          style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%', maxHeight: '100%' }}
        />
        {gameState === 'paused' && (
          <>
            {/* Blur overlay */}
            <div
              className="absolute inset-0 z-10"
              style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            />
            {/* Pause message */}
            <div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none select-none"
            >
              <span className="text-3xl font-bold text-blue-300 drop-shadow-lg bg-transparent px-6 py-3 rounded-xl">
                {t('game.paused')}
              </span>
            </div>
          </>
        )}
      </div>
      <div className="mt-4 flex gap-4">
        <button
          onClick={() => {
            const newState = gameState === 'playing' ? 'paused' : 'playing';
            setGameState(newState);
            
            // If resuming while ramp is open, set manual resume flag
            if (newState === 'playing' && isCrossRampOpen) {
              setManualResume(true);
            }
          }}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          {gameState === 'playing' ? t('game.pause') : t('game.resume')}
        </button>
        <button
          onClick={() => {
            setScore({ left: 0, right: 0 });
            setWinMessage({ show: false, text: '', color: '' });
            ball.current = { x: width / 2, y: height / 2, dx: 6, dy: 4, radius: 8 };
            speedMultiplier.current = 1;
            waitingForReset.current = false;
            ballSpawnEffect.current = { active: true, scale: 3, alpha: 0.3 };
          }}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          {t('game.reset')}
        </button>
      </div>
      <p className="text-sm text-gray-400 mt-2 text-center">
        <span className="hidden sm:inline">{t('game.mouse_control')}</span>
        <span className="sm:hidden">{t('game.touch_control')}</span>
      </p>
    </div>
  );
} 