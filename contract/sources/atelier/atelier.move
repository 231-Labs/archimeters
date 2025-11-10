module archimeters::atelier {
    use archimeters::archimeters::{ Self, MemberShip };
    use archimeters::atelier_validation::{
        Self,
        ParameterRule,
        ParameterRules,
        verify_membership_ownership,
        verify_owner_permission,
        build_parameter_rules,
        validate_parameter as validation_validate_parameter,
    };
    use archimeters::royalty_rule;
    use std::string::{ String };
    use sui::{
        event,
        clock,
        package,
        display,
        transfer_policy,
    };
    
    use sui::{
        coin::{ Self, Coin },
        balance::{ Self, Balance },
        sui::SUI,
    };

    const ENO_PERMISSION: u64 = 1;
    const ENO_AMOUNT: u64 = 2;
    const ENO_POOL_MISMATCH: u64 = 3;
    const ENO_CAP_MISMATCH: u64 = 4;
    const ENO_INVALID_CREATOR_ROYALTY: u64 = 5;
    const DEFAULT_CREATOR_ROYALTY_BPS: u64 = 250;
    const MAX_CREATOR_ROYALTY_BPS: u64 = 5000;
    const BPS_BASE: u64 = 10000;

    public struct ATELIER has drop {}

    public struct AtelierState has key {
        id: UID,
        all_ateliers: vector<ID>,
    }
    
    #[allow(unused_field)]
    public struct ParameterInput has copy, drop {
        key: String,
        param_type: String,
        label: String,
        min_value: u64,
        max_value: u64,
        default_value: u64,
    }

    public struct Atelier<phantom T> has key, store {
        id: UID,
        name: String,
        original_creator: address,
        current_owner: address,
        photo: String,
        data: String,
        algorithm: String,
        artificials: vector<ID>,
        price: u64,
        pool_id: ID,
        publish_time: u64,
        parameter_rules: ParameterRules,
        creator_royalty_bps: u64, // Adjustable creator royalty in basis points
    }
    
    public struct AtelierPoolCap<phantom T> has key, store {
        id: UID,
        pool_id: ID,
    }
    
    public struct AtelierPool<phantom T> has key {
        id: UID,
        atelier_id: ID,
        balance: Balance<SUI>,
    }

    // == Events ==
    public struct New_atelier has copy, drop {
        id: ID,
        pool_id: ID,
        pool_cap_id: ID,
        name: String,
        photo: String,
        algorithm: String,
        data: String,
        original_creator: address,
        price: u64,
        publish_time: u64,
    }
    
    public struct WithdrawPool has copy, drop {
        atelier_id: ID,
        total_amount: u64,
        creator_royalty: u64,
        owner_amount: u64,
    }
    
    public struct CreatorRoyaltyUpdated has copy, drop {
        atelier_id: ID,
        old_royalty_bps: u64,
        new_royalty_bps: u64,
    }

    #[allow(lint(share_owned))]
    fun init(otw: ATELIER, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        
        let mut display = display::new<Atelier<ATELIER>>(&publisher, ctx);
        display.add(b"name".to_string(), b"{name}".to_string());
        display.add(b"link".to_string(), b"https://archimeters.vercel.app/".to_string());
        display.add(b"description".to_string(), b"Atelier Published by Archimeters".to_string());
        display.add(b"image_url".to_string(), b"https://aggregator.walrus-testnet.walrus.space/v1/blobs/zw47vReyw9PXRYjIrtMFhgFF8O3nv26nWCJFY6QEiDI".to_string());
        display.add(b"original_creator".to_string(), b"{original_creator}".to_string());
        display.add(b"current_owner".to_string(), b"{current_owner}".to_string());
        display.update_version();

        // Create TransferPolicy and set default 5% royalty
        let (mut policy, policy_cap) = transfer_policy::new<Atelier<ATELIER>>(&publisher, ctx);
        royalty_rule::add(&mut policy, &policy_cap, 500, ctx.sender()); // 5% royalty to deployer

        transfer::share_object(AtelierState {
            id: object::new(ctx),
            all_ateliers: vector[],
        });

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
        transfer::public_share_object(policy);
        transfer::public_transfer(policy_cap, ctx.sender());
    }

    public fun mint_atelier<T>(
        atelier_state: &mut AtelierState,
        membership: &mut MemberShip,
        name: String,
        photo: String,
        data: String,
        algorithm: String,
        clock: &clock::Clock,
        price: u64,
        param_keys: vector<String>,
        param_types: vector<String>,
        param_labels: vector<String>,
        param_min_values: vector<u64>,
        param_max_values: vector<u64>,
        param_default_values: vector<u64>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        verify_membership_ownership(membership, sender);
        
        let param_rules = build_parameter_rules(
            param_keys, param_types, param_labels,
            param_min_values, param_max_values, param_default_values
        );
        
        let (atelier, pool_cap, atelier_id, pool_id, pool_cap_id) = create_atelier_object<T>(
            name, photo, data, algorithm, sender, price, param_rules, clock, ctx
        );
        
        register_atelier(atelier_state, membership, atelier_id);
        finalize_atelier_mint<T>(atelier, pool_cap, atelier_id, pool_id, pool_cap_id, ctx);
    }
    
    
    fun create_atelier_object<T>(
        name: String,
        photo: String,
        data: String,
        algorithm: String,
        creator: address,
        price: u64,
        parameter_rules: ParameterRules,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ): (Atelier<T>, AtelierPoolCap<T>, ID, ID, ID) {
        let atelier_uid = object::new(ctx);
        let atelier_id = object::uid_to_inner(&atelier_uid);
        
        let pool_uid = object::new(ctx);
        let pool_id = object::uid_to_inner(&pool_uid);
        transfer::share_object(AtelierPool<T> {
            id: pool_uid,
            atelier_id,
            balance: balance::zero<SUI>(),
        });
        
        let pool_cap_uid = object::new(ctx);
        let pool_cap_id = object::uid_to_inner(&pool_cap_uid);
        let pool_cap = AtelierPoolCap<T> {
            id: pool_cap_uid,
            pool_id,
        };
        
        let atelier = Atelier<T> {
            id: atelier_uid,
            name,
            original_creator: creator,
            current_owner: creator,
            photo,
            data,
            algorithm,
            artificials: vector[],
            price,
            pool_id,
            publish_time: clock::timestamp_ms(clock),
            parameter_rules,
            creator_royalty_bps: DEFAULT_CREATOR_ROYALTY_BPS,
        };
        
        (atelier, pool_cap, atelier_id, pool_id, pool_cap_id)
    }
    
    fun register_atelier(
        atelier_state: &mut AtelierState,
        membership: &mut MemberShip,
        atelier_id: ID
    ) {
        archimeters::add_atelier_to_membership(membership, atelier_id);
        add_atelier_to_state(atelier_state, atelier_id);
    }
    
    #[allow(lint(share_owned, self_transfer))]
    fun finalize_atelier_mint<T>(
        atelier: Atelier<T>,
        pool_cap: AtelierPoolCap<T>,
        atelier_id: ID,
        pool_id: ID,
        pool_cap_id: ID,
        ctx: &TxContext,
    ) {
        // Emit event with full metadata
        event::emit(New_atelier { 
            id: atelier_id, 
            pool_id, 
            pool_cap_id,
            name: atelier.name,
            photo: atelier.photo,
            algorithm: atelier.algorithm,
            data: atelier.data,
            original_creator: atelier.original_creator,
            price: atelier.price,
            publish_time: atelier.publish_time,
        });
        
        transfer::share_object(atelier);
        transfer::public_transfer(pool_cap, ctx.sender());
    }

    public fun withdraw_pool<T>(
        pool_cap: &AtelierPoolCap<T>,
        atelier: &Atelier<T>,
        pool: &mut AtelierPool<T>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(pool_cap.pool_id == object::id(pool), ENO_CAP_MISMATCH);
        assert!(pool.atelier_id == object::id(atelier), ENO_POOL_MISMATCH);
        assert!(amount > 0, ENO_AMOUNT);
        
        let mut withdrawn = coin::take(&mut pool.balance, amount, ctx);
        
        let (creator_royalty, owner_amount) = if (atelier.current_owner != atelier.original_creator) {
            let royalty = (amount * atelier.creator_royalty_bps) / BPS_BASE;
            let owner_amt = amount - royalty;
            let royalty_coin = coin::split(&mut withdrawn, royalty, ctx);
            transfer::public_transfer(royalty_coin, atelier.original_creator);
            (royalty, owner_amt)
        } else {
            (0, amount)
        };
        
        transfer::public_transfer(withdrawn, recipient);
        
        event::emit(WithdrawPool { 
            atelier_id: pool.atelier_id, 
            total_amount: amount,
            creator_royalty,
            owner_amount,
        });
    }
    
    public fun transfer_ownership<T>(
        atelier: &mut Atelier<T>,
        new_owner: address,
        ctx: &TxContext
    ) {
        let sender = ctx.sender();
        verify_owner_permission(atelier.current_owner, sender);
        atelier.current_owner = new_owner;
    }
    
    public fun update_creator_royalty<T>(
        atelier: &mut Atelier<T>,
        new_royalty_bps: u64,
        ctx: &TxContext
    ) {
        assert!(atelier.original_creator == ctx.sender(), ENO_PERMISSION);
        assert!(new_royalty_bps <= MAX_CREATOR_ROYALTY_BPS, ENO_INVALID_CREATOR_ROYALTY);
        
        let old_royalty_bps = atelier.creator_royalty_bps;
        atelier.creator_royalty_bps = new_royalty_bps;
        
        event::emit(CreatorRoyaltyUpdated {
            atelier_id: object::id(atelier),
            old_royalty_bps,
            new_royalty_bps,
        });
    }

    // == Getter Functions ==
    public fun get_original_creator<T>(atelier: &Atelier<T>): address { atelier.original_creator }
    public fun get_current_owner<T>(atelier: &Atelier<T>): address { atelier.current_owner }
    public fun get_price<T>(atelier: &Atelier<T>): u64 { atelier.price }
    public fun get_pool_id<T>(atelier: &Atelier<T>): ID { atelier.pool_id }
    public fun get_pool_balance<T>(pool: &AtelierPool<T>): u64 { balance::value(&pool.balance) }
    public fun get_atelier_id<T>(atelier: &Atelier<T>): ID { object::id(atelier) }
    public fun get_creator_royalty_bps<T>(atelier: &Atelier<T>): u64 { atelier.creator_royalty_bps }
    
    // == Helper Functions ==
    public fun add_payment_to_pool<T>(pool: &mut AtelierPool<T>, payment: Coin<SUI>) {
        coin::put(&mut pool.balance, payment);
    }
    
    public fun add_sculpt_to_atelier<T>(atelier: &mut Atelier<T>, sculpt_id: ID) {
        vector::push_back(&mut atelier.artificials, sculpt_id);
    }

    fun add_atelier_to_state(atelier_state: &mut AtelierState, atelier_id: ID) {
        atelier_state.all_ateliers.push_back(atelier_id);
    }

    public(package) fun validate_parameter(rules: &ParameterRules, key: String, value: u64): bool {
        validation_validate_parameter(rules, key, value)
    }
    
    public(package) fun get_parameter_rules<T>(atelier: &Atelier<T>): &ParameterRules {
        &atelier.parameter_rules
    }
    
    public fun get_min_value(rule: &ParameterRule): u64 { atelier_validation::get_min_value(rule) }
    public fun get_max_value(rule: &ParameterRule): u64 { atelier_validation::get_max_value(rule) }
    
    #[test_only]
    public fun new_atelier_state_for_testing(ctx: &mut TxContext) {
        transfer::share_object(AtelierState { id: object::new(ctx), all_ateliers: vector[] });
    }
}