import React, { Component } from "react";
import { Button } from "reactstrap";

class ItemForm extends Component {
  constructor() {
    super();
    this.state = {};
    this.onInputchange = this.onInputchange.bind(this);
    this.onSubmitForm = this.onSubmitForm.bind(this);
  }

  onInputchange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  onSubmitForm() {
    console.log(this.state);
  }

  render() {
    return (
      <>
        <div>
          <h1>Widgets Catalog</h1>
          <p className="lead">Add a new Product to Widgets Catalog</p>
        </div>

        <div className="item-input-container">
          <div className="item-input">
            <label for="item-name" className="item-description">
              Product Name
            </label>
            <br />
            <input
              type="text"
              id="item-name"
              name="item-name"
              className="text-input"
              value={this.state.name}
              onChange={this.onInputchange}
            />
          </div>
          <div className="item-input">
            <label for="item-description" className="item-description">
              Product Description
            </label>
            <br />
            <textarea
              id="item-description"
              name="item-description"
              className="text-input"
              value={this.state.description}
              onChange={this.onInputchange}
            />
          </div>
          <div className="item-input">
            <label for="item-price" className="item-description">
              Product Price
            </label>
            <br />
            <input
              type="text"
              id="item-price"
              name="item-price"
              className="text-input"
              value={this.state.price}
              onChange={this.onInputchange}
            />
          </div>
          <div className="item-input">
            <label for="item-quantity" className="item-description">
              Product Quantity
            </label>
            <br />
            <input
              type="text"
              id="item-quantity"
              name="item-quantity"
              className="text-input"
              value={this.state.quantity}
              onChange={this.onInputchange}
            />
          </div>
          <div className="item-input">
            <label for="item-image" className="item-description">
              Product Documentation
            </label>
            <br />
            <input
              type="file"
              id="item-documentation"
              name="item-documentation"
              value={this.state.documentation}
              onChange={this.onInputchange}
            />
          </div>
          <div className="item-input">
            <Button
              color="primary"
              className="btn-margin"
              onClick={this.onSubmitForm}
            >
              Add Product
            </Button>
          </div>
        </div>
      </>
    );
  }
}

export default ItemForm;
