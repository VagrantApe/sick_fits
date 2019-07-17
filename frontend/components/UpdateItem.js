import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import Router from "next/router";
import gql from "graphql-tag";
import { adopt } from "react-adopt";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
      title
      description
      price
    }
  }
`;

const Composed = adopt({
  itemQ: ({ id, render }) => (
    <Query query={SINGLE_ITEM_QUERY} variables={{ id }}>
      {render}
    </Query>
  ),
  updateItemM: ({ state, render }) => (
    <Mutation mutation={UPDATE_ITEM_MUTATION} variables={{ state }}>
      {render}
    </Mutation>
  )
});

class UpdateItem extends Component {
  state = {};
  handleChange = evt => {
    const { name, type, value } = evt.target;
    const val = type === "number" ? parseFloat(value) : value;

    this.setState({ [name]: val });
  };
  updateItem = async (evt, updateItemMutation) => {
    evt.preventDefault();
    const res = await updateItemMutation({
      variables: {
        id: this.props.id,
        ...this.state
      }
    });
    Router.push({
      pathname: "/item",
      query: { id: res.data.updateItem.id }
    });
  };

  render() {
    return (
      <Composed id={this.props.id} state={this.state}>
        {({ itemQ, updateItemM }) => {
          const { loading: itemLoading, data: itemData } = itemQ;
          const {
            loading: updateItemLoading,
            error: updateItemError
          } = updateItemM;
          if (itemLoading) return <p>Loading...</p>;
          if (!itemData.item)
            return <p>No Item Found for ID: {this.props.id}</p>;
          return (
            <Form onSubmit={evt => this.updateItem(evt, updateItemM)}>
              <Error error={updateItemError} />
              <fieldset
                disabled={updateItemLoading}
                aria-busy={updateItemLoading}
              >
                <label htmlFor="title">
                  Title
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Title"
                    required
                    defaultValue={itemData.item.title}
                    onChange={this.handleChange}
                  />
                </label>
                <label htmlFor="price">
                  Price
                  <input
                    type="number"
                    id="price"
                    name="price"
                    placeholder="Price"
                    required
                    defaultValue={itemData.item.price}
                    onChange={this.handleChange}
                  />
                </label>
                <label htmlFor="description">
                  Description
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Enter a Description"
                    required
                    defaultValue={itemData.item.description}
                    onChange={this.handleChange}
                  />
                </label>
                <button type="submit">
                  Sav
                  {itemLoading ? "ing" : "e"} Changes
                </button>
              </fieldset>
            </Form>
          );
        }}
      </Composed>
    );
  }
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };
