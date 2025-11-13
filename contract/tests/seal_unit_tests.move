#[test_only]
module archimeters::seal_unit_tests {
    use std::string;
    use sui::test_scenario::{Self as ts};
    use sui::clock;
    use sui::test_utils;
    
    use archimeters::sculpt::{Self, Sculpt};
    use archimeters::atelier::ATELIER;

    const OWNER: address = @0x1;
    // Printer IDs for testing
    const PRINTER1_ADDR: address = @0xA;
    const PRINTER2_ADDR: address = @0xB;
    const UNAUTHORIZED_ADDR: address = @0xC;

    #[test]
    fun test_encrypted_sculpt_properties() {
        let mut scenario = ts::begin(OWNER);
        
        ts::next_tx(&mut scenario, OWNER);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let sculpt = sculpt::create_test_sculpt<ATELIER>(
                string::utf8(b"Test Sculpt"),
                OWNER,
                OWNER,
                string::utf8(b"blueprint_id"),
                string::utf8(b"glb_id"),
                std::option::some(string::utf8(b"encrypted_stl_id")),
                vector[string::utf8(b"size")],
                vector[50],
                &clock,
                ts::ctx(&mut scenario)
            );
            clock::destroy_for_testing(clock);
            
            // Test encrypted flag
            assert!(sculpt::is_encrypted(&sculpt), 1);
            
            // Test GLB file
            assert!(sculpt::get_glb_file(&sculpt) == string::utf8(b"glb_id"), 2);
            
            // Test structure (encrypted STL)
            let structure = sculpt::get_structure(&sculpt);
            assert!(std::option::is_some(&structure), 3);
            assert!(*std::option::borrow(&structure) == string::utf8(b"encrypted_stl_id"), 4);
            
            test_utils::destroy(sculpt);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_unencrypted_sculpt_properties() {
        let mut scenario = ts::begin(OWNER);
        
        ts::next_tx(&mut scenario, OWNER);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let sculpt = sculpt::create_test_sculpt<ATELIER>(
                string::utf8(b"Test Sculpt No STL"),
                OWNER,
                OWNER,
                string::utf8(b"blueprint_id"),
                string::utf8(b"glb_only_id"),
                std::option::none(), // No STL
                vector[string::utf8(b"size")],
                vector[30],
                &clock,
                ts::ctx(&mut scenario)
            );
            clock::destroy_for_testing(clock);
            
            // Test encrypted flag is false
            assert!(!sculpt::is_encrypted(&sculpt), 1);
            
            // Test GLB file
            assert!(sculpt::get_glb_file(&sculpt) == string::utf8(b"glb_only_id"), 2);
            
            // Test structure is None
            let structure = sculpt::get_structure(&sculpt);
            assert!(std::option::is_none(&structure), 3);
            
            test_utils::destroy(sculpt);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_printer_whitelist_add_remove() {
        let mut scenario = ts::begin(OWNER);
        
        ts::next_tx(&mut scenario, OWNER);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let mut sculpt = sculpt::create_test_sculpt<ATELIER>(
                string::utf8(b"Test Sculpt"),
                OWNER,
                OWNER,
                string::utf8(b"blueprint_id"),
                string::utf8(b"glb_id"),
                std::option::some(string::utf8(b"encrypted_stl_id")),
                vector[string::utf8(b"size")],
                vector[50],
                &clock,
                ts::ctx(&mut scenario)
            );
            clock::destroy_for_testing(clock);
            
            // Create printer IDs for testing
            let printer1_id = object::id_from_address(PRINTER1_ADDR);
            let printer2_id = object::id_from_address(PRINTER2_ADDR);
            let unauthorized_id = object::id_from_address(UNAUTHORIZED_ADDR);
            
            // Initially, no printers are authorized
            assert!(!sculpt::is_printer_authorized(&sculpt, printer1_id), 1);
            
            // Add printer1
            sculpt::add_printer_to_whitelist(&mut sculpt, printer1_id, ts::ctx(&mut scenario));
            assert!(sculpt::is_printer_authorized(&sculpt, printer1_id), 2);
            
            // Add printer2
            sculpt::add_printer_to_whitelist(&mut sculpt, printer2_id, ts::ctx(&mut scenario));
            assert!(sculpt::is_printer_authorized(&sculpt, printer2_id), 3);
            
            // UNAUTHORIZED should not be in whitelist
            assert!(!sculpt::is_printer_authorized(&sculpt, unauthorized_id), 4);
            
            // Remove printer1
            sculpt::remove_printer_from_whitelist(&mut sculpt, printer1_id, ts::ctx(&mut scenario));
            assert!(!sculpt::is_printer_authorized(&sculpt, printer1_id), 5);
            
            // Printer2 should still be authorized
            assert!(sculpt::is_printer_authorized(&sculpt, printer2_id), 6);
            
            test_utils::destroy(sculpt);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_seal_approve_with_authorized_printer() {
        let mut scenario = ts::begin(PRINTER1_ADDR);
        
        ts::next_tx(&mut scenario, PRINTER1_ADDR);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            // Create sculpt with PRINTER1 as owner (so they can add to whitelist)
            let mut sculpt = sculpt::create_test_sculpt<ATELIER>(
                string::utf8(b"Test Sculpt"),
                PRINTER1_ADDR,   // owner is PRINTER1
                OWNER,           // creator
                string::utf8(b"blueprint_id"),
                string::utf8(b"glb_id"),
                std::option::some(string::utf8(b"encrypted_stl_id")),
                vector[string::utf8(b"size")],
                vector[50],
                &clock,
                ts::ctx(&mut scenario)
            );
            clock::destroy_for_testing(clock);
            
            // Create a printer ID and add it to whitelist
            let printer1_id = object::id_from_address(PRINTER1_ADDR);
            sculpt::add_printer_to_whitelist(&mut sculpt, printer1_id, ts::ctx(&mut scenario));
            assert!(sculpt::is_printer_authorized(&sculpt, printer1_id), 1);
            
            // Test printer authorization (should succeed)
            assert!(sculpt::verify_printer_access(printer1_id, &sculpt), 1);
            
            test_utils::destroy(sculpt);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_seal_approve_with_unauthorized_printer() {
        let mut scenario = ts::begin(UNAUTHORIZED_ADDR);
        
        ts::next_tx(&mut scenario, UNAUTHORIZED_ADDR);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let sculpt = sculpt::create_test_sculpt<ATELIER>(
                string::utf8(b"Test Sculpt"),
                OWNER,
                OWNER,
                string::utf8(b"blueprint_id"),
                string::utf8(b"glb_id"),
                std::option::some(string::utf8(b"encrypted_stl_id")),
                vector[string::utf8(b"size")],
                vector[50],
                &clock,
                ts::ctx(&mut scenario)
            );
            clock::destroy_for_testing(clock);
            
            // Create unauthorized printer ID (NOT added to whitelist)
            let unauthorized_id = object::id_from_address(UNAUTHORIZED_ADDR);
            
            // Test printer authorization with unauthorized ID (should return false)
            let is_authorized = sculpt::verify_printer_access(unauthorized_id, &sculpt);
            assert!(!is_authorized, 1); // Should be false since printer is not in whitelist
            
            test_utils::destroy(sculpt);
        };
        
        ts::end(scenario);
    }
}

