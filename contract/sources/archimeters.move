module archimeters::archimeters {

    use std::string::{ String };
    use sui::{
        package,
        display,
        event,
        clock,
        table::{ Self, Table },
        vec_set::{ Self, VecSet },
    };

    // == Errors ==

    const Eregistered: u64 = 0;

    // == Structs ==

    public struct State has key {
        id: UID,
        registered_users: Table<address, VecSet<ID>>,
    }

    public struct MemberShip has key, store {
        id: UID,
        owner: address,
        username: String,
        description: String,
        ateliers: VecSet<ID>,
        sculptures: VecSet<ID>,
        registered_time: u64,
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
            b"{username}".to_string()
        );
        display.add(
            b"link".to_string(),
            b"https://archimeters.vercel.app".to_string()
        );
        display.add(
            b"description".to_string(),
            b"Your access to the parametric design world".to_string()
        );
        display.add(
            b"image_url".to_string(),
            b"https://aggregator.walrus-testnet.walrus.space/v1/blobs/d3ElFh07L2aZFHgFASwsIkn_WHnjnNHSz0U8SlbTi_Q".to_string()
        );

        display.update_version();

        transfer::share_object(State {
            id: object::new(ctx),
            registered_users: table::new(ctx),
        });

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == Entry Functions ==
    public entry fun mint_membership(
        state: &mut State,
        username: String,
        description: String,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(!table::contains(&state.registered_users, sender), Eregistered);
        
        let now = clock::timestamp_ms(clock);

        let member = MemberShip {
            id: object::new(ctx),
            owner: sender,
            username,
            description,
            ateliers: vec_set::empty(),
            sculptures: vec_set::empty(),
            registered_time: now,
        };

        let id_copy = object::uid_to_inner(&member.id);
        
        let mut ids = vec_set::empty();
        vec_set::insert(&mut ids, id_copy);
        table::add(&mut state.registered_users, sender, ids);

        transfer::public_transfer(member, sender);

        event::emit( New_member {
            member_id: id_copy,
            username,
        });
    }

    // == Public Functions ==

    public fun owner(membership: &MemberShip): address {
        membership.owner
    }

    public fun add_atelier_to_membership(membership: &mut MemberShip, design_series_id: ID) {
        vec_set::insert(&mut membership.ateliers, design_series_id);
    }

    public fun add_sculpt_to_membership(membership: &mut MemberShip, sculpt_id: ID) {
        vec_set::insert(&mut membership.sculptures, sculpt_id);
    }
}



