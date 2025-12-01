use anchor_lang::prelude::*;

declare_id!("BvuNWwf599hrxzQ5YNfAn2j2UhGcb2qkjYMzGakwqxKL");

#[program]
pub mod anchor_project {
    use super::*;

    pub fn initialize_quiz_state(ctx: Context<InitializeQuizState>) -> Result<()> {
        let quiz_state = &mut ctx.accounts.quiz_state;
        quiz_state.authority = ctx.accounts.user.key();
        quiz_state.score = 0;
        quiz_state.is_completed = false;
        Ok(())
    }

    pub fn submit_answers(ctx: Context<SubmitAnswers>, user_answers: Vec<u8>) -> Result<()> {
        require!(user_answers.len() == 10, QuizError::InvalidAnswersLength);
        
        let quiz_state = &mut ctx.accounts.quiz_state;
        
        // Check if quiz is already completed
        require!(!quiz_state.is_completed, QuizError::QuizAlreadyCompleted);
        
        // Hardcoded correct answers
        let correct_answers: [u8; 10] = [2, 1, 3, 0, 2, 1, 3, 2, 0, 1]; // Answers: C, B, D, A, C, B, D, C, A, B
        
        // Calculate score
        let mut score = 0;
        for (i, &answer) in user_answers.iter().enumerate() {
            if i < correct_answers.len() && answer == correct_answers[i] {
                score += 1;
            }
        }
        
        // Update quiz state
        quiz_state.score = score;
        quiz_state.is_completed = true;
        
        msg!("Quiz completed. Score: {}/10", score);
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeQuizState<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + QuizState::INIT_SPACE,
        seeds = [b"quiz_state", user.key().as_ref()],
        bump
    )]
    pub quiz_state: Account<'info, QuizState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitAnswers<'info> {
    #[account(
        mut,
        seeds = [b"quiz_state", user.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub quiz_state: Account<'info, QuizState>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This is the authority of the quiz state
    pub authority: AccountInfo<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct QuizState {
    pub authority: Pubkey, // 32 bytes
    pub score: u8,         // 1 byte
    pub is_completed: bool, // 1 byte
}

#[error_code]
pub enum QuizError {
    #[msg("Quiz has already been completed")]
    QuizAlreadyCompleted,
    #[msg("Invalid answers length. Expected 10 answers")]
    InvalidAnswersLength,
}