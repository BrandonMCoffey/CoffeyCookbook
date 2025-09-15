import React, { useState, useEffect } from 'react';
import { database } from '../../lib/firebase';
import { ref, get, set, onValue, off, push, onDisconnect } from 'firebase/database';

export default function GameController({ initialCode = '' }) {
    const [gameState, setGameState] = useState('joining');
    const [name, setName] = useState(() => localStorage.getItem('playerName') || '');
    const [playerId] = useState(() => 
        localStorage.getItem('playerId') || `player_${Math.random().toString(36).substring(2, 9)}`
    );
    const [roomCode, setRoomCode] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            if (code) {
                return code.toUpperCase();
            }
        }
        return '';
    });
    const [prompt, setPrompt] = useState('Waiting for game to start...');
    const [chatMessage, setChatMessage] = useState('');
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (gameState !== 'playing' || !roomCode) return;
        const roomRef = ref(database, `rooms/${roomCode}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const roomData = snapshot.val();
            if (roomData) {
                setPrompt(roomData.prompt || '...');
            } else {
                setGameState('joining');
                setError('The host has ended the game.');
            }
        });
        return () => off(roomRef, 'value', unsubscribe);
    }, [gameState, roomCode]);

    const handleJoin = async () => {
        setError('');
        if (!name || !roomCode) {
            setError('Please enter your name and a room code.');
            return;
        }

        try {
            const upperRoomCode = roomCode.toUpperCase();
            const roomRef = ref(database, `rooms/${upperRoomCode}`);
            const snapshot = await get(roomRef);

            if (snapshot.exists()) {
                localStorage.setItem('playerName', name);
                localStorage.setItem('playerId', playerId);
                
                const playerRef = ref(database, `rooms/${upperRoomCode}/players/${playerId}`);
                await set(playerRef, { name: name, score: 0 });
                
                onDisconnect(playerRef).remove();
                
                setGameState('playing');
            } else {
                setError('Room not found! Please check the code.');
            }
        } catch (err) {
            console.error("Connection failed:", err);
            setError('Could not connect to the server. Please check your internet.');
        }
    };

    const handleSendChat = () => {
        if (!chatMessage.trim()) return;

        const chatRef = ref(database, `rooms/${roomCode.toUpperCase()}/chatMessages`);
        push(chatRef, {
            sender: name,
            message: chatMessage
        });
        setChatMessage('');
    };
    
    const handleChatKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendChat();
        }
    };

    if (gameState === 'joining') {
        return (
            <div className="w-full max-w-sm p-8 space-y-4 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-white">Join Game</h2>
                <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setError('')}
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    onFocus={() => setError('')}
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleJoin}
                    className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Join
                </button>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
            <div className="text-center">
                <p className="text-sm text-gray-400">Room: {roomCode}</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{prompt}</h2>
            </div>
            <div className="pt-4 border-t border-gray-700">
                <h3 className="mb-2 text-lg font-semibold text-left text-gray-300">Chat</h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Say something..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={handleChatKeyPress}
                        className="flex-grow px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSendChat}
                        className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}