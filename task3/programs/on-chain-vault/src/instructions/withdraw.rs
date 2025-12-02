//-------------------------------------------------------------------------------
///
/// TASK: Implement the withdraw functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the vault is not locked
/// - Verify that the vault has enough balance to withdraw
/// - Transfer lamports from vault to vault authority
/// - Emit a withdraw event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::WithdrawEvent;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault", vault_authority.key().as_ref()],
        bump,
        has_one = vault_authority
    )]
    pub vault: Account<'info, Vault>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let vault_authority = &mut ctx.accounts.vault_authority;

    // - Verify that the vault is not locked
    require!(!vault.locked, VaultError::VaultLocked);

    // - Verify that the vault has enough balance to withdraw
    require!(vault.to_account_info().lamports() >= amount, VaultError::InsufficientBalance);

    // - Transfer lamports from vault to vault authority
    **vault.to_account_info().try_borrow_mut_lamports()? = vault
        .to_account_info()
        .lamports()
        .checked_sub(amount)
        .ok_or(VaultError::Overflow)?;

    **vault_authority.to_account_info().try_borrow_mut_lamports()? = vault_authority
        .to_account_info()
        .lamports()
        .checked_add(amount)
        .ok_or(VaultError::Overflow)?;

    // - Emit a withdraw event after successful transfer
    emit!(WithdrawEvent {
        amount,
        vault_authority: vault_authority.key(),
        vault: vault.key(),
    });

    Ok(())
}