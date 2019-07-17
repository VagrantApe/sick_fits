import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import SingleItem, { SINGLE_ITEM_QUERY } from "../components/SingleItem";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeItem } from "../lib/testUtils";

describe("<SingleItem/>", () => {
  it("renders with proper data", async () => {
    const mocks = [
      {
        //when a request with this query is made
        request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
        //return this fake data
        result: {
          data: {
            item: fakeItem()
          }
        }
      }
    ];
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );
    expect(wrapper.text()).toContain("Loading...");
    await wait();
    wrapper.update();
    //console.log(wrapper.debug());
    expect(toJSON(wrapper.find("h2"))).toMatchSnapshot();
    expect(toJSON(wrapper.find("img"))).toMatchSnapshot();
    expect(toJSON(wrapper.find("p"))).toMatchSnapshot();
  });

  it("errors with not found item", async () => {
    const mocks = [
      {
        //when a request with this query is made
        request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
        //return this fake data
        result: {
          errors: [
            {
              message: "Items not found"
            }
          ]
        }
      }
    ];
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );
    await wait();
    expect(wrapper.text()).toContain("Items not found");
    wrapper.update();
    //console.log(wrapper.debug());
    const item = wrapper.find('[data-test="graphql-error"]');
    expect(item.text()).toContain("Items not found");
    expect(toJSON(item)).toMatchSnapshot();
  });
});
