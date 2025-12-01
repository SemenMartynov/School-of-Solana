import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorProject } from "../target/types/anchor_project";
import { expect } from "chai";

describe("anchor_project", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchorProject as Program<AnchorProject>;
  const provider = anchor.getProvider();
  const connection = provider.connection;

  const passingAnswers = Buffer.from([2, 1, 3, 0, 2, 1, 3, 2, 0, 1]); // 10/10 correct
  const failingAnswers = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 0/10 correct
  const mixedAnswers = Buffer.from([2, 1, 0, 0, 2, 1, 0, 2, 0, 1]); // 6/10 correct

  describe("initialize_quiz_state", () => {
    it("should successfully initialize quiz state for a new user", async () => {
      const user = anchor.web3.Keypair.generate();
      
      // Airdrop SOL to user
      const airdropSignature = await connection.requestAirdrop(
        user.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);

      // Find PDA for quiz state
      const [quizStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("quiz_state"), user.publicKey.toBuffer()],
        program.programId
      );

      // Initialize quiz state
      const tx = await program.methods
        .initializeQuizState()
        .accounts({
          quizState: quizStatePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      console.log("Initialize quiz state transaction signature:", tx);

      // Fetch and verify quiz state
      const quizState = await program.account.quizState.fetch(quizStatePDA);
      expect(quizState.authority.toString()).to.equal(user.publicKey.toString());
      expect(quizState.score).to.equal(0);
      expect(quizState.isCompleted).to.equal(false);
    });

    it("should fail when trying to initialize quiz state twice for the same user", async () => {
      const user = anchor.web3.Keypair.generate();
      
      // Airdrop SOL to user
      const airdropSignature = await connection.requestAirdrop(
        user.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);

      // Find PDA for quiz state
      const [quizStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("quiz_state"), user.publicKey.toBuffer()],
        program.programId
      );

      // First initialization should succeed
      await program.methods
        .initializeQuizState()
        .accounts({
          quizState: quizStatePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Second initialization should fail
      try {
        await program.methods
          .initializeQuizState()
          .accounts({
            quizState: quizStatePDA,
            user: user.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("already in use");
      }
    });
  });

  describe("submit_answers", () => {
    it("should successfully submit correct answers and update score", async () => {
      const user = anchor.web3.Keypair.generate();
      
      // Airdrop SOL to user
      const airdropSignature = await connection.requestAirdrop(
        user.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);

      // Find PDA for quiz state
      const [quizStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("quiz_state"), user.publicKey.toBuffer()],
        program.programId
      );

      // Initialize quiz state first
      await program.methods
        .initializeQuizState()
        .accounts({
          quizState: quizStatePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Submit answers
      const tx = await program.methods
        .submitAnswers(passingAnswers)
        .accounts({
          quizState: quizStatePDA,
          user: user.publicKey,
          authority: user.publicKey,
        })
        .signers([user])
        .rpc();

      console.log("Submit answers transaction signature:", tx);

      // Verify updated quiz state
      const quizState = await program.account.quizState.fetch(quizStatePDA);
      expect(quizState.score).to.equal(10);
      expect(quizState.isCompleted).to.equal(true);
    });

    it("should successfully submit mixed answers and calculate correct score", async () => {
      const user = anchor.web3.Keypair.generate();
      
      // Airdrop SOL to user
      const airdropSignature = await connection.requestAirdrop(
        user.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);

      // Find PDA for quiz state
      const [quizStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("quiz_state"), user.publicKey.toBuffer()],
        program.programId
      );

      // Initialize quiz state first
      await program.methods
        .initializeQuizState()
        .accounts({
          quizState: quizStatePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Submit mixed answers (8 correct)
      await program.methods
        .submitAnswers(mixedAnswers)
        .accounts({
          quizState: quizStatePDA,
          user: user.publicKey,
          authority: user.publicKey,
        })
        .signers([user])
        .rpc();

      // Verify updated quiz state
      const quizState = await program.account.quizState.fetch(quizStatePDA);
      expect(quizState.score).to.equal(8);
      expect(quizState.isCompleted).to.equal(true);
    });

    it("should fail when trying to submit answers without initializing quiz state", async () => {
      const user = anchor.web3.Keypair.generate();
      
      // Airdrop SOL to user
      const airdropSignature = await connection.requestAirdrop(
        user.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);

      // Find PDA for quiz state (but don't initialize it)
      const [quizStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("quiz_state"), user.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .submitAnswers(passingAnswers)
          .accounts({
            quizState: quizStatePDA,
            user: user.publicKey,
            authority: user.publicKey,
          })
          .signers([user])
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("AccountNotInitialized");
      }
    });

    it("should fail when trying to submit answers twice", async () => {
      const user = anchor.web3.Keypair.generate();
      
      // Airdrop SOL to user
      const airdropSignature = await connection.requestAirdrop(
        user.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);

      // Find PDA for quiz state
      const [quizStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("quiz_state"), user.publicKey.toBuffer()],
        program.programId
      );

      // Initialize quiz state first
      await program.methods
        .initializeQuizState()
        .accounts({
          quizState: quizStatePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // First submission should succeed
      await program.methods
        .submitAnswers(passingAnswers)
        .accounts({
          quizState: quizStatePDA,
          user: user.publicKey,
          authority: user.publicKey,
        })
        .signers([user])
        .rpc();

      // Second submission should fail
      try {
        await program.methods
          .submitAnswers(passingAnswers)
          .accounts({
            quizState: quizStatePDA,
            user: user.publicKey,
            authority: user.publicKey,
          })
          .signers([user])
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Quiz has already been completed");
      }
    });

    it("should fail when submitting answers with wrong length", async () => {
      const user = anchor.web3.Keypair.generate();
      
      // Airdrop SOL to user
      const airdropSignature = await connection.requestAirdrop(
        user.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);

      // Find PDA for quiz state
      const [quizStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("quiz_state"), user.publicKey.toBuffer()],
        program.programId
      );

      // Initialize quiz state first
      await program.methods
        .initializeQuizState()
        .accounts({
          quizState: quizStatePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Try to submit 9 answers instead of 10
      const wrongLengthAnswers = Buffer.from([1, 2, 3, 0, 1, 2, 3, 0, 1]);
      
      try {
        await program.methods
          .submitAnswers(wrongLengthAnswers)
          .accounts({
            quizState: quizStatePDA,
            user: user.publicKey,
            authority: user.publicKey,
          })
          .signers([user])
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Invalid answers length");
      }
    });
  });
});