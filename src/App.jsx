import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ShootingDrillApp() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentMinute, setCurrentMinute] = useState(1);
  const [scores, setScores] = useState({});
  const [minuteScores, setMinuteScores] = useState({});
  const [playerName, setPlayerName] = useState("");
  const [alarm, setAlarm] = useState(false);
  const intervalRef = useRef(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && running) {
      clearInterval(intervalRef.current);
      checkScores();
    }
    return () => clearInterval(intervalRef.current);
  }, [timeLeft, running]);

  const startTimer = () => {
    if (currentMinute > 3) return;
    setTimeLeft(60);
    setRunning(true);
    setAlarm(false);
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(60);
  };

  const addPlayer = () => {
    if (playerName && !scores[playerName]) {
      setScores({ ...scores, [playerName]: 0 });
      setMinuteScores({ ...minuteScores, [playerName]: [0, 0, 0] });
      setPlayerName("");
    }
  };

  const addTriple = (name) => {
    if (running) {
      setScores((prev) => ({ ...prev, [name]: prev[name] + 1 }));
      setMinuteScores((prev) => {
        const updated = [...prev[name]];
        updated[currentMinute - 1] += 1;
        return { ...prev, [name]: updated };
      });
    }
  };

  const checkScores = () => {
    let requiredTotal = currentMinute * 10;
    const qualified = Object.values(scores).some((score) => score >= requiredTotal);

    if (!qualified || currentMinute === 3) {
      setAlarm(true);
      setRunning(false);
    } else {
      setCurrentMinute((m) => m + 1);
      startTimer();
    }
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Tiro Minuto</h1>

      <div className="mb-4">
        <input
          className="p-2 border rounded mr-2"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Nombre del jugador"
        />
        <button className="p-2 bg-blue-500 text-white rounded" onClick={addPlayer}>Añadir Jugador</button>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Minuto {currentMinute} / 3</h2>
        <p className="text-4xl font-mono">{timeLeft}s</p>
        <div className="flex justify-center gap-2 mt-2">
          {!running && currentMinute <= 3 && (
            <button className="p-2 bg-green-500 text-white rounded" onClick={startTimer}>Comenzar</button>
          )}
          {running && <button className="p-2 bg-yellow-500 text-white rounded" onClick={pauseTimer}>Pausar</button>}
          <button className="p-2 bg-red-500 text-white rounded" onClick={resetTimer}>Reiniciar</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(scores).map(([name, total]) => (
          <div key={name} className="p-4 border rounded shadow">
            <h3 className="text-lg font-bold mb-2">{name}</h3>
            <p className="text-xl">Total: {total}</p>
            <div className="text-sm">
              {minuteScores[name]?.map((val, idx) => (
                <p key={idx}>Minuto {idx + 1}: {val}</p>
              ))}
            </div>
            <button className="mt-2 p-2 bg-blue-600 text-white rounded" onClick={() => addTriple(name)}>
              +1 Triple
            </button>
          </div>
        ))}
      </div>

      {alarm && (
        <div className="mt-4 text-red-600 text-xl font-bold animate-pulse">
          ¡Fin del ejercicio o nadie alcanzó los puntos requeridos!
        </div>
      )}
    </div>
  );
}
