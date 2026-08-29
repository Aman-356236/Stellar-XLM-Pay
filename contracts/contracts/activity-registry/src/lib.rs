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
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Activity {
    pub caller: Address,
    pub recipient: String,
    pub count: u32,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Activity(String),
    RecordCount,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ActivityRecordedEvent {
    #[topic]
    pub caller: Address,
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
    ) -> Result<(), ActivityRegistryError> {
        if recipient.is_empty() || recipient.len() > MAX_RECIPIENT_LENGTH {
            return Err(ActivityRegistryError::InvalidRecipient);
        }

        if count == 0 {
            return Err(ActivityRegistryError::InvalidCount);
        }

        caller.require_auth();

        let activity = Activity {
            caller: caller.clone(),
            recipient: recipient.clone(),
            count,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Activity(recipient), &activity);

        let record_count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::RecordCount)
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&DataKey::RecordCount, &(record_count + 1));

        ActivityRecordedEvent {
            caller,
            recipient: activity.recipient,
            count,
        }
        .publish(&env);

        Ok(())
    }

    /// Returns the most recently recorded activity for a recipient.
    pub fn get_activity(env: Env, recipient: String) -> Option<Activity> {
        env.storage()
            .persistent()
            .get(&DataKey::Activity(recipient))
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
