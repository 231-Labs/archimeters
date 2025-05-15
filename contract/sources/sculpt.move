module archimeters::sculpt {
    use std::string::{ String };
    use sui::{
        event,
        clock,
        package,
        display,
        sui::SUI,
        coin::{ Self, Coin },
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

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == Entry Functions ==
    public entry fun mint_sculpt(
        atelier: &mut Atelier,
        membership: &mut MemberShip,
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

        add_sculpt_to_membership(membership, object::uid_to_inner(&sculpt.id));
        add_sculpt_to_atelier(atelier, object::uid_to_inner(&sculpt.id));
        add_to_pool(atelier, coin::into_balance(fee));

        let sculpt_id = object::uid_to_inner(&sculpt.id);
        transfer::public_transfer(sculpt, sender);

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
    public fun add_print_record<T: key + store>(sculpt: &mut Sculpt, record: T) {
        let key = sculpt.printed;
        sui::dynamic_object_field::add(&mut sculpt.id, key, record);
    }

    // === Getters ===  
    public fun get_sculpt_info(sculpt: &Sculpt): (ID, String, String) {
        (sculpt.id.uid_to_inner(), sculpt.alias, sculpt.structure)
    }

    public fun get_sculpt_printed(sculpt: &Sculpt): u64 {
        sculpt.printed
    }
}