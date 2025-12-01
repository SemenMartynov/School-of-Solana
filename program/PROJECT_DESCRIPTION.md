# Project Description

**Deployed Frontend URL:** http://localhost:3000/ (after `npm start`)

**Solana Program ID:** BvuNWwf599hrxzQ5YNfAn2j2UhGcb2qkjYMzGakwqxKL

## Project Overview

### Description
**Pizza Quiz** is a decentralized quiz application running on the Solana blockchain designed to test users' knowledge of internet safety. Users connect their wallets, answer a series of 10 questions regarding cybersecurity best practices (passwords, phishing, 2FA, etc.), and submit their answers directly to the blockchain. The grading logic resides entirely on-chain to ensure transparency. If a user scores 7 or more points, they are rewarded with a pizza promo code displayed on the frontend. The application uses Solana to persist the user's quiz status and score, preventing multiple attempts from the same wallet address.

### Key Features
- **On-Chain Grading**: User answers are processed and graded by the Solana program, not the frontend.
- **State Persistence**: The application remembers if a user has already started or completed the quiz using Program Derived Addresses (PDAs).
- **Internet Safety Education**: Provides educational value by testing knowledge on critical security topics.
- **Reward System**: Unlocks a "Pizza Promo Code" only if the on-chain score meets the passing threshold.

### How to Use the dApp
1. **Connect Wallet**: Click the "Select Wallet" button to connect your Phantom (or other Solana) wallet.
2. **Start Quiz**: Click "Start Quiz". This prompts a transaction to initialize your unique `QuizState` account on the blockchain.
3. **Answer Questions**: Select the correct answers for the 10 internet safety questions displayed.
4. **Submit**: Click "Submit Answers". This signs a transaction sending your answers to the program for verification.
5. **View Results**: The dApp displays your score (retrieved from the blockchain) and, if you passed, reveals your prize code.

## Program Architecture
The Pizza Quiz utilizes a user-centric architecture where every participant has a unique PDA associated with their wallet. This ensures that one wallet can only take the quiz once and the results are permanently stored.

### PDA Usage
The program uses Program Derived Addresses to deterministically locate a user's quiz state without requiring the user to store a separate keypair.

**PDAs Used:**
- **Quiz State PDA**: Derived from seeds `["quiz_state", user_wallet_pubkey]`.
  - **Purpose**: Stores the specific user's progress, score, and completion status. It ensures the account is unique to the user and easily retrievable by the frontend.

### Program Instructions
**Instructions Implemented:**
- **`initialize_quiz_state`**: 
  - Creates a new PDA account for the user.
  - Sets the `authority` to the user's public key.
  - Initializes `score` to 0 and `is_completed` to `false`.
- **`submit_answers`**: 
  - Accepts a vector of 10 integers representing the user's answers.
  - Validates that exactly 10 answers are provided.
  - Checks if the quiz is already completed (prevents retries).
  - Compares user answers against the hardcoded correct answers.
  - Updates the `score` and sets `is_completed` to `true`.

### Account Structure
```rust
#[account]
#[derive(InitSpace)]
pub struct QuizState {
    pub authority: Pubkey,  // The wallet that took the quiz (32 bytes)
    pub score: u8,          // The calculated score out of 10 (1 byte)
    pub is_completed: bool, // Flag to prevent retaking the quiz (1 byte)
}
```

## Testing

### Test Coverage
The project includes a comprehensive TypeScript test suite using Chai and Mocha to verify program logic and security constraints.

**Happy Path Tests:**
- **Initialize Quiz State**: Verifies that a new user can successfully create a `QuizState` account and default values are set correctly.
- **Submit Correct Answers**: Simulates a perfect run (10/10), submits the transaction, and verifies the on-chain score is 10 and `is_completed` is true.
- **Submit Mixed Answers**: Submits a known set of partially correct answers and verifies the program calculates the score accurately (e.g., 8/10).

**Unhappy Path Tests:**
- **Double Initialization**: Ensures a user cannot initialize the quiz state twice (fails with "already in use").
- **Submit Without Initialization**: Verifies that submitting answers fails if the user hasn't started the quiz yet (AccountNotInitialized).
- **Double Submission**: Verifies that a user cannot submit answers again after completing the quiz (fails with `QuizAlreadyCompleted`).
- **Invalid Answer Length**: Ensures the program rejects submissions with fewer or more than 10 answers (fails with `InvalidAnswersLength`).

### Running Tests
```bash
# Install dependencies
yarn install

# Run the test suite
anchor test
```

### Additional Notes for Evaluators

- **Educational Value**: While the "Pizza" reward is a fun hook, the primary goal is to reinforce cybersecurity awareness.
- **On-Chain Logic**: Unlike many simple dApps that grade on the frontend, this project processes the logic on the backend to demonstrate computation on Solana.
- **Hardcoded Answers**: For the scope of this MVP, correct answers are stored in the program binary (`lib.rs`). In a production environment with high stakes, these would likely be hashed or stored in a separate oracle/admin account to prevent decompilation cheating.
