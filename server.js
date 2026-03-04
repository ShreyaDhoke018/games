// server.js
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Game rooms storage
const rooms = new Map();
const players = new Map();

wss.on('connection', (ws) => {
  const playerId = uuidv4();
  players.set(playerId, { ws, roomId: null });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(playerId, data);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    handleDisconnect(playerId);
  });
});

function handleMessage(playerId, data) {
  const player = players.get(playerId);
  if (!player) return;

  switch (data.type) {
    case 'CREATE_ROOM':
      createRoom(playerId);
      break;
    case 'JOIN_ROOM':
      joinRoom(playerId, data.roomId);
      break;
    case 'PLAYER_MOVE':
      handlePlayerMove(playerId, data);
      break;
    case 'RESET_GAME':
      resetGame(data.roomId);
      break;
    case 'PLAY_AGAIN':
      playAgain(data.roomId);
      break;
    default:
      console.log('Unknown message type:', data.type);
  }
}

function createRoom(playerId) {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  rooms.set(roomId, {
    id: roomId,
    players: [playerId],
    moves: {},
    scores: { player1: 0, player2: 0 },
    maxScore: 3,
    gameOver: false,
    roundActive: false
  });

  const player = players.get(playerId);
  player.roomId = roomId;

  sendToPlayer(playerId, {
    type: 'ROOM_CREATED',
    roomId,
    isHost: true
  });
}

function joinRoom(playerId, roomId) {
  const room = rooms.get(roomId);
  if (!room) {
    sendToPlayer(playerId, {
      type: 'ERROR',
      message: 'Room not found'
    });
    return;
  }

  if (room.players.length >= 2) {
    sendToPlayer(playerId, {
      type: 'ERROR',
      message: 'Room is full'
    });
    return;
  }

  room.players.push(playerId);
  const player = players.get(playerId);
  player.roomId = roomId;

  // Notify both players that game is ready
  room.players.forEach((pId) => {
    sendToPlayer(pId, {
      type: 'GAME_READY',
      players: room.players.length,
      isHost: pId === room.players[0],
      roomId
    });
  });
}

function handlePlayerMove(playerId, data) {
  const { roomId, move } = data;
  const room = rooms.get(roomId);
  if (!room || room.players.length !== 2) return;

  const playerIndex = room.players.indexOf(playerId);
  const playerKey = `player${playerIndex + 1}`;
  room.moves[playerKey] = move;

  if (room.moves.player1 && room.moves.player2) {
    determineWinner(room);
  } else {
    const otherPlayerId = room.players.find(id => id !== playerId);
    sendToPlayer(otherPlayerId, {
      type: 'OPPONENT_MOVED'
    });
  }
}

function determineWinner(room) {
  const move1 = room.moves.player1;
  const move2 = room.moves.player2;
  
  let result, message;

  if (move1 === move2) {
    result = 'tie';
    message = "🤝 It's a tie!";
  } else if (
    (move1 === 'Rock' && move2 === 'Scissors') ||
    (move1 === 'Paper' && move2 === 'Rock') ||
    (move1 === 'Scissors' && move2 === 'Paper')
  ) {
    result = 'player1';
    room.scores.player1++;
    message = `🎉 Player 1 wins! ${move1} beats ${move2}!`;
  } else {
    result = 'player2';
    room.scores.player2++;
    message = `🎉 Player 2 wins! ${move2} beats ${move1}!`;
  }

  const gameOver = room.scores.player1 >= room.maxScore || room.scores.player2 >= room.maxScore;

  room.players.forEach((playerId, index) => {
    const playerResult = index === 0 ? result === 'player1' : result === 'player2';
    sendToPlayer(playerId, {
      type: 'ROUND_RESULT',
      move1,
      move2,
      result: playerResult ? 'win' : result === 'tie' ? 'tie' : 'lose',
      message,
      scores: room.scores,
      gameOver,
      winner: gameOver ? (room.scores.player1 >= room.maxScore ? 'player1' : 'player2') : null
    });
  });

  room.moves = {};
  room.roundActive = !gameOver;
}

function resetGame(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.scores = { player1: 0, player2: 0 };
  room.moves = {};
  room.gameOver = false;
  room.roundActive = false;

  room.players.forEach((playerId) => {
    sendToPlayer(playerId, {
      type: 'GAME_RESET'
    });
  });
}

function playAgain(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.scores = { player1: 0, player2: 0 };
  room.moves = {};
  room.gameOver = false;
  room.roundActive = false;

  room.players.forEach((playerId) => {
    sendToPlayer(playerId, {
      type: 'PLAY_AGAIN_READY'
    });
  });
}

function handleDisconnect(playerId) {
  const player = players.get(playerId);
  if (player && player.roomId) {
    const room = rooms.get(player.roomId);
    if (room) {
      const otherPlayer = room.players.find(id => id !== playerId);
      if (otherPlayer) {
        sendToPlayer(otherPlayer, {
          type: 'PLAYER_DISCONNECTED'
        });
      }
      rooms.delete(player.roomId);
    }
  }
  players.delete(playerId);
}

function sendToPlayer(playerId, data) {
  const player = players.get(playerId);
  if (player && player.ws.readyState === WebSocket.OPEN) {
    player.ws.send(JSON.stringify(data));
  }
}

// Use the port provided by Render or default to 8080
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
