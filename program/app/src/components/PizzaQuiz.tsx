import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import idl from '../idl/anchor_project.json';
import QuizQuestions from './QuizQuestions';
import QuizResults from './QuizResults';
import { initializeQuizState, submitAnswers, getQuizState } from '../utils/solana';
import './PizzaQuiz.css';

const PROGRAM_ID = new PublicKey("BvuNWwf599hrxzQ5YNfAn2j2UhGcb2qkjYMzGakwqxKL");

interface QuizState {
  authority: string;
  score: number;
  isCompleted: boolean;
}

const PizzaQuiz: React.FC = () => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'connect' | 'start' | 'quiz' | 'results'>('connect');
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [program, setProgram] = useState<anchor.Program | null>(null);

  useEffect(() => {
    if (publicKey && connection && signTransaction && signAllTransactions) {
      initializeProgram();
    }
  }, [publicKey, connection, signTransaction, signAllTransactions]);

  const initializeProgram = async () => {
    try {
      if (!publicKey || !signTransaction || !signAllTransactions) return;

      const provider = new anchor.AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction,
          signAllTransactions,
        },
        { commitment: 'confirmed' }
      );
      
      anchor.setProvider(provider);
      
      const program = new anchor.Program(
        idl as anchor.Idl,
        provider
      );
      
      setProgram(program);
      
      await checkQuizStateInternal(program);
    } catch (error) {
      console.error('Error initializing program:', error);
    }
  };

  const checkQuizStateInternal = async (prog: anchor.Program) => {
    if (!publicKey) return;

    try {
      const state = await getQuizState(prog, publicKey);
      setQuizState(state);
      
      if (state && state.isCompleted) {
        setCurrentView('results');
      } else {
        setCurrentView('start');
      }
    } catch (error) {
      console.error('Error checking quiz state:', error);
      setCurrentView('start');
    }
  };

  const checkQuizState = async () => {
    if (!publicKey || !program) return;

    setIsLoading(true);
    try {
      await checkQuizStateInternal(program);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!publicKey || !program) return;

    setIsLoading(true);
    try {
      const balance = await connection.getBalance(publicKey);
      const minBalance = 0.01 * 1_000_000_000; // 0.01 SOL в lamports
      
      if (balance < minBalance) {
        alert('Insufficient SOL balance. You need at least 0.01 SOL to pay for transactions.');
        setIsLoading(false);
        return;
      }

      const existingState = await getQuizState(program, publicKey);
      
      if (existingState?.isCompleted) {
        alert('You have already completed this quiz!');
        setQuizState(existingState);
        setCurrentView('results');
        setIsLoading(false);
        return;
      }
      
      if (!existingState) {
        const signature = await initializeQuizState(program, publicKey);
        console.log('Quiz state initialized:', signature);

        await connection.confirmTransaction(signature, 'confirmed');
      }
      
      setCurrentView('quiz');
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      
      if (error.message?.includes('User rejected')) {
        alert('Transaction was rejected. Please try again.');
      } else {
        alert(`Error starting quiz: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswers = async (answers: number[]) => {
    if (!publicKey || !program) return;

    setIsLoading(true);
    try {
      const signature = await submitAnswers(program, publicKey, answers);
      console.log('Answers submitted:', signature);
      
      await connection.confirmTransaction(signature, 'confirmed');

      const updatedState = await getQuizState(program, publicKey);
      setQuizState(updatedState);
      setUserAnswers(answers);
      setCurrentView('results');
    } catch (error: any) {
      console.error('Error submitting answers:', error);
      
      if (error.message?.includes('QuizAlreadyCompleted')) {
        alert('You have already completed this quiz!');
      } else if (error.message?.includes('InvalidAnswersLength')) {
        alert('Invalid number of answers. Please answer all 10 questions.');
      } else if (error.message?.includes('User rejected')) {
        alert('Transaction was rejected. Please try again.');
      } else {
        alert(`Error submitting answers: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (!publicKey) {
      return (
        <div className="connect-wallet">
          <h1>🍕 Pizza Quiz</h1>
          <p>Test your internet safety knowledge and win pizza!</p>
          <WalletMultiButton className="wallet-button" />
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'start':
        return (
          <div className="start-quiz">
            <h1>🍕 Pizza Quiz</h1>
            <p>Ready to test your internet safety knowledge?</p>
            <p>Answer at least 7 out of 10 questions correctly to win a pizza promo code!</p>
            <button onClick={handleStartQuiz} className="start-button">
              Start Quiz
            </button>
          </div>
        );
      
      case 'quiz':
        return <QuizQuestions onSubmit={handleSubmitAnswers} />;
      
      case 'results':
        return <QuizResults quizState={quizState!} userAnswers={userAnswers} />;
      
      default:
        return (
          <div className="check-quiz">
            <h1>🍕 Pizza Quiz</h1>
            <p>Welcome back! Let's check your quiz status...</p>
            <button onClick={checkQuizState} className="check-button">
              Check Status
            </button>
          </div>
        );
    }
  };

  return (
    <div className="pizza-quiz">
      {renderContent()}
    </div>
  );
};

export default PizzaQuiz;