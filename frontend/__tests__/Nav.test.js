import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import Nav from "../components/Nav";
import { CURRENT_USER_QUERY } from "../components/User";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } }
  }
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } }
  }
];

const signedInMocksWithItems = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem(), fakeCartItem(), fakeCartItem()]
        }
      }
    }
  }
];

describe("<Nav />", () => {
  it("renders a minimal nav when signed out", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    //console.log(wrapper.debug());
    //expect(wrapper.text()).toContain("Sign In");
    const nav = wrapper.find('ul[data-test="nav"]');
    expect(toJSON(nav)).toMatchSnapshot();
  });

  it("renders a full nav when signed in", async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const nav = wrapper.find('ul[data-test="nav"]');
    //expect(toJSON(nav)).toMatchSnapshot();
    expect(nav.children().length).toBe(6);
    expect(nav.text()).toContain("Sign Out");
  });

  it("renders the amount of items in cart", async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMocksWithItems}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const nav = wrapper.find('[data-test="nav"]');
    const count = nav.find("div.count");
    expect(count.text()).toContain("9");
    expect(toJSON(count)).toMatchSnapshot();
  });
});
