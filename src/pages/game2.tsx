// Game2.tsx
"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react'

type Props = {}

type GameMode = 'single' | 'multi' | null;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function Game2({}: Props) {
  // Game state
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [userSelection, setUserSelection] = useState<string>("")
  const [generatedSelection, setGeneratedSelection] = useState<string>("")
  const [msg, setMsg] = useState<string>("");
  const [userScore, setUserScore] = useState<number>(0)
  const [computerScore, setComputerScore] = useState<number>(0)
  const [maxScore] = useState<number>(3);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showComputerChoice, setShowComputerChoice] = useState<boolean>(false);
  const [roundActive, setRoundActive] = useState<boolean>(false);
  
  // Multiplayer state
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const [isHost, setIsHost] = useState<boolean>(false);
  const [playersInRoom, setPlayersInRoom] = useState<number>(0);
  const [opponentMove, setOpponentMove] = useState<string>("");
  const [playerNumber, setPlayerNumber] = useState<number>(1);
  const [waitingForOpponent, setWaitingForOpponent] = useState<boolean>(false);
  const [multiplayerScores, setMultiplayerScores] = useState({ player1: 0, player2: 0 });

  const options = ["Rock", "Paper", "Scissors"]

  // Emoji and color mappings
  const emojis: Record<string, string> = {
    "Rock": "🪨",
    "Paper": "📄",
    "Scissors": "✂️"
  }

  const colors: Record<string, string> = {
    "Rock": "from-gray-600 to-gray-700",
    "Paper": "from-blue-600 to-indigo-700",
    "Scissors": "from-amber-500 to-orange-600"
  }

  const bgColors: Record<string, string> = {
    "Rock": "bg-gradient-to-br from-gray-100 to-gray-200",
    "Paper": "bg-gradient-to-br from-blue-100 to-indigo-200",
    "Scissors": "bg-gradient-to-br from-amber-100 to-orange-200"
  }

  // WebSocket connection
  useEffect(() => {
    if (gameMode === 'multi') {
      const websocket = new WebSocket('ws://localhost:8080');
      
      websocket.onopen = () => {
        console.log('Connected to WebSocket server');
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      websocket.onclose = () => {
        console.log('Disconnected from WebSocket server');
        setMsg("⚠️ Disconnected from server");
      };

      setWs(websocket);

      return () => {
        websocket.close();
      };
    }
  }, [gameMode]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'ROOM_CREATED':
        setRoomId(data.roomId);
        setIsHost(data.isHost);
        setMsg(`🎮 Room created! ID: ${data.roomId}`);
        break;

      case 'GAME_READY':
        setPlayersInRoom(data.players);
        setIsHost(data.isHost);
        setRoomId(data.roomId);
        setPlayerNumber(data.isHost ? 1 : 2);
        setMsg("🎮 Game ready! Both players connected!");
        setWaitingForOpponent(false);
        break;

      case 'OPPONENT_MOVED':
        setMsg("👀 Opponent has made their move! Waiting for you...");
        break;

      case 'ROUND_RESULT':
        setGeneratedSelection(data.move2);
        setOpponentMove(data.move2);
        setShowComputerChoice(true);
        setRoundActive(true);
        
        setMultiplayerScores(data.scores);
        
        if (data.gameOver) {
          setGameOver(true);
          if (data.winner === `player${playerNumber}`) {
            setMsg("🎉 YOU WON THE GAME! 🎉");
          } else {
            setMsg("💻 OPPONENT WON THE GAME! 💻");
          }
        } else {
          setMsg(data.message);
        }

        // Auto hide after 3 seconds
        setTimeout(() => {
          setShowComputerChoice(false);
          setRoundActive(false);
          setGeneratedSelection("");
          setOpponentMove("");
          setUserSelection("");
        }, 3000);
        break;

      case 'GAME_RESET':
        setMultiplayerScores({ player1: 0, player2: 0 });
        setGameOver(false);
        setShowComputerChoice(false);
        setRoundActive(false);
        setUserSelection("");
        setGeneratedSelection("");
        setOpponentMove("");
        setMsg("Game reset! Ready to play!");
        break;

      case 'PLAYER_DISCONNECTED':
        setMsg("⚠️ Opponent disconnected");
        setGameMode(null);
        break;

      case 'ERROR':
        setMsg(`❌ ${data.message}`);
        break;

      default:
        console.log('Unknown message:', data);
    }
  };

  // Single player game logic
  useEffect(() => {
    if (gameMode === 'single') {
      if (computerScore === maxScore || userScore === maxScore) {
        setGameOver(true);
        if (userScore > computerScore) {
          setMsg("🎉 YOU WON THE GAME! 🎉");
        } else {
          setMsg("💻 COMPUTER WON THE GAME! 💻");
        }
      }
    }
  }, [computerScore, userScore, maxScore, gameMode]);

  useEffect(() => {
    if (gameMode !== 'single') return;
    if (!roundActive || !userSelection || !generatedSelection) return;

    // Single player game logic
    if (userSelection === "Rock" && generatedSelection === "Rock") {
      setMsg("🤝 Tie!! Try again");
    } else if (userSelection === "Paper" && generatedSelection === "Paper") {
      setMsg("🤝 Tie!! Try again");
    } else if (userSelection === "Scissors" && generatedSelection === "Scissors") {
      setMsg("🤝 Tie!! Try again");
    } else if (userSelection === "Rock" && generatedSelection === "Scissors") {
      setUserScore(u => u + 1);
      setMsg("🎉 You win! Rock crushes Scissors!");
    } else if (userSelection === "Paper" && generatedSelection === "Rock") {
      setUserScore(u => u + 1);
      setMsg("🎉 You win! Paper covers Rock!");
    } else if (userSelection === "Scissors" && generatedSelection === "Paper") {
      setUserScore(u => u + 1);
      setMsg("🎉 You win! Scissors cut Paper!");
    } else if (userSelection === "Scissors" && generatedSelection === "Rock") {
      setComputerScore(u => u + 1);
      setMsg("💻 Computer wins! Rock crushes Scissors!");
    } else if (userSelection === "Rock" && generatedSelection === "Paper") {
      setComputerScore(u => u + 1);
      setMsg("💻 Computer wins! Paper covers Rock!");
    } else if (userSelection === "Paper" && generatedSelection === "Scissors") {
      setComputerScore(u => u + 1);
      setMsg("💻 Computer wins! Scissors cut Paper!");
    }

    const timer = setTimeout(() => {
      setShowComputerChoice(false);
      setRoundActive(false);
      setGeneratedSelection("");
      setMsg("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [roundActive, generatedSelection, gameMode, userSelection]);

  const handlePlay = () => {
    if (gameMode === 'single') {
      if (!userSelection) {
        setMsg("⚠️ Please select Rock, Paper, or Scissors first!");
        return;
      }
      
      const number = getRandomInt(0, 2);
      const selection = options[number];
      setGeneratedSelection(selection);
      setShowComputerChoice(true);
      setRoundActive(true);
    }
  };

  const handleMultiplayerMove = () => {
    if (!userSelection) {
      setMsg("⚠️ Please select Rock, Paper, or Scissors first!");
      return;
    }

    if (ws && roomId) {
      ws.send(JSON.stringify({
        type: 'PLAYER_MOVE',
        roomId,
        move: userSelection
      }));
      setWaitingForOpponent(true);
      setMsg("✅ Move sent! Waiting for opponent...");
    }
  };

  const createRoom = () => {
    if (ws) {
      ws.send(JSON.stringify({ type: 'CREATE_ROOM' }));
      setWaitingForOpponent(true);
    }
  };

  const joinRoom = () => {
    if (ws && joinRoomId) {
      ws.send(JSON.stringify({
        type: 'JOIN_ROOM',
        roomId: joinRoomId.toUpperCase()
      }));
      setWaitingForOpponent(true);
    }
  };

  const resetGame = () => {
    if (gameMode === 'single') {
      setGameOver(false);
      setComputerScore(0);
      setUserScore(0);
      setMsg("");
      setUserSelection("");
      setGeneratedSelection("");
      setShowComputerChoice(false);
      setRoundActive(false);
    } else if (gameMode === 'multi' && ws && roomId) {
      ws.send(JSON.stringify({
        type: 'RESET_GAME',
        roomId
      }));
    }
  };

  const playAgain = () => {
    if (gameMode === 'multi' && ws && roomId) {
      ws.send(JSON.stringify({
        type: 'PLAY_AGAIN',
        roomId
      }));
    }
  };

  const leaveGame = () => {
    setGameMode(null);
    setRoomId("");
    setJoinRoomId("");
    setPlayersInRoom(0);
    setWaitingForOpponent(false);
    setMultiplayerScores({ player1: 0, player2: 0 });
    setMsg("");
    if (ws) {
      ws.close();
    }
  };

  // Mode selection screen
  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text">
            Rock Paper Scissors
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={() => setGameMode('single')}
              className="w-full p-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-2xl font-bold hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl"
            >
              🎮 1 Player (vs Computer)
            </button>
            
            <button
              onClick={() => setGameMode('multi')}
              className="w-full p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
            >
              👥 2 Players (Online)
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            Created with ❤️ by Shreya Dhoke
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer lobby screen
  if (gameMode === 'multi' && playersInRoom < 2 && !roomId && !waitingForOpponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6">Multiplayer Lobby</h2>
          
          <div className="space-y-6">
            <button
              onClick={createRoom}
              className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              🎮 Create New Room
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={joinRoom}
                disabled={!joinRoomId}
                className="w-full p-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔑 Join Room
              </button>
            </div>

            <button
              onClick={() => setGameMode(null)}
              className="w-full p-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for opponent screen
  if (gameMode === 'multi' && waitingForOpponent && playersInRoom < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="animate-spin text-6xl mb-6">🔄</div>
          <h2 className="text-2xl font-bold mb-4">Waiting for opponent...</h2>
          {roomId && (
            <div className="bg-violet-100 p-4 rounded-lg mb-4">
              <p className="text-gray-600 mb-2">Room ID:</p>
              <p className="text-3xl font-mono font-bold text-violet-700">{roomId}</p>
            </div>
          )}
          <p className="text-gray-600">Share this ID with your friend to join</p>
          <button
            onClick={leaveGame}
            className="mt-6 text-gray-600 hover:text-gray-800"
          >
            ← Cancel
          </button>
        </div>
      </div>
    );
  }

  // Main game screen (Single or Multiplayer)
  const currentUserScore = gameMode === 'single' ? userScore : (playerNumber === 1 ? multiplayerScores.player1 : multiplayerScores.player2);
  const currentOpponentScore = gameMode === 'single' ? computerScore : (playerNumber === 1 ? multiplayerScores.player2 : multiplayerScores.player1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text mb-2">
            Rock Paper Scissors
          </h1>
          <p className="text-gray-600 text-lg">
            {gameMode === 'single' 
              ? `First to ${maxScore} points wins!` 
              : `Multiplayer Mode - Room: ${roomId}`}
          </p>
          {gameMode === 'multi' && (
            <p className="text-sm text-violet-600 mt-1">
              You are Player {playerNumber}
            </p>
          )}
        </div>

        {/* Score Board */}
        <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-2 gap-8 text-center">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-sm text-violet-600 font-medium">
                {gameMode === 'single' ? 'YOU' : `PLAYER ${playerNumber}`}
              </p>
              <p className="text-5xl font-bold text-violet-700">{currentUserScore}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-sm text-fuchsia-600 font-medium">
                {gameMode === 'single' ? 'COMPUTER' : `PLAYER ${playerNumber === 1 ? 2 : 1}`}
              </p>
              <p className="text-5xl font-bold text-fuchsia-700">{currentOpponentScore}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/50 h-3 rounded-full mt-4">
            <div 
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentUserScore + currentOpponentScore) / (maxScore * 2)) * 100}%` }}
            ></div>
          </div>
        </div>

        {!gameOver ? (
          <>
            {/* Selection Area */}
            <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                {gameMode === 'single' ? 'CHOOSE YOUR WEAPON' : 'MAKE YOUR MOVE'}
              </h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setUserSelection(option);
                      setMsg("");
                    }}
                    disabled={roundActive || waitingForOpponent}
                    className={`
                      p-4 rounded-xl text-white font-bold text-lg shadow-lg
                      bg-gradient-to-r ${colors[option]}
                      transform transition-all duration-200
                      ${userSelection === option 
                        ? 'ring-4 ring-violet-400 scale-105 shadow-xl' 
                        : 'opacity-90 hover:opacity-100 hover:scale-105 hover:shadow-xl'
                      }
                      ${(roundActive || waitingForOpponent) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="text-3xl mb-2">{emojis[option]}</div>
                    {option}
                  </button>
                ))}
              </div>

              {/* Play Button */}
              {gameMode === 'single' ? (
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
              ) : (
                <button
                  onClick={handleMultiplayerMove}
                  disabled={!userSelection || roundActive || waitingForOpponent}
                  className={`
                    w-full py-4 rounded-xl font-bold text-xl text-white shadow-lg
                    transition-all active:transform active:scale-95
                    ${!userSelection || roundActive || waitingForOpponent
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl'
                    }
                  `}
                >
                  {waitingForOpponent 
                    ? "⏳ WAITING FOR OPPONENT..." 
                    : !userSelection 
                    ? "👆 SELECT YOUR MOVE" 
                    : roundActive 
                    ? "⚔️ ROUND IN PROGRESS..." 
                    : "⚔️ CONFIRM MOVE"}
                </button>
              )}
            </div>

            {/* Battle Arena */}
            {showComputerChoice && (
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl border-2 border-violet-200 animate-fade-in">
                <h2 className="text-2xl font-bold text-center mb-4">
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text">
                    ⚔️ BATTLE ARENA ⚔️
                  </span>
                </h2>
                
                <div className="grid grid-cols-2 gap-8">
                  {/* Player Choice */}
                  <div className="text-center">
                    <p className="text-gray-600 font-medium mb-2">
                      {gameMode === 'single' ? 'YOU' : `PLAYER ${playerNumber}`}
                    </p>
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

                  {/* Opponent Choice */}
                  <div className="text-center">
                    <p className="text-gray-600 font-medium mb-2">
                      {gameMode === 'single' ? 'COMPUTER' : `PLAYER ${playerNumber === 1 ? 2 : 1}`}
                    </p>
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
            {gameMode === 'multi' && waitingForOpponent && !showComputerChoice && (
              <div className="text-center p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl">
                <div className="animate-spin inline-block text-2xl mr-2">⏳</div>
                <p className="text-gray-600 text-lg inline">Waiting for opponent's move...</p>
              </div>
            )}
          </>
        ) : (
          /* Game Over Screen */
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-2xl p-8">
              <span className="text-7xl block mb-4">
                {currentUserScore > currentOpponentScore ? "🏆" : "💻"}
              </span>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{msg}</h2>
              <p className="text-xl text-gray-600 mb-6">
                Final Score: You {currentUserScore} - {currentOpponentScore} Opponent
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all active:transform active:scale-95 shadow-lg w-full"
              >
                🔄 PLAY AGAIN 🔄
              </button>
              
              {gameMode === 'multi' && (
                <button
                  onClick={leaveGame}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all w-full"
                >
                  ← Leave Room
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          Created with ❤️ by Shreya Dhoke
        </div>
      </div>

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