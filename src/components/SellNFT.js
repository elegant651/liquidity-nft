import React, { useState } from "react";
import AlertModal from "./modals/AlertModal";
import SuccessModal from "./modals/SuccessModal";
import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, BigNumber, utils, Contract } from "ethers";
import { Row, Col, Button, Card, Form } from "react-bootstrap";
import { abis, addresses } from "../web3/config";
import { createSellOrder } from "../rarible/createOrders";
import useWeb3Modal from "../hooks/useWeb3Modal";

//Lazy mint
export default function SellNFT({}) {
  const [provider] = useWeb3Modal();
  const [processing, setProcessing] = useState(false);
  const [errorModal, setErrorModal] = useState({
    msg: "",
    open: false
  });
  const [successModal, setSuccessModal] = useState({
    msg: "",
    open: false
  });
  const [sellForEthValue, setSellForEthValue] = React.useState();
  const [sellOrderContent, setSellOrderContent] = useState();

  // for testing
  const collectionId = '0xB0EA149212Eb707a1E5FC1D2d3fD318a8d94cf05';
  const tokenId = '88636988724758511652761905972311461386111098846339222310546461884618702323714';

  // const handleApprove = async () => {
  //   // console.log("writeContracts", writeContracts);
  //   // const thisERC721Rarible = writeContracts.ERC721Rarible.attach(collectionContract)
  //   // tx(thisERC721Rarible.approve(addresses.TRANFER_FROXY_RARIBLE, tokenId));

  //   const timerId = setTimeout(async () => {
  //     if (typeof(provider) !== "undefined") {
  //       const signer = provider.getSigner();
  //       const thisERC721Rarible = new Contract(
  //         addresses.ERC721_RARIBLE,
  //         abis.ERC721Rarible,
  //         signer
  //       ).attach(collectionId);
  //       thisERC721Rarible.approve(addresses.TRANFER_FROXY_RARIBLE, tokenId)
  //       clearTimeout(timerId);
  //     }
  //   }, 500);

  // }

  const handleSellOrder = async () => {
    setProcessing(true);
    try {
      const signer = provider.getSigner();
      const addr = await signer.getAddress();

      createSellOrder("MAKE_ERC721_TAKE_ETH", provider, {
        accountAddress: addr,
        makeERC721Address: addresses.ERC721_RARIBLE,
        makeERC721TokenId: tokenId,
        ethAmt: utils.parseEther(sellForEthValue.toString()).toString(),
      })
      
      setProcessing(false);
    } catch (error) {
      setErrorModal({
        open: true,
        msg: error.message,
      });
      setProcessing(false);
    }
  }

  return (
    <div>
      <Card
        className="mx-auto form-card text-center"
        style={{ backgroundColor: "rgb(253, 255, 255)" }}
      >
        <Card.Header>
          <u>Sell NFT</u>
        </Card.Header>

        <Card.Body>
          <div>
            <Row style={{ marginTop: "10px" }}>
              <Col className="text-header">
                Sell for ETH:
              </Col>
              <Col style={{ paddingLeft: "0px" }}>
                <Form.Control
                  className="mb-4"
                  type="text"
                  placeholder="ETH"
                  onChange={(e) => setSellForEthValue(e.target.value)}
                  style={{ width: "80%" }}
                  value={sellForEthValue}
                  required
                />
              </Col>
            </Row>

            <Row className="text-center" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
              <Col>
                <Button variant="success" onClick={handleSellOrder}>
                  {processing ?
                    <div className="d-flex align-items-center">
                      Processing
                        <span className="loading ml-2"></span>
                    </div>
                    :
                    <div>Create Sell Order</div>
                  }
                </Button>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      <Button
        style={{ margin: 8 }}
        size="large"
        shape="round"
        type="primary"
        onClick={async () => {
          let sellOrderResult
          if (tokenId) {
            const getSellOrdersByItemUrl = `https://api-dev.rarible.com/protocol/v0.1/ethereum/order/orders/sell/byItem?contract=${collectionId}&tokenId=${tokenId}&sort=LAST_UPDATE`;
            sellOrderResult = await fetch(getSellOrdersByItemUrl);
          } else {
            const getSellOrderByCollectionUrl = `https://api-dev.rarible.com/protocol/v0.1/ethereum/order/orders/sell/byCollection?collection=${collectionId}&sort=LAST_UPDATE`;
            sellOrderResult = await fetch(getSellOrderByCollectionUrl);
          }
          const resultJson = await sellOrderResult.json();
          if (resultJson && resultJson.orders) {
            console.log('result', resultJson.orders[0])
            setSellOrderContent(resultJson.orders[0]);
          }
        }}
      >
        Get Sell Orders
      </Button>

      { sellOrderContent? 
        <Card
          title={
            <div>
              <span style={{ fontSize: 16, marginRight: 8 }}>{sellOrderContent.type}</span>
            </div>
          }
        >
          <div>
            <p>collectionId: {sellOrderContent.make.assetType.contract}</p>
            <p>tokenId: {sellOrderContent.make.assetType.tokenId}</p>
            <p>
              price: {formatEther(sellOrderContent.take.value)}
               {sellOrderContent.take.assetType.assetClass}
            </p>
            <p>createAt: {sellOrderContent.createdAt}</p>
          </div>
        </Card>
        :<div></div>
      }

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
      >
        {successModal.msg}
      </SuccessModal>
    </div >
  );
}
