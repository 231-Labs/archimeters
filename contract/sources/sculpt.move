module archimeters::sculpt {
    use std::string::{ String };
    use sui::{
        event,
        clock,
        package,
        display,
        sui::SUI,
        coin::{ Self, Coin },
        kiosk::{ Self, Kiosk, KioskOwnerCap },
        transfer_policy,
        vec_map::{ Self, VecMap },
    };
    use archimeters::archimeters::{
        MemberShip,
        add_sculpt_to_membership,
    };
    use archimeters::atelier::{
        Self as atelier_module,
        Atelier,
        get_author,
        get_price,
        add_to_pool,
        add_sculpt_to_atelier,
    };

    // == Errors ==
    const ENO_CORRECT_FEE: u64 = 0;
    const ENO_INVALID_PARAMETER: u64 = 1;
    const ENO_PARAMETER_COUNT_MISMATCH: u64 = 2;

    // == One Time Witness ==
    public struct SCULPT has drop {}

    // == Structs ==
    public struct Sculpt has key, store {
        id: UID,
        alias: String,
        owner: address,
        creator: address,
        blueprint: String, //blob-id for the image
        structure: String, //blob-id for printable file
        parameters: VecMap<String, u64>, // User-provided parameter values
        printed: u64,
        time: u64
    }

    // == Events ==
    public struct New_sculpt has copy, drop {
        id: ID,
    }

    // == Initializer ==
    #[allow(lint(share_owned))]
    fun init(otw: SCULPT, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<Sculpt>(&publisher, ctx);

        display.add(
            b"name".to_string(),
            b"{alias}".to_string()
        );
        display.add(
            b"link".to_string(),
            b"https://archimeters.vercel.app/".to_string() 
        );
        display.add(
            b"description".to_string(),
            b"Sculpt Published by Archimeters".to_string()
        );
        display.add(
            b"image_url".to_string(),
            b"{blueprint}".to_string()
        );

        display.update_version();

        // Initialize TransferPolicy
        let (policy, policy_cap) = transfer_policy::new<Sculpt>(&publisher, ctx);

        transfer::public_share_object(policy);
        transfer::public_transfer(policy_cap, ctx.sender());
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == Entry Functions ==
    
    /// Main function to mint a new sculpt
    entry fun mint_sculpt(
        atelier: &mut Atelier,
        membership: &mut MemberShip,
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        alias: String,
        blueprint: String,
        structure: String,
        param_keys: vector<String>,
        param_values: vector<u64>,
        payment: &mut Coin<SUI>,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        
        // Step 1: Validate payment
        validate_payment(atelier, payment);
        
        // Step 2: Validate parameters against atelier rules
        let params = validate_and_build_parameters(atelier, param_keys, param_values);
        
        // Step 3: Process payment
        let fee = extract_payment(atelier, payment, ctx);
        
        // Step 4: Create sculpt
        let (sculpt, sculpt_id) = create_sculpt(
            alias,
            sender,
            get_author(atelier),
            blueprint,
            structure,
            params,
            clock,
            ctx
        );
        
        // Step 5: Register sculpt
        register_sculpt(membership, atelier, sculpt_id, fee);
        
        // Step 6: Place in kiosk and emit event
        finalize_sculpt_mint(kiosk, kiosk_cap, sculpt, sculpt_id);
    }
    
    // == Internal Helper Functions ==
    
    /// Validate that payment is sufficient
    fun validate_payment(atelier: &Atelier, payment: &Coin<SUI>) {
        let price = get_price(atelier);
        assert!(coin::value(payment) >= price, ENO_CORRECT_FEE);
    }
    
    /// Validate parameters and build parameter map
    fun validate_and_build_parameters(
        atelier: &Atelier,
        param_keys: vector<String>,
        param_values: vector<u64>
    ): VecMap<String, u64> {
        let keys_len = vector::length(&param_keys);
        let values_len = vector::length(&param_values);
        
        // Ensure keys and values have same length
        assert!(keys_len == values_len, ENO_PARAMETER_COUNT_MISMATCH);
        
        // Get parameter rules from atelier
        let rules = atelier_module::get_parameter_rules(atelier);
        
        // Validate each parameter
        let mut params = vec_map::empty<String, u64>();
        let mut i = 0;
        
        while (i < keys_len) {
            let key = *vector::borrow(&param_keys, i);
            let value = *vector::borrow(&param_values, i);
            
            // Validate parameter against rules
            assert!(
                atelier_module::validate_parameter(rules, key, value),
                ENO_INVALID_PARAMETER
            );
            
            vec_map::insert(&mut params, key, value);
            i = i + 1;
        };
        
        params
    }
    
    /// Extract payment fee from coin
    fun extract_payment(atelier: &Atelier, payment: &mut Coin<SUI>, ctx: &mut TxContext): Coin<SUI> {
        let price = get_price(atelier);
        coin::split(payment, price, ctx)
    }
    
    /// Create sculpt object
    fun create_sculpt(
        alias: String,
        owner: address,
        creator: address,
        blueprint: String,
        structure: String,
        parameters: VecMap<String, u64>,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ): (Sculpt, ID) {
        let id = object::new(ctx);
        let id_inner = object::uid_to_inner(&id);
        let now = clock::timestamp_ms(clock);
        
        let sculpt = Sculpt {
            id,
            alias,
            owner,
            creator,
            blueprint,
            structure,
            parameters,
            printed: 0,
            time: now,
        };
        
        (sculpt, id_inner)
    }
    
    /// Register sculpt to membership and atelier
    fun register_sculpt(
        membership: &mut MemberShip,
        atelier: &mut Atelier,
        sculpt_id: ID,
        fee: Coin<SUI>
    ) {
        add_sculpt_to_membership(membership, sculpt_id);
        add_sculpt_to_atelier(atelier, sculpt_id);
        add_to_pool(atelier, coin::into_balance(fee));
    }
    
    /// Finalize minting by placing in kiosk and emitting event
    fun finalize_sculpt_mint(
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        sculpt: Sculpt,
        sculpt_id: ID
    ) {
        kiosk::place(kiosk, kiosk_cap, sculpt);
        event::emit(New_sculpt { id: sculpt_id });
    }

    public fun print_sculpt(
        sculpt: &mut Sculpt,
        clock: &clock::Clock,
    ) {
        sculpt.printed = sculpt.printed + 1;
        sculpt.time = clock::timestamp_ms(clock);
    }

    // adds a print record to the sculpt
    public fun add_print_record<T: key + store>(sculpt: &mut Sculpt, record: T, clock: &clock::Clock) {
        let timestamp = clock::timestamp_ms(clock);
        sui::dynamic_object_field::add(&mut sculpt.id, timestamp, record);
    }

    // === Getters ===  
    public fun get_sculpt_info(sculpt: &Sculpt): (ID, String, String) {
        (sculpt.id.uid_to_inner(), sculpt.alias, sculpt.structure)
    }

    public fun get_sculpt_printed(sculpt: &Sculpt): u64 {
        sculpt.printed
    }
    
    // == Test Functions ==
    #[test_only]
    public fun test_init(otw: SCULPT, ctx: &mut TxContext) {
        init(otw, ctx);
    }
    
    // == Test-only error code exports ==
    #[test_only]
    public fun eno_invalid_parameter(): u64 { ENO_INVALID_PARAMETER }
    
    #[test_only]
    public fun eno_parameter_count_mismatch(): u64 { ENO_PARAMETER_COUNT_MISMATCH }
    
    #[test_only]
    public fun eno_correct_fee(): u64 { ENO_CORRECT_FEE }
}