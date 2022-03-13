import React, { useState } from "react";
import AlertModal from "./modals/AlertModal";
import SuccessModal from "./modals/SuccessModal";
import { Row, Col, Button, Card, Form } from "react-bootstrap";
import useWeb3Modal from "../hooks/useWeb3Modal";

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
  const [ipfsHash, setIpfsHash] = useState('');
  const ipfsAPI = require("ipfs-http-client");

  const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

  const handleUpload = async () => {
    setProcessing(true);

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

    // ipfsHash
    const result = await ipfs.add(JSON.stringify(nftJSON));
    if (result && result.path) {
      setIpfsHash(result.path);
    }

    setProcessing(false);
  }

  return (
    <div>
      <Card
        className="mx-auto form-card text-center"
        style={{ backgroundColor: "rgb(253, 255, 255)" }}
      >
        <Card.Header>
          <u>Upload Music Info</u>
        </Card.Header>

        <Card.Body>
          <div>

            <Row className="text-center" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
              <Col>
                <Button variant="success" onClick={handleUpload}>
                  {processing ?
                    <div className="d-flex align-items-center">
                      Processing
                        <span className="loading ml-2"></span>
                    </div>
                    :
                    <div>Upload</div>
                  }
                </Button>
              </Col>
            </Row>

            <Row>
              <Col>
                  <div>IPFS Hash: {ipfsHash}</div>
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
