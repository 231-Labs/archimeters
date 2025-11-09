module archimeters::atelier_validation {
    use std::string::String;
    use sui::vec_map::{Self, VecMap};
    use archimeters::archimeters::{Self, MemberShip};

    const ENO_MEMBERSHIP: u64 = 0;
    const ENO_PERMISSION: u64 = 1;
    const ENO_VECTOR_LENGTH_MISMATCH: u64 = 2;

    public struct ParameterRule has store, copy, drop {
        param_type: String,
        label: String,
        min_value: u64,
        max_value: u64,
        default_value: u64,
    }
    
    public struct ParameterRules has store {
        rules: VecMap<String, ParameterRule>,
    }

    public(package) fun verify_membership_ownership(membership: &MemberShip, sender: address) {
        assert!(archimeters::owner(membership) == sender, ENO_MEMBERSHIP);
    }

    public(package) fun verify_owner_permission(current_owner: address, sender: address) {
        assert!(current_owner == sender, ENO_PERMISSION);
    }

    public(package) fun build_parameter_rules(
        keys: vector<String>,
        types: vector<String>,
        labels: vector<String>,
        min_values: vector<u64>,
        max_values: vector<u64>,
        default_values: vector<u64>,
    ): ParameterRules {
        let mut rules_map = vec_map::empty<String, ParameterRule>();
        let len = vector::length(&keys);
        
        assert!(vector::length(&types) == len, ENO_VECTOR_LENGTH_MISMATCH);
        assert!(vector::length(&labels) == len, ENO_VECTOR_LENGTH_MISMATCH);
        assert!(vector::length(&min_values) == len, ENO_VECTOR_LENGTH_MISMATCH);
        assert!(vector::length(&max_values) == len, ENO_VECTOR_LENGTH_MISMATCH);
        assert!(vector::length(&default_values) == len, ENO_VECTOR_LENGTH_MISMATCH);
        
        let mut i = 0;
        while (i < len) {
            let rule = ParameterRule {
                param_type: *vector::borrow(&types, i),
                label: *vector::borrow(&labels, i),
                min_value: *vector::borrow(&min_values, i),
                max_value: *vector::borrow(&max_values, i),
                default_value: *vector::borrow(&default_values, i),
            };
            vec_map::insert(&mut rules_map, *vector::borrow(&keys, i), rule);
            i = i + 1;
        };
        
        ParameterRules { rules: rules_map }
    }

    public(package) fun validate_parameter(rules: &ParameterRules, key: String, value: u64): bool {
        if (!vec_map::contains(&rules.rules, &key)) return false;
        let rule = vec_map::get(&rules.rules, &key);
        value >= rule.min_value && value <= rule.max_value
    }

    public fun get_parameter_rules(rules: &ParameterRules): &VecMap<String, ParameterRule> {
        &rules.rules
    }

    public fun get_min_value(rule: &ParameterRule): u64 { rule.min_value }
    public fun get_max_value(rule: &ParameterRule): u64 { rule.max_value }
    public fun get_default_value(rule: &ParameterRule): u64 { rule.default_value }
    public fun get_param_type(rule: &ParameterRule): String { rule.param_type }
    public fun get_label(rule: &ParameterRule): String { rule.label }

    #[test_only]
    public fun new_parameter_rules(): ParameterRules {
        ParameterRules { rules: vec_map::empty() }
    }
}

