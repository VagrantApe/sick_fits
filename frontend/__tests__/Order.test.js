import { mount } from "enzyme";
import toJSON, { toJson } from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import Order, { SINGLE_ORDER_QUERY } from "../components/Order";
import { fakeOrder } from "../lib/testUtils";

const mocks = [
  {
    request: {
      query: SINGLE_ORDER_QUERY,
      variables: { id: "abc123" },
      result: { data: { order: fakeOrder() } }
    }
  }
];

describe("<Order />", () => {
  it("renders the order", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Order id="ord123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    //console.log(wrapper.debug());
    const order = wrapper.find('[data-test="order"]');
    expect(toJSON(order)).toMatchSnapshot();
  });
});
