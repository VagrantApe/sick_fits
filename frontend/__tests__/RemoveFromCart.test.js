import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import RemoveFromCart, {
  REMOVE_FROM_CART_MUTATION
} from "../components/RemoveFromCart";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeCartItem, fakeUser } from "../lib/testUtils";
import { ApolloConsumer } from "react-apollo";

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem({ id: "abc123" })]
        }
      }
    }
  },
  {
    request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: "abc123" } },
    response: {
      data: {
        removeFromCart: {
          __typename: "CartItem",
          id: "abc123"
        }
      }
    }
  }
];

describe("<RemoveFromCart />", () => {
  it("renders and matches snapshots", async () => {
    const wrapper = mount(
      <MockedProvider>
        <RemoveFromCart id="abc123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(toJSON(wrapper.find("button"))).toMatchSnapshot();
    //expect(wrapper.find("CartItem")).toHaveLength(1);
  });

  it("it removes item from cart", async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <RemoveFromCart id="abc123" />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const {
      data: { me }
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });
    //console.log(me);
    expect(me.cart).toHaveLength(1);
    expect(me.cart[0].item.price).toBe(5000);
    expect(me.cart[0].quantity).toBe(3);
    wrapper.find("button").simulate("click");
    await wait();
    const {
      data: { me: me2 }
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });
    //console.log(me2);
    expect(me2.cart).toHaveLength(0);
  });
});
