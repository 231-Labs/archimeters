#[allow(unused_field)]
module archimeters::archimeters {
    use std::string::{ String };
    use sui::{
        package,
        display,
        event,
        table::{ Self, Table },
        vec_set::{ Self, VecSet }
    };

    // == Errors ==

    const Eregistered: u64 = 0;

    // == Structs ==

    public struct State has key {
        id: UID,
        accounts: Table<address, ID>,
        all_members: vector<ID>,
    }

    public struct MemberShip has key, store {
        id: UID,
        owner: address,
        username: String,
        artliers: VecSet<ID>,
        gallery: vector<ID>,
    }

    // == One Time Witness ==

    public struct ARCHIMETERS has drop {}

    // == Events ==

    public struct New_member has copy, drop {
        member_id: ID,
        username: String,
    }

    // == Initializer ==

    fun init(otw: ARCHIMETERS, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<MemberShip>(&publisher, ctx);

        display.add(
            b"name".to_string(),
            b"Archimeters".to_string()
        );
        display.add(
            b"link".to_string(),
            b"https://archimeters.xyz".to_string() // TODO: change to realsite
        );
        display.add(
            b"description".to_string(),
            b"Your pass to the parametric design world".to_string() // TODO: change to realsite
        );
        display.add(
            b"image_url".to_string(),
            b"https://aggregator.walrus-testnet.walrus.space/v1/blobs/jBwMThR7sKzyZAeuDla4lPSJ-AW4f6irNQKsY3OdwwU".to_string() // TODO: change to realsite
        );

        display.update_version();

        transfer::share_object(State {
            id: object::new(ctx),
            accounts: table::new(ctx),
            all_members: vector::empty(),
        });

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == Entry_functions ==

    public fun owner(membership: &MemberShip): address {
        membership.owner
    }

    public fun add_artlier(membership: &mut MemberShip, design_series_id: ID) {
        vec_set::insert(&mut membership.artliers, design_series_id);
    }

    public entry fun mint_membership(
        state: &mut State,
        username: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(!table::contains(&state.accounts, sender), Eregistered);

        let member = MemberShip {
            id: object::new(ctx),
            owner: sender,
            username,
            artliers: vec_set::empty(),
            gallery: vector::empty(),
        };

        let id_copy = object::uid_to_inner(&member.id);

        vector::push_back(&mut state.all_members, id_copy);
        table::add(&mut state.accounts, sender, id_copy);

        transfer::public_transfer(member, sender);

        event::emit( New_member {
            member_id: id_copy,
            username,
        });
    }
}



