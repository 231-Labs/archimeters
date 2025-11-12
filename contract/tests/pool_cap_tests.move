#[test_only]
module archimeters::pool_cap_tests {
    use std::string;
    use sui::test_scenario::{Self as ts};
    use sui::clock;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    
    use archimeters::archimeters::MemberShip;
    use archimeters::atelier::{
        Self, 
        AtelierState, 
        ATELIER,
        Atelier,
        AtelierPool,
        AtelierPoolCap,
    };
    use archimeters::test_helpers::{
        setup_test, 
        create_clock, 
        register_user,
        create_test_parameter_vectors, 
        designer, 
        user,
        one_sui
    };

    // Helper function to mint an atelier and return pool/cap IDs
    fun mint_test_atelier(
        scenario: &mut ts::Scenario,
        clock: &clock::Clock,
    ): (address, address) {
        // Register designer
        register_user(scenario, designer(), b"Designer", b"Designer user", clock);
        
        // Mint atelier
        ts::next_tx(scenario, designer());
        {
            let mut atelier_state = ts::take_shared<AtelierState>(scenario);
            let mut membership = ts::take_from_sender<MemberShip>(scenario);
            let (keys, types, labels, min_values, max_values, default_values) = create_test_parameter_vectors();
            
            atelier::mint_atelier<ATELIER>(
                &mut atelier_state,
                &mut membership,
                string::utf8(b"Test Atelier"),
                string::utf8(b"photo_blob_id"),
                string::utf8(b"data_blob_id"),
                string::utf8(b"algorithm_blob_id"),
                clock,
                5 * one_sui(),
                keys,
                types,
                labels,
                min_values,
                max_values,
                default_values,
                ts::ctx(scenario)
            );
            
            ts::return_shared(atelier_state);
            ts::return_to_sender(scenario, membership);
        };
        
        // Get pool ID from shared atelier object
        ts::next_tx(scenario, designer());
        let pool_id;
        {
            let atelier = ts::take_shared<Atelier<ATELIER>>(scenario);
            pool_id = atelier::get_pool_id(&atelier);
            ts::return_shared(atelier);
        };
        
        (object::id_to_address(&pool_id), @0x0)  // Cap ID is owned by designer
    }

    // Helper to add funds to pool
    fun add_funds_to_pool(
        scenario: &mut ts::Scenario,
        pool_addr: address,
        amount: u64,
    ) {
        ts::next_tx(scenario, user());
        {
            let mut pool = ts::take_shared_by_id<AtelierPool<ATELIER>>(scenario, object::id_from_address(pool_addr));
            let payment = coin::mint_for_testing<SUI>(amount, ts::ctx(scenario));
            atelier::add_payment_to_pool<ATELIER>(&mut pool, payment);
            ts::return_shared(pool);
        };
    }

    // ========================================================================
    // Test 1: Cap holder CAN withdraw
    // ========================================================================
    #[test]
    fun test_cap_holder_can_withdraw() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier (designer gets cap)
        let (pool_addr, _cap_addr) = mint_test_atelier(&mut scenario, &clock);
        
        // Add funds to pool
        add_funds_to_pool(&mut scenario, pool_addr, 10 * one_sui());
        
        // Designer withdraws (has pool_cap)
        ts::next_tx(&mut scenario, designer());
        {
            let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared_by_id<AtelierPool<ATELIER>>(&scenario, object::id_from_address(pool_addr));
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            
            // Get balance before
            let balance_before = atelier::get_pool_balance<ATELIER>(&pool);
            assert!(balance_before == 10 * one_sui(), 0);
            
            // Withdraw 5 SUI
            atelier::withdraw_pool<ATELIER>(
                &pool_cap,
                &atelier,
                &mut pool,
                5 * one_sui(),
                designer(),
                ts::ctx(&mut scenario)
            );
            
            // Verify balance after
            let balance_after = atelier::get_pool_balance<ATELIER>(&pool);
            assert!(balance_after == 5 * one_sui(), 1);
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, pool_cap);
            ts::return_shared(pool);
        };
        
        // Verify designer received the coin
        ts::next_tx(&mut scenario, designer());
        {
            let received_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&received_coin) == 5 * one_sui(), 2);
            ts::return_to_sender(&scenario, received_coin);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ========================================================================
    // Test 2: Non-cap holder CANNOT withdraw (反向測試)
    // ========================================================================
    #[test]
    #[expected_failure(abort_code = sui::test_scenario::EEmptyInventory)]
    fun test_non_cap_holder_cannot_withdraw() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier (designer gets cap)
        let (pool_addr, _cap_addr) = mint_test_atelier(&mut scenario, &clock);
        
        // Add funds
        add_funds_to_pool(&mut scenario, pool_addr, 10 * one_sui());
        
        // Register another user
        register_user(&mut scenario, user(), b"User", b"Regular user", &clock);
        
        // User tries to withdraw but doesn't own the pool_cap
        ts::next_tx(&mut scenario, user());
        {
            let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared_by_id<AtelierPool<ATELIER>>(&scenario, object::id_from_address(pool_addr));
            
            // User tries to take pool_cap but doesn't own it - this will fail
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            
            // Should never reach here
            atelier::withdraw_pool<ATELIER>(
                &pool_cap,
                &atelier,
                &mut pool,
                5 * one_sui(),
                user(),
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, pool_cap);
            ts::return_shared(pool);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ========================================================================
    // Test 3: After pool_cap transfer, NEW owner can withdraw
    // ========================================================================
    #[test]
    fun test_cap_transfer_changes_permission() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier (designer owns pool_cap)
        let (pool_addr, _cap_addr) = mint_test_atelier(&mut scenario, &clock);
        
        // Register user
        register_user(&mut scenario, user(), b"User", b"Regular user", &clock);
        
        // Add funds
        add_funds_to_pool(&mut scenario, pool_addr, 10 * one_sui());
        
        // Designer transfers pool_cap to user
        ts::next_tx(&mut scenario, designer());
        {
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            transfer::public_transfer(pool_cap, user());
        };
        
        // Now user (new pool_cap owner) CAN withdraw
        ts::next_tx(&mut scenario, user());
        {
            let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared_by_id<AtelierPool<ATELIER>>(&scenario, object::id_from_address(pool_addr));
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            
            // User withdraws successfully
            atelier::withdraw_pool<ATELIER>(
                &pool_cap,
                &atelier,
                &mut pool,
                3 * one_sui(),
                user(),
                ts::ctx(&mut scenario)
            );
            
            let balance_after = atelier::get_pool_balance<ATELIER>(&pool);
            assert!(balance_after == 7 * one_sui(), 0);
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, pool_cap);
            ts::return_shared(pool);
        };
        
        // Verify user received the withdrawn amount
        ts::next_tx(&mut scenario, user());
        {
            let received_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            // User should receive some amount
            let actual = coin::value(&received_coin);
            assert!(actual > 0, 1);
            ts::return_to_sender(&scenario, received_coin);
        };
        
        // Check if designer received royalty (may or may not exist depending on implementation)
        ts::next_tx(&mut scenario, designer());
        {
            // Only check if royalty coin exists
            if (ts::has_most_recent_for_sender<Coin<SUI>>(&scenario)) {
                let royalty_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
                // Verify it's a reasonable amount
                assert!(coin::value(&royalty_coin) > 0, 2);
                ts::return_to_sender(&scenario, royalty_coin);
            };
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ========================================================================
    // Test 4: After pool_cap transfer, OLD owner CANNOT withdraw (反向測試)
    // ========================================================================
    #[test]
    #[expected_failure(abort_code = sui::test_scenario::EEmptyInventory)]
    fun test_old_cap_holder_cannot_withdraw_after_transfer() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier (designer owns pool_cap)
        let (pool_addr, _cap_addr) = mint_test_atelier(&mut scenario, &clock);
        
        // Register user
        register_user(&mut scenario, user(), b"User", b"Regular user", &clock);
        
        // Add funds
        add_funds_to_pool(&mut scenario, pool_addr, 10 * one_sui());
        
        // Designer transfers pool_cap to user
        ts::next_tx(&mut scenario, designer());
        {
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            transfer::public_transfer(pool_cap, user());
        };
        
        // Designer (old owner) tries to withdraw - should fail
        ts::next_tx(&mut scenario, designer());
        {
            let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared_by_id<AtelierPool<ATELIER>>(&scenario, object::id_from_address(pool_addr));
            
            // Designer no longer owns the pool_cap - this will fail with EEmptyInventory
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            
            // Should never reach here
            atelier::withdraw_pool<ATELIER>(
                &pool_cap,
                &atelier,
                &mut pool,
                5 * one_sui(),
                designer(),
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, pool_cap);
            ts::return_shared(pool);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ========================================================================
    // Test 5: Cap from different Pool cannot be used
    // ========================================================================
    #[test]
    #[expected_failure(abort_code = archimeters::atelier::ENO_CAP_MISMATCH)]
    fun test_cap_from_different_pool_fails() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint first atelier
        let (pool_addr_1, _cap_addr_1) = mint_test_atelier(&mut scenario, &clock);
        
        // Mint second atelier (need to use different user)
        register_user(&mut scenario, user(), b"User", b"Regular user", &clock);
        
        ts::next_tx(&mut scenario, user());
        {
            let mut atelier_state = ts::take_shared<AtelierState>(&scenario);
            let mut membership = ts::take_from_sender<MemberShip>(&scenario);
            let (keys, types, labels, min_values, max_values, default_values) = create_test_parameter_vectors();
            
            atelier::mint_atelier<ATELIER>(
                &mut atelier_state,
                &mut membership,
                string::utf8(b"Second Atelier"),
                string::utf8(b"photo2"),
                string::utf8(b"data2"),
                string::utf8(b"algo2"),
                &clock,
                3 * one_sui(),
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
        
        // Add funds to first pool
        add_funds_to_pool(&mut scenario, pool_addr_1, 10 * one_sui());
        
        // User tries to use pool_cap from second atelier on first pool
        ts::next_tx(&mut scenario, user());
        {
            let atelier_1 = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut pool_1 = ts::take_shared_by_id<AtelierPool<ATELIER>>(&scenario, object::id_from_address(pool_addr_1));
            let pool_cap_2 = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);  // Pool cap from second atelier
            
            // This should fail - pool_cap doesn't match pool
            atelier::withdraw_pool<ATELIER>(
                &pool_cap_2,
                &atelier_1,
                &mut pool_1,
                5 * one_sui(),
                user(),
                ts::ctx(&mut scenario)
            );
            
            // Should never reach here
            ts::return_shared(atelier_1);
            ts::return_to_sender(&scenario, pool_cap_2);
            ts::return_shared(pool_1);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ========================================================================
    // Test 6: Multiple withdrawals by cap holder
    // ========================================================================
    #[test]
    fun test_multiple_withdrawals() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier
        let (pool_addr, _cap_addr) = mint_test_atelier(&mut scenario, &clock);
        
        // Add large funds
        add_funds_to_pool(&mut scenario, pool_addr, 100 * one_sui());
        
        // Multiple withdrawals
        let withdrawals = vector[10u64, 20u64, 30u64];
        let mut i = 0;
        let len = vector::length(&withdrawals);
        
        while (i < len) {
            let amount = *vector::borrow(&withdrawals, i);
            
            ts::next_tx(&mut scenario, designer());
            {
                let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
                let mut pool = ts::take_shared_by_id<AtelierPool<ATELIER>>(&scenario, object::id_from_address(pool_addr));
                let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
                
                atelier::withdraw_pool<ATELIER>(
                    &pool_cap,
                    &atelier,
                    &mut pool,
                    amount * one_sui(),
                    designer(),
                    ts::ctx(&mut scenario)
                );
                
                ts::return_shared(atelier);
                ts::return_to_sender(&scenario, pool_cap);
                ts::return_shared(pool);
            };
            
            i = i + 1;
        };
        
        // Verify final balance
        ts::next_tx(&mut scenario, designer());
        {
            let pool = ts::take_shared_by_id<AtelierPool<ATELIER>>(&scenario, object::id_from_address(pool_addr));
            let final_balance = atelier::get_pool_balance<ATELIER>(&pool);
            assert!(final_balance == 40 * one_sui(), 0);  // 100 - 10 - 20 - 30 = 40
            ts::return_shared(pool);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}