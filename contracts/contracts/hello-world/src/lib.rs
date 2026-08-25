#![no_std]

use soroban_sdk::{
    contract,
    contractevent,
    contractimpl,
    Env,
    String,
    Vec,
};

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HelloEvent {
    pub to: String,
    pub message: String,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn hello(env: Env, to: String) -> Vec<String> {
        let message = String::from_str(&env, "Hello");

        HelloEvent {
            to: to.clone(),
            message: message.clone(),
        }
        .publish(&env);

        Vec::from_array(&env, [message, to])
    }
}

mod test;