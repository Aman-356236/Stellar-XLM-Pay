#![no_std]

use soroban_sdk::{
    contract, contractclient, contracterror, contractevent, contractimpl, contracttype,
    symbol_short, Address, Env, String, Vec,
};

const MAX_RECIPIENT_LENGTH: u32 = 128;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum HelloWorldError {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    InvalidRecipient = 3,
    InvalidRegistry = 4,
    RegistryNotConfigured = 5,
    RegistryCallFailed = 6,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Registry,
}

/// The minimal external interface used by `hello_and_record`.
///
/// This trait intentionally mirrors the activity-registry ABI and produces a
/// typed Soroban client. The implementation is kept in its own contract crate.
#[contractclient(name = "RegistryClient")]
pub trait ActivityRegistryInterface {
    fn record_greeting(
        env: Env,
        caller: Address,
        recipient: String,
        count: u32,
    ) -> Result<u32, activity_registry::ActivityRegistryError>;
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HelloEvent {
    pub to: String,
    pub message: String,
    pub count: u32,
}

/// Stable frontend event emitted only after a registry record succeeds.
///
/// Topics are `greeting`, `v1`, and the configured registry contract address.
#[contractevent(topics = ["greeting", "v1"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GreetingRecordedEvent {
    #[topic]
    pub registry: Address,
    pub record_id: u32,
    pub recipient: String,
    pub count: u32,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Explicitly configures the contract administrator once.
    pub fn initialize(env: Env, admin: Address) -> Result<(), HelloWorldError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(HelloWorldError::AlreadyInitialized);
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Updates the optional activity registry address after administrator authorization.
    pub fn set_registry(
        env: Env,
        admin: Address,
        registry: Address,
    ) -> Result<(), HelloWorldError> {
        let configured_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(HelloWorldError::Unauthorized)?;

        if configured_admin != admin {
            return Err(HelloWorldError::Unauthorized);
        }

        if registry == env.current_contract_address() {
            return Err(HelloWorldError::InvalidRegistry);
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Registry, &registry);
        Ok(())
    }

    pub fn get_registry(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Registry)
    }

    pub fn hello(env: Env, to: String) -> Vec<String> {
        let message = String::from_str(&env, "Hello");

        let key = symbol_short!("count");

        let current_count: u32 = env.storage().instance().get(&key).unwrap_or(0);

        let new_count = current_count + 1;

        env.storage().instance().set(&key, &new_count);

        HelloEvent {
            to: to.clone(),
            message: message.clone(),
            count: new_count,
        }
        .publish(&env);

        Vec::from_array(&env, [message, to])
    }

    pub fn get_count(env: Env) -> u32 {
        let key = symbol_short!("count");

        env.storage().instance().get(&key).unwrap_or(0)
    }

    pub fn reset_count(env: Env) {
        let key = symbol_short!("count");

        env.storage().instance().set(&key, &0u32);
    }

    /// Opt-in Level 3 greeting flow. Counter state and HelloEvent are committed
    /// only after the typed registry call succeeds.
    pub fn hello_and_record(env: Env, to: String) -> Result<Vec<String>, HelloWorldError> {
        if to.is_empty() || to.len() > MAX_RECIPIENT_LENGTH {
            return Err(HelloWorldError::InvalidRecipient);
        }

        let registry: Address = env
            .storage()
            .instance()
            .get(&DataKey::Registry)
            .ok_or(HelloWorldError::RegistryNotConfigured)?;

        let key = symbol_short!("count");
        let current_count: u32 = env.storage().instance().get(&key).unwrap_or(0);
        let new_count = current_count
            .checked_add(1)
            .ok_or(HelloWorldError::RegistryCallFailed)?;

        let registry_client = RegistryClient::new(&env, &registry);
        let registry_result =
            registry_client.try_record_greeting(&env.current_contract_address(), &to, &new_count);

        let record_id = match registry_result {
            Ok(Ok(record_id)) if record_id > 0 => record_id,
            _ => return Err(HelloWorldError::RegistryCallFailed),
        };

        let message = String::from_str(&env, "Hello");
        env.storage().instance().set(&key, &new_count);

        HelloEvent {
            to: to.clone(),
            message: message.clone(),
            count: new_count,
        }
        .publish(&env);

        GreetingRecordedEvent {
            registry,
            record_id,
            recipient: to.clone(),
            count: new_count,
        }
        .publish(&env);

        Ok(Vec::from_array(&env, [message, to]))
    }
}

mod test;
