module archimeters::atelier_marketplace {
    use archimeters::atelier::{ Self, Atelier };
    use archimeters::royalty_rule;
    use sui::{
        event,
        coin::{ Self as coin, Coin },
        sui::SUI,
        transfer_policy::{ Self as transfer_policy, TransferPolicy, TransferPolicyCap },
        kiosk::{ Self, Kiosk, KioskOwnerCap },
    };

    // == Events ==
    public struct AtelierListed has copy, drop {
        atelier_id: ID,
        kiosk_id: ID,
        price: u64,
        seller: address,
    }
    
    public struct AtelierDelisted has copy, drop {
        atelier_id: ID,
        kiosk_id: ID,
    }
    
    public struct AtelierPurchased has copy, drop {
        atelier_id: ID,
        buyer: address,
        price: u64,
        royalty_paid: u64,
    }

    // == Marketplace Functions ==
    
    /// List an Atelier in a Kiosk for sale
    public fun list_atelier<T>(
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        atelier: Atelier<T>,
        price: u64,
        ctx: &TxContext
    ) {
        let atelier_id = object::id(&atelier);
        let kiosk_id = object::id(kiosk);
        let seller = ctx.sender();
        
        kiosk::place(kiosk, kiosk_cap, atelier);
        kiosk::list<Atelier<T>>(kiosk, kiosk_cap, atelier_id, price);
        
        event::emit(AtelierListed {
            atelier_id,
            kiosk_id,
            price,
            seller,
        });
    }
    
    /// Delist an Atelier from a Kiosk
    public fun delist_atelier<T>(
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        atelier_id: ID,
    ) {
        let kiosk_id = object::id(kiosk);
        kiosk::delist<Atelier<T>>(kiosk, kiosk_cap, atelier_id);
        
        event::emit(AtelierDelisted {
            atelier_id,
            kiosk_id,
        });
    }
    
    /// Purchase an Atelier from a Kiosk
    #[allow(lint(self_transfer))]
    public fun purchase_atelier<T>(
        kiosk: &mut Kiosk,
        atelier_id: ID,
        payment: Coin<SUI>,
        royalty_payment: Coin<SUI>,
        policy: &TransferPolicy<Atelier<T>>,
        ctx: &mut TxContext
    ) {
        let buyer = ctx.sender();
        let paid_amount = coin::value(&payment);
        let royalty_amount = coin::value(&royalty_payment);
        
        let (mut atelier, mut transfer_request) = kiosk::purchase<Atelier<T>>(
            kiosk,
            atelier_id,
            payment
        );
        
        if (royalty_amount > 0) {
            royalty_rule::pay(policy, &mut transfer_request, royalty_payment);
        } else {
            coin::destroy_zero(royalty_payment);
        };
        
        atelier::update_owner_on_purchase(&mut atelier, buyer);
        transfer_policy::confirm_request(policy, transfer_request);
        transfer::public_transfer(atelier, buyer);
        
        event::emit(AtelierPurchased {
            atelier_id,
            buyer,
            price: paid_amount,
            royalty_paid: royalty_amount,
        });
    }
    
    /// Take an Atelier from a Kiosk (for owner to retrieve)
    public fun take_from_kiosk<T>(
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        atelier_id: ID,
    ): Atelier<T> {
        kiosk::take<Atelier<T>>(kiosk, kiosk_cap, atelier_id)
    }

    // == TransferPolicy Management Functions ==
    
    /// Setup royalty for Atelier TransferPolicy
    public fun setup_royalty<T>(
        policy: &mut TransferPolicy<Atelier<T>>,
        policy_cap: &TransferPolicyCap<Atelier<T>>,
        royalty_bps: u16,
        beneficiary: address,
    ) {
        royalty_rule::add(policy, policy_cap, royalty_bps, beneficiary);
    }
    
    /// Update royalty rate in TransferPolicy
    public fun update_royalty_rate<T>(
        policy: &mut TransferPolicy<Atelier<T>>,
        policy_cap: &TransferPolicyCap<Atelier<T>>,
        new_royalty_bps: u16,
    ) {
        royalty_rule::update_royalty(policy, policy_cap, new_royalty_bps);
    }
    
    /// Update royalty beneficiary in TransferPolicy
    public fun update_royalty_beneficiary<T>(
        policy: &mut TransferPolicy<Atelier<T>>,
        policy_cap: &TransferPolicyCap<Atelier<T>>,
        new_beneficiary: address,
    ) {
        royalty_rule::update_beneficiary(policy, policy_cap, new_beneficiary);
    }
}

