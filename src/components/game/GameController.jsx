import React, { useState, useEffect } from 'react';
import { database } from '../../lib/firebase';
import { ref, get, set, onValue, off, push, onDisconnect } from 'firebase/database';

const JoinView = ({ name, setName, roomCode, setRoomCode, handleJoin, error, setError }) => {
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
};

const LobbyView = ({ playerId, roomCode, name }) => {
    const [isReady, setIsReady] = useState(false);
    const [chatMessage, setChatMessage] = useState('');

    const handleToggleReady = () => {
        const newReadyState = !isReady;
        setIsReady(newReadyState);
        const readyRef = ref(database, `rooms/${roomCode}/players/${playerId}/isReady`);
        set(readyRef, newReadyState);
    };

    const handleSendChat = () => {
        if (!chatMessage.trim()) return;
        const chatRef = ref(database, `rooms/${roomCode}/chatMessages`);
        push(chatRef, { sender: name, message: chatMessage });
        setChatMessage('');
    };

    return (
        <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center text-white">Lobby</h2>
            
            <button
                onClick={handleToggleReady}
                className={`w-full py-3 font-bold text-white rounded-md transition-colors ${
                    isReady ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
            >
                {isReady ? "Ready!" : "Click to Ready Up"}
            </button>
            
            <div className="pt-4 border-t border-gray-700">
                <h3 className="mb-2 text-lg font-semibold text-left text-gray-300">Chat</h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Say something..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
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
};

const InGameView = ({ playerId, roomCode }) => {
    const [inputs, setInputs] = useState({
        up: false,
        down: false,
        left: false,
        right: false
    });

    const handleToggleInput = (direction) => {
        const newInputs = { ...inputs, [direction]: !inputs[direction] };
        setInputs(newInputs);
        
        const inputsRef = ref(database, `rooms/${roomCode}/players/${playerId}/inputs`);
        set(inputsRef, newInputs);
    };
    
    const getBtnClass = (dir) => {
        return inputs[dir]
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-700 hover:bg-gray-600';
    };

    return (
        <div className="w-full max-w-sm p-8 space-y-4 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center text-white">In Game!</h2>
            <div className="grid grid-cols-3 gap-4">
                <div />
                <button onClick={() => handleToggleInput('up')} className={`w-full py-4 text-white rounded-md transition-colors ${getBtnClass('up')}`}>UP</button>
                <div />
                <button onClick={() => handleToggleInput('left')} className={`w-full py-4 text-white rounded-md transition-colors ${getBtnClass('left')}`}>LEFT</button>
                <div />
                <button onClick={() => handleToggleInput('right')} className={`w-full py-4 text-white rounded-md transition-colors ${getBtnClass('right')}`}>RIGHT</button>
                <div />
                <button onClick={() => handleToggleInput('down')} className={`w-full py-4 text-white rounded-md transition-colors ${getBtnClass('down')}`}>DOWN</button>
                <div />
            </div>
        </div>
    );
};

export default function GameController() {
    const [viewState, setViewState] = useState('joining');
    const [name, setName] = useState(() => localStorage.getItem('playerName') || '');
    const [playerId] = useState(() => 
        localStorage.getItem('playerId') || `player_${Math.random().toString(36).substring(2, 9)}`
    );
    const [roomCode, setRoomCode] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('code') ? params.get('code').toUpperCase() : '';
        }
        return '';
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (viewState === 'joining' || !roomCode) return;

        const roomRef = ref(database, `rooms/${roomCode}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const roomData = snapshot.val();
            if (roomData) {
                setViewState(roomData.gameState || 'lobby');
            } else {
                setViewState('joining');
                setError('The host has ended the game.');
            }
        });
        
        return () => off(roomRef, 'value', unsubscribe);
    }, [viewState, roomCode]);

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
                
                await set(playerRef, { 
                    name: name, 
                    score: 0, 
                    isReady: false,
                    inputs: { up: false, down: false, left: false, right: false }
                });
                
                onDisconnect(playerRef).remove();
                
                setViewState('lobby');
            } else {
                setError('Room not found! Please check the code.');
            }
        } catch (err) {
            console.error("Connection failed:", err);
            setError('Could not connect to the server. Please check your internet.');
        }
    };

    if (viewState === 'joining') {
        return (
            <JoinView
                name={name}
                setName={setName}
                roomCode={roomCode}
                setRoomCode={setRoomCode}
                handleJoin={handleJoin}
                error={error}
                setError={setError}
            />
        );
    }
    else if (viewState === 'lobby') {
        return <LobbyView playerId={playerId} roomCode={roomCode} name={name} />;
    }
    else if (viewState === 'in-game') {
        return <InGameView playerId={playerId} roomCode={roomCode} />;
    }
}