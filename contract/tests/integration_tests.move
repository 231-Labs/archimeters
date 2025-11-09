#[test_only]
module archimeters::integration_tests {
    use std::string;
    use std::option;
    use sui::test_scenario::{Self as ts};
    use sui::clock;
    
    use archimeters::archimeters::MemberShip;
    use archimeters::atelier::{Self, AtelierState, ATELIER};
    use archimeters::test_helpers::{
        setup_test, create_clock, register_user,
        create_test_parameter_vectors, designer, one_sui
    };

    #[test]
    fun test_atelier_mint_as_party_object() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Step 1: Register designer
        register_user(&mut scenario, designer(), b"Alice", b"Designer user", &clock);
        
        // Step 2: Designer creates atelier (will be transferred as party object)
        ts::next_tx(&mut scenario, designer());
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
                5 * one_sui(),
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
        
        // Step 3: Verify atelier was transferred to designer as party object
        ts::next_tx(&mut scenario, designer());
        {
            // Atelier should now be owned by designer
            assert!(ts::has_most_recent_for_sender<atelier::Atelier<ATELIER>>(&scenario), 0);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_membership_registration() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Register a user
        register_user(&mut scenario, designer(), b"Alice", b"Designer user", &clock);
        
        // Verify membership exists
        ts::next_tx(&mut scenario, designer());
        {
            let membership = ts::take_from_sender<MemberShip>(&scenario);
            ts::return_to_sender(&scenario, membership);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ===== NEW TESTS: Parameter Validation =====

    #[test]
    #[expected_failure(abort_code = archimeters::sculpt::ENO_INVALID_PARAMETER)]
    fun test_mint_sculpt_with_parameter_above_max() {
        use sui::coin;
        use sui::sui::SUI;
        use sui::kiosk;
        use archimeters::atelier::{Atelier, AtelierPool};
        use archimeters::sculpt;
        
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Register user and create atelier
        register_user(&mut scenario, designer(), b"Alice", b"Designer user", &clock);
        
        ts::next_tx(&mut scenario, designer());
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
                5 * one_sui(),
                keys, types, labels, min_values, max_values, default_values,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier_state);
            ts::return_to_sender(&scenario, membership);
        };
        
        // Create kiosk for designer
        ts::next_tx(&mut scenario, designer());
        {
            let (kiosk, cap) = kiosk::new(ts::ctx(&mut scenario));
            transfer::public_share_object(kiosk);
            transfer::public_transfer(cap, designer());
        };
        
        // Try to mint sculpt with width=2000 (exceeds max of 1000)
        ts::next_tx(&mut scenario, designer());
        {
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let mut kiosk = ts::take_shared<kiosk::Kiosk>(&scenario);
            let cap = ts::take_from_sender<kiosk::KioskOwnerCap>(&scenario);
            
            let param_keys = vector[string::utf8(b"width"), string::utf8(b"height")];
            let param_values = vector[2000, 500]; // width=2000 exceeds max=1000!
            
            let payment = coin::mint_for_testing<SUI>(5 * one_sui(), ts::ctx(&mut scenario));
            
            // This should FAIL with ENO_INVALID_PARAMETER
            sculpt::mint_sculpt<ATELIER>(
                &atelier,
                &mut pool,
                &mut membership,
                &mut kiosk,
                &cap,
                string::utf8(b"Test Sculpt"),
                string::utf8(b"blueprint_blob_id"),
                string::utf8(b"glb_file_blob_id"),
                option::none(), // No STL for this test
                param_keys,
                param_values,
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, atelier);
            ts::return_shared(pool);
            ts::return_to_sender(&scenario, membership);
            ts::return_shared(kiosk);
            ts::return_to_sender(&scenario, cap);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = archimeters::sculpt::ENO_INVALID_PARAMETER)]
    fun test_mint_sculpt_with_parameter_below_min() {
        use sui::coin;
        use sui::sui::SUI;
        use sui::kiosk;
        use archimeters::atelier::{Atelier, AtelierPool};
        use archimeters::sculpt;
        
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Register user and create atelier
        register_user(&mut scenario, designer(), b"Alice", b"Designer user", &clock);
        
        ts::next_tx(&mut scenario, designer());
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
                5 * one_sui(),
                keys, types, labels, min_values, max_values, default_values,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier_state);
            ts::return_to_sender(&scenario, membership);
        };
        
        // Create kiosk for designer
        ts::next_tx(&mut scenario, designer());
        {
            let (kiosk, cap) = kiosk::new(ts::ctx(&mut scenario));
            transfer::public_share_object(kiosk);
            transfer::public_transfer(cap, designer());
        };
        
        // Try to mint sculpt with height=50 (below min of 100)
        ts::next_tx(&mut scenario, designer());
        {
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let mut kiosk = ts::take_shared<kiosk::Kiosk>(&scenario);
            let cap = ts::take_from_sender<kiosk::KioskOwnerCap>(&scenario);
            
            let param_keys = vector[string::utf8(b"width"), string::utf8(b"height")];
            let param_values = vector[500, 50]; // height=50 below min=100!
            
            let payment = coin::mint_for_testing<SUI>(5 * one_sui(), ts::ctx(&mut scenario));
            
            // This should FAIL with ENO_INVALID_PARAMETER
            sculpt::mint_sculpt<ATELIER>(
                &atelier,
                &mut pool,
                &mut membership,
                &mut kiosk,
                &cap,
                string::utf8(b"Test Sculpt"),
                string::utf8(b"blueprint_blob_id"),
                string::utf8(b"glb_file_blob_id"),
                option::none(), // No STL for this test
                param_keys,
                param_values,
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, atelier);
            ts::return_shared(pool);
            ts::return_to_sender(&scenario, membership);
            ts::return_shared(kiosk);
            ts::return_to_sender(&scenario, cap);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = archimeters::sculpt::ENO_EMPTY_PARAMETERS)]
    fun test_mint_sculpt_with_empty_parameters() {
        use sui::coin;
        use sui::sui::SUI;
        use sui::kiosk;
        use archimeters::atelier::{Atelier, AtelierPool};
        use archimeters::sculpt;
        
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Register user and create atelier
        register_user(&mut scenario, designer(), b"Alice", b"Designer user", &clock);
        
        ts::next_tx(&mut scenario, designer());
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
                5 * one_sui(),
                keys, types, labels, min_values, max_values, default_values,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier_state);
            ts::return_to_sender(&scenario, membership);
        };
        
        // Create kiosk for designer
        ts::next_tx(&mut scenario, designer());
        {
            let (kiosk, cap) = kiosk::new(ts::ctx(&mut scenario));
            transfer::public_share_object(kiosk);
            transfer::public_transfer(cap, designer());
        };
        
        // Try to mint sculpt with EMPTY parameters (should FAIL)
        ts::next_tx(&mut scenario, designer());
        {
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let mut kiosk = ts::take_shared<kiosk::Kiosk>(&scenario);
            let cap = ts::take_from_sender<kiosk::KioskOwnerCap>(&scenario);
            
            // Empty parameter arrays!
            let param_keys = vector[];
            let param_values = vector[];
            
            let payment = coin::mint_for_testing<SUI>(5 * one_sui(), ts::ctx(&mut scenario));
            
            // This should FAIL with ENO_EMPTY_PARAMETERS
            sculpt::mint_sculpt<ATELIER>(
                &atelier,
                &mut pool,
                &mut membership,
                &mut kiosk,
                &cap,
                string::utf8(b"Test Sculpt"),
                string::utf8(b"blueprint_blob_id"),
                string::utf8(b"glb_file_blob_id"),
                option::none(), // No STL for this test
                param_keys,
                param_values,
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, atelier);
            ts::return_shared(pool);
            ts::return_to_sender(&scenario, membership);
            ts::return_shared(kiosk);
            ts::return_to_sender(&scenario, cap);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_mint_sculpt_with_valid_parameters() {
        use sui::coin;
        use sui::sui::SUI;
        use sui::kiosk;
        use archimeters::atelier::{Atelier, AtelierPool};
        use archimeters::sculpt;
        
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Register user and create atelier
        register_user(&mut scenario, designer(), b"Alice", b"Designer user", &clock);
        
        ts::next_tx(&mut scenario, designer());
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
                5 * one_sui(),
                keys, types, labels, min_values, max_values, default_values,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier_state);
            ts::return_to_sender(&scenario, membership);
        };
        
        // Create kiosk for designer
        ts::next_tx(&mut scenario, designer());
        {
            let (kiosk, cap) = kiosk::new(ts::ctx(&mut scenario));
            transfer::public_share_object(kiosk);
            transfer::public_transfer(cap, designer());
        };
        
        // Mint sculpt with valid parameters (within range)
        ts::next_tx(&mut scenario, designer());
        {
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let mut kiosk = ts::take_shared<kiosk::Kiosk>(&scenario);
            let cap = ts::take_from_sender<kiosk::KioskOwnerCap>(&scenario);
            
            let param_keys = vector[string::utf8(b"width"), string::utf8(b"height")];
            let param_values = vector[500, 800]; // Both within range 100-1000
            
            let payment = coin::mint_for_testing<SUI>(5 * one_sui(), ts::ctx(&mut scenario));
            
            // This should SUCCEED
            sculpt::mint_sculpt<ATELIER>(
                &atelier,
                &mut pool,
                &mut membership,
                &mut kiosk,
                &cap,
                string::utf8(b"Test Sculpt"),
                string::utf8(b"blueprint_blob_id"),
                string::utf8(b"glb_file_blob_id"),
                option::none(), // No STL for this test
                param_keys,
                param_values,
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, atelier);
            ts::return_shared(pool);
            ts::return_to_sender(&scenario, membership);
            ts::return_shared(kiosk);
            ts::return_to_sender(&scenario, cap);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}

