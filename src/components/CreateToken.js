import React, { useEffect, useState, useCallback } from "react";
import AlertModal from "./modals/AlertModal";
import SuccessModal from "./modals/SuccessModal";
import { ethers, BigNumber, utils, Contract } from "ethers";
import { abis, addresses } from "../web3/config";
import history from "./history";
import useWeb3Modal from "../hooks/useWeb3Modal";
import {
  Row,
  Col,
  Form,
  Card,
  Image,
  Button,
  CardDeck,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";

export default function CreateToken() {
  const [processing, setProcessing] = useState(false);
  const [errorModal, setErrorModal] = useState({
    msg: "",
    open: false
  });
  const [successModal, setSuccessModal] = useState({
    msg: "",
    open: false
  });

  const [managerFactory, setManagerFactory] = useState(undefined);
  const [addTokenState, setAddTokenState] = useState({
    tokenName: "",
    tokenSymbol: "",
    amtTotalMint: "",
    minReqAmt: "",
    price: "",
    payback: ""
  });
  const [provider] = useWeb3Modal();
  const [value, setValue] = useState("");

  const getManagerFactory = useCallback(async () => {
    const timerId = setTimeout(async () => {
      if (typeof(provider) !== "undefined") {
        const signer = provider.getSigner();
        const managerFactory = new Contract(
          addresses.MANAGER_FACTORY,
          abis.MANAGER_FACTORY_ABI,
          signer
        );
        setManagerFactory(managerFactory);
        clearTimeout(timerId);
      }
    }, 500);
  }, [provider]);

  useEffect(() => {
    if (!managerFactory) {
      getManagerFactory();
    }
  }, [managerFactory, getManagerFactory]);

  const getValue = useCallback(() => {
    setTimeout(() => {
        if (addTokenState.amtTotalMint !== "" && addTokenState.price !== "") {
            const value = utils.parseEther(addTokenState.amtTotalMint).mul(utils.parseEther(addTokenState.price)).div("1000000000000000000");
            console.log(utils.formatEther(value));
            setValue(utils.formatEther(value));
        }
    }, 500);
  });

  useEffect(() => {
    if (value.length <= 18) {
      getValue();
    }
  }, [getValue, value]);


  const handleCreateToken = async () => {
    setProcessing(true);
    console.log('f', addTokenState)

    console.log('s', provider)
    
    try {
        const result = await managerFactory.callStatic.newManager(
            addTokenState.tokenName,
            addTokenState.tokenSymbol,
            utils.parseEther(addTokenState.amtTotalMint),
            utils.parseEther(addTokenState.minReqAmt),
            utils.parseEther(addTokenState.minReqAmt),
            {
              value: utils.parseEther(addTokenState.amtTotalMint).mul(utils.parseEther(addTokenState.price)).div("1000000000000000000"),
              gasLimit: BigNumber.from("5000000"),
            }
        );
        await managerFactory.newManager(
            addTokenState.tokenName,
            addTokenState.tokenSymbol,
            utils.parseEther(addTokenState.amtTotalMint),
            utils.parseEther(addTokenState.minReqAmt),
            utils.parseEther(addTokenState.minReqAmt),
            {
                value: utils.parseEther(addTokenState.amtTotalMint).mul(utils.parseEther(addTokenState.price)).div("1000000000000000000"),
                gasLimit: BigNumber.from("5000000"),
            }
        );
        console.log('r', result)
        
        setProcessing(false);
        setSuccessModal({
          open: true,
          msg: "Token successfully created !!",
        });
    } catch (e) {
      console.error(e)
      setProcessing(false);
      setErrorModal({
        open: true,
        msg: e.message
      })
    }
    
  }

  return (
    <div style={{ marginTop: "5%" }}>
      <CardDeck>
        <Card className="hidden-card"></Card>

        <Card className="mx-auto create-card">
          <Card.Header>
            <u>Create Token</u>
          </Card.Header>

          <Card.Body>
            <Row style={{ marginTop: "10px" }}>
              <Col className="text-header">
                Token Name:
              </Col>
              <Col style={{ paddingLeft: "0px" }}>
                <Form.Control
                  className="mb-4"
                  type="text"
                  placeholder="Token Name"
                  onChange={(e) => setAddTokenState({
                    ...addTokenState,
                    tokenName: e.target.value
                  })}
                  style={{ width: "80%" }}
                  value={addTokenState.tokenName}
                  required
                />
              </Col>
            </Row>

            <Row>
              <Col className="text-header">
                Token Symbol:
              </Col>
              <Col style={{ paddingLeft: "0px" }}>
                <Form.Control
                  className="mb-4"
                  type="text"
                  placeholder="Token Symbol"
                  onChange={(e) => setAddTokenState({
                    ...addTokenState,
                    tokenSymbol: e.target.value
                  })}
                  style={{ width: "80%" }}
                  value={addTokenState.tokenSymbol}
                  required
                />
              </Col>
            </Row>

            <Row>
              <Col className="text-header">
                Total amount for mint
              </Col>
              <Col style={{ paddingLeft: "0px" }}>
                <Form.Control
                  className="mb-4"
                  type="number"
                  step="0"
                  placeholder="Total amount for mint:"
                  onChange={(e) => setAddTokenState({
                    ...addTokenState,
                    amtTotalMint: e.target.value
                  })}
                  style={{ width: "80%" }}
                  value={addTokenState.amtTotalMint}
                  required
                />
              </Col>
            </Row>

            <Row>
              <Col className="text-header">
                Initial Price
              </Col>
              <Col style={{ paddingLeft: "0px" }}>
                <Form.Control
                  className="mb-4"
                  placeholder="Initial Price (ETH):"
                  onChange={(e) => setAddTokenState({
                    ...addTokenState,
                    price: e.target.value
                  })}
                  style={{ width: "80%" }}
                  value={addTokenState.price}
                  required
                />
              </Col>
            </Row>

            <Row>
              <Col className="text-header">
                Minimum amount for request:
              </Col>
              <Col style={{ paddingLeft: "0px" }}>
                <Form.Control
                  className="mb-4"
                  type="number"
                  step="0"
                  placeholder="Minimum amount for request:"
                  onChange={(e) => setAddTokenState({
                    ...addTokenState,
                    minReqAmt: e.target.value
                  })}
                  style={{ width: "80%" }}
                  value={addTokenState.minReqAmt}
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className="text-header">
                Total estimation fee
              </Col>
              <Col style={{ paddingLeft: "0px" }}>
                <div className="detail final">{value} ETH</div>
              </Col>
            </Row>
        </Card.Body>

        <Card.Footer className="text-center">
          <Button
            onClick={handleCreateToken}
            variant="outline-success"
          >
            {
              processing ?
              <div className="d-flex align-items-center">
                Processing
                <span className="loading ml-2"></span>
              </div>
              :
              <div>Fractionize</div>
            }
          </Button>
        </Card.Footer>
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
    </div>
  )
}