module archimeters::design_series {
    use std::string::{ String };
    use sui::vec_set::{ Self, VecSet };
    use sui::event;
    use archimeters::archimeters::{ Self, MemberShip, State };

    // == Errors ==
    const ENO_MEMBERSHIP: u64 = 0;

    // == Structs ==
    public struct Design_series has key, store {
        id: UID,
        owner: address,
        photo: String, // IPFS blob ID for the main design image
        website: String, // IPFS blob ID for the website
        algorithm: String, // IPFS blob ID for the algorithm file
        artificials: VecSet<ID>, // Collection of all items in the series
    }

    // == Events ==
    public struct New_design_series has copy, drop {
        id: ID,
    }

    // == Public Functions ==
    public entry fun mint(
        state: &mut State,
        membership: &mut MemberShip,
        photo: String,
        website: String,
        algorithm: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify membership ownership
        assert!(archimeters::owner(membership) == sender, ENO_MEMBERSHIP);
        
        let id = object::new(ctx);
        let id_inner = object::uid_to_inner(&id);
        
        let design_series = Design_series {
            id,
            owner: sender,
            photo,
            website,
            algorithm,
            artificials: vec_set::empty(),
        };

        // Add Design Series ID to MemberShip and State
        archimeters::add_artlier_to_membership(membership, id_inner);
        archimeters::add_artlier_to_state(state, id_inner, ctx);

        transfer::transfer(design_series, sender);

        // Emit the event at the end
        event::emit(New_design_series {
            id: id_inner,
        });
    }
}