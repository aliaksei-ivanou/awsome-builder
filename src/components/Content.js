import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import contentData from "../utils/contentData";

class Content extends Component {
  render() {
    return (
      <div>
        <h2 className="my-5 text-center">Description</h2>
        <Row className="d-flex justify-content-between">
          {contentData.map((col, i) => (
            <Col key={i} md={5} className="mb-4">
              <h6 className="mb-3">
                <FontAwesomeIcon className="mr-2" />
                {col.title}
              </h6>
              <p>{col.description}</p>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}

export default Content;
