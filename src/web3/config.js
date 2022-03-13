import erc20 from "../abis/erc20.json";
import tokenprovider from "../abis/tokenprovider.json";
import managerFactory from "../abis/manager-factory.json";
import uniSwap from "../abis/IUniswapV2Router02.json";
import uniswapFactory from "../abis/uniswap-factory.json";
import collectible from "../abis/collectible.json";

export const addresses = {
  MANAGER_FACTORY: "0x79748cbD288e2FEC78A0b4826c8004fbfff53326",
  ERC721_RARIBLE: "0xB0EA149212Eb707a1E5FC1D2d3fD318a8d94cf05",
  TRANFER_FROXY_RARIBLE: "0xf8e4ecac18b65fd04569ff1f0d561f74effaa206",
  // COLLECTIBLE: "0xfdDC1E6F4CF57bDeCF3863d885a5efaD0B69580a"
}

export const abis = {
  ERC20: erc20,
  MANAGER_ABI: tokenprovider,
  MANAGER_FACTORY_ABI: managerFactory,
  UNI_SWAP_ABI: uniSwap,
  UNISWAP_FACTORY_ABI: uniswapFactory,
  COLLECTIBLE_ABI: collectible
}
