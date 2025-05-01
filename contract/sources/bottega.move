module archimeters::bottega {
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
        add_bottega_to_membership,
    };
    use archimeters::artlier::{
        Artlier,
        get_author,
        get_price,
        add_to_pool,
        add_bottega_to_artlier,
    };

    // == Errors ==
    const ENO_CORRECT_FEE: u64 = 0;

    // == One Time Witness ==
    public struct BOTTEGA has drop {}

    // == Structs ==
    public struct Bottega has key, store {
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
    public struct New_bottega has copy, drop {
        id: ID,
    }

    // == Initializer ==
    fun init(otw: BOTTEGA, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<Bottega>(&publisher, ctx);

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
            b"Bottega Published by Archimeters".to_string()
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
    public entry fun mint_bottega(
        artlier: &mut Artlier,
        membership: &mut MemberShip,
        alias: String,
        blueprint: String,
        structure: String,
        payment: &mut Coin<SUI>,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ) {
        let price = get_price(artlier);
        assert!(coin::value(payment) >= price, ENO_CORRECT_FEE);
        
        let fee = coin::split(payment, price, ctx);
        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock);

        let bottega = Bottega {
            id: object::new(ctx),
            alias,
            owner: sender,
            creator: get_author(artlier),
            blueprint,
            structure,
            printed: 0,
            time: now,
        };

        add_bottega_to_membership(membership, object::uid_to_inner(&bottega.id));
        add_bottega_to_artlier(artlier, object::uid_to_inner(&bottega.id));
        add_to_pool(artlier, coin::into_balance(fee));

        let bottega_id = object::uid_to_inner(&bottega.id);
        transfer::public_transfer(bottega, sender);

        event::emit(New_bottega { id: bottega_id });
    }

    // public entry fun print_bottega(
    //     bottega: &mut Bottega,
    //     clock: &clock::Clock,
    //     ctx: &mut TxContext
    // ) {
    //     let sender = tx_context::sender(ctx);
    //     let now = clock::timestamp_ms(clock);
    // }
}