#![no_std]

use soroban_sdk::{
    contract,
    contractevent,
    contractimpl,
    symbol_short,
    Env,
    String,
    Vec,
};

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HelloEvent {
    pub to: String,
    pub message: String,
    pub count: u32,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn hello(env: Env, to: String) -> Vec<String> {
        let message = String::from_str(&env, "Hello");

        let key = symbol_short!("count");

        let current_count: u32 =
            env.storage()
                .instance()
                .get(&key)
                .unwrap_or(0);

        let new_count = current_count + 1;

        env.storage()
            .instance()
            .set(&key, &new_count);

        HelloEvent {
            to: to.clone(),
            message: message.clone(),
            count: new_count,
        }
        .publish(&env);

        Vec::from_array(
            &env,
            [message, to],
        )
    }

    pub fn get_count(env: Env) -> u32 {
        let key = symbol_short!("count");

        env.storage()
            .instance()
            .get(&key)
            .unwrap_or(0)
    }

    pub fn reset_count(env: Env) {
        let key = symbol_short!("count");

        env.storage()
            .instance()
            .set(&key, &0u32);
    }
}

mod test;