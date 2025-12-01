import React from 'react';
import './QuizResults.css';

interface QuizState {
  authority: string;
  score: number;
  isCompleted: boolean;
}

interface QuizResultsProps {
  quizState: QuizState;
  userAnswers: number[];
}

const QuizResults: React.FC<QuizResultsProps> = ({ quizState, userAnswers }) => {
  const passed = quizState.score >= 7;
  
  const promoCodes = [
    "PIZZA2024WINNER",
    "SAFETYFIRST25",
    "CYBERSECPIZZA",
    "WINNERWINNER",
    "PIZZAQUIZHERO"
  ];
  
  const promoCode = promoCodes[Math.floor(Math.random() * promoCodes.length)];

  return (
    <div className="quiz-results">
      <div className={`result-header ${passed ? 'success' : 'failure'}`}>
        {passed ? '🎉' : '😔'}
        <h2>{passed ? 'Congratulations!' : 'Quiz Completed'}</h2>
      </div>

      <div className="score-display">
        <div className="score-circle">
          <span className="score-number">{quizState.score}</span>
          <span className="score-total">/10</span>
        </div>
        <p className="score-text">
          You scored {quizState.score} out of 10 questions correctly!
        </p>
      </div>

      {passed ? (
        <div className="success-content">
          <div className="promo-card">
            <h3>🍕 Your Pizza Promo Code!</h3>
            <div className="promo-code">
              <code>{promoCode}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(promoCode)}
                className="copy-button"
              >
                Copy
              </button>
            </div>
            <p className="promo-instructions">
              Use this code at checkout on any participating pizza delivery service!
              Valid for one large pizza.
            </p>
          </div>
          
          <div className="success-message">
            <h3>Excellent Work!</h3>
            <p>
              You have demonstrated excellent knowledge of internet safety! 
              Your awareness of cybersecurity best practices will help keep you safe online.
            </p>
          </div>
        </div>
      ) : (
        <div className="failure-content">
          <div className="encouragement-card">
            <h3>Keep Learning!</h3>
            <p>
              You need at least 7 correct answers to win a pizza promo code. 
              Don't worry - internet safety is an important skill that takes time to master!
            </p>
            <p>
              Consider reviewing internet safety best practices and try again later.
              Remember: being safe online is more valuable than any prize!
            </p>
          </div>
          
          <div className="tips-section">
            <h4>Quick Internet Safety Tips:</h4>
            <ul>
              <li>Always use strong, unique passwords</li>
              <li>Enable two-factor authentication when possible</li>
              <li>Be cautious of suspicious emails and links</li>
              <li>Use secure Wi-Fi connections</li>
              <li>Keep your software and browsers updated</li>
            </ul>
          </div>
        </div>
      )}

      <div className="quiz-stats">
        <h4>Quiz Statistics:</h4>
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-label">Correct Answers:</span>
            <span className="stat-value">{quizState.score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Passing Score:</span>
            <span className="stat-value">7/10</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Success Rate:</span>
            <span className="stat-value">{(quizState.score / 10 * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="result-footer">
        <p className="thank-you">
          Thank you for participating in the Pizza Quiz! 🍕
        </p>
        <p className="reminder">
          Remember: Internet safety knowledge is the best prize you can win!
        </p>
      </div>
    </div>
  );
};

export default QuizResults;