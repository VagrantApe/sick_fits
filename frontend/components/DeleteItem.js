import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { ALL_ITEMS_QUERY } from "./Items";
import { CURRENT_USER_QUERY } from "./User";

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

class DeleteItem extends Component {
  update = (cache, payload) => {
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    data.items = data.items.filter(
      item => item.id !== payload.data.deleteItem.id
    );
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
  };
  render() {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(deleteItem, { error }) => (
          <button
            onClick={() => {
              if (confirm("Delete This?")) {
                deleteItem().catch(err => {
                  alert(err.message);
                });
              }
            }}
          >
            {this.props.children}
          </button>
        )}
      </Mutation>
    );
  }
}

export default DeleteItem;
