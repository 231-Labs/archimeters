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
        ATELIER,
        get_author,
        get_price,
        get_atelier_id,
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
    public struct Sculpt<phantom ATELIER> has key, store {
        id: UID,
        atelier_id: ID, // Links to the specific Atelier this Sculpt was minted from
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
        
        // Create Display for Sculpt<ATELIER>
        // Note: Using ATELIER as the phantom type parameter
        let mut display = display::new<Sculpt<ATELIER>>(&publisher, ctx);

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

        // Initialize TransferPolicy for Sculpt<ATELIER>
        // This policy applies to all Sculpts minted from any Atelier
        let (policy, policy_cap) = transfer_policy::new<Sculpt<ATELIER>>(&publisher, ctx);

        transfer::public_share_object(policy);
        transfer::public_transfer(policy_cap, ctx.sender());
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == Entry Functions ==
    
    /// Main function to mint a new sculpt
    /// Generic parameter T should be archimeters::atelier::ATELIER
    /// This ensures type safety: only Atelier<T> can mint Sculpt<T>
    entry fun mint_sculpt<T>(
        atelier: &mut Atelier<T>,
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
        let atelier_id = get_atelier_id(atelier);
        
        // Step 1: Validate payment
        validate_payment(atelier, payment);
        
        // Step 2: Validate parameters against atelier rules
        let params = validate_and_build_parameters(atelier, param_keys, param_values);
        
        // Step 3: Process payment
        let fee = extract_payment(atelier, payment, ctx);
        
        // Step 4: Create sculpt with generic type parameter
        let (sculpt, sculpt_id) = create_sculpt<T>(
            atelier_id,
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
        finalize_sculpt_mint<T>(kiosk, kiosk_cap, sculpt, sculpt_id);
    }
    
    // == Internal Helper Functions ==
    
    /// Validate that payment is sufficient
    fun validate_payment<T>(atelier: &Atelier<T>, payment: &Coin<SUI>) {
        let price = get_price(atelier);
        assert!(coin::value(payment) >= price, ENO_CORRECT_FEE);
    }
    
    /// Validate parameters and build parameter map
    fun validate_and_build_parameters<T>(
        atelier: &Atelier<T>,
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
    fun extract_payment<T>(atelier: &Atelier<T>, payment: &mut Coin<SUI>, ctx: &mut TxContext): Coin<SUI> {
        let price = get_price(atelier);
        coin::split(payment, price, ctx)
    }
    
    /// Create sculpt object with generic type parameter
    fun create_sculpt<T>(
        atelier_id: ID,
        alias: String,
        owner: address,
        creator: address,
        blueprint: String,
        structure: String,
        parameters: VecMap<String, u64>,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ): (Sculpt<T>, ID) {
        let id = object::new(ctx);
        let id_inner = object::uid_to_inner(&id);
        let now = clock::timestamp_ms(clock);
        
        let sculpt = Sculpt<T> {
            id,
            atelier_id,
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
    fun register_sculpt<T>(
        membership: &mut MemberShip,
        atelier: &mut Atelier<T>,
        sculpt_id: ID,
        fee: Coin<SUI>
    ) {
        add_sculpt_to_membership(membership, sculpt_id);
        add_sculpt_to_atelier(atelier, sculpt_id);
        add_to_pool(atelier, coin::into_balance(fee));
    }
    
    /// Finalize minting by placing in kiosk and emitting event
    fun finalize_sculpt_mint<T>(
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        sculpt: Sculpt<T>,
        sculpt_id: ID
    ) {
        kiosk::place(kiosk, kiosk_cap, sculpt);
        event::emit(New_sculpt { id: sculpt_id });
    }

    public fun print_sculpt<T>(
        sculpt: &mut Sculpt<T>,
        clock: &clock::Clock,
    ) {
        sculpt.printed = sculpt.printed + 1;
        sculpt.time = clock::timestamp_ms(clock);
    }

    // adds a print record to the sculpt
    public fun add_print_record<T, R: key + store>(sculpt: &mut Sculpt<T>, record: R, clock: &clock::Clock) {
        let timestamp = clock::timestamp_ms(clock);
        sui::dynamic_object_field::add(&mut sculpt.id, timestamp, record);
    }

    // === Getters ===  
    public fun get_sculpt_info<T>(sculpt: &Sculpt<T>): (ID, String, String) {
        (sculpt.id.uid_to_inner(), sculpt.alias, sculpt.structure)
    }

    public fun get_sculpt_printed<T>(sculpt: &Sculpt<T>): u64 {
        sculpt.printed
    }
    
    public fun get_sculpt_atelier_id<T>(sculpt: &Sculpt<T>): ID {
        sculpt.atelier_id
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