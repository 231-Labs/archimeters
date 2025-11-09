#[test_only]
module archimeters::printer {
    use std::string::String;
    use sui::clock;
    use sui::event;

    public struct Printer has key, store {
        id: UID,
        name: String,
        owner: address,
        manufacturer: String,
        serial_number: String,
        created_at: u64,
    }

    public struct PrinterMinted has copy, drop { printer_id: ID, owner: address, name: String }

    public fun mint_printer(
        name: String,
        manufacturer: String,
        serial_number: String,
        clock: &clock::Clock,
        ctx: &mut TxContext
    ): Printer {
        let uid = object::new(ctx);
        let printer_id = object::uid_to_inner(&uid);
        let owner = ctx.sender();
        
        event::emit(PrinterMinted { printer_id, owner, name });
        
        Printer { id: uid, name, owner, manufacturer, serial_number, created_at: clock::timestamp_ms(clock) }
    }

    public fun transfer_printer(printer: Printer, recipient: address) {
        transfer::public_transfer(printer, recipient);
    }

    public fun get_name(printer: &Printer): String { printer.name }
    public fun get_owner(printer: &Printer): address { printer.owner }
    public fun get_manufacturer(printer: &Printer): String { printer.manufacturer }
    public fun get_serial_number(printer: &Printer): String { printer.serial_number }
    public fun get_created_at(printer: &Printer): u64 { printer.created_at }
}

