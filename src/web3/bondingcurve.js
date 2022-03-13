
const MAX_RESERVE_RATIO = 1000000;

export const calculatePurchaseReturn = (
    _supply,
    _reserveBalance,
    _reserveRatio,
    _depositAmount) =>
{

    if(_supply > 0 && _reserveBalance > 0 && _reserveRatio > 0 && _reserveRatio <= MAX_RESERVE_RATIO) {
        // special case for 0 deposit amount
        if (_depositAmount == 0) {
            return 0;
        }
        // special case if the ratio = 100%
        if (_reserveRatio == MAX_RESERVE_RATIO) {
            return _supply*_depositAmount/_reserveBalance;
        }

        //Token Supply * ((1 + ReserveTokensReceived / ReserveTokenBalance) ^ (ReserveRatio) - 1)
        return _supply * (Math.pow(1 + _depositAmount/_reserveBalance, _reserveRatio)-1)
    }
    
    return 0;
}


export const calculateSaleReturn = (
    _supply,
    _reserveBalance,
    _reserveRatio,
    _sellAmount) =>
{

    if(_supply > 0 && _reserveBalance > 0 && _reserveRatio > 0 && _reserveRatio <= MAX_RESERVE_RATIO && _sellAmount <= _supply) {
         // special case for 0 sell amount
         if (_sellAmount == 0) {
            return 0;
        }
        // special case for selling the entire supply
        if (_sellAmount == _supply) {
            return _reserveBalance;
        }
        // special case if the ratio = 100%
        if (_reserveRatio == MAX_RESERVE_RATIO) {
            return _reserveBalance*_sellAmount/_supply;
        }

        //Sale Return = ReserveTokenBalance * (1 - (1 - SMILE Token Received / SMILE Token Supply) ^ (1 / (ReserveRatio)))**
        return _reserveBalance * (1 - Math.pow(1 - _sellAmount / _supply), (1 / _reserveRatio))
    }
    
    return 0;
}