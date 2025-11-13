#[test_only]
module archimeters::test_helpers {
    use std::string;
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    
    use archimeters::archimeters::{Self, State};
    use archimeters::atelier;

    // Test addresses
    public fun admin(): address { @0xAD }
    public fun designer(): address { @0x1 }
    public fun collector(): address { @0x2 }
    public fun user(): address { @0x3 }
    
    // Test constants
    public fun one_sui(): u64 { 1_000_000_000 }

    /// Initialize all modules and return the scenario
    public fun setup_test(): Scenario {
        let mut scenario = ts::begin(admin());
        
        // Initialize State and AtelierState manually for testing
        ts::next_tx(&mut scenario, admin());
        {
            // Create and share State
            archimeters::new_state_for_testing(ts::ctx(&mut scenario));
            
            // Create and share AtelierState
            atelier::new_atelier_state_for_testing(ts::ctx(&mut scenario));
        };
        
        scenario
    }

    /// Create a clock object for testing
    public fun create_clock(scenario: &mut Scenario): Clock {
        ts::next_tx(scenario, admin());
        clock::create_for_testing(ts::ctx(scenario))
    }

    /// Create a test coin with specified amount
    public fun create_test_coin(scenario: &mut Scenario, amount: u64, user: address): Coin<SUI> {
        ts::next_tx(scenario, user);
        coin::mint_for_testing<SUI>(amount, ts::ctx(scenario))
    }

    /// Register a user and return their membership
    public fun register_user(
        scenario: &mut Scenario, 
        user: address, 
        username: vector<u8>,
        description: vector<u8>,
        clock: &Clock
    ) {
        ts::next_tx(scenario, user);
        let mut state = ts::take_shared<State>(scenario);
        
        archimeters::mint_membership(
            &mut state,
            string::utf8(username),
            string::utf8(description),
            clock,
            ts::ctx(scenario)
        );
        
        ts::return_shared(state);
    }

    /// Create test parameter vectors (keys, types, labels, min, max, default)
    public fun create_test_parameter_vectors(): (
        vector<string::String>,
        vector<string::String>,
        vector<string::String>,
        vector<u64>,
        vector<u64>,
        vector<u64>
    ) {
        let keys = vector[
            string::utf8(b"width"),
            string::utf8(b"height")
        ];
        let types = vector[
            string::utf8(b"number"),
            string::utf8(b"number")
        ];
        let labels = vector[
            string::utf8(b"Width"),
            string::utf8(b"Height")
        ];
        let min_values = vector[100, 100];
        let max_values = vector[1000, 1000];
        let default_values = vector[500, 500];
        
        (keys, types, labels, min_values, max_values, default_values)
    }
}

