#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address, Env, String,
};

#[test]
fn records_and_reads_an_activity() {
    let env = Env::default();
    let contract_id = env.register(ActivityRegistry, ());
    let client = ActivityRegistryClient::new(&env, &contract_id);
    let caller = Address::generate(&env);
    let recipient = String::from_str(&env, "Dev");

    client
        .mock_all_auths()
        .record_greeting(&caller, &recipient, &1);

    assert_eq!(
        client.get_activity(&recipient),
        Some(Activity {
            record_id: 1,
            caller: caller.clone(),
            recipient: recipient.clone(),
            count: 1,
        })
    );

    assert_eq!(
        client.get_activity_by_id(&1),
        client.get_activity(&recipient)
    );

    assert_eq!(client.get_record_count(), 1);
}

#[test]
fn rejects_invalid_activity_input() {
    let env = Env::default();
    let contract_id = env.register(ActivityRegistry, ());
    let client = ActivityRegistryClient::new(&env, &contract_id);
    let caller = Address::generate(&env);
    let recipient = String::from_str(&env, "Dev");

    assert_eq!(
        client.try_record_greeting(
            &caller,
            &String::from_str(&env, ""),
            &1
        ),
        Err(Ok(ActivityRegistryError::InvalidRecipient))
    );

    assert_eq!(
        client.try_record_greeting(&caller, &recipient, &0),
        Err(Ok(ActivityRegistryError::InvalidCount))
    );

    assert_eq!(client.get_record_count(), 0);
}
