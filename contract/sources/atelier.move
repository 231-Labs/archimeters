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

    // == Errors ==
    const ENO_MEMBERSHIP: u64 = 0;
    const ENO_PERMISSION: u64 = 1;
    const ENO_AMOUNT: u64 = 2;

    // == One Time Witness ==
    public struct ATELIER has drop {}

    // == Structs ==
    public struct AtelierState has key {
        id: UID,
        all_ateliers: vector<ID>,
    }
    
    /// Input structure for defining a parameter (used when minting atelier)
    public struct ParameterInput has copy, drop {
        key: String,
        param_type: String,
        label: String,
        min_value: u64,
        max_value: u64,
        default_value: u64,
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

    public struct Atelier<phantom T> has key, store {
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
        let mut display = display::new<Atelier<ATELIER>>(&publisher, ctx);

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
    
    /// Main function to mint a new atelier
    /// Instead of vector<ParameterInput>, we use separate vectors for each field
    /// Generic parameter T represents the phantom type for this Atelier (typically ATELIER)
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
        
        // Step 1: Verify membership ownership
        verify_membership_ownership(membership, sender);
        
        // Step 2: Build parameter rules from separate vectors
        let param_rules = build_parameter_rules_from_vectors(
            param_keys,
            param_types,
            param_labels,
            param_min_values,
            param_max_values,
            param_default_values
        );
        
        // Step 3: Create the atelier object
        let (atelier, atelier_id) = create_atelier_object<T>(
            name,
            photo,
            data,
            algorithm,
            sender,
            price,
            param_rules,
            clock,
            ctx
        );
        
        // Step 4: Create the atelier capability
        let cap = create_atelier_cap(atelier_id, ctx);
        
        // Step 5: Register atelier to membership and global state
        register_atelier(atelier_state, membership, atelier_id);
        
        // Step 6: Transfer objects and emit event
        finalize_atelier_mint<T>(atelier, cap, atelier_id, sender);
    }
    
    // == Internal Helper Functions ==
    
    /// Verify that the sender owns the membership
    fun verify_membership_ownership(membership: &MemberShip, sender: address) {
        assert!(archimeters::owner(membership) == sender, ENO_MEMBERSHIP);
    }
    
    /// Build ParameterRules from separate vectors (new approach)
    fun build_parameter_rules_from_vectors(
        keys: vector<String>,
        types: vector<String>,
        labels: vector<String>,
        min_values: vector<u64>,
        max_values: vector<u64>,
        default_values: vector<u64>
    ): ParameterRules {
        let mut rules_map = vec_map::empty<String, ParameterRule>();
        let len = vector::length(&keys);
        
        // Validate all vectors have the same length
        assert!(vector::length(&types) == len, 0);
        assert!(vector::length(&labels) == len, 0);
        assert!(vector::length(&min_values) == len, 0);
        assert!(vector::length(&max_values) == len, 0);
        assert!(vector::length(&default_values) == len, 0);
        
        let mut i = 0;
        while (i < len) {
            let key = *vector::borrow(&keys, i);
            let rule = ParameterRule {
                param_type: *vector::borrow(&types, i),
                label: *vector::borrow(&labels, i),
                min_value: *vector::borrow(&min_values, i),
                max_value: *vector::borrow(&max_values, i),
                default_value: *vector::borrow(&default_values, i),
            };
            vec_map::insert(&mut rules_map, key, rule);
            i = i + 1;
        };
        
        ParameterRules { rules: rules_map }
    }
    
    /// Create the Atelier object with all its properties
    fun create_atelier_object<T>(
        name: String,
        photo: String,
        data: String,
        algorithm: String,
        author: address,
        price: u64,
        parameter_rules: ParameterRules,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ): (Atelier<T>, ID) {
        let id = object::new(ctx);
        let id_inner = object::uid_to_inner(&id);
        let now = clock::timestamp_ms(clock);
        
        let atelier = Atelier<T> {
            id,
            name,
            author,
            photo,
            data,
            algorithm,
            artificials: vector[],
            price, // Price is already in MIST from frontend
            pool: balance::zero<SUI>(),
            publish_time: now,
            parameter_rules,
        };
        
        (atelier, id_inner)
    }
    
    /// Create an AtelierCap for the given atelier ID
    fun create_atelier_cap(atelier_id: ID, ctx: &mut TxContext): AtelierCap {
        AtelierCap {
            id: object::new(ctx),
            atelier_id,
        }
    }
    
    /// Register the atelier to membership and global state
    fun register_atelier(
        atelier_state: &mut AtelierState,
        membership: &mut MemberShip,
        atelier_id: ID
    ) {
        archimeters::add_atelier_to_membership(membership, atelier_id);
        add_atelier_to_state(atelier_state, atelier_id);
    }
    
    /// Finalize the minting process by transferring objects and emitting events
    #[allow(lint(share_owned, custom_state_change))]
    fun finalize_atelier_mint<T>(
        atelier: Atelier<T>,
        cap: AtelierCap,
        atelier_id: ID,
        recipient: address
    ) {
        transfer::share_object(atelier);
        transfer::transfer(cap, recipient);
        
        event::emit(New_atelier {
            id: atelier_id,
        });
    }

    /// Withdraw funds from the pool to a specified recipient
    public fun withdraw_pool<T>(
        atelier: &mut Atelier<T>,
        cap: &AtelierCap,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // Verify capability and amount
        verify_atelier_cap(atelier, cap);
        assert!(amount > 0, ENO_AMOUNT);
        
        // Perform withdrawal
        let coin = extract_from_pool(atelier, amount, ctx);
        transfer::public_transfer(coin, recipient);
        
        event::emit(WithdrawPool { amount });
    }
    
    /// Verify that the capability matches the atelier
    fun verify_atelier_cap<T>(atelier: &Atelier<T>, cap: &AtelierCap) {
        let atelier_id = object::uid_to_inner(&atelier.id);
        assert!(cap.atelier_id == atelier_id, ENO_PERMISSION);
    }
    
    /// Extract coin from the atelier pool
    fun extract_from_pool<T>(atelier: &mut Atelier<T>, amount: u64, ctx: &mut TxContext): coin::Coin<SUI> {
        coin::from_balance(balance::split(&mut atelier.pool, amount), ctx)
    }

    // == Getter Functions ==

    public fun get_author<T>(atelier: &Atelier<T>): address {
        atelier.author
    }

    public fun get_price<T>(atelier: &Atelier<T>): u64 {
        atelier.price
    }

    public fun get_pool<T>(atelier: &Atelier<T>): &Balance<SUI> {
        &atelier.pool
    }
    
    public fun get_atelier_id<T>(atelier: &Atelier<T>): ID {
        object::uid_to_inner(&atelier.id)
    }

    public fun add_to_pool<T>(atelier: &mut Atelier<T>, fee: Balance<SUI>) {
        balance::join(&mut atelier.pool, fee);
    }

    public fun add_sculpt_to_atelier<T>(atelier: &mut Atelier<T>, sculpt_id: ID) {
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
    
    /// Get all parameter rules from an atelier
    public(package) fun get_parameter_rules<T>(atelier: &Atelier<T>): &ParameterRules {
        &atelier.parameter_rules
    }
    
    // == Test Functions ==
    #[test_only]
    public fun test_init(otw: ATELIER, ctx: &mut TxContext) {
        init(otw, ctx);
    }
    
    #[test_only]
    public fun new_atelier_state_for_testing(ctx: &mut TxContext) {
        let atelier_state = AtelierState {
            id: object::new(ctx),
            all_ateliers: vector[],
        };
        transfer::share_object(atelier_state);
    }
    
    #[test_only]
    public fun new_parameter_input(
        key: String,
        param_type: String,
        label: String,
        min_value: u64,
        max_value: u64,
        default_value: u64
    ): ParameterInput {
        ParameterInput {
            key,
            param_type,
            label,
            min_value,
            max_value,
            default_value,
        }
    }
}