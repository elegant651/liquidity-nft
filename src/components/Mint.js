import React, { useState } from "react";
import AlertModal from "./modals/AlertModal";
import SuccessModal from "./modals/SuccessModal";
import { Row, Col, Button, Card, Form } from "react-bootstrap";
import { createLazyMint, generateTokenId, putLazyMint } from "../rarible/createLazyMint";
import { addresses } from "../web3/config";
import useWeb3Modal from "../hooks/useWeb3Modal";

//Lazy mint
export default function Mint({}) {
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
  const [contractAddress, setContractAddress] = React.useState();
  const [tokenId, setTokenId] = React.useState();
  const [mintState, setMintState] = useState({
    ipfsHash: ''
  });

  const handleMint = async () => {
    setProcessing(true);
    try {
      const signer = provider.getSigner();
      const addr = await signer.getAddress();

      const newTokenId = await generateTokenId(addresses.ERC721_RARIBLE, addr)
      
      setTokenId(newTokenId)
      setContractAddress(addresses.ERC721_RARIBLE)

      const form = await createLazyMint(newTokenId, provider, addresses.ERC721_RARIBLE, addr, mintState.ipfsHash)
      await putLazyMint(form)
      
      setProcessing(false);
      setSuccessModal({
        open: true,
        msg: "New NFT successfully minted !!",
      });
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
          <u>Mint NFT Token</u>
        </Card.Header>

        <Card.Body>
          <div>
            <Row style={{ marginTop: "10px" }}>
              <Col className="text-header">
                IPFS Hash:
              </Col>
              <Col style={{ paddingLeft: "0px" }}>
                <Form.Control
                  className="mb-4"
                  type="text"
                  placeholder="IPFS Hash"
                  onChange={(e) => setMintState({
                    ...mintState,
                    ipfsHash: e.target.value
                    //Qmc9hvaC9EUK7efbCfJc2QESB9NxW84jbPiTvz1p6Lh91d
                    //https://ropsten.rarible.com/token/0xB0EA149212Eb707a1E5FC1D2d3fD318a8d94cf05:88636988724758511652761905972311461386111098846339222310546461884618702323714?tab=history
                    //Token ID: 88636988724758511652761905972311461386111098846339222310546461884618702323714
                    //Contract: 0xB0EA149212Eb707a1E5FC1D2d3fD318a8d94cf05
                  })}
                  style={{ width: "80%" }}
                  value={mintState.ipfsHash}
                  required
                />
              </Col>
            </Row>

            <Row className="text-center" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
              <Col>
                <Button variant="success" onClick={handleMint}>
                  {processing ?
                    <div className="d-flex align-items-center">
                      Processing
                        <span className="loading ml-2"></span>
                    </div>
                    :
                    <div>Mint</div>
                  }
                </Button>
              </Col>
            </Row>

            <Row>
              <Col>
                  <div>Token ID: {tokenId}</div>
                  <div>Contract: {contractAddress}</div>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      <AlertModal
        open={errorModal.open}
        toggle={() => setErrorModal({
          ...errorModal, open: false
        })}
        onConfirm={() => {}}
      >
        {errorModal.msg}
      </AlertModal>

      <SuccessModal
        open={successModal.open}
        toggle={() => setSuccessModal({
          ...successModal, open: false
        })}
        onConfirm={() => {}}
      >
        {successModal.msg}
      </SuccessModal>
    </div >
  );
}
