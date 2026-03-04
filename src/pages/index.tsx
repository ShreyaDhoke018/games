"use client"

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const games = [
    {
      id: 'numberGuess',
      title: 'Number Guessing Game',
      description: 'Guess the secret number between 1-100 with only 3 chances!',
      icon: '🔢',
      color: 'from-purple-600 to-blue-600',
      path: '/numberGuess'
    },
    {
      id: 'rockPaperScissors',
      title: 'Rock Paper Scissors',
      description: 'Battle against the computer in this classic hand game!',
      icon: '🪨📄✂️',
      color: 'from-violet-600 to-fuchsia-600',
      path: '/game2'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-4xl border border-white/20">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">🎮 Game Arcade</h1>
          <p className="text-xl text-purple-200">Choose your game and start playing!</p>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {games.map((game) => (
            <div
              key={game.id}
              className="relative group cursor-pointer"
              onClick={() => router.push(game.path)}
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${game.color} rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 ${hoveredGame === game.id ? 'animate-pulse' : ''}`}></div>
              
              {/* Game Card */}
              <div className="relative bg-white rounded-2xl p-8 h-full transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                
                {/* Icon */}
                <div className="text-7xl mb-6 text-center">{game.icon}</div>
                
                {/* Title */}
                <h2 className={`text-3xl font-bold text-center mb-4 bg-gradient-to-r ${game.color} text-transparent bg-clip-text`}>
                  {game.title}
                </h2>
                
                {/* Description */}
                <p className="text-gray-600 text-center mb-6 text-lg">
                  {game.description}
                </p>
                
                {/* Play Button */}
                <div className="text-center">
                  <button
                    className={`bg-gradient-to-r ${game.color} text-white px-8 py-3 rounded-full font-semibold text-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl`}
                  >
                    Play Now →
                  </button>
                </div>

                {/* Features */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-center gap-4 text-sm text-gray-500">
                    {game.id === 'numberGuess' ? (
                      <>
                        <span>🎯 3 Chances</span>
                        <span>🔢 1-100</span>
                        <span>💡 Hints</span>
                      </>
                    ) : (
                      <>
                        <span>⚔️ VS Computer</span>
                        <span>🏆 Best of 3</span>
                        <span>🎮 Classic</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm mb-6">
          <div className="grid grid-cols-3 gap-4 text-center text-white">
            <div>
              <p className="text-3xl font-bold">2</p>
              <p className="text-sm opacity-80">Total Games</p>
            </div>
            <div>
              <p className="text-3xl font-bold">🎮</p>
              <p className="text-sm opacity-80">Fun Guaranteed</p>
            </div>
            <div>
              <p className="text-3xl font-bold">✨</p>
              <p className="text-sm opacity-80">Free to Play</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/60 text-sm">
          <p>Click on any game card to start playing!</p>
        </div>

        {/* Your Signature Footer */}
        <div className="mt-6 pt-4 border-t border-white/20 text-center text-sm text-white/60">
          Created with ❤️ by Shreya Dhoke
        </div>
      </div>
    </div>
  );
}