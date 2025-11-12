#[test_only]
module archimeters::marketplace_tests {
    use std::string;
    use sui::test_scenario::{Self as ts};
    use sui::clock;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::kiosk::{Self, Kiosk, KioskOwnerCap};
    
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
        one_sui
    };

    const SELLER: address = @0xA;
    const BUYER: address = @0xB;

    // Helper: Mint test atelier
    fun mint_test_atelier(
        scenario: &mut ts::Scenario,
        clock: &clock::Clock,
        seller: address,
    ) {
        register_user(scenario, seller, b"Seller", b"Seller user", clock);
        
        ts::next_tx(scenario, seller);
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
                keys, types, labels, min_values, max_values, default_values,
                ts::ctx(scenario)
            );
            
            ts::return_to_sender(scenario, membership);
            ts::return_shared(atelier_state);
        };
    }

    // Helper: Create kiosk for user
    fun create_test_kiosk(scenario: &mut ts::Scenario, owner: address) {
        ts::next_tx(scenario, owner);
        {
            let (kiosk, cap) = kiosk::new(ts::ctx(scenario));
            transfer::public_share_object(kiosk);
            transfer::public_transfer(cap, owner);
        };
    }

    #[test]
    fun test_basic_kiosk_operations() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Create kiosk
        create_test_kiosk(&mut scenario, SELLER);
        
        // Verify atelier exists as shared object and user has pool_cap
        ts::next_tx(&mut scenario, SELLER);
        {
            let kiosk = ts::take_shared<Kiosk>(&scenario);
            let cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            
            // Verify objects exist
            assert!(object::id(&atelier) != object::id_from_address(@0x0), 0);
            assert!(object::id(&pool_cap) != object::id_from_address(@0x0), 1);
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, pool_cap);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(kiosk);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_pool_cap_binding() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Test withdraw using pool cap
        ts::next_tx(&mut scenario, SELLER);
        {
            let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            
            // Add some balance to pool first
            let payment = coin::mint_for_testing<SUI>(5 * one_sui(), ts::ctx(&mut scenario));
            atelier::add_payment_to_pool(&mut pool, payment);
            
            // Withdraw using pool cap
            atelier::withdraw_pool<ATELIER>(
                &pool_cap,
                &atelier,
                &mut pool,
                2 * one_sui(),
                SELLER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, pool_cap);
            ts::return_shared(pool);
        };
        
        // Verify withdrawal successful
        ts::next_tx(&mut scenario, SELLER);
        {
            assert!(ts::has_most_recent_for_sender<Coin<SUI>>(&scenario), 0);
            let withdrawn = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&withdrawn) == 2 * one_sui(), 1);
            ts::return_to_sender(&scenario, withdrawn);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = sui::test_scenario::EEmptyInventory)]
    fun test_withdraw_pool_not_owner() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier as SELLER
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Register BUYER
        register_user(&mut scenario, BUYER, b"Buyer", b"Buyer user", &clock);
        
        // Try to withdraw as different user (should fail because BUYER doesn't have pool_cap)
        ts::next_tx(&mut scenario, BUYER);
        {
            // This should fail because BUYER doesn't own the pool_cap
            let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            
            // BUYER tries to take pool_cap but doesn't own it - this will fail
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            
            atelier::withdraw_pool<ATELIER>(
                &pool_cap,
                &atelier,
                &mut pool,
                1 * one_sui(),
                BUYER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, pool_cap);
            ts::return_shared(pool);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_royalty_calculation() {
        // Test royalty calculation at different percentages
        let base_price = 10 * one_sui();
        
        // 1% = 100 bps
        let royalty_1_percent = (base_price * 100) / 10000;
        assert!(royalty_1_percent == (1 * one_sui()) / 10, 0);
        
        // 5% = 500 bps
        let royalty_5_percent = (base_price * 500) / 10000;
        assert!(royalty_5_percent == (5 * one_sui()) / 10, 1);
        
        // 10% = 1000 bps
        let royalty_10_percent = (base_price * 1000) / 10000;
        assert!(royalty_10_percent == 1 * one_sui(), 2);
        
        // 25% = 2500 bps
        let royalty_25_percent = (base_price * 2500) / 10000;
        assert!(royalty_25_percent == (25 * one_sui()) / 10, 3);
    }

    #[test]
    fun test_withdraw_pool_with_creator_royalty() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier as SELLER
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Add payment to pool
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10 * one_sui(), ts::ctx(&mut scenario));
            atelier::add_payment_to_pool(&mut pool, payment);
            ts::return_shared(pool);
        };
        
        // Transfer ownership to BUYER
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            atelier::transfer_ownership(&mut atelier, BUYER, ts::ctx(&mut scenario));
            transfer::public_transfer(pool_cap, BUYER);
            ts::return_shared(atelier);
        };
        
        // BUYER withdraws - should split royalty to SELLER (original creator)
        ts::next_tx(&mut scenario, BUYER);
        {
            let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            
            // Withdraw 10 SUI: 2.5% should go to SELLER, 97.5% to BUYER
            atelier::withdraw_pool<ATELIER>(
                &pool_cap,
                &atelier,
                &mut pool,
                10 * one_sui(),
                BUYER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, pool_cap);
            ts::return_shared(pool);
        };
        
        // Verify SELLER received 2.5% royalty (0.25 SUI)
        ts::next_tx(&mut scenario, SELLER);
        {
            let royalty_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&royalty_coin) == (25 * one_sui()) / 100, 0);
            ts::return_to_sender(&scenario, royalty_coin);
        };
        
        // Verify BUYER received 97.5% (9.75 SUI)
        ts::next_tx(&mut scenario, BUYER);
        {
            let owner_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&owner_coin) == (975 * one_sui()) / 100, 1);
            ts::return_to_sender(&scenario, owner_coin);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_withdraw_pool_creator_no_split() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier as SELLER
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Add payment to pool
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10 * one_sui(), ts::ctx(&mut scenario));
            atelier::add_payment_to_pool(&mut pool, payment);
            ts::return_shared(pool);
        };
        
        // SELLER (original creator) withdraws - should NOT split, gets full amount
        ts::next_tx(&mut scenario, SELLER);
        {
            let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            let pool_cap = ts::take_from_sender<AtelierPoolCap<ATELIER>>(&scenario);
            
            // Withdraw 10 SUI: creator gets all 10 SUI
            atelier::withdraw_pool<ATELIER>(
                &pool_cap,
                &atelier,
                &mut pool,
                10 * one_sui(),
                SELLER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(atelier);
            ts::return_to_sender(&scenario, pool_cap);
            ts::return_shared(pool);
        };
        
        // Verify SELLER received full amount (10 SUI)
        ts::next_tx(&mut scenario, SELLER);
        {
            let full_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&full_coin) == 10 * one_sui(), 0);
            ts::return_to_sender(&scenario, full_coin);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_update_creator_royalty() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier as SELLER
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Verify initial royalty is 2.5% (250 bps)
        ts::next_tx(&mut scenario, SELLER);
        {
            let atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            assert!(atelier::get_creator_royalty_bps(&atelier) == 250, 0);
            ts::return_shared(atelier);
        };
        
        // SELLER (original creator) updates royalty to 5% (500 bps)
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            atelier::update_creator_royalty(&mut atelier, 500, ts::ctx(&mut scenario));
            assert!(atelier::get_creator_royalty_bps(&atelier) == 500, 1);
            ts::return_shared(atelier);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = archimeters::atelier::ENO_PERMISSION)]
    fun test_update_creator_royalty_non_creator() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier as SELLER
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Register BUYER
        register_user(&mut scenario, BUYER, b"Buyer", b"Buyer user", &clock);
        
        // Transfer ownership to BUYER
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            atelier::transfer_ownership(&mut atelier, BUYER, ts::ctx(&mut scenario));
            ts::return_shared(atelier);
        };
        
        // BUYER (not original creator) tries to update royalty - should fail
        ts::next_tx(&mut scenario, BUYER);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            atelier::update_creator_royalty(&mut atelier, 1000, ts::ctx(&mut scenario));
            ts::return_shared(atelier);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = archimeters::atelier::ENO_INVALID_CREATOR_ROYALTY)]
    fun test_update_creator_royalty_exceeds_max() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier as SELLER
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // SELLER tries to set royalty above 50% (5000 bps) - should fail
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut atelier = ts::take_shared<Atelier<ATELIER>>(&scenario);
            atelier::update_creator_royalty(&mut atelier, 5001, ts::ctx(&mut scenario));
            ts::return_shared(atelier);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}