import ItemComponent from "../components/Item";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

const fakeItem = {
  id: "ABC124",
  title: "Sweet Item",
  price: 4000,
  desription: "Test Item",
  image: "item.jpg",
  largeImage: "largeItem.jpg"
};

describe("<Item />", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<ItemComponent item={fakeItem} />);
  });
  it("renders and matches the snapshot", () => {
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  // it("renders the image properly", () => {
  //   const img = wrapper.find("img");
  //   console.log(img.props());
  //   expect(img.props().alt).toBe(fakeItem.title);
  //   expect(img.props().src).toBe(fakeItem.image);
  // });
  // it("renders and displays properly", () => {
  //   const PriceTag = wrapper.find("PriceTag");
  //   console.log(PriceTag.debug());
  //   console.log(PriceTag.children().text());
  //   expect(PriceTag.children().text()).toBe("$50");
  //   expect(wrapper.find("Title a").text()).toBe(fakeItem.title);
  // });
  // it("renders out buttons properly", () => {
  //   const buttonList = wrapper.find(".buttonList");
  //   expect(buttonList.children()).toHaveLength(3);
  //   expect(buttonList.find("Link").exists()).toBe(true);
  //   expect(buttonList.find("AddToCart").exists()).toBe(true);
  //   expect(buttonList.find("DeleteItem").exists()).toBe(true);
  // });
});
