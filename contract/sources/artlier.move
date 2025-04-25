module archimeters::artlier {
    use archimeters::archimeters::{ Self, MemberShip };
    use std::string::{ String };
    use sui::{
        event,
        clock,
        package,
        display,
    };

    // == Errors ==
    const ENO_MEMBERSHIP: u64 = 0;

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
        publish_time: u64,
    }

    // == Events ==
    public struct New_artlier has copy, drop {
        id: ID,
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
            price,
            publish_time: now,
        };

        // Add Artlier ID to MemberShip and State
        archimeters::add_artlier_to_membership(membership, id_inner);
        add_artlier_to_state(artlier_state, id_inner);

        transfer::transfer(artlier, sender);

        // Emit the event at the end
        event::emit(New_artlier {
            id: id_inner,
        });
    }

    // == Helper Functions ==
    fun add_artlier_to_state(artlier_state: &mut ArtlierState, artlier_id: ID) {
        artlier_state.all_artliers.push_back(artlier_id);
    }
}