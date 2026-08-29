#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Events as _},
    Address, Env, Event as _, String,
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
            caller: caller.clone(),
            recipient: recipient.clone(),
            count: 1,
        })
    );
    assert_eq!(client.get_record_count(), 1);
    assert_eq!(
        env.events().all(),
        [ActivityRecordedEvent {
            caller,
            recipient,
            count: 1,
        }
        .to_xdr(&env, &contract_id)]
    );
}

#[test]
fn rejects_invalid_activity_input() {
    let env = Env::default();
    let contract_id = env.register(ActivityRegistry, ());
    let client = ActivityRegistryClient::new(&env, &contract_id);
    let caller = Address::generate(&env);
    let recipient = String::from_str(&env, "Dev");

    assert_eq!(
        client.try_record_greeting(&caller, &String::from_str(&env, ""), &1),
        Err(Ok(ActivityRegistryError::InvalidRecipient))
    );
    assert_eq!(
        client.try_record_greeting(&caller, &recipient, &0),
        Err(Ok(ActivityRegistryError::InvalidCount))
    );
    assert_eq!(client.get_record_count(), 0);
}
