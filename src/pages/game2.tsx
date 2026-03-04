"use client"
import React, { useEffect, useState } from 'react'

type Props = {}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function Game2({}: Props) {
  const [userSelection, setUserSelection] = useState<string>("")
  const [generatedSelection, setGeneratedSelection] = useState<string>("")
  const [msg, setMsg] = useState<string>("");
  const [userScore, setUserScore] = useState<number>(0)
  const [computerScore, setComputerScore] = useState<number>(0)
  const [maxScore] = useState<number>(3);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showComputerChoice, setShowComputerChoice] = useState<boolean>(false);
  const [roundActive, setRoundActive] = useState<boolean>(false);

  const options = ["Rock", "Paper", "Scissors"]

  // Emoji mapping
  const emojis: Record<string, string> = {
    "Rock": "🪨",
    "Paper": "📄",
    "Scissors": "✂️"
  }

  // Color mapping - more vibrant colors
  const colors: Record<string, string> = {
    "Rock": "from-gray-600 to-gray-700",
    "Paper": "from-blue-600 to-indigo-700",
    "Scissors": "from-amber-500 to-orange-600"
  }

  // Background colors for selected state
  const bgColors: Record<string, string> = {
    "Rock": "bg-gradient-to-br from-gray-100 to-gray-200",
    "Paper": "bg-gradient-to-br from-blue-100 to-indigo-200",
    "Scissors": "bg-gradient-to-br from-amber-100 to-orange-200"
  }

  useEffect(() => {
    if (computerScore === maxScore || userScore === maxScore) {
      setGameOver(true)
      if (userScore > computerScore) {
        setMsg("🎉 YOU WON THE GAME! 🎉")
      } else {
        setMsg("💻 COMPUTER WON THE GAME! 💻")
      }
    }
  }, [computerScore, userScore, maxScore])

  const handlePlay = () => {
    if (!userSelection) {
      setMsg("⚠️ Please select Rock, Paper, or Scissors first!")
      return
    }
    
    // Generate computer choice
    const number = getRandomInt(0, 2)
    const selection = options[number]
    setGeneratedSelection(selection)
    setShowComputerChoice(true)
    setRoundActive(true)
  }

  useEffect(() => {
    if (!roundActive || !userSelection || !generatedSelection) return

    // Determine winner
    if (userSelection === "Rock" && generatedSelection === "Rock") {
      setMsg("🤝 Tie!! Try again")
    } else if (userSelection === "Paper" && generatedSelection === "Paper") {
      setMsg("🤝 Tie!! Try again")
    } else if (userSelection === "Scissors" && generatedSelection === "Scissors") {
      setMsg("🤝 Tie!! Try again")
    } else if (userSelection === "Rock" && generatedSelection === "Scissors") {
      setUserScore(u => u + 1)
      setMsg("🎉 You win! Rock crushes Scissors!")
    } else if (userSelection === "Paper" && generatedSelection === "Rock") {
      setUserScore(u => u + 1)
      setMsg("🎉 You win! Paper covers Rock!")
    } else if (userSelection === "Scissors" && generatedSelection === "Paper") {
      setUserScore(u => u + 1)
      setMsg("🎉 You win! Scissors cut Paper!")
    } else if (userSelection === "Scissors" && generatedSelection === "Rock") {
      setComputerScore(u => u + 1)
      setMsg("💻 Computer wins! Rock crushes Scissors!")
    } else if (userSelection === "Rock" && generatedSelection === "Paper") {
      setComputerScore(u => u + 1)
      setMsg("💻 Computer wins! Paper covers Rock!")
    } else if (userSelection === "Paper" && generatedSelection === "Scissors") {
      setComputerScore(u => u + 1)
      setMsg("💻 Computer wins! Scissors cut Paper!")
    }

    // Auto hide computer choice after 5 seconds (increased timer)
    const timer = setTimeout(() => {
      setShowComputerChoice(false)
      setRoundActive(false)
      setGeneratedSelection("")
      setMsg("")
    }, 3000)

    return () => clearTimeout(timer)
  }, [roundActive, generatedSelection])

  const resetGame = () => {
    setGameOver(false)
    setComputerScore(0)
    setUserScore(0)
    setMsg("")
    setUserSelection("")
    setGeneratedSelection("")
    setShowComputerChoice(false)
    setRoundActive(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text mb-2">
            Rock Paper Scissors
          </h1>
          <p className="text-gray-600 text-lg">First to {maxScore} points wins!</p>
        </div>

        {/* Score Board */}
        <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-2 gap-8 text-center">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-sm text-violet-600 font-medium">YOU</p>
              <p className="text-5xl font-bold text-violet-700">{userScore}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-sm text-fuchsia-600 font-medium">COMPUTER</p>
              <p className="text-5xl font-bold text-fuchsia-700">{computerScore}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/50 h-3 rounded-full mt-4">
            <div 
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((userScore + computerScore) / (maxScore * 2)) * 100}%` }}
            ></div>
          </div>
        </div>

        {!gameOver ? (
          <>
            {/* Selection Area */}
            <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">CHOOSE YOUR WEAPON</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setUserSelection(option)
                      setMsg("")
                    }}
                    className={`
                      p-4 rounded-xl text-white font-bold text-lg shadow-lg
                      bg-gradient-to-r ${colors[option]}
                      transform transition-all duration-200
                      ${userSelection === option 
                        ? 'ring-4 ring-violet-400 scale-105 shadow-xl' 
                        : 'opacity-90 hover:opacity-100 hover:scale-105 hover:shadow-xl'
                      }
                    `}
                  >
                    <div className="text-3xl mb-2">{emojis[option]}</div>
                    {option}
                  </button>
                ))}
              </div>

              {/* Play Button */}
              <button
                onClick={handlePlay}
                disabled={!userSelection || roundActive}
                className={`
                  w-full py-4 rounded-xl font-bold text-xl text-white shadow-lg
                  transition-all active:transform active:scale-95
                  ${!userSelection || roundActive
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl'
                  }
                `}
              >
                {!userSelection 
                  ? "👆 SELECT AN OPTION FIRST" 
                  : roundActive 
                  ? "⚔️ BATTLE IN PROGRESS..." 
                  : "⚔️ PLAY ROUND"}
              </button>
            </div>

            {/* Battle Arena - Only shows when round is active */}
            {showComputerChoice && generatedSelection && (
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl border-2 border-violet-200 animate-fade-in">
                <h2 className="text-2xl font-bold text-center mb-4">
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text">
                    ⚔️ BATTLE ARENA ⚔️
                  </span>
                </h2>
                
                <div className="grid grid-cols-2 gap-8">
                  {/* Player Choice */}
                  <div className="text-center">
                    <p className="text-gray-600 font-medium mb-2">YOU</p>
                    <div className={`${bgColors[userSelection]} p-6 rounded-xl shadow-lg border-2 border-violet-200`}>
                      <span className="text-7xl">{emojis[userSelection]}</span>
                      <p className="text-gray-800 font-bold text-xl mt-3">{userSelection}</p>
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="flex items-center justify-center">
                    <span className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text animate-pulse">
                      VS
                    </span>
                  </div>

                  {/* Computer Choice */}
                  <div className="text-center">
                    <p className="text-gray-600 font-medium mb-2">COMPUTER</p>
                    <div className={`${bgColors[generatedSelection]} p-6 rounded-xl shadow-lg border-2 border-fuchsia-200`}>
                      <span className="text-7xl">{emojis[generatedSelection]}</span>
                      <p className="text-gray-800 font-bold text-xl mt-3">{generatedSelection}</p>
                    </div>
                  </div>
                </div>

                {/* Result Message */}
                {msg && (
                  <div className={`mt-6 p-4 rounded-xl text-center font-bold text-lg shadow-md
                    ${msg.includes('🎉') ? 'bg-green-100 text-green-700 border-2 border-green-300' : 
                      msg.includes('💻') ? 'bg-red-100 text-red-700 border-2 border-red-300' : 
                      'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'}`}
                  >
                    {msg}
                  </div>
                )}
              </div>
            )}

            {/* Waiting Message */}
            {!showComputerChoice && userSelection && !roundActive && (
              <div className="text-center p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl">
                <p className="text-gray-600 text-lg">✨ Ready to battle! Click "PLAY ROUND" to fight! ✨</p>
              </div>
            )}
          </>
        ) : (
          /* Game Over Screen */
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-2xl p-8">
              <span className="text-7xl block mb-4">
                {userScore > computerScore ? "🏆" : "💻"}
              </span>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{msg}</h2>
              <p className="text-xl text-gray-600 mb-6">
                Final Score: You {userScore} - {computerScore} Computer
              </p>
            </div>
            
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all active:transform active:scale-95 shadow-lg w-full"
            >
              🔄 PLAY AGAIN 🔄
            </button>
          </div>
        )}

        {/* Footer - Your requested footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          Created with ❤️ by Shreya Dhoke
        </div>
      </div>

      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}