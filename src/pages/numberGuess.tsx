"use client"

import { useEffect, useState } from "react";

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function NumberGuess() {
  const [generatedNumber, setGeneratedNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [chance, setChance] = useState<number>(3);
  const [msg, setMsg] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [guessedNumbers, setGuessedNumbers] = useState<number[]>([]);
  const [won, setWon] = useState<boolean>(false);

  useEffect(() => {
    startNewGame();
  }, []);

  function startNewGame() {
    const number = getRandomInt(1, 100);
    console.log(number); // For testing - remove in production
    setGeneratedNumber(number);
    setChance(3);
    setGuess("");
    setMsg("");
    setGameOver(false);
    setWon(false);
    setGuessedNumbers([]);
  }

  function checkAnswer(currentGuess: number) {
    if (won || gameOver) return;

    // Check if already guessed
    if (guessedNumbers.includes(currentGuess)) {
      setMsg("You already guessed that number!");
      return;
    }

    // Add to guessed numbers
    setGuessedNumbers([...guessedNumbers, currentGuess]);

    if (currentGuess === generatedNumber) {
      setMsg("🎉 Good guess! You won!");
      setWon(true);
      setGameOver(true);
    } else {
      const remainingChances = chance - 1;
      
      if (currentGuess < generatedNumber) {
        setMsg("📉 Too low! Try again.");
      } else if (currentGuess > generatedNumber) {
        setMsg("📈 Too high! Try again.");
      }

      if (remainingChances === 0) {
        setMsg(`😢 Game over! The number was ${generatedNumber}`);
        setGameOver(true);
      } else {
        setChance(remainingChances);
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numGuess = parseInt(guess);
    
    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      setMsg("⚠️ Please enter a valid number between 1-100");
      return;
    }
    
    checkAnswer(numGuess);
    setGuess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Number Guessing Game</h1>
          <p className="text-gray-600">Guess the number between 1-100</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">Chances Left</p>
            <p className="text-3xl font-bold text-blue-700">{chance}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-600 font-medium">Attempts</p>
            <p className="text-3xl font-bold text-purple-700">{guessedNumbers.length}</p>
          </div>
        </div>

        {/* Game Area */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={gameOver}
              min="1"
              max="100"
              placeholder="Enter your guess"
              className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 
                ${gameOver 
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                  : 'border-purple-300 focus:border-purple-500 focus:ring-purple-200'
                }`}
            />
            <button
              type="submit"
              disabled={gameOver}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-all
                ${gameOver 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 active:transform active:scale-95'
                }`}
            >
              Guess
            </button>
          </div>
        </form>

        {/* Message */}
        {msg && (
          <div className={`mb-6 p-4 rounded-lg text-center font-semibold animate-pulse
            ${msg.includes('🎉') ? 'bg-green-100 text-green-700' : 
              msg.includes('😢') ? 'bg-red-100 text-red-700' : 
              'bg-blue-100 text-blue-700'}`}
          >
            {msg}
          </div>
        )}

        {/* Previous Guesses */}
        {guessedNumbers.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Previous guesses:</p>
            <div className="flex flex-wrap gap-2">
              {guessedNumbers.map((num, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium
                    ${num === generatedNumber && !won
                      ? 'bg-green-200 text-green-800'
                      : num < generatedNumber
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-orange-200 text-orange-800'
                    }`}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Game Over Controls */}
        {gameOver && (
          <div className="space-y-3">
            <button
              onClick={startNewGame}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all active:transform active:scale-95"
            >
              Play Again
            </button>
            
            {/* Reveal the number if game over and didn't win */}
            {!won && (
              <p className="text-center text-gray-600 text-sm">
                The number was: <span className="font-bold text-purple-600">{generatedNumber}</span>
              </p>
            )}
          </div>
        )}

        {/* Hint System */}
        {!gameOver && guessedNumbers.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center border-t pt-4">
            {guessedNumbers[guessedNumbers.length - 1] < generatedNumber ? 
              "📝 Hint: Try a higher number!" : 
              guessedNumbers[guessedNumbers.length - 1] > generatedNumber ?
              "📝 Hint: Try a lower number!" :
              "🎯 You're getting closer!"}
          </div>
        )}

        {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            Created with ❤️ by Shreya Dhoke
          </div>
      </div>
    </div>
  );
}