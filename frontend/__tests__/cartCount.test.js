import { shallow, mount } from "enzyme";
import toJson, { mountToJson } from "enzyme-to-json";
import CartCount from "../components/CartCount";

describe("<CartCount />", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<CartCount count={10} />);
  });
  it("renders", () => {
    wrapper;
  });

  it("matches the snapshot", () => {
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it("updates via props", () => {
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.setProps({ count: 50 });
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
