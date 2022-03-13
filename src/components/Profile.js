import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Row, Col, Card, CardDeck, Image, Button } from "react-bootstrap";
import Loading from "./Loading";
import useWeb3Modal from "../hooks/useWeb3Modal";
import { abis, addresses } from "../web3/config";
import { Contract } from "ethers";
import SellNFT from "./SellNFT";

const { BufferList } = require("bl");
const ipfsAPI = require("ipfs-http-client");

export default function Profile() {
  const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

  const [yourCollectibles, setYourCollectibles] = useState();
  const [provider] = useWeb3Modal();  

  const getFromIPFS = async hashToGet => {
    for await (const file of ipfs.get(hashToGet)) {
      console.log(file.path);
      if (!file.content) continue;
      const content = new BufferList();
      for await (const chunk of file.content) {
        content.append(chunk);
      }
      console.log(content);
      return content;
    }
  };

    const updateYourCollectiblesByRarible = async () => {
      const signer = provider.getSigner();
      const addr = await signer.getAddress();

      const collectible = new Contract(addresses.COLLECTIBLE, abis.COLLECTIBLE_ABI, signer)
      const balance = await collectible.balanceOf(addr);
      // const readContracts = useContractLoader(provider);
      // const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [addr]);

      const yourBalance = balance && balance.toNumber && balance.toNumber();

      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          console.log("GEtting token index", tokenIndex);
          const tokenId = await collectible.tokenOfOwnerByIndex(addr, tokenIndex);
          console.log("tokenId", tokenId);
          const tokenURI = await collectible.tokenURI(tokenId);
          console.log("tokenURI", tokenURI);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          console.log("ipfsHash", ipfsHash);

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: addr, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
    };

  useEffect(() => {
    const updateYourCollectiblesByMock = async () => {
      if (provider!== undefined) {
        const signer = provider.getSigner();
          const addr = await signer.getAddress();
          
          const collectibleUpdate = [];
            for (let tokenIndex = 0; tokenIndex < 1; tokenIndex++) {
              collectibleUpdate.push({
                address: addr,
                artwork: "https://usermetadata.audius.co/ipfs/QmWHyf1UqEZCVrGcCefwxX3NH3KTJ8kVn45DbvBeaPZx6X/150x150.jpg",
                description: "LISTEN TO JENNY NOW! MY COLLAB WITH 3LAU EXCLUSIVELY ON AUDIUS!\n\nFollow:\nyoutube.com/steveaoki\nfacebook.com/steveaoki\ntwitter.com/steveaoki\ninstagram.com/steveaoki\nSnapchat: @aokisteve\nTikTok: @steveaoki\nTriller: @steveaoki",
                genre: "Electronic",
                id: "agVo1",
                tags: "edm,electronic,electro,bass,steveaoki,3lau,hype,dance",
                title: "Jenny - Steve Aoki & 3LAU"
              }) 
            }
            setYourCollectibles(collectibleUpdate);
        }
      }      

    updateYourCollectiblesByMock();
  }, [provider]);

  function DisplayCard({ item, count }) {
    return (
      <Card key={count} className="display-coupon-card" >
        <Link
          key={count}
          style={{ textDecoration: "none", color: "black" }}
          to={`/view/`}
        > 
          <Card.Header style={{ marginBottom: "5px" }}>
            <Image src={item.artwork} width="150px"></Image>
            <h5>{item.title}</h5>
          </Card.Header>

          <Card.Body>
            <div style={{ marginBottom: "10px" }}>
              <div><b>{item.genre}</b> {item.tags && item.tags.slice(0, 10)}</div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              {item.description && item.description.slice(0, 70)}
            </div>
            <div style={{ marginBottom: "5px" }}>
              <div>
                <h5 style={{ color: "blue" }}>{item.address}</h5>
              </div>
            </div>
          </Card.Body>
        </Link>
      </Card>
    );
  }

  return (
    <div>
      
      <Row xs={2} md={4} className="g-4">
      {
        yourCollectibles && yourCollectibles.map((element, key) => (
          <Col key={key}>
            <DisplayCard item={element} count={key} />
            <SellNFT />
          </Col>
        ))
      }
      </Row>
    </div >
  );

}

