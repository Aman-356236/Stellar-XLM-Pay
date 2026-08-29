#![cfg(test)]

use super::*;
use activity_registry::{
    Activity, ActivityRecordedEvent, ActivityRegistry, ActivityRegistryClient,
};
use soroban_sdk::{
    testutils::{Address as _, Events as _},
    vec, Address, Env, Event as _, String,
};

#[test]
fn existing_hello_behavior_and_counter_are_preserved() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let words = client.hello(&String::from_str(&env, "Dev"));
    assert_eq!(
        words,
        vec![
            &env,
            String::from_str(&env, "Hello"),
            String::from_str(&env, "Dev"),
        ]
    );
    assert_eq!(client.get_count(), 1);

    let second_words = client.hello(&String::from_str(&env, "Aman"));
    assert_eq!(
        second_words,
        vec![
            &env,
            String::from_str(&env, "Hello"),
            String::from_str(&env, "Aman"),
        ]
    );
    assert_eq!(client.get_count(), 2);
}

#[test]
fn reset_count_is_preserved() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.hello(&String::from_str(&env, "Dev"));
    assert_eq!(client.get_count(), 1);
    client.reset_count();
    assert_eq!(client.get_count(), 0);
}

#[test]
fn hello_emits_the_existing_event() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let to = String::from_str(&env, "Dev");

    client.hello(&to);

    assert_eq!(
        env.events().all(),
        [HelloEvent {
            to,
            message: String::from_str(&env, "Hello"),
            count: 1,
        }
        .to_xdr(&env, &contract_id)]
    );
}

#[test]
fn records_a_greeting_through_the_configured_registry() {
    let env = Env::default();
    let hello_id = env.register(Contract, ());
    let registry_id = env.register(ActivityRegistry, ());
    let hello = ContractClient::new(&env, &hello_id);
    let registry = ActivityRegistryClient::new(&env, &registry_id);
    let admin = Address::generate(&env);
    let recipient = String::from_str(&env, "Dev");

    hello.mock_all_auths().initialize(&admin);
    hello.mock_all_auths().set_registry(&admin, &registry_id);
    let words = hello.hello_and_record(&recipient).unwrap();

    assert_eq!(
        words,
        vec![&env, String::from_str(&env, "Hello"), recipient.clone(),]
    );
    assert_eq!(hello.get_count(), 1);
    assert_eq!(registry.get_record_count(), 1);
    assert_eq!(
        registry.get_activity(&recipient),
        Some(Activity {
            record_id: 1,
            caller: hello_id,
            recipient: recipient.clone(),
            count: 1,
        })
    );
    assert_eq!(
        env.events().all(),
        [
            ActivityRecordedEvent {
                caller: hello_id.clone(),
                record_id: 1,
                recipient: recipient.clone(),
                count: 1,
            }
            .to_xdr(&env, &registry_id),
            HelloEvent {
                to: recipient.clone(),
                message: String::from_str(&env, "Hello"),
                count: 1,
            }
            .to_xdr(&env, &hello_id),
            GreetingRecordedEvent {
                registry: registry_id,
                record_id: 1,
                recipient,
                count: 1,
            }
            .to_xdr(&env, &hello_id),
        ]
    );
}

#[test]
fn rejects_unauthorized_registry_configuration() {
    let env = Env::default();
    let hello_id = env.register(Contract, ());
    let registry_id = env.register(ActivityRegistry, ());
    let hello = ContractClient::new(&env, &hello_id);
    let admin = Address::generate(&env);
    let other = Address::generate(&env);

    hello.mock_all_auths().initialize(&admin);

    assert_eq!(
        hello
            .mock_all_auths()
            .try_set_registry(&other, &registry_id),
        Err(Ok(HelloWorldError::Unauthorized))
    );
    assert_eq!(hello.get_registry(), None);
}

#[test]
fn rejects_invalid_registry_configuration() {
    let env = Env::default();
    let hello_id = env.register(Contract, ());
    let hello = ContractClient::new(&env, &hello_id);
    let admin = Address::generate(&env);

    hello.mock_all_auths().initialize(&admin);

    assert_eq!(
        hello.mock_all_auths().try_set_registry(&admin, &hello_id),
        Err(Ok(HelloWorldError::InvalidRegistry))
    );
    assert_eq!(hello.get_registry(), None);
}

#[test]
fn external_call_failure_does_not_change_hello_state() {
    let env = Env::default();
    let hello_id = env.register(Contract, ());
    let hello = ContractClient::new(&env, &hello_id);
    let admin = Address::generate(&env);
    let unregistered_registry = Address::generate(&env);

    hello.mock_all_auths().initialize(&admin);
    hello
        .mock_all_auths()
        .set_registry(&admin, &unregistered_registry);

    assert_eq!(
        hello.try_hello_and_record(&String::from_str(&env, "Dev")),
        Err(Ok(HelloWorldError::RegistryCallFailed))
    );
    assert_eq!(hello.get_count(), 0);
    assert!(env.events().all().events().is_empty());
}
