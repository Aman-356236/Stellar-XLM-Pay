#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, Env, String,
};

const MAX_RECIPIENT_LENGTH: u32 = 128;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ActivityRegistryError {
    InvalidRecipient = 1,
    InvalidCount = 2,
    RecordLimitReached = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Activity {
    pub record_id: u32,
    pub caller: Address,
    pub recipient: String,
    pub count: u32,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    LatestActivity(String),
    ActivityById(u32),
    RecordCount,
}

/// Stable frontend event schema.
///
/// Topics are `activity`, `v1`, and the caller contract/account address.
#[contractevent(topics = ["activity", "v1"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ActivityRecordedEvent {
    #[topic]
    pub caller: Address,
    pub record_id: u32,
    pub recipient: String,
    pub count: u32,
}

#[contract]
pub struct ActivityRegistry;

#[contractimpl]
impl ActivityRegistry {
    /// Records the latest greeting activity for a recipient.
    ///
    /// The supplied caller must authorize this invocation. This lets a calling
    /// contract prove its identity without hard-coding a contract address.
    pub fn record_greeting(
        env: Env,
        caller: Address,
        recipient: String,
        count: u32,
    ) -> Result<u32, ActivityRegistryError> {
        if recipient.is_empty() || recipient.len() > MAX_RECIPIENT_LENGTH {
            return Err(ActivityRegistryError::InvalidRecipient);
        }

        if count == 0 {
            return Err(ActivityRegistryError::InvalidCount);
        }

        caller.require_auth();

        let current_record_count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::RecordCount)
            .unwrap_or(0);

        let record_id = current_record_count
            .checked_add(1)
            .ok_or(ActivityRegistryError::RecordLimitReached)?;

        let activity = Activity {
            record_id,
            caller: caller.clone(),
            recipient: recipient.clone(),
            count,
        };

        env.storage()
            .persistent()
            .set(&DataKey::LatestActivity(recipient), &activity);

        env.storage()
            .persistent()
            .set(&DataKey::ActivityById(record_id), &activity);

        env.storage()
            .persistent()
            .set(&DataKey::RecordCount, &record_id);

        ActivityRecordedEvent {
            caller,
            record_id,
            recipient: activity.recipient,
            count,
        }
        .publish(&env);

        Ok(record_id)
    }

    /// Returns the most recently recorded activity for a recipient.
    pub fn get_activity(env: Env, recipient: String) -> Option<Activity> {
        env.storage()
            .persistent()
            .get(&DataKey::LatestActivity(recipient))
    }

    /// Returns an immutable activity record by its monotonic record ID.
    pub fn get_activity_by_id(env: Env, record_id: u32) -> Option<Activity> {
        env.storage()
            .persistent()
            .get(&DataKey::ActivityById(record_id))
    }

    /// Returns the total number of recorded activities.
    pub fn get_record_count(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::RecordCount)
            .unwrap_or(0)
    }
}

mod test;
