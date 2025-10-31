module archimeters::atelier {
    use archimeters::archimeters::{ Self, MemberShip };
    use std::string::{ String };
    use sui::{
        event,
        clock,
        package,
        display,
        coin::{ Self },
        balance::{ Self, Balance },
        sui::SUI,
        vec_map::{ Self, VecMap },
    };

    // == Constants ==
    const ONE_SUI: u64 = 1_000_000_000;
    const BASIS_POINTS: u64 = 100;

    // == Errors ==
    const ENO_MEMBERSHIP: u64 = 0;
    const ENO_PERMISSION: u64 = 1;
    const ENO_AMOUNT: u64 = 2;
    const ENO_INVALID_PARAMETER: u64 = 3;
    const ENO_PARAMETER_NOT_FOUND: u64 = 4;

    // == One Time Witness ==
    public struct ATELIER has drop {}

    // == Structs ==
    public struct AtelierState has key {
        id: UID,
        all_ateliers: vector<ID>,
    }
    
    /// Parameter rule for validation (values in basis points, e.g., 5.25 = 525)
    public struct ParameterRule has store, copy, drop {
        param_type: String,
        label: String,
        min_value: u64,
        max_value: u64,
        default_value: u64,
    }
    
    /// Container for all parameter rules
    public struct ParameterRules has store {
        rules: VecMap<String, ParameterRule>,
    }

    public struct Atelier has key, store {
        id: UID,
        name: String,
        author: address,
        photo: String, // Walrus  blob ID for the main design image
        data: String, // Walrus blob ID for the website
        algorithm: String, // Walrus blob ID for the algorithm file
        artificials: vector<ID>, // Collection of all items in the series
        price: u64,
        pool: Balance<SUI>,
        publish_time: u64,
        parameter_rules: ParameterRules,
    }

    public struct AtelierCap has key, store {
        id: UID,
        atelier_id: ID,
    }

    // == Events ==
    public struct New_atelier has copy, drop {
        id: ID,
    }

    public struct WithdrawPool has copy, drop {
        amount: u64,
    }

    // == Initializer ==
    fun init(otw: ATELIER, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<Atelier>(&publisher, ctx);

        display.add(
            b"name".to_string(),
            b"{name}".to_string()
        );
        display.add(
            b"link".to_string(),
            b"https://archimeters.vercel.app/".to_string() 
        );
        display.add(
            b"description".to_string(),
            b"Atelier Published by Archimeters".to_string()
        );
        display.add(
            b"image_url".to_string(),
            b"https://aggregator.walrus-testnet.walrus.space/v1/blobs/zw47vReyw9PXRYjIrtMFhgFF8O3nv26nWCJFY6QEiDI".to_string()
        );

        display.update_version();

        transfer::share_object(AtelierState {
            id: object::new(ctx),
            all_ateliers: vector[],
        });

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == Entry Functions ==
    public entry fun mint_atelier(
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
        
        // Verify membership ownership
        assert!(archimeters::owner(membership) == sender, ENO_MEMBERSHIP);
        
        let id = object::new(ctx);
        let id_inner = object::uid_to_inner(&id);
        let now = clock::timestamp_ms(clock);
        
        // Build parameter rules
        let mut rules_map = vec_map::empty<String, ParameterRule>();
        let len = vector::length(&param_keys);
        let mut i = 0;
        while (i < len) {
            let rule = ParameterRule {
                param_type: *vector::borrow(&param_types, i),
                label: *vector::borrow(&param_labels, i),
                min_value: *vector::borrow(&param_min_values, i),
                max_value: *vector::borrow(&param_max_values, i),
                default_value: *vector::borrow(&param_default_values, i),
            };
            vec_map::insert(&mut rules_map, *vector::borrow(&param_keys, i), rule);
            i = i + 1;
        };
        
        let atelier = Atelier {
            id,
            name,
            author: sender,
            photo,
            data,
            algorithm,
            artificials: vector[],
            price: price * ONE_SUI,
            pool: balance::zero<SUI>(),
            publish_time: now,
            parameter_rules: ParameterRules { rules: rules_map },
        };

        // Create AtelierCap
        let cap = AtelierCap {
            id: object::new(ctx),
            atelier_id: id_inner,
        };

        // Add Atelier ID to MemberShip and State
        archimeters::add_atelier_to_membership(membership, id_inner);
        add_atelier_to_state(atelier_state, id_inner);

        transfer::share_object(atelier);
        transfer::transfer(cap, sender);

        // Emit the event at the end
        event::emit(New_atelier {
            id: id_inner,
        });
    }

    public entry fun withdraw_pool(
        atelier: &mut Atelier,
        cap: &AtelierCap,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let atelier_id = object::uid_to_inner(&atelier.id);
        
        // Verify atelier_id match and amount
        assert!(cap.atelier_id == atelier_id, ENO_PERMISSION);
        assert!(amount > 0, ENO_AMOUNT);
        
        let coin = coin::from_balance(balance::split(&mut atelier.pool, amount), ctx);
        transfer::public_transfer(coin, sender);
        
        event::emit(WithdrawPool {
            amount,
        });
    }

    // == Getter Functions ==

    public fun get_author(atelier: &Atelier): address {
        atelier.author
    }

    public fun get_price(atelier: &Atelier): u64 {
        atelier.price
    }

    public fun get_pool(atelier: &Atelier): &Balance<SUI> {
        &atelier.pool
    }

    public fun add_to_pool(atelier: &mut Atelier, fee: Balance<SUI>) {
        balance::join(&mut atelier.pool, fee);
    }

    public fun add_sculpt_to_atelier(atelier: &mut Atelier, sculpt_id: ID) {
        vector::push_back(&mut atelier.artificials, sculpt_id);
    }

    fun add_atelier_to_state(atelier_state: &mut AtelierState, atelier_id: ID) {
        atelier_state.all_ateliers.push_back(atelier_id);
    }
    
    // == Parameter Validation Functions ==
    
    /// Validate if a parameter value is within the rule's constraints
    public(package) fun validate_parameter(
        rules: &ParameterRules, 
        key: String, 
        value: u64
    ): bool {
        if (!vec_map::contains(&rules.rules, &key)) {
            return false
        };
        
        let rule = vec_map::get(&rules.rules, &key);
        value >= rule.min_value && value <= rule.max_value
    }
    
    /// Get a specific parameter rule
    public(package) fun get_parameter_rule(
        rules: &ParameterRules, 
        key: &String
    ): &ParameterRule {
        assert!(vec_map::contains(&rules.rules, key), ENO_PARAMETER_NOT_FOUND);
        vec_map::get(&rules.rules, key)
    }
    
    /// Get all parameter rules from an atelier
    public fun get_parameter_rules(atelier: &Atelier): &ParameterRules {
        &atelier.parameter_rules
    }
}