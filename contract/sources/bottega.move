#[allow(unused_field)]
module archimeters::bottega {
    use std::string::{ String };

    public struct Bottega has key, store {
        id: UID,
        owner: address,
        creator: address,
        name: String,
        blueprint: String,
        structure: String,
    }
}