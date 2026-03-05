"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import wordData from '@/data/words.json';

export default function Home() {
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [userGuess, setUserGuess] = useState<string>("")
  const [scrambledWord, setScrambledWord] = useState<string>("")
  const [originalWord, setOriginalWord] = useState<string>("")
  const [hint, setHint] = useState<string>("")
  const [showHint, setShowHint] = useState<boolean>(false)
  const [attempts, setAttempts] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  function scrambleWord(word: string) {
    let letters = word.toLowerCase().split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join("");
  }

  function getDailyWord() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + 
                 (today.getMonth() + 1) * 100 + 
                 today.getDate();
    
    function seededRandom(seed: number) {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }
    
    const index = Math.floor(seededRandom(seed) * wordData.length);
    return wordData[index];
  }

  useEffect(() => {
    setTimeout(() => {
      const dailyWord = getDailyWord();
      setOriginalWord(dailyWord.word);
      setHint(dailyWord.hint);
      setScrambledWord(scrambleWord(dailyWord.word));
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSubmit = () => {
    setAttempts(prev => prev + 1);
    
    if (userGuess.toLowerCase() === originalWord) {
      setIsCorrect(true);
      setFeedback("🎉 Correct! Amazing job!");
    } else {
      setFeedback(`❌ Not quite. Try again! (Attempt: ${attempts + 1})`);
    }
    setUserGuess("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCorrect && userGuess.trim()) {
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6"></div>
        <p className="text-white text-2xl font-light animate-pulse">Preparing today's challenge...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 relative overflow-hidden">
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto pt-12 relative z-10">
        
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-[40px] shadow-2xl p-8 md:p-12 border border-white/30">
          
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="flex flex-wrap justify-center gap-3 mb-6">
              <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent animate-fade-in [animation-delay:100ms]">
                Daily
              </span>
              <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent animate-fade-in [animation-delay:200ms]">
                Word
              </span>
              <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent animate-fade-in [animation-delay:300ms]">
                Scramble
              </span>
            </h1>
            
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg animate-pulse">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="font-medium">{todayDate}</span>
            </div>
          </div>

          {/* Game Area */}
          <div className="space-y-8">
            
            {/* Scrambled Word */}
            <div className="text-center">
              <h2 className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-6 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-semibold">
                🌟 Unscramble this word 🌟
              </h2>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 perspective-1000">
                {scrambledWord.split('').map((letter, index) => (
                  <span
                    key={index}
                    className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl md:text-4xl font-bold rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30 animate-pop-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>

            {/* Input Section */}
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your guess"
                  disabled={isCorrect}
                  className={`flex-1 px-6 py-4 text-lg border-3 rounded-xl outline-none transition-all duration-300
                    ${isCorrect 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-200 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-200'
                    }
                    ${!isCorrect && 'hover:border-purple-300'}
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                  `}
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={isCorrect || !userGuess.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  <span>Submit</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`p-4 rounded-xl font-medium animate-slide-down
                  ${isCorrect 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : 'bg-red-100 text-red-700 border-2 border-red-300'
                  }`}
                >
                  {feedback}
                </div>
              )}
            </div>

            {/* Hint Section */}
            <div className="text-center">
              <button
                onClick={() => setShowHint(!showHint)}
                disabled={isCorrect}
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all duration-300
                  ${showHint 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg' 
                    : 'border-3 border-dashed border-purple-400 text-purple-600 hover:bg-purple-50'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 9c0-3.5 3-6 6-6s6 2.5 6 6c0 2.5-1.5 4.5-3 6l-3 3v2"></path>
                  <circle cx="15" cy="20" r="1"></circle>
                  <line x1="9" y1="18" x2="9" y2="22"></line>
                  <line x1="9" y1="15" x2="9" y2="18"></line>
                </svg>
                {showHint ? 'Hide Hint' : 'Need a Hint?'}
              </button>

              {showHint && (
                <div className="mt-6 animate-fade-scale">
                  <div className="relative inline-block max-w-lg">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-purple-400"></div>
                    <div className="bg-white border-3 border-purple-400 rounded-2xl p-6 shadow-xl">
                      <p className="text-gray-700 text-lg">{hint}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Success Animation */}
            {isCorrect && (
              <div className="relative mt-8">
                {/* Confetti */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-6 animate-confetti"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: '-20px',
                        animationDelay: `${Math.random() * 2}s`,
                        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                        transform: `rotate(${Math.random() * 360}deg)`
                      }}
                    ></div>
                  ))}
                </div>

                {/* Success Card */}
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-8 rounded-3xl shadow-2xl text-center relative animate-bounce-in">
                  <div className="text-6xl mb-4 animate-spin-slow">🏆</div>
                  <h2 className="text-3xl font-bold mb-2">You did it!</h2>
                  <p className="text-xl mb-2">You solved today's challenge in {attempts} {attempts === 1 ? 'try' : 'tries'}!</p>
                  <p className="text-lg opacity-90 bg-white/20 inline-block px-4 py-2 rounded-full">Come back tomorrow for a new word</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/90 text-lg mb-3">✨ Challenge your friends ✨</p>
          <button className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white border-2 border-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share Challenge
          </button>
        </div>

        {/* Signature */}
        <div className="mt-6 text-center text-white/60 text-sm">
          Created with ❤️ by Shreya Dhoke
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes popIn {
          0% { transform: scale(0) rotate(-180deg); }
          80% { transform: scale(1.1) rotate(10deg); }
          100% { transform: scale(1) rotate(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
        
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pop-in {
          animation: popIn 0.4s ease-out forwards;
        }
        
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-fade-scale {
          animation: fadeScale 0.3s ease-out;
        }
        
        .animate-confetti {
          animation: confetti 3s ease-in-out infinite;
        }
        
        .animate-bounce-in {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}