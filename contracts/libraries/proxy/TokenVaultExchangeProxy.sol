pragma solidity ^0.8.0;

import {InitializedProxy} from "./InitializedProxy.sol";
import {IImpls} from "../../interfaces/IImpls.sol";

/**
 * @title InitializedProxy
 */
contract TokenVaultExchangeProxy is InitializedProxy {
    constructor(address _settings)
        InitializedProxy(_settings)
    {}

    /**
     * @dev Returns the current implementation address.
     */
    function _implementation()
        internal
        view
        virtual
        override
        returns (address impl)
    {
        return IImpls(settings).exchangeImpl();
    }
}
