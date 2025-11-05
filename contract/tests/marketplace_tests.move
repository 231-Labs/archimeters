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
    };
    use archimeters::atelier_marketplace;
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
    fun test_list_atelier() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Create kiosk
        create_test_kiosk(&mut scenario, SELLER);
        
        // List atelier
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            
            let atelier_id = object::id(&atelier);
            let price = 10 * one_sui();
            atelier_marketplace::list_atelier<ATELIER>(
                &mut kiosk,
                &cap,
                atelier,
                price,
                ts::ctx(&mut scenario)
            );
            
            // Verify atelier is in kiosk
            assert!(kiosk::has_item(&kiosk, atelier_id), 0);
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(kiosk);
        };
        
        clock.destroy_for_testing();
        ts::end(scenario);
    }

    #[test]
    fun test_delist_atelier() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint and list atelier
        mint_test_atelier(&mut scenario, &clock, SELLER);
        create_test_kiosk(&mut scenario, SELLER);
        
        let atelier_id;
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            
            atelier_id = object::id(&atelier);
            atelier_marketplace::list_atelier<ATELIER>(
                &mut kiosk,
                &cap,
                atelier,
                10 * one_sui(),
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(kiosk);
        };
        
        // Delist
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            
            atelier_marketplace::delist_atelier<ATELIER>(
                &mut kiosk,
                &cap,
                atelier_id,
            );
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(kiosk);
        };
        
        clock.destroy_for_testing();
        ts::end(scenario);
    }

    // Note: Full purchase test requires TransferPolicy to be created in init
    // This test is simplified to focus on pool_cap binding and basic operations

    #[test]
    fun test_pool_cap_binding() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Test withdraw using atelier reference
        ts::next_tx(&mut scenario, SELLER);
        {
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            
            // Add some balance to pool first
            let payment = coin::mint_for_testing<SUI>(5 * one_sui(), ts::ctx(&mut scenario));
            atelier::add_payment_to_pool(&mut pool, payment);
            
            // Withdraw using atelier (PoolCap is bound inside)
            atelier::withdraw_pool<ATELIER>(
                &atelier,
                &mut pool,
                2 * one_sui(),
                SELLER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, atelier);
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
        
        clock.destroy_for_testing();
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = atelier::ENO_PERMISSION)]
    fun test_withdraw_pool_not_owner() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier as SELLER
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Try to withdraw as different user
        ts::next_tx(&mut scenario, BUYER);
        {
            // This should fail because BUYER is not the owner
            let atelier = ts::take_from_address<Atelier<ATELIER>>(&scenario, SELLER);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            
            atelier::withdraw_pool<ATELIER>(
                &atelier,
                &mut pool,
                1 * one_sui(),
                BUYER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_address(SELLER, atelier);
            ts::return_shared(pool);
        };
        
        clock.destroy_for_testing();
        ts::end(scenario);
    }

    #[test]
    fun test_take_from_kiosk() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Setup
        mint_test_atelier(&mut scenario, &clock, SELLER);
        create_test_kiosk(&mut scenario, SELLER);
        
        let atelier_id;
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            
            atelier_id = object::id(&atelier);
            
            // Place in kiosk (not list)
            kiosk::place(&mut kiosk, &cap, atelier);
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(kiosk);
        };
        
        // Take from kiosk
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            
            let atelier = atelier_marketplace::take_from_kiosk<ATELIER>(
                &mut kiosk,
                &cap,
                atelier_id,
            );
            
            transfer::public_transfer(atelier, SELLER);
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(kiosk);
        };
        
        // Verify
        ts::next_tx(&mut scenario, SELLER);
        {
            assert!(ts::has_most_recent_for_sender<Atelier<ATELIER>>(&scenario), 0);
        };
        
        clock.destroy_for_testing();
        ts::end(scenario);
    }

    #[test]
    fun test_list_and_delist_atelier() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // === Step 1: Seller mints Atelier ===
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        let atelier_id;
        let atelier_price = 10 * one_sui();
        
        // === Step 2: Seller creates Kiosk and lists Atelier ===
        create_test_kiosk(&mut scenario, SELLER);
        
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            
            atelier_id = object::id(&atelier);
            let seller_address = atelier::get_current_owner(&atelier);
            
            // Verify seller owns the atelier
            assert!(seller_address == SELLER, 0);
            
            // List atelier
            atelier_marketplace::list_atelier<ATELIER>(
                &mut kiosk,
                &cap,
                atelier,
                atelier_price,
                ts::ctx(&mut scenario)
            );
            
            // Verify atelier is in kiosk and listed
            assert!(kiosk::is_listed(&kiosk, atelier_id), 1);
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(kiosk);
        };
        
        // === Step 3: Seller delists Atelier ===
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            
            // Delist atelier
            atelier_marketplace::delist_atelier<ATELIER>(
                &mut kiosk,
                &cap,
                atelier_id,
            );
            
            // Verify atelier is no longer listed but still in kiosk
            assert!(!kiosk::is_listed(&kiosk, atelier_id), 2);
            assert!(kiosk::has_item(&kiosk, atelier_id), 3);
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(kiosk);
        };
        
        // === Step 4: Seller takes Atelier from Kiosk ===
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut kiosk = ts::take_shared<Kiosk>(&scenario);
            let cap = ts::take_from_sender<KioskOwnerCap>(&scenario);
            
            let atelier = atelier_marketplace::take_from_kiosk<ATELIER>(
                &mut kiosk,
                &cap,
                atelier_id,
            );
            
            // Verify atelier is no longer in kiosk
            assert!(!kiosk::has_item(&kiosk, atelier_id), 4);
            
            transfer::public_transfer(atelier, SELLER);
            
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(kiosk);
        };
        
        // === Step 5: Verify Seller has the Atelier back ===
        ts::next_tx(&mut scenario, SELLER);
        {
            assert!(ts::has_most_recent_for_sender<Atelier<ATELIER>>(&scenario), 5);
        };
        
        clock.destroy_for_testing();
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = atelier::ENO_PERMISSION)]
    fun test_only_owner_can_withdraw_pool() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Seller mints atelier
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Buyer tries to withdraw (should fail)
        ts::next_tx(&mut scenario, BUYER);
        {
            let atelier = ts::take_from_address<Atelier<ATELIER>>(&scenario, SELLER);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            
            // Add some balance first
            let payment = coin::mint_for_testing<SUI>(5 * one_sui(), ts::ctx(&mut scenario));
            atelier::add_payment_to_pool(&mut pool, payment);
            
            // Try to withdraw as non-owner (should fail)
            atelier::withdraw_pool<ATELIER>(
                &atelier,
                &mut pool,
                1 * one_sui(),
                BUYER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_address(SELLER, atelier);
            ts::return_shared(pool);
        };
        
        clock.destroy_for_testing();
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
            let mut atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            atelier::transfer_ownership(&mut atelier, BUYER, ts::ctx(&mut scenario));
            transfer::public_transfer(atelier, BUYER);
        };
        
        // BUYER withdraws - should split royalty to SELLER (original creator)
        ts::next_tx(&mut scenario, BUYER);
        {
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            
            // Withdraw 10 SUI: 10% (1 SUI) should go to SELLER, 9 SUI to BUYER
            atelier::withdraw_pool<ATELIER>(
                &atelier,
                &mut pool,
                10 * one_sui(),
                BUYER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, atelier);
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
        
        clock.destroy_for_testing();
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
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            
            // Withdraw 10 SUI: creator gets all 10 SUI
            atelier::withdraw_pool<ATELIER>(
                &atelier,
                &mut pool,
                10 * one_sui(),
                SELLER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, atelier);
            ts::return_shared(pool);
        };
        
        // Verify SELLER received full amount (10 SUI)
        ts::next_tx(&mut scenario, SELLER);
        {
            let full_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&full_coin) == 10 * one_sui(), 0);
            ts::return_to_sender(&scenario, full_coin);
        };
        
        clock.destroy_for_testing();
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
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            assert!(atelier::get_creator_royalty_bps(&atelier) == 250, 0);
            ts::return_to_sender(&scenario, atelier);
        };
        
        // SELLER (original creator) updates royalty to 5% (500 bps)
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            atelier::update_creator_royalty(&mut atelier, 500, ts::ctx(&mut scenario));
            assert!(atelier::get_creator_royalty_bps(&atelier) == 500, 1);
            ts::return_to_sender(&scenario, atelier);
        };
        
        // Transfer ownership to BUYER
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            atelier::transfer_ownership(&mut atelier, BUYER, ts::ctx(&mut scenario));
            transfer::public_transfer(atelier, BUYER);
        };
        
        // Add payment to pool
        ts::next_tx(&mut scenario, BUYER);
        {
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10 * one_sui(), ts::ctx(&mut scenario));
            atelier::add_payment_to_pool(&mut pool, payment);
            ts::return_shared(pool);
        };
        
        // BUYER withdraws - should use updated 5% royalty
        ts::next_tx(&mut scenario, BUYER);
        {
            let atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            let mut pool = ts::take_shared<AtelierPool<ATELIER>>(&scenario);
            
            atelier::withdraw_pool<ATELIER>(
                &atelier,
                &mut pool,
                10 * one_sui(),
                BUYER,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, atelier);
            ts::return_shared(pool);
        };
        
        // Verify SELLER received 5% royalty (0.5 SUI)
        ts::next_tx(&mut scenario, SELLER);
        {
            let royalty_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&royalty_coin) == (5 * one_sui()) / 10, 2);
            ts::return_to_sender(&scenario, royalty_coin);
        };
        
        // Verify BUYER received 95% (9.5 SUI)
        ts::next_tx(&mut scenario, BUYER);
        {
            let owner_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&owner_coin) == (95 * one_sui()) / 10, 3);
            ts::return_to_sender(&scenario, owner_coin);
        };
        
        clock.destroy_for_testing();
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = archimeters::atelier::ENO_PERMISSION)]
    fun test_update_creator_royalty_non_creator() {
        let mut scenario = setup_test();
        let clock = create_clock(&mut scenario);
        
        // Mint atelier as SELLER
        mint_test_atelier(&mut scenario, &clock, SELLER);
        
        // Transfer ownership to BUYER
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            atelier::transfer_ownership(&mut atelier, BUYER, ts::ctx(&mut scenario));
            transfer::public_transfer(atelier, BUYER);
        };
        
        // BUYER (not original creator) tries to update royalty - should fail
        ts::next_tx(&mut scenario, BUYER);
        {
            let mut atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            atelier::update_creator_royalty(&mut atelier, 1000, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, atelier);
        };
        
        clock.destroy_for_testing();
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
            let mut atelier = ts::take_from_sender<Atelier<ATELIER>>(&scenario);
            atelier::update_creator_royalty(&mut atelier, 5001, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, atelier);
        };
        
        clock.destroy_for_testing();
        ts::end(scenario);
    }
}

