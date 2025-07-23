import React, { useState, useEffect } from 'react';
import './CountdownView.css';

interface CountdownViewProps {
  onCountdownComplete: () => void;
  initialCountdown?: number;
}

const CountdownView: React.FC<CountdownViewProps> = ({ 
  onCountdownComplete, 
  initialCountdown = 5 
}) => {
  const [countdown, setCountdown] = useState(initialCountdown);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          setIsActive(false);
          onCountdownComplete();
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onCountdownComplete]);

  const getCountdownText = () => {
    if (countdown > 3) return 'GET READY';
    if (countdown > 1) return 'PREPARE';
    if (countdown === 1) return 'GO!';
    return '';
  };

  const getRulesText = () => {
    return [
      '• Solve puzzles to help your teammates survive',
      '• Points you earn go to the next player, not yourself',
      '• Every 5 seconds, each player loses 1 point',
      '• Survive as long as possible as a team',
      '• Work together to maximize survival time'
    ];
  };

  return (
    <div className="countdown-container" style={{ background: 'none', boxShadow: 'none', border: 'none' }}>
      <div className="countdown-timer" data-testid="countdown-timer">
        {countdown}
      </div>
    </div>
  );
};

export default CountdownView; 