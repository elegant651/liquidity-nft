import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import history from "./history";
import Loading from "./Loading";
import AlertModal from "./modals/AlertModal";
import SuccessModal from "./modals/SuccessModal";
import useWeb3Modal from "../hooks/useWeb3Modal";
import { abis, addresses } from "../web3/config";
import { calculatePurchaseReturn } from "../web3/bondingcurve";
import {
  Form,
  Card,
  Row,
  Col,
  Button,
  CardDeck
} from "react-bootstrap";
import { ethers, BigNumber, utils, Contract } from "ethers";

export default function View() {
  let routes;
  const { profileAddr } = useParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successModal, setSuccessModal] = useState({
    msg: "",
    open: false
  });
  const [errorModal, setErrorModal] = useState({
    msg: "",
    open: false
  });

  const [provider] = useWeb3Modal();
  const [buyTokenPrice, setBuyTokenPrice] = useState(undefined);
  const [tokenCount, setTokenCount] = useState(undefined);
  const [ethBalance, setEthBalance] = useState(undefined);
  const [tokenBalance, setTokenBalance] = useState(undefined);
  const [buyToken, setBuyToken] = useState("1");
  const [reqEth, setReqEth] = useState(undefined);
  const [reqToken, setReqToken] = useState(undefined);

  const [uniSwap, setUniSwap] = useState(undefined);
  const [curPrice, setCurPrice] = useState(undefined);
  const [bondingPrice, setBondingPrice] = useState(undefined);
  const [path, setPath] = useState([]);
  const [addr, setAddr] = useState(undefined);

    const getAddr = useCallback(async () => {
        if (typeof provider !== "undefined") {
            setTimeout(async () => {
                const signer = provider.getSigner();
                const addr = await signer.getAddress();
                setAddr(addr);
            }, 500);
        }
    }, [provider]);

    const getUniSwap = useCallback(async () => {
        if (typeof provider !== "undefined") {
            setTimeout(async () => {
                const signer = provider.getSigner();
                const mngFact = new Contract(
                    addresses.MANAGER_FACTORY,
                    abis.MANAGER_FACTORY_ABI,
                    signer
                );
                const uniSwap = new Contract(
                    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
                    abis.UNI_SWAP_ABI,
                    signer
                    );
                setUniSwap(uniSwap);
                const managerAddr = profileAddr;
                const mng = new Contract(managerAddr, abis.MANAGER_ABI, signer);
                const tokenAddr = await mng.token();
                const WETH = await mngFact.WETH();
                const path = [WETH, tokenAddr];
                setPath(path);
                const priceList = await uniSwap.getAmountsIn(
                    ethers.utils.parseEther(buyToken),
                    path,
                    { gasLimit: BigNumber.from("900000") }
                );
                setCurPrice(priceList[0]);
            }, 500);
        }
    }, [buyToken, profileAddr, provider]);

    const getBuyTokenPrice = useCallback(() => {
        if (typeof provider !== "undefined") {
            setTimeout(async () => {
                const signer = provider.getSigner();
                const mngFact = new Contract(
                    addresses.MANAGER_FACTORY,
                    abis.MANAGER_FACTORY_ABI,
                    signer
                );
                const uniSwap = new Contract(
                    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
                    abis.UNI_SWAP_ABI,
                    signer
                );
                const managerAddr = profileAddr;
                const mng = new Contract(managerAddr, abis.MANAGER_ABI, signer);
                const tokenAddr = await mng.token();
                const WETH = await mngFact.WETH();
                const path = [WETH, tokenAddr];
                const priceList = await uniSwap.getAmountsIn(
                    ethers.utils.parseEther(buyToken),
                    path,
                    { gasLimit: BigNumber.from("900000") }
                );
                setBuyTokenPrice(utils.formatEther(priceList[0].toString()).toString());
                getBondingPrice();
            }, 500);
        }
    }, [buyToken, profileAddr, provider]);

    const getTokenCount = useCallback(() => {
        if (typeof provider !== "undefined") {
            setTimeout(async () => {
                const signer = provider.getSigner();
                const managerAddr = profileAddr;
                const mng = new Contract(managerAddr, abis.MANAGER_ABI, signer);
                const tokenAddr = await mng.token();
                const token = new Contract(tokenAddr, abis.ERC20, signer);
                const uniswapRouter = new Contract("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", abis.UNI_SWAP_ABI, signer);
                const WETH = await uniswapRouter.WETH();
                const uniswapFactory = new Contract("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", abis.UNISWAP_FACTORY_ABI, signer);
                const lp = await uniswapFactory.getPair(tokenAddr, WETH);
                const balance = await token.balanceOf(lp);
                setTokenCount(utils.formatEther(balance.toString()).toString());
            }, 500);
        }
    }, [profileAddr, provider]);

    const getEthBalance = useCallback(() => {
        if (typeof provider !== "undefined") {
            setTimeout(async () => {
                const signer = provider.getSigner();
                const balance = await signer.getBalance();
                setEthBalance(utils.formatEther(balance.toString()).toString());
            }, 500);
        }
    }, [provider]);

    const getTokenBalance = useCallback(() => {
        if (typeof provider !== "undefined") {
            setTimeout(async () => {
                const signer = provider.getSigner();
                const addr = await signer.getAddress();
                const managerAddr = profileAddr;
                const mng = new Contract(managerAddr, abis.MANAGER_ABI, signer);
                const tokenAddr = await mng.token();
                const token = new Contract(tokenAddr, abis.ERC20, signer);
                const balance = await token.balanceOf(addr);
                setTokenBalance(utils.formatEther(balance.toString()).toString());
            }, 500);
        }
    }, [profileAddr, provider]);

    const getReqToken = useCallback(() => {
        if (typeof provider !== "undefined") {
            setTimeout(async () => {
                const signer = provider.getSigner();
                const managerAddr = profileAddr;
                const mng = new Contract(managerAddr, abis.MANAGER_ABI, signer);
                const req = await mng.requireAmount();
                setReqToken(utils.formatEther(req.toString()).toString());
            }, 500);
        }
    }, [profileAddr, provider]);

    const getBondingPrice = useCallback(() => {
      const reserveBalance = 8
      const reserveRatio = 0.1
      const depositAmount = 1
      const bondingFactor = calculatePurchaseReturn(10, reserveBalance, reserveRatio, depositAmount)
      //1.11847940917808941
      console.log(bondingFactor)
      setBondingPrice(bondingFactor);
    }, [profileAddr, provider, tokenCount, curPrice]);

    useEffect(() => {
        if(!addr) {
            getAddr();
        }
        if (!uniSwap && addr) {
            getUniSwap();
        }
    }, [uniSwap, getUniSwap, addr, getAddr]);
  
  const handleBuy = async () => {
    setProcessing(true)
    try {
      const result = await uniSwap.swapETHForExactTokens(
        ethers.utils.parseEther(buyToken),
        path,
        addr,
        ethers.constants.MaxUint256,
        {
            value: curPrice,
            gasLimit: BigNumber.from("900000"),
        }
      );
      console.log('r', result)

      setProcessing(false)
      setSuccessModal({
        open: true,
        msg: "Buying the Token successful !!",
      });
    } catch (e) {
      console.error(e)
      setProcessing(false)

      setErrorModal({
        open: true,
        msg: e.message
      })
    }
  }

  useEffect(() => {
    setLoading(true);

    if (!buyTokenPrice) {
        getBuyTokenPrice();
    }
    if (!tokenCount) {
        getTokenCount();
    }
    if (!ethBalance) {
        getEthBalance();
    }
    if (buyToken.length >= 1 && buyTokenPrice) {
        const price = utils.parseEther(buyTokenPrice);
        const p = BigNumber.from(buyToken).mul(price).toString();
        setReqEth(utils.formatEther(p).toString());
    }
    if(!tokenBalance) {
        getTokenBalance();
    }
    if(!reqToken) {
        getReqToken();
    }
    
    setTimeout(async () => {
      setLoading(false);
    }, 3000)
  }, [buyToken, ethBalance, getEthBalance, getTokenCount, getBuyTokenPrice, tokenCount, buyTokenPrice, tokenBalance, getTokenBalance, reqToken, getReqToken]);

  if (loading) {
    routes = <Loading />;
  } else {
    routes = (
        <div>
          <CardDeck>
            <Card className="hidden-card"></Card>

            <Card className="mx-auto view-pool-card">
              <Card.Body style={{ textAlign: "left", fontWeight: "bold" }}>
                <p className="view-pool-header">
                  <u>Buy Jenny - Steve Aoki & 3LAU's Token</u>
                </p>

                <Row style={{ paddingBottom: "20px" }}>
                  <Col>
                    <u>Total of Fractionized Tokens</u>
                    <span> :</span>
                    <span className="float-right">
                      {tokenCount}
                    </span>
                  </Col>

                  <Col>
                    <u>Current Price</u>
                    <span> :</span>
                    <span className="float-right">
                      <span>{buyTokenPrice} ETH</span>
                      {/* <span>boning: {bondingPrice} ETH</span> */}
                    </span>
                  </Col>
                </Row>

                <Row style={{ paddingBottom: "20px" }}>
                  <Col>
                    <u>The amount I have</u>
                    <span> :</span>
                    <span className="float-right">
                      {ethBalance} ETH
                    </span>
                  </Col>

                  <Col>
                    <u>Request price</u>
                    <span> :</span>
                    <span className="float-right">
                      <span>{reqEth} ETH</span>
                    </span>
                  </Col>
                </Row>

                <Row>
                    <Col className="text-header">
                        The amount to buy
                    </Col>
                    <Col style={{ paddingLeft: "0px" }}>
                      <Form.Control
                        className="mb-4"
                        type="text"
                        placeholder="Token Symbol"
                        onChange={(e) => setBuyToken(
                          e.target.value
                        )}
                        style={{ width: "80%" }}
                        value={buyToken}
                        required
                        />
                    </Col>
                </Row>

                <Row className="text-center">
                  <Col>
                    <Button variant="info" onClick={handleBuy}>
                      {processing ?
                        <div className="d-flex align-items-center">
                          Processing
                          <span className="loading ml-2"></span>
                        </div>
                      :
                        <div>Buy</div>
                      }
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="hidden-card"></Card>
          </CardDeck>

        <AlertModal
          open={errorModal.open}
          toggle={() => setErrorModal({
            ...errorModal, open: false
          })}
        >
          {errorModal.msg}
        </AlertModal>

        <SuccessModal
          open={successModal.open}
          toggle={() => setSuccessModal({
            ...successModal, open: false
          })}
          onConfirm={() => history.push("/")}
        >
          {successModal.msg}
        </SuccessModal>
      </div >
    );
  }

  return routes;
}
