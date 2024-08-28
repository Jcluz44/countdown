import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, AlertTriangle, StopCircle, Clock } from 'lucide-react';

const RandomCountdownApp = () => {
  const [minDuration, setMinDuration] = useState(5);
  const [maxDuration, setMaxDuration] = useState(30);
  const [countdown, setCountdown] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState('');
  const [savedIntervals, setSavedIntervals] = useState([]);

  const validateDurations = useCallback(() => {
    if (minDuration === '' || maxDuration === '') {
      setError('Les deux durées doivent être spécifiées.');
      return false;
    }
    if (parseInt(minDuration) <= 0 || parseInt(maxDuration) <= 0) {
      setError('Les durées doivent être supérieures à zéro.');
      return false;
    }
    if (parseInt(minDuration) > parseInt(maxDuration)) {
      setError('La durée minimale ne peut pas être supérieure à la durée maximale.');
      return false;
    }
    setError('');
    return true;
  }, [minDuration, maxDuration]);

  const getRandomDuration = useCallback(() => {
    return Math.floor(Math.random() * (parseInt(maxDuration) - parseInt(minDuration) + 1) + parseInt(minDuration));
  }, [minDuration, maxDuration]);

  const startCountdown = useCallback(() => {
    if (validateDurations()) {
      const duration = getRandomDuration();
      setCountdown(duration);
      setIsRunning(true);
      setShowNotification(false);
      
      // Sauvegarder le nouvel intervalle
      setSavedIntervals(prev => {
        const newInterval = { min: parseInt(minDuration), max: parseInt(maxDuration) };
        const exists = prev.some(interval => interval.min === newInterval.min && interval.max === newInterval.max);
        if (!exists) {
          return [newInterval, ...prev.slice(0, 2)];
        }
        return prev;
      });
    }
  }, [getRandomDuration, validateDurations, minDuration, maxDuration]);

  const stopCountdown = () => {
    setIsRunning(false);
    setCountdown(null);
  };

  const useInterval = (interval) => {
    setMinDuration(interval.min);
    setMaxDuration(interval.max);
  };

  useEffect(() => {
    let timer;
    if (isRunning && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isRunning && countdown === 0) {
      setIsRunning(false);
      setShowNotification(true);
    }
    return () => clearTimeout(timer);
  }, [isRunning, countdown]);

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setter(value);
      setError('');
    }
  };

  const handleNotificationClick = () => {
    setShowNotification(false);
    startCountdown();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Compte à Rebours Aléatoire</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Durée min (s)"
              value={minDuration}
              onChange={handleInputChange(setMinDuration)}
            />
            <Input
              type="text"
              placeholder="Durée max (s)"
              value={maxDuration}
              onChange={handleInputChange(setMaxDuration)}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={startCountdown} disabled={isRunning} className="w-full">
            {isRunning ? 'En cours...' : 'Démarrer'}
          </Button>
          {isRunning && (
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">{countdown}</div>
              <Button onClick={stopCountdown} variant="outline" className="w-full">
                <StopCircle className="mr-2 h-4 w-4" /> Arrêter
              </Button>
            </div>
          )}
          {showNotification && (
            <Alert onClick={handleNotificationClick} className="cursor-pointer">
              <Bell className="h-4 w-4" />
              <AlertTitle>Temps écoulé !</AlertTitle>
              <AlertDescription>
                Cliquez pour relancer un nouveau compte à rebours.
              </AlertDescription>
            </Alert>
          )}
          {savedIntervals.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Intervalles mémorisés :</h3>
              <div className="space-y-2">
                {savedIntervals.map((interval, index) => (
                  <Button 
                    key={index} 
                    onClick={() => useInterval(interval)} 
                    variant="outline" 
                    className="w-full flex justify-between items-center"
                  >
                    <Clock className="h-4 w-4" />
                    <span>{interval.min}s - {interval.max}s</span>
                    <span className="text-sm text-gray-500">Utiliser</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RandomCountdownApp;
