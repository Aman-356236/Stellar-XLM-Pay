#![no_std]

use soroban_sdk::{
    contract,
    contractimpl,
    symbol_short,
    vec,
    Env,
    String,
    Vec,
};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn hello(env: Env, to: String) -> Vec<String> {
        let message = String::from_str(&env, "Hello");

        // Emit a contract event
        env.events().publish(
            (symbol_short!("hello"),),
            to.clone(),
        );

        // Return the actual contract value
        vec![&env, message, to]
    }
}

mod test;