#[allow(unused_field)]
module archimeters::design_series {
    use std::string::{ String };
    use archimeters::bottega::Bottega;

    // == Structs ==
    public struct Design_series has key, store {
        id: UID,
        owner: address,
        artist: address,
        name: String,
        description: String,
        artlier: String,
        algorithm: String,
        artificials: vector<Bottega>,
    }

    // == Events ==
    public struct New_design_series has copy, drop {
        id: ID,
        name: String,
    }
}