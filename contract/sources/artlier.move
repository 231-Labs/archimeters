module archimeters::artlier {
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
    };

    // == Constants ==
    const ONE_SUI: u64 = 1_000_000_000;

    // == Errors ==
    const ENO_MEMBERSHIP: u64 = 0;
    const ENO_PERMISSION: u64 = 1;
    const ENO_AMOUNT: u64 = 2;

    // == One Time Witness ==
    public struct ARTLIER has drop {}

    // == Structs ==
    public struct ArtlierState has key {
        id: UID,
        all_artliers: vector<ID>,
    }

    public struct Artlier has key, store {
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
    }

    public struct ArtlierCap has key, store {
        id: UID,
        artlier_id: ID,
    }

    // == Events ==
    public struct New_artlier has copy, drop {
        id: ID,
    }

    public struct WithdrawPool has copy, drop {
        amount: u64,
    }

    // == Initializer ==
    fun init(otw: ARTLIER, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<Artlier>(&publisher, ctx);

        display.add(
            b"name".to_string(),
            b"Artlier".to_string()
        );
        display.add(
            b"link".to_string(),
            b"https://archimeters.vercel.app/".to_string() 
        );
        display.add(
            b"description".to_string(),
            b"Artlier Published by Archimeters".to_string()
        );
        display.add(
            b"image_url".to_string(),
            b"https://aggregator.walrus-testnet.walrus.space/v1/blobs/zw47vReyw9PXRYjIrtMFhgFF8O3nv26nWCJFY6QEiDI".to_string()
        );

        display.update_version();

        transfer::share_object(ArtlierState {
            id: object::new(ctx),
            all_artliers: vector[],
        });

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == Entry Functions ==
    public entry fun mint_artlier(
        artlier_state: &mut ArtlierState,
        membership: &mut MemberShip,
        name: String,
        photo: String,
        data: String,
        algorithm: String,
        clock: &clock::Clock,
        price: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify membership ownership
        assert!(archimeters::owner(membership) == sender, ENO_MEMBERSHIP);
        
        let id = object::new(ctx);
        let id_inner = object::uid_to_inner(&id);
        let now = clock::timestamp_ms(clock);
        
        let artlier = Artlier {
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
        };

        // Create ArtlierCap
        let cap = ArtlierCap {
            id: object::new(ctx),
            artlier_id: id_inner,
        };

        // Add Artlier ID to MemberShip and State
        archimeters::add_artlier_to_membership(membership, id_inner);
        add_artlier_to_state(artlier_state, id_inner);

        transfer::share_object(artlier);
        transfer::transfer(cap, sender);

        // Emit the event at the end
        event::emit(New_artlier {
            id: id_inner,
        });
    }

    public entry fun withdraw_pool(
        artlier: &mut Artlier,
        cap: &ArtlierCap,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let artlier_id = object::uid_to_inner(&artlier.id);
        
        // Verify artlier_id match and amount
        assert!(cap.artlier_id == artlier_id, ENO_PERMISSION);
        assert!(amount > 0, ENO_AMOUNT);
        
        let coin = coin::from_balance(balance::split(&mut artlier.pool, amount), ctx);
        transfer::public_transfer(coin, sender);
        
        event::emit(WithdrawPool {
            amount,
        });
    }

    // == Getter Functions ==

    public fun get_author(artlier: &Artlier): address {
        artlier.author
    }

    public fun get_price(artlier: &Artlier): u64 {
        artlier.price
    }

    public fun get_pool(artlier: &Artlier): &Balance<SUI> {
        &artlier.pool
    }

    public fun add_to_pool(artlier: &mut Artlier, fee: Balance<SUI>) {
        balance::join(&mut artlier.pool, fee);
    }

    public fun add_bottega_to_artlier(artlier: &mut Artlier, bottega_id: ID) {
        vector::push_back(&mut artlier.artificials, bottega_id);
    }

    fun add_artlier_to_state(artlier_state: &mut ArtlierState, artlier_id: ID) {
        artlier_state.all_artliers.push_back(artlier_id);
    }
}