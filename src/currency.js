import {xdr, Keypair} from "./index";
import {encodeBase58Check} from "./base58";

/**
* Currency class represents a currency, either the native currency ("XLM")
* or a currency code / issuer address pair.
* @class Currency
*/
export class Currency {

    /**
    * Returns a currency object for the native currency.
    */
    static native() {
        return new Currency("XLM");
    }

    /**
    * Returns a currency object from its XDR object representation.
    * @param {xdr.Currency.iso4217} xdr - The currency xdr object.
    */
    static fromOperation(xdr) {
        if (xdr._switch.name == "currencyTypeNative") {
            return this.native();
        } else {
            let code = xdr._value._attributes.currencyCode;
            let issuer = encodeBase58Check("accountId", xdr._value._attributes.issuer);
            return new this(code, issuer);
        }
    }

    /**
    * A currency code describes a currency and issuer pair. In the case of the native
    * currency XLM, the issuer will be null.
    * @constructor
    * @param {string} code - The currency code.
    * @param {string} issuer - The address of the issuer.
    */
    constructor(code, issuer) {
        if (code.length != 3 && code.length != 4) {
            throw new Error("Currency code must be 3 or 4 characters");
        }
        if (String(code).toLowerCase() !== "xlm" && !issuer) {
            throw new Error("Issuer cannot be null");
        }
        // pad code with null byte if necessary
        this.code = code.length == 3 ? code + "\0" : code;
        this.issuer = issuer;
    }

    /**
    * Returns the xdr object for this currency.
    */
    toXdrObject() {
        if (this.isNative()) {
            return xdr.Currency.currencyTypeNative();
        } else {
            // need to pad the currency code with the null byte
            var currencyType = new xdr.CurrencyAlphaNum({
                currencyCode: this.code,
                issuer: Keypair.fromAddress(this.issuer).publicKey()
            });
            var currency = xdr.Currency.currencyTypeAlphanum();
            currency.set("currencyTypeAlphanum", currencyType);

            return currency;
        }
    }

    /**
    * Returns true if this currency object is the native currency.
    */
    isNative() {
        return !this.issuer;
    }

    /**
    * Returns true if this currency equals the given currency.
    */
    equals(currency) {
        return this.code == currency.code && this.issuer == currency.issuer;
    }
}