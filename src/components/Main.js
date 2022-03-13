import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Row, Col, Card, CardDeck, Image } from "react-bootstrap";
import Loading from "./Loading";

export default function Main() {
  const [listTracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noMetamsk, setNoMetamask] = useState(false);
  const testMangerAccount = "0xad43284879Bb1055B8bc4793850616e9239A2535";

  const selectHost = async () => {
    const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]
    const res = await fetch('https://api.audius.co')
    const hosts = await res.json()
    return sample(hosts.data)
  }

  const fetchTracks = async () => {
    const host = await selectHost()
    const res = await fetch(`${host}/v1/tracks/trending?limit=1&timeRange=week?app_name=EXAMPLEAPP`)
    const json = await res.json()
    const allTracks = json.data.slice(0, 20);

    console.log('aa', allTracks)
    setTracks(allTracks);
    setLoading(false);
  }

  const isMetamaskInstalled = () => {
    return (typeof window.ethereum !== 'undefined');
  }

  useEffect(() => {
    if (!isMetamaskInstalled()) {
        setLoading(false);
        setNoMetamask(true);
    } else if (listTracks.length === 0) {
      fetchTracks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function DisplayCard({ item, count }) {
    return (
      <Card key={count} className="display-coupon-card" >
        <Link
          key={count}
          style={{ textDecoration: "none", color: "black" }}
          to={`/view/${testMangerAccount}`}
        > 
          <Card.Header style={{ marginBottom: "5px" }}>
            <Image src={item.artwork["150x150"]} width="150px"></Image>
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
                <h5 style={{ color: "blue" }}>{item.user.name}</h5>
                <span className="info-message">

                </span>
              </div>
            </div>
          </Card.Body>
        </Link>
      </Card>
    );
  }

  if (loading) {
    return <Loading />
  };

  return (
    <div>
      <Row xs={2} md={4} className="g-4">
      {!noMetamsk ?
        (listTracks.map((element, key) => (
            <Col key={key}>
              <DisplayCard item={element} count={key} />
            </Col>
          )))
        : <div
            className="alert-message"
            style={{ marginTop: "20%", fontSize: "x-large" }}
          >
            You don't have metamask. Please install first !!
        </div>
      }
      </Row>
    </div >
  );

}

