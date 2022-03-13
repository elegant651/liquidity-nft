import React, { useState, useEffect, useCallback } from "react";
import AlertModal from "./modals/AlertModal";
import SuccessModal from "./modals/SuccessModal";
import { Row, Col, Button, Card, CardDeck, Form, Image, ProgressBar } from "react-bootstrap";
import { ethers, BigNumber, utils, Contract } from "ethers";
import useWeb3Modal from "../hooks/useWeb3Modal";
import { abis, addresses } from "../web3/config";
import { createLazyMint, generateTokenId, putLazyMint } from "../rarible/createLazyMint";

//Lazy mint
export default function Upload({}) {
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

  // progress ui
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  //ipfs
  const [ipfsHash, setIpfsHash] = useState('');
  const ipfsAPI = require("ipfs-http-client");

  //contract-rarible
  const [contractAddress, setContractAddress] = React.useState();
  const [tokenId, setTokenId] = React.useState();

  //fractionize
  const [managerFactory, setManagerFactory] = useState(undefined);
  const [addTokenState, setAddTokenState] = useState({
    tokenName: "aoki",
    tokenSymbol: "AOKI",
    amtTotalMint: "10",
    minReqAmt: "1",
    price: "0.00001",
    payback: ""
  });
  const [value, setValue] = useState("");
  const [newManagerAddr, setNewManagerAddr] = useState(undefined)


///init factory
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
            // console.log(utils.formatEther(value));
            setValue(utils.formatEther(value));
        }
    }, 500);
  });

  useEffect(() => {
    if (value.length <= 18) {
      getValue();
    }
  }, [getValue, value]);

  const nftJSON = {
    description: "LISTEN TO JENNY NOW! MY COLLAB WITH 3LAU EXCLUSIVELY ON AUDIUS!\n\nFollow:\nyoutube.com/steveaoki\nfacebook.com/steveaoki\ntwitter.com/steveaoki\ninstagram.com/steveaoki\nSnapchat: @aokisteve\nTikTok: @steveaoki\nTriller: @steveaoki",
    external_url: "https://usermetadata.audius.co/ipfs/QmWHyf1UqEZCVrGcCefwxX3NH3KTJ8kVn45DbvBeaPZx6X/150x150.jpg",
    image: "https://usermetadata.audius.co/ipfs/QmWHyf1UqEZCVrGcCefwxX3NH3KTJ8kVn45DbvBeaPZx6X/150x150.jpg",
    name: "Jenny - Steve Aoki & 3LAU",
    attributes: [
      {
        trait_type: "genre",
        value: "Electronic",
      },
      {
        trait_type: "tags",
        value: "edm,electronic,electro,bass,steveaoki,3lau,hype,dance",
      },
    ],
  };

  //Uploading music info into IPFS
  const step1 = async () => {
    const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });    

    // ipfsHash
    const result = await ipfs.add(JSON.stringify(nftJSON));
    if (result && result.path) {
      setIpfsHash(result.path);
      console.log('STEP1: ipfsHash', result.path)

      goStep(2);
    }
  }

  //Minting NFT with rarible protocol
  const step2 = async () => {
    const signer = provider.getSigner();
    const addr = await signer.getAddress();

    const newTokenId = await generateTokenId(addresses.ERC721_RARIBLE, addr)
    
    setTokenId(newTokenId)
    setContractAddress(addresses.ERC721_RARIBLE)

    const form = await createLazyMint(newTokenId, provider, addresses.ERC721_RARIBLE, addr, ipfsHash)
    await putLazyMint(form)

    console.log('STEP2: newTokenId', newTokenId)

    goStep(3);
  }

  //Fractionize - create ERC-20 token - add liquidity on uniswap
  const step3 = async () => {
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
    console.log('STEP3: result', result)

    setNewManagerAddr(result[1]);

    goStep(4);
  }


  const goStep = async (stepIdx) => {
    setStep(stepIdx)
    if (stepIdx===1) {
      setProcessing(true)
      setProgress(3)
      await step1();
    } else if (stepIdx===2) {
      setProgress(33)
      await step2();
    } else if (stepIdx===3) {
      setProgress(70)
      await step3();
    } else {
      setProgress(100)
      setProcessing(false)

      setSuccessModal({
        open: true,
        msg: "NFT minting prcoess successfully finished !!",
      });
    }
  }

  return (
    <div>
      <Card
        className="mx-auto form-card text-center"
        style={{ backgroundColor: "rgb(253, 255, 255)" }}
      >
        <Card.Header>
          <u>NFT Minting process</u>
        </Card.Header>

        <Card.Body>
          <div>
            <ProgressBar animated now={progress} label={`${step}`} />  

            <Row className="text-center" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
              <Col>
                { step === 0 ?
                  <Card className="display-coupon-card" >
                      <Card.Header style={{ marginBottom: "5px" }}>
                        <Image src={nftJSON.image} width="150px"></Image>
                        <h5>{nftJSON.name}</h5>
                      </Card.Header>
            
                      <Card.Body>
                        <div style={{ marginBottom: "10px" }}>
                          {nftJSON.description && nftJSON.description.slice(0, 70)}
                        </div>
                      </Card.Body>
                  </Card> : <div></div>
                }

                { step === 1 ?
                    <div>
                        <h4>Step1</h4>
                        <div>Uploading music info into IPFS</div>
                    </div> : <div></div>
                }

                { step === 2 ?
                    <div>
                        <h4>Step2</h4>
                        <div>Minting NFT with rarible protocol</div>
                    </div> : <div></div>
                }

                { step === 3 ?
                    <div>
                        <h4>Step3</h4>
                        <div>Fractionalized - create ERC-20 token - add liquidity on uniswap</div>
                    </div> : <div></div>
                }

                { step === 4 ?
                  <div>
                    <h4>Complete</h4>
                    <div>
                        IPFS Hash: {ipfsHash} <br />
                        TokenId: {tokenId} <br />
                        NFT Contract address: {contractAddress} <br />
                        <a href={`https://ropsten.rarible.com/token/${contractAddress}:${tokenId}?tab=history`} target="_blank">Go Rarible</a> <br />
                        Fractionalized Address: {newManagerAddr}
                    </div>
                  </div>
                    : <div></div>
                }
              </Col>
            </Row>
          </div>
        </Card.Body>

        <Card.Footer className="text-center">
          <Button
            onClick={() => goStep(1)}
            variant="outline-success"
          >
            {
              processing ?
              <div className="d-flex align-items-center">
                Processing
                <span className="loading ml-2"></span>
              </div>
              :
              <div>Minting</div>
            }
          </Button>
        </Card.Footer>
      </Card>

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
        onConfirm={() => {}}
      >
        {successModal.msg}
      </SuccessModal>
    </div >
  );
}
