#[test_only]
module archimeters::integration_tests {
    use std::string;
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
}

