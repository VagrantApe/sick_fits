import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import RequestReset, {
  REQUEST_RESET_MUTATION
} from "../components/RequestReset";
import { MockedProvider } from "react-apollo/test-utils";

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: "fart@fart.com" }
    },
    result: {
      data: { requestReset: { message: "success", __typename: "Message" } }
    }
  }
];

describe("<RequestReset />", () => {
  it("renders and matches snapshot", () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );
    const form = wrapper.find('[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it("calls the mutation", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );
    //simulate typing
    wrapper.find("input").simulate("change", {
      target: { name: "email", value: "fart@fart.com" }
    });
    //submit form
    wrapper.find("form").simulate("submit");
    await wait();
    wrapper.update();
    //console.log(wrapper.debug());
    expect(wrapper.find("p").text()).toContain(
      "Success! Check your email for a reset link."
    );
  });
});
