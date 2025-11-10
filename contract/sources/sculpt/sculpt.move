module archimeters::sculpt {
    use std::string::{ Self as string, String };
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
        vec_set::{ Self, VecSet },
    };
    use archimeters::archimeters::{
        Self as archimeters_module,
        MemberShip,
        add_sculpt_to_membership,
    };
    use archimeters::atelier::{
        Self as atelier_module,
        Atelier,
        AtelierPool,
        ATELIER,
        get_original_creator,
        get_price,
        get_pool_id,
        add_payment_to_pool,
    };
    use archimeters::royalty_rule;

    const ENO_CORRECT_FEE: u64 = 0;
    const ENO_INVALID_PARAMETER: u64 = 1;
    const ENO_PARAMETER_COUNT_MISMATCH: u64 = 2;
    const ENO_POOL_MISMATCH: u64 = 3;
    const ENO_MEMBERSHIP: u64 = 4;
    const ENO_EMPTY_STRING: u64 = 5;
    const ENO_PERMISSION: u64 = 6;
    const ENO_EMPTY_PARAMETERS: u64 = 7;

    public struct SCULPT has drop {}

    public struct Sculpt<phantom ATELIER> has key, store {
        id: UID,
        atelier_id: ID,
        alias: String,
        owner: address,
        creator: address,
        blueprint: String,
        glb_file: String,
        structure: option::Option<String>,
        parameters: VecMap<String, u64>,
        printed: u64,
        time: u64,
        printer_whitelist: VecSet<ID>,
        encrypted: bool,
        seal_resource_id: option::Option<String>,
    }

    public struct New_sculpt has copy, drop { id: ID }
    public struct PrinterAdded has copy, drop { sculpt_id: ID, printer_id: ID }
    public struct PrinterRemoved has copy, drop { sculpt_id: ID, printer_id: ID }

    #[allow(lint(share_owned))]
    fun init(otw: SCULPT, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        
        let mut display = display::new<Sculpt<ATELIER>>(&publisher, ctx);
        display.add(b"name".to_string(), b"{alias}".to_string());
        display.add(b"link".to_string(), b"https://archimeters.vercel.app/".to_string());
        display.add(b"description".to_string(), b"Sculpt Published by Archimeters".to_string());
        display.add(b"image_url".to_string(), b"{blueprint}".to_string());
        display.update_version();

        let (mut policy, policy_cap) = transfer_policy::new<Sculpt<ATELIER>>(&publisher, ctx);
        royalty_rule::add(&mut policy, &policy_cap, 250, ctx.sender());

        transfer::public_share_object(policy);
        transfer::public_transfer(policy_cap, ctx.sender());
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    public fun mint_sculpt<T>(
        atelier: &Atelier<T>,
        pool: &mut AtelierPool<T>,
        membership: &mut MemberShip,
        sculpt_kiosk: &mut Kiosk,
        sculpt_kiosk_cap: &KioskOwnerCap,
        alias: String,
        blueprint: String,
        glb_file: String,
        structure: option::Option<String>,
        seal_resource_id: option::Option<String>,
        param_keys: vector<String>,
        param_values: vector<u64>,
        payment: Coin<SUI>,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let atelier_id = object::id(atelier);
        
        assert!(archimeters_module::owner(membership) == sender, ENO_MEMBERSHIP);
        assert!(!string::is_empty(&alias), ENO_EMPTY_STRING);
        assert!(!string::is_empty(&blueprint), ENO_EMPTY_STRING);
        assert!(!string::is_empty(&glb_file), ENO_EMPTY_STRING);
        assert!(get_pool_id(atelier) == object::id(pool), ENO_POOL_MISMATCH);
        assert!(coin::value(&payment) == get_price(atelier), ENO_CORRECT_FEE);
        assert!(vector::length(&param_keys) > 0, ENO_EMPTY_PARAMETERS);
        assert!(vector::length(&param_values) > 0, ENO_EMPTY_PARAMETERS);
        
        let params = validate_and_build_parameters(atelier, param_keys, param_values);
        let creator = get_original_creator(atelier);
        
        add_payment_to_pool<T>(pool, payment);
        
        let (sculpt, sculpt_id) = create_sculpt<T>(
            atelier_id, alias, sender, creator, blueprint, glb_file, structure, seal_resource_id, params, clock, ctx
        );
        
        add_sculpt_to_membership(membership, sculpt_id);
        finalize_sculpt_mint<T>(sculpt_kiosk, sculpt_kiosk_cap, sculpt, sculpt_id);
    }
    
    fun validate_and_build_parameters<T>(
        atelier: &Atelier<T>,
        param_keys: vector<String>,
        param_values: vector<u64>
    ): VecMap<String, u64> {
        assert!(vector::length(&param_keys) == vector::length(&param_values), ENO_PARAMETER_COUNT_MISMATCH);
        
        let rules = atelier_module::get_parameter_rules(atelier);
        let mut params = vec_map::empty<String, u64>();
        let mut i = 0;
        
        while (i < vector::length(&param_keys)) {
            let key = *vector::borrow(&param_keys, i);
            let value = *vector::borrow(&param_values, i);
            assert!(atelier_module::validate_parameter(rules, key, value), ENO_INVALID_PARAMETER);
            vec_map::insert(&mut params, key, value);
            i = i + 1;
        };
        params
    }
    
    fun create_sculpt<T>(
        atelier_id: ID,
        alias: String,
        owner: address,
        creator: address,
        blueprint: String,
        glb_file: String,
        structure: option::Option<String>,
        seal_resource_id: option::Option<String>,
        parameters: VecMap<String, u64>,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ): (Sculpt<T>, ID) {

        let id = object::new(ctx);
        let id_inner = object::uid_to_inner(&id);
        
        // Check if STL is encrypted
        let encrypted = option::is_some(&structure);
        
        (Sculpt<T> {
            id, atelier_id, alias, owner, creator, blueprint, glb_file, structure,
            parameters, printed: 0, time: clock::timestamp_ms(clock),
            printer_whitelist: vec_set::empty(),
            encrypted,
            seal_resource_id,
        }, id_inner)
    }
    
    fun finalize_sculpt_mint<T>(
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        sculpt: Sculpt<T>,
        sculpt_id: ID
    ) {
        kiosk::place(kiosk, kiosk_cap, sculpt);
        event::emit(New_sculpt { id: sculpt_id });
    }

    public fun print_sculpt<T>(sculpt: &mut Sculpt<T>, clock: &clock::Clock) {
        sculpt.printed = sculpt.printed + 1;
        sculpt.time = clock::timestamp_ms(clock);
    }

    public fun add_print_record<T, R: key + store>(sculpt: &mut Sculpt<T>, record: R, clock: &clock::Clock) {
        sui::dynamic_object_field::add(&mut sculpt.id, clock::timestamp_ms(clock), record);
    }

    public fun get_sculpt_info<T>(sculpt: &Sculpt<T>): (ID, String, String, option::Option<String>) {
        (sculpt.id.uid_to_inner(), sculpt.alias, sculpt.glb_file, sculpt.structure)
    }

    public fun get_sculpt_printed<T>(sculpt: &Sculpt<T>): u64 { sculpt.printed }
    
    public fun get_sculpt_atelier_id<T>(sculpt: &Sculpt<T>): ID { sculpt.atelier_id }
    
    // == Seal Authorization Functions ==
    
    /// Seal authorization function for printer access control
    /// Verifies if the given Printer ID is authorized to decrypt the STL file
    /// 
    /// The `id` parameter contains the Printer ID (without package prefix)
    /// This function checks if the Printer ID is in the sculpt's whitelist
    entry fun seal_approve_printer<T>(
        id: vector<u8>,
        sculpt: &Sculpt<T>,
        _ctx: &TxContext
    ) {
        // Convert the printer ID bytes to ID type
        let printer_id = object::id_from_bytes(id);
        
        // Check if the Printer ID is in the whitelist
        assert!(vec_set::contains(&sculpt.printer_whitelist, &printer_id), ENO_PERMISSION);

        // If we reach here, access is granted (function returns normally)
    }
    
    /// Add a printer to the whitelist for this sculpt (owner only)
    public fun add_printer_to_whitelist<T>(
        sculpt: &mut Sculpt<T>,
        printer_id: ID,
        ctx: &TxContext
    ) {
        assert!(sculpt.owner == ctx.sender(), ENO_PERMISSION);
        vec_set::insert(&mut sculpt.printer_whitelist, printer_id);
        
        event::emit(PrinterAdded {
            sculpt_id: object::uid_to_inner(&sculpt.id),
            printer_id,
        });
    }
    
    /// Remove a printer from the whitelist (owner only)
    public fun remove_printer_from_whitelist<T>(
        sculpt: &mut Sculpt<T>,
        printer_id: ID,
        ctx: &TxContext
    ) {
        assert!(sculpt.owner == ctx.sender(), ENO_PERMISSION);
        vec_set::remove(&mut sculpt.printer_whitelist, &printer_id);
        
        event::emit(PrinterRemoved {
            sculpt_id: object::uid_to_inner(&sculpt.id),
            printer_id,
        });
    }
    
    /// Check if a printer is authorized to decrypt this sculpt
    public fun is_printer_authorized<T>(sculpt: &Sculpt<T>, printer_id: ID): bool {
        vec_set::contains(&sculpt.printer_whitelist, &printer_id)
    }
    
    /// Set the encryption status for this sculpt (owner only, can only be set once)
    public fun set_encrypted<T>(
        sculpt: &mut Sculpt<T>,
        ctx: &TxContext
    ) {
        assert!(sculpt.owner == ctx.sender(), ENO_PERMISSION);
        sculpt.encrypted = true;
    }
    
    /// Check if the sculpt is encrypted
    public fun is_encrypted<T>(sculpt: &Sculpt<T>): bool {
        sculpt.encrypted
    }
    
    /// Get the printer whitelist
    public fun get_printer_whitelist<T>(sculpt: &Sculpt<T>): &VecSet<ID> {
        &sculpt.printer_whitelist
    }
    
    /// Get the GLB file blobId
    public fun get_glb_file<T>(sculpt: &Sculpt<T>): String {
        sculpt.glb_file
    }
    
    /// Get the STL file blobId (if encrypted)
    public fun get_structure<T>(sculpt: &Sculpt<T>): option::Option<String> {
        sculpt.structure
    }
    
    // == Test Helper Functions ==
    
    #[test_only]
    /// Test helper to call seal_approve_printer (since entry functions can't be called directly in tests)
    public fun test_seal_approve_printer<T>(
        id: &vector<u8>,
        sculpt: &Sculpt<T>,
        _ctx: &TxContext
    ) {
        let printer_id = object::id_from_bytes(*id);
        assert!(vec_set::contains(&sculpt.printer_whitelist, &printer_id), ENO_PERMISSION);
    }
    
    #[test_only]
    /// Create a test Sculpt for unit testing
    public fun create_test_sculpt<T>(
        alias: String,
        owner: address,
        creator: address,
        blueprint: String,
        glb_file: String,
        structure: option::Option<String>,
        param_keys: vector<String>,
        param_values: vector<u64>,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ): Sculpt<T> {
        let atelier_id = object::id_from_address(@0x0);
        let id = object::new(ctx);
        
        let mut parameters = vec_map::empty<String, u64>();
        let mut i = 0;
        while (i < vector::length(&param_keys)) {
            vec_map::insert(&mut parameters, *vector::borrow(&param_keys, i), *vector::borrow(&param_values, i));
            i = i + 1;
        };
        
        let encrypted = option::is_some(&structure);
        
        Sculpt<T> {
            id,
            atelier_id,
            alias,
            owner,
            creator,
            blueprint,
            glb_file,
            structure,
            parameters,
            printed: 0,
            time: clock::timestamp_ms(clock),
            printer_whitelist: vec_set::empty(),
            encrypted,
            seal_resource_id: option::none(),
        }
    }
}