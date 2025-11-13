module archimeters::royalty_rule {
    use sui::{
        transfer_policy::{
            Self as policy,
            TransferPolicy,
            TransferPolicyCap,
            TransferRequest,
        },
        coin::{ Self, Coin },
        sui::SUI,
    };

    const ENO_INSUFFICIENT_PAYMENT: u64 = 0;
    const ENO_INVALID_ROYALTY: u64 = 1;
    const MAX_ROYALTY_BPS: u16 = 5000;
    const BPS_BASE: u64 = 10000;

    public struct RoyaltyRule has drop {}
    
    public struct Config has store, drop {
        royalty_bps: u16,
        beneficiary: address,
    }

    public fun add<T>(
        policy: &mut TransferPolicy<T>,
        cap: &TransferPolicyCap<T>,
        royalty_bps: u16,
        beneficiary: address,
    ) {
        assert!(royalty_bps <= MAX_ROYALTY_BPS, ENO_INVALID_ROYALTY);
        policy::add_rule(RoyaltyRule {}, policy, cap, Config { royalty_bps, beneficiary });
    }

    public fun pay<T>(
        policy: &TransferPolicy<T>,
        request: &mut TransferRequest<T>,
        payment: Coin<SUI>,
    ) {
        let config: &Config = policy::get_rule(RoyaltyRule {}, policy);
        let paid = coin::value(&payment);
        let amount = fee_amount(policy, paid);
        
        assert!(paid >= amount, ENO_INSUFFICIENT_PAYMENT);
        transfer::public_transfer(payment, config.beneficiary);
        policy::add_receipt(RoyaltyRule {}, request);
    }

    public fun fee_amount<T>(policy: &TransferPolicy<T>, paid: u64): u64 {
        let config: &Config = policy::get_rule(RoyaltyRule {}, policy);
        let amount = (((paid as u128) * (config.royalty_bps as u128) / (BPS_BASE as u128)) as u64);
        amount
    }

    public fun get_config<T>(policy: &TransferPolicy<T>): (u16, address) {
        let config: &Config = policy::get_rule(RoyaltyRule {}, policy);
        (config.royalty_bps, config.beneficiary)
    }
    
    public fun update_royalty<T>(
        policy: &mut TransferPolicy<T>,
        cap: &TransferPolicyCap<T>,
        new_royalty_bps: u16,
    ) {
        assert!(new_royalty_bps <= MAX_ROYALTY_BPS, ENO_INVALID_ROYALTY);
        let (_, beneficiary) = get_config(policy);
        policy::remove_rule<T, RoyaltyRule, Config>(policy, cap);
        policy::add_rule(RoyaltyRule {}, policy, cap, Config { 
            royalty_bps: new_royalty_bps, 
            beneficiary 
        });
    }

    public fun update_beneficiary<T>(
        policy: &mut TransferPolicy<T>,
        cap: &TransferPolicyCap<T>,
        new_beneficiary: address,
    ) {
        let (royalty_bps, _) = get_config(policy);
        policy::remove_rule<T, RoyaltyRule, Config>(policy, cap);
        policy::add_rule(RoyaltyRule {}, policy, cap, Config { 
            royalty_bps, 
            beneficiary: new_beneficiary 
        });
    }
}

