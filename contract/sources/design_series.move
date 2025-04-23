module archimeters::design_series {
    use archimeters::archimeters::{ Self, MemberShip };
    use std::string::{ String };
    use sui::{
        event,
        clock,
        table,
        package,
        display,
        table::{ Table },
        vec_set::{ Self, VecSet }
    };

    // == Errors ==
    const ENO_MEMBERSHIP: u64 = 0;

    // == One Time Witness ==
    public struct DESIGN_SERIES has drop {}

    // == Structs ==
    public struct ArtlierState has key {
        id: UID,
        all_artliers: Table<address, VecSet<ID>>,
    }

    public struct Design_series has key, store {
        id: UID,
        owner: address,
        photo: String, // Walrus  blob ID for the main design image
        data: String, // Walrus blob ID for the website
        algorithm: String, // Walrus blob ID for the algorithm file
        artificials: VecSet<ID>, // Collection of all items in the series
        price: u64,
        publish_time: u64,
    }

    // == Events ==
    public struct New_design_series has copy, drop {
        id: ID,
    }

    // == Initializer ==
    fun init(otw: DESIGN_SERIES, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<Design_series>(&publisher, ctx);

        display.add(
            b"name".to_string(),
            b"Artlier".to_string()
        );
        display.add(
            b"link".to_string(),
            b"https://archimeters.xyz".to_string() // TODO: change to realsite
        );
        display.add(
            b"description".to_string(),
            b"Your Artlier is here".to_string() // TODO: change to realsite
        );
        display.add(
            b"image_url".to_string(),
            b"https://aggregator.walrus-testnet.walrus.space/v1/blobs/jBwMThR7sKzyZAeuDla4lPSJ-AW4f6irNQKsY3OdwwU".to_string() // TODO: change to realsite
        );

        display.update_version();

        transfer::share_object(ArtlierState {
            id: object::new(ctx),
            all_artliers: table::new(ctx),
        });

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == Public Functions ==
    public fun add_artlier_to_state(artlier_state: &mut ArtlierState, design_series_id: ID, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        if (!table::contains(&artlier_state.all_artliers, sender)) {
            table::add(&mut artlier_state.all_artliers, sender, vec_set::empty());
        };
        vec_set::insert(table::borrow_mut(&mut artlier_state.all_artliers, sender), design_series_id);
    }

    public entry fun mint_design_series(
        artlier_state: &mut ArtlierState,
        membership: &mut MemberShip,
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
        
        let design_series = Design_series {
            id,
            owner: sender,
            photo,
            data,
            algorithm,
            artificials: vec_set::empty(),
            price,
            publish_time: now,
        };

        // Add Design Series ID to MemberShip and State
        archimeters::add_artlier_to_membership(membership, id_inner);
        add_artlier_to_state(artlier_state, id_inner, ctx);

        transfer::transfer(design_series, sender);

        // Emit the event at the end
        event::emit(New_design_series {
            id: id_inner,
        });
    }
}