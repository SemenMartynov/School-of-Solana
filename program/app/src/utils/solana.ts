import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';

export interface QuizState {
  authority: string;
  score: number;
  isCompleted: boolean;
}

export const getQuizStatePDA = (userPublicKey: PublicKey, programId: PublicKey): PublicKey => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('quiz_state'), userPublicKey.toBuffer()],
    programId
  );
  return pda;
};

export const initializeQuizState = async (
  program: anchor.Program,
  userPublicKey: PublicKey
): Promise<string> => {
  const quizStatePDA = getQuizStatePDA(userPublicKey, program.programId);
  
  try {
    const tx = await program.methods
      .initializeQuizState()
      .accounts({
        quizState: quizStatePDA,
        user: userPublicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error initializing quiz state:', error);
    throw error;
  }
};

export const submitAnswers = async (
  program: anchor.Program,
  userPublicKey: PublicKey,
  answers: number[]
): Promise<string> => {
  const quizStatePDA = getQuizStatePDA(userPublicKey, program.programId);
  
  try {
    const tx = await program.methods
      .submitAnswers(answers)
      .accounts({
        quizState: quizStatePDA,
        user: userPublicKey,
        authority: userPublicKey,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error submitting answers:', error);
    throw error;
  }
};

export const getQuizState = async (
  program: anchor.Program,
  userPublicKey: PublicKey
): Promise<QuizState | null> => {
  const quizStatePDA = getQuizStatePDA(userPublicKey, program.programId);
  
  try {
    // Type assertion для обхода проверки типов
    const account = await (program.account as any).quizState.fetch(quizStatePDA);
    
    return {
      authority: account.authority.toString(),
      score: account.score,
      isCompleted: account.isCompleted,
    };
  } catch (error) {
    const err = error as Error;
    
    if (err.message && err.message.includes('Account does not exist')) {
      return null;
    }
    
    console.error('Error fetching quiz state:', error);
    throw error;
  }
};