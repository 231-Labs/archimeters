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
        transfer_policy::{ 
            Self, 
            TransferPolicy, 
            TransferPolicyCap,
            TransferRequest
        },
    };
    use archimeters::archimeters::{
        MemberShip,
        add_sculpt_to_membership,
    };
    use archimeters::atelier::{
        Atelier,
        get_author,
        get_price,
        add_to_pool,
        add_sculpt_to_atelier,
    };

    // == Errors ==
    const ENO_CORRECT_FEE: u64 = 0;
    const ENO_PERMISSION: u64 = 1;
    
    // == Constants ==
    const BASIS_POINTS: u64 = 10000;

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
        printed: u64,
        time: u64
    }

    // == Events ==
    public struct New_sculpt has copy, drop {
        id: ID,
    }
    
    public struct RoyaltyUpdated has copy, drop {
        new_rate_bp: u64,
    }

    // == Initializer ==
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

        // Initialize TransferPolicy with 0% royalty (0 basis points)
        let (mut policy, policy_cap) = transfer_policy::new<Sculpt>(&publisher, ctx);
        transfer_policy::add_rule(
            transfer_policy::royalty_rule::Rule {},
            &mut policy,
            &policy_cap,
            0,
            0
        );

        transfer::public_share_object(policy);
        transfer::public_transfer(policy_cap, ctx.sender());
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == Entry Functions ==
    entry fun mint_sculpt(
        atelier: &mut Atelier,
        membership: &mut MemberShip,
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        alias: String,
        blueprint: String,
        structure: String,
        payment: &mut Coin<SUI>,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ) {
        let price = get_price(atelier);
        assert!(coin::value(payment) >= price, ENO_CORRECT_FEE);
        
        let fee = coin::split(payment, price, ctx);
        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock);

        let sculpt = Sculpt {
            id: object::new(ctx),
            alias,
            owner: sender,
            creator: get_author(atelier),
            blueprint,
            structure,
            printed: 0,
            time: now,
        };

        let sculpt_id = object::uid_to_inner(&sculpt.id);
        add_sculpt_to_membership(membership, sculpt_id);
        add_sculpt_to_atelier(atelier, sculpt_id);
        add_to_pool(atelier, coin::into_balance(fee));

        // Place sculpt in kiosk instead of direct transfer
        kiosk::place(kiosk, kiosk_cap, sculpt);

        event::emit(New_sculpt { id: sculpt_id });
    }
    
    /// Set royalty rate for Sculpt transfers (in basis points, e.g., 500 = 5%)
    /// Only the TransferPolicyCap owner can call this
    public entry fun set_royalty_rate(
        policy: &mut TransferPolicy<Sculpt>,
        policy_cap: &TransferPolicyCap<Sculpt>,
        rate_bp: u64,
        ctx: &mut TxContext
    ) {
        assert!(rate_bp <= BASIS_POINTS, ENO_PERMISSION);
        
        transfer_policy::add_rule(
            transfer_policy::royalty_rule::Rule {},
            policy,
            policy_cap,
            rate_bp,
            0
        );
        
        event::emit(RoyaltyUpdated { new_rate_bp: rate_bp });
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
}