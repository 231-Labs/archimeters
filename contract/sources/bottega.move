module archimeters::bottega {
    use std::string::{ String };
    use sui::{
        clock,
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

    // == Structs ==
    public struct Bottega has key, store {
        id: UID,
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

    // == Entry Functions ==
    public entry fun mint_bottega(
        artlier: &mut Artlier,
        membership: &mut MemberShip,
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

        transfer::public_transfer(bottega, sender);

        emit_event(New_bottega { id: object::uid_to_inner(&bottega.id) });
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