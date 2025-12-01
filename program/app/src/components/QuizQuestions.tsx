import React, { useState } from 'react';
import './QuizQuestions.css';

interface QuizQuestionsProps {
  onSubmit: (answers: number[]) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Какой самый надежный способ создания пароля?",
    options: [
      "Использовать имя своего питомца",
      "Использовать дату рождения",
      "Создать длинный пароль с комбинацией букв, цифр и символов",
      "Использовать один и тот же пароль для всех сайтов"
    ],
    correctAnswer: 2
  },
  {
    id: 2,
    question: "Что делать, если вы получили подозрительное письмо с ссылкой?",
    options: [
      "Немедленно перейти по ссылке",
      "Проверить отправителя и не переходить по подозрительным ссылкам",
      "Переслать письмо всем друзьям",
      "Удалить письмо и очистить корзину"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "Какой тип Wi-Fi сети самый безопасный для онлайн-банкинга?",
    options: [
      "Публичный Wi-Fi в кафе",
      "Wi-Fi соседа без пароля",
      "Защищенная домашняя сеть с WPA2/WPA3 шифрованием",
      "Wi-Fi в аэропорту"
    ],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "Что такое двухфакторная аутентификация (2FA)?",
    options: [
      "Двойной пароль для входа",
      "Метод защиты требующий два разных способа подтверждения личности",
      "Два аккаунта для одного сайта",
      "Двойная проверка email"
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "Как распознать фишинговый сайт?",
    options: [
      "По ярким цветам на сайте",
      "По неправильному написанию URL-адреса или отсутствию HTTPS",
      "По количеству рекламы",
      "По размеру шрифта"
    ],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "Что делать при утечке персональных данных?",
    options: [
      "Ничего, это не опасно",
      "Ждать пока все само решится",
      "Сменить пароли, включить 2FA и следить за подозрительной активностью",
      "Удалить все социальные сети"
    ],
    correctAnswer: 2
  },
  {
    id: 7,
    question: "Какой браузер самый безопасный?",
    options: [
      "Устаревший браузер",
      "Любой браузер без обновлений",
      "Современный браузер с регулярными обновлениями и защитой от трекинга",
      "Браузер с установленными неизвестными расширениями"
    ],
    correctAnswer: 2
  },
  {
    id: 8,
    question: "Что такое VPN и зачем он нужен?",
    options: [
      "Вирусная программа",
      "Сервис для шифрования интернет-трафика и защиты приватности",
      "Социальная сеть",
      "Игровая платформа"
    ],
    correctAnswer: 1
  },
  {
    id: 9,
    question: "Как безопасно делать покупки онлайн?",
    options: [
      "Использовать любую карту на любом сайте",
      "Проверять HTTPS соединение, использовать проверенные сайты и виртуальные карты",
      "Делиться данными карт в социальных сетях",
      "Сохранять данные карт в браузере"
    ],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "Что делать при подозрении на взлом аккаунта?",
    options: [
      "Игнорировать подозрительную активность",
      "Сменить пароль, проверить настройки безопасности и выйти со всех устройств",
      "Удалить аккаунт",
      "Создать новый аккаунт и забыть о старом"
    ],
    correctAnswer: 1
  }
];

const QuizQuestions: React.FC<QuizQuestionsProps> = ({ onSubmit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(10).fill(-1));
  const [showSummary, setShowSummary] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showSummary) {
    return (
      <div className="quiz-summary">
        <h2>Quiz Summary</h2>
        <p>Please review your answers before submitting:</p>
        
        <div className="answers-review">
          {questions.map((q, index) => (
            <div key={q.id} className="answer-item">
              <span className="question-number">{index + 1}.</span>
              <span className="answer-text">
                {answers[index] !== -1 ? q.options[answers[index]] : 'Not answered'}
              </span>
            </div>
          ))}
        </div>
        
        <div className="summary-buttons">
          <button onClick={() => setShowSummary(false)} className="back-button">
            Back to Quiz
          </button>
          <button onClick={handleSubmit} className="submit-button">
            Submit Answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Internet Safety Quiz</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      <div className="question-card">
        <h3>{questions[currentQuestion].question}</h3>
        
        <div className="options">
          {questions[currentQuestion].options.map((option, index) => (
            <label
              key={index}
              className={`option ${answers[currentQuestion] === index ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={index}
                checked={answers[currentQuestion] === index}
                onChange={() => handleAnswerSelect(index)}
              />
              <span className="option-text">{option}</span>
            </label>
          ))}
        </div>

        <div className="question-navigation">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="nav-button prev-button"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === -1}
            className="nav-button next-button"
          >
            {currentQuestion === questions.length - 1 ? 'Review' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestions;