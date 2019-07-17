import React, { Component } from "react";
import Downshift from "downshift";
import Router from "next/router";
import { ApolloConsumer } from "react-apollo";
import gql from "graphql-tag";
import debounce from "lodash.debounce";
import { DropDown, DropDownItem, SearchStyles } from "./styles/DropDown";

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      image
      title
    }
  }
`;

class AutoComplete extends Component {
  state = {
    items: [],
    loading: false
  };

  onChange = debounce(async (evt, client) => {
    this.setState({ loading: true });
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: evt.target.value }
    });
    this.setState({ items: res.data.items, loading: false });
  }, 350);

  routeToItem(item) {
    Router.push({
      pathname: "/item",
      query: { id: item.id }
    });
  }
  render() {
    return (
      <SearchStyles>
        <Downshift
          id="lang-switcher"
          itemToString={item => (item === null ? "" : item.title)}
          onChange={this.routeToItem}
        >
          {({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            highlightedIndex
          }) => (
            <div>
              <ApolloConsumer>
                {client => (
                  <input
                    {...getInputProps({
                      type: "search",
                      placeholder: "search for items",
                      id: "search",
                      className: this.state.loading ? "loading" : "",
                      onChange: evt => {
                        evt.persist();
                        this.onChange(evt, client);
                      }
                    })}
                  />
                )}
              </ApolloConsumer>
              {isOpen && (
                <DropDown>
                  {this.state.items.map((item, index) => (
                    <DropDownItem
                      key={item.id}
                      {...getItemProps({ item })}
                      highlighted={index == highlightedIndex}
                    >
                      <img src={item.image} alt={item.title} />
                      {item.title}
                    </DropDownItem>
                  ))}
                  {!this.state.items.length && !this.state.loading && (
                    <DropDownItem>Nothing Found for {inputValue} </DropDownItem>
                  )}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }
}

export default AutoComplete;
