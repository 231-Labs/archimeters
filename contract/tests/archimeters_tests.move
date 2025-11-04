#[test_only]
module archimeters::archimeters_tests {
    use std::string;
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::kiosk::{Self, Kiosk, KioskOwnerCap};
    
    use archimeters::archimeters::{Self, State, MemberShip};
    use archimeters::atelier::{Self, Atelier, AtelierState, AtelierCap, ATELIER};
    use archimeters::sculpt::{Self};

    // Test addresses
    const ADMIN: address = @0xAD;
    const DESIGNER: address = @0x1;  // Creates ateliers
    const COLLECTOR: address = @0x2; // Buys sculpts
    
    // Test constants
    const ONE_SUI: u64 = 1_000_000_000;

    // == Setup Functions ==
    
    /// Initialize all modules and return the scenario
    fun setup_test(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize State and AtelierState manually for testing
        ts::next_tx(&mut scenario, ADMIN);
        {
            // Create and share State
            archimeters::new_state_for_testing(ts::ctx(&mut scenario));
            
            // Create and share AtelierState
            atelier::new_atelier_state_for_testing(ts::ctx(&mut scenario));
        };
        
        scenario
    }

    /// Create a clock object for testing
    fun create_clock(scenario: &mut Scenario): Clock {
        ts::next_tx(scenario, ADMIN);
        clock::create_for_testing(ts::ctx(scenario))
    }

    /// Create a test coin with specified amount
    fun create_test_coin(scenario: &mut Scenario, amount: u64, user: address): Coin<SUI> {
        ts::next_tx(scenario, user);
        coin::mint_for_testing<SUI>(amount, ts::ctx(scenario))
    }

    /// Register a user and return their membership
    fun register_user(
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
    fun create_test_parameter_vectors(): (
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

    // == Integration Tests ==

    #[test]
    fun test_full_flow_success() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Step 1: Register designer
        register_user(&mut scenario, DESIGNER, b"Alice", b"Designer user", &clock);
        
        // Step 2: Designer creates atelier
        ts::next_tx(&mut scenario, DESIGNER);
        {
            let mut atelier_state = ts::take_shared<AtelierState>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let (keys, types, labels, min_values, max_values, default_values) = create_test_parameter_vectors();
            
            atelier::mint_atelier<ATELIER>(
                &mut atelier_state,
                &mut membership,
                string::utf8(b"Test Atelier"),
                string::utf8(b"photo_blob_id"),
                string::utf8(b"data_blob_id"),
                string::utf8(b"algorithm_blob_id"),
                &clock,
                5 * ONE_SUI, // 5 SUI price in MIST
                keys,
                types,
                labels,
                min_values,
                max_values,
                default_values,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier_state);
            ts::return_to_sender(&scenario, membership);
        };
        
        // Step 3: Create kiosk for collector (who will buy the sculpt)
        ts::next_tx(&mut scenario, COLLECTOR);
        let (kiosk, kiosk_cap) = kiosk::new(ts::ctx(&mut scenario));
        transfer::public_transfer(kiosk_cap, COLLECTOR);
        transfer::public_share_object(kiosk);
        
        // Step 4: Collector registers
        register_user(&mut scenario, COLLECTOR, b"Bob", b"Collector user", &clock);
        
        // Step 5: Collector mints a sculpt with valid parameters
        ts::next_tx(&mut scenario, COLLECTOR);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let kiosk_cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            let mut payment = create_test_coin(&mut scenario, 5 * ONE_SUI, COLLECTOR);
            
            // Valid parameters (within range)
            let param_keys = vector[
                string::utf8(b"width"),
                string::utf8(b"height")
            ];
            let param_values = vector[500, 750]; // Both within 100-1000 range
            
            sculpt::mint_sculpt<ATELIER>(
                &mut atelier,
                &mut membership,
                &mut kiosk,
                &kiosk_cap,
                string::utf8(b"My Sculpt"),
                string::utf8(b"blueprint_blob_id"),
                string::utf8(b"structure_blob_id"),
                param_keys,
                param_values,
                &mut payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, membership);
            ts::return_shared(kiosk);
            ts::return_to_sender(&scenario, kiosk_cap);
            coin::burn_for_testing(payment);
        };
        
        // Step 6: Designer withdraws funds from atelier
        ts::next_tx(&mut scenario, DESIGNER);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let atelier_cap = ts::take_from_sender<AtelierCap>(&scenario);
            
            // Check pool balance
            let pool = atelier::get_pool(&atelier);
            assert!(sui::balance::value(pool) == 5 * ONE_SUI, 0);
            
            // Withdraw to designer
            atelier::withdraw_pool<ATELIER>(
                &mut atelier,
                &atelier_cap,
                5 * ONE_SUI,
                DESIGNER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, atelier_cap);
        };
        
        // Verify withdrawal received by designer
        ts::next_tx(&mut scenario, DESIGNER);
        {
            let withdrawn_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&withdrawn_coin) == 5 * ONE_SUI, 1);
            ts::return_to_sender(&scenario, withdrawn_coin);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_mint_sculpt_with_invalid_parameter_too_high() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Setup: Register designer and create atelier
        register_user(&mut scenario, DESIGNER, b"Alice", b"Designer user", &clock);
        
        ts::next_tx(&mut scenario, DESIGNER);
        {
            let mut atelier_state = ts::take_shared<AtelierState>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let (keys, types, labels, min_values, max_values, default_values) = create_test_parameter_vectors();
            
            atelier::mint_atelier<ATELIER>(
                &mut atelier_state,
                &mut membership,
                string::utf8(b"Test Atelier"),
                string::utf8(b"photo_blob_id"),
                string::utf8(b"data_blob_id"),
                string::utf8(b"algorithm_blob_id"),
                &clock,
                5 * ONE_SUI,
                keys,
                types,
                labels,
                min_values,
                max_values,
                default_values,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier_state);
            ts::return_to_sender(&scenario, membership);
        };
        
        register_user(&mut scenario, COLLECTOR, b"Bob", b"Collector user", &clock);
        
        ts::next_tx(&mut scenario, COLLECTOR);
        let (kiosk, kiosk_cap) = kiosk::new(ts::ctx(&mut scenario));
        transfer::public_transfer(kiosk_cap, COLLECTOR);
        transfer::public_share_object(kiosk);
        
        // Try to mint with invalid parameter (too high)
        ts::next_tx(&mut scenario, COLLECTOR);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let kiosk_cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            let mut payment = create_test_coin(&mut scenario, 5 * ONE_SUI, COLLECTOR);
            
            // Invalid parameter: width = 1500 (max is 1000)
            let param_keys = vector[
                string::utf8(b"width"),
                string::utf8(b"height")
            ];
            let param_values = vector[1500, 500]; // width exceeds max!
            
            sculpt::mint_sculpt<ATELIER>(
                &mut atelier,
                &mut membership,
                &mut kiosk,
                &kiosk_cap,
                string::utf8(b"My Sculpt"),
                string::utf8(b"blueprint_blob_id"),
                string::utf8(b"structure_blob_id"),
                param_keys,
                param_values,
                &mut payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, membership);
            ts::return_shared(kiosk);
            ts::return_to_sender(&scenario, kiosk_cap);
            coin::burn_for_testing(payment);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_mint_sculpt_with_invalid_parameter_too_low() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Setup
        register_user(&mut scenario, DESIGNER, b"Alice", b"Test user", &clock);
        
        ts::next_tx(&mut scenario, DESIGNER);
        {
            let mut atelier_state = ts::take_shared<AtelierState>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let (keys, types, labels, min_values, max_values, default_values) = create_test_parameter_vectors();
            
            atelier::mint_atelier<ATELIER>(
                &mut atelier_state,
                &mut membership,
                string::utf8(b"Test Atelier"),
                string::utf8(b"photo_blob_id"),
                string::utf8(b"data_blob_id"),
                string::utf8(b"algorithm_blob_id"),
                &clock,
                5 * ONE_SUI,
                keys,
                types,
                labels,
                min_values,
                max_values,
                default_values,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier_state);
            ts::return_to_sender(&scenario, membership);
        };
        
        register_user(&mut scenario, COLLECTOR, b"Bob", b"Buyer", &clock);
        
        ts::next_tx(&mut scenario, COLLECTOR);
        let (kiosk, kiosk_cap) = kiosk::new(ts::ctx(&mut scenario));
        transfer::public_transfer(kiosk_cap, COLLECTOR);
        transfer::public_share_object(kiosk);
        
        // Try to mint with invalid parameter (too low)
        ts::next_tx(&mut scenario, COLLECTOR);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let kiosk_cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            let mut payment = create_test_coin(&mut scenario, 5 * ONE_SUI, COLLECTOR);
            
            // Invalid parameter: height = 50 (min is 100)
            let param_keys = vector[
                string::utf8(b"width"),
                string::utf8(b"height")
            ];
            let param_values = vector[500, 50]; // height below min!
            
            sculpt::mint_sculpt<ATELIER>(
                &mut atelier,
                &mut membership,
                &mut kiosk,
                &kiosk_cap,
                string::utf8(b"My Sculpt"),
                string::utf8(b"blueprint_blob_id"),
                string::utf8(b"structure_blob_id"),
                param_keys,
                param_values,
                &mut payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, membership);
            ts::return_shared(kiosk);
            ts::return_to_sender(&scenario, kiosk_cap);
            coin::burn_for_testing(payment);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_mint_sculpt_with_mismatched_parameter_count() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Setup
        register_user(&mut scenario, DESIGNER, b"Alice", b"Test user", &clock);
        
        ts::next_tx(&mut scenario, DESIGNER);
        {
            let mut atelier_state = ts::take_shared<AtelierState>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let (keys, types, labels, min_values, max_values, default_values) = create_test_parameter_vectors();
            
            atelier::mint_atelier<ATELIER>(
                &mut atelier_state,
                &mut membership,
                string::utf8(b"Test Atelier"),
                string::utf8(b"photo_blob_id"),
                string::utf8(b"data_blob_id"),
                string::utf8(b"algorithm_blob_id"),
                &clock,
                5 * ONE_SUI,
                keys,
                types,
                labels,
                min_values,
                max_values,
                default_values,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier_state);
            ts::return_to_sender(&scenario, membership);
        };
        
        register_user(&mut scenario, COLLECTOR, b"Bob", b"Buyer", &clock);
        
        ts::next_tx(&mut scenario, COLLECTOR);
        let (kiosk, kiosk_cap) = kiosk::new(ts::ctx(&mut scenario));
        transfer::public_transfer(kiosk_cap, COLLECTOR);
        transfer::public_share_object(kiosk);
        
        // Try to mint with mismatched key/value count
        ts::next_tx(&mut scenario, COLLECTOR);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let kiosk_cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            let mut payment = create_test_coin(&mut scenario, 5 * ONE_SUI, COLLECTOR);
            
            // Mismatched: 2 keys but 3 values
            let param_keys = vector[
                string::utf8(b"width"),
                string::utf8(b"height")
            ];
            let param_values = vector[500, 750, 600]; // Extra value!
            
            sculpt::mint_sculpt<ATELIER>(
                &mut atelier,
                &mut membership,
                &mut kiosk,
                &kiosk_cap,
                string::utf8(b"My Sculpt"),
                string::utf8(b"blueprint_blob_id"),
                string::utf8(b"structure_blob_id"),
                param_keys,
                param_values,
                &mut payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, membership);
            ts::return_shared(kiosk);
            ts::return_to_sender(&scenario, kiosk_cap);
            coin::burn_for_testing(payment);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_mint_sculpt_with_insufficient_payment() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Setup
        register_user(&mut scenario, DESIGNER, b"Alice", b"Test user", &clock);
        
        ts::next_tx(&mut scenario, DESIGNER);
        {
            let mut atelier_state = ts::take_shared<AtelierState>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let (keys, types, labels, min_values, max_values, default_values) = create_test_parameter_vectors();
            
            atelier::mint_atelier<ATELIER>(
                &mut atelier_state,
                &mut membership,
                string::utf8(b"Test Atelier"),
                string::utf8(b"photo_blob_id"),
                string::utf8(b"data_blob_id"),
                string::utf8(b"algorithm_blob_id"),
                &clock,
                5 * ONE_SUI,
                keys,
                types,
                labels,
                min_values,
                max_values,
                default_values,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier_state);
            ts::return_to_sender(&scenario, membership);
        };
        
        register_user(&mut scenario, COLLECTOR, b"Bob", b"Buyer", &clock);
        
        ts::next_tx(&mut scenario, COLLECTOR);
        let (kiosk, kiosk_cap) = kiosk::new(ts::ctx(&mut scenario));
        transfer::public_transfer(kiosk_cap, COLLECTOR);
        transfer::public_share_object(kiosk);
        
        // Try to mint with insufficient payment
        ts::next_tx(&mut scenario, COLLECTOR);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let kiosk_cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            let mut payment = create_test_coin(&mut scenario, 3 * ONE_SUI, COLLECTOR); // Only 3 SUI (need 5)
            
            let param_keys = vector[
                string::utf8(b"width"),
                string::utf8(b"height")
            ];
            let param_values = vector[500, 750];
            
            sculpt::mint_sculpt<ATELIER>(
                &mut atelier,
                &mut membership,
                &mut kiosk,
                &kiosk_cap,
                string::utf8(b"My Sculpt"),
                string::utf8(b"blueprint_blob_id"),
                string::utf8(b"structure_blob_id"),
                param_keys,
                param_values,
                &mut payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, membership);
            ts::return_shared(kiosk);
            ts::return_to_sender(&scenario, kiosk_cap);
            coin::burn_for_testing(payment);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
