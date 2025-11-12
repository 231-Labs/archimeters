#[test_only]
module archimeters::seal_approval_tests {
    use sui::test_scenario::{Self as ts};
    use sui::test_utils;
    use std::string;
    use archimeters::sculpt;
    use archimeters::atelier::ATELIER;
    use sui::clock;
    
    const USER1: address = @0x1234;
    const PRINTER_OWNER: address = @0x9999;
    
    #[test]
    /// Test verify_printer_access - authorized
    fun test_verify_printer_access_authorized() {
        let mut scenario = ts::begin(USER1);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        let mut sculpt = sculpt::create_test_sculpt<ATELIER>(
            string::utf8(b"Test"),
            USER1,
            USER1,
            string::utf8(b"blueprint"),
            string::utf8(b"glb"),
            option::some(string::utf8(b"stl")),
            vector[string::utf8(b"width")],
            vector[100],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        let printer_id = object::id_from_address(PRINTER_OWNER);
        sculpt::add_printer_to_whitelist(&mut sculpt, printer_id, ts::ctx(&mut scenario));
        
        assert!(sculpt::verify_printer_access(printer_id, &sculpt), 0);
        
        test_utils::destroy(sculpt);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
    
    #[test]
    /// Test verify_printer_access - unauthorized
    fun test_verify_printer_access_unauthorized() {
        let mut scenario = ts::begin(USER1);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        let sculpt = sculpt::create_test_sculpt<ATELIER>(
            string::utf8(b"Test"),
            USER1,
            USER1,
            string::utf8(b"blueprint"),
            string::utf8(b"glb"),
            option::some(string::utf8(b"stl")),
            vector[string::utf8(b"width")],
            vector[100],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        let printer_id = object::id_from_address(PRINTER_OWNER);
        assert!(!sculpt::verify_printer_access(printer_id, &sculpt), 0);
        
        test_utils::destroy(sculpt);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
    
    #[test]
    /// Test whitelist add/remove
    fun test_whitelist_management() {
        let mut scenario = ts::begin(USER1);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        let mut sculpt = sculpt::create_test_sculpt<ATELIER>(
            string::utf8(b"Test"),
            USER1,
            USER1,
            string::utf8(b"blueprint"),
            string::utf8(b"glb"),
            option::some(string::utf8(b"stl")),
            vector[string::utf8(b"width")],
            vector[100],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        let printer_id = object::id_from_address(PRINTER_OWNER);
        
        // Not in whitelist initially
        assert!(!sculpt::verify_printer_access(printer_id, &sculpt), 0);
        
        // Add to whitelist
        sculpt::add_printer_to_whitelist(&mut sculpt, printer_id, ts::ctx(&mut scenario));
        assert!(sculpt::verify_printer_access(printer_id, &sculpt), 1);
        
        // Remove from whitelist
        sculpt::remove_printer_from_whitelist(&mut sculpt, printer_id, ts::ctx(&mut scenario));
        assert!(!sculpt::verify_printer_access(printer_id, &sculpt), 2);
        
        test_utils::destroy(sculpt);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
