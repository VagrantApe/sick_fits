const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const hasPermission = require("../utils");
const stripe = require("../stripe");

const isSignedIn = userId => {
  if (!userId) {
    throw new Error("You must be signed in!");
  }
};

const Mutations = {
  async createItem(parent, args, ctx, info) {
    const { userId } = ctx.request;
    isSignedIn(userId);
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            // create relationship between item and user
            connect: {
              id: userId
            }
          },
          ...args
        }
      },
      info
    );
    return item;
  },
  updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, `{id title user {id}}`);
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission)
    );
    if (!ownsItem || !hasPermission) {
      throw new Error("You Dont have permission to delete this item!");
    }
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 //1 yr token
    });
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}!`);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Password!");
    }
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 //1 yr token
    });
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye!" };
  },
  async requestReset(parent, args, ctx, info) {
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}!`);
    }
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    const mailRes = await transport.sendMail({
      from: "jj@jj.com",
      to: user.email,
      subject: "Your Password Reset",
      html: makeANiceEmail(
        `Your Password Reset Token is:

<a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click here to reset!</a>`
      )
    });

    return { message: "Thanks!" };
  },
  async resetPassword(parent, args, ctx, info) {
    if (args.password != args.confirmPassword) {
      throw new Error("Passwords don't match");
    }
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error("This token is invalid or expired!");
    }
    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    const token = jwt.sign(
      { userId: updatedUser.userId },
      process.env.APP_SECRET
    );
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    const { userId } = ctx.request;
    isSignedIn(userId);
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: userId
        }
      },
      info
    );
    if (hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"])) {
      return ctx.db.mutation.updateUser(
        {
          data: {
            permissions: { set: args.permissions }
          },
          where: {
            id: args.userId
          }
        },
        info
      );
    } else {
      throw new Error("You do not have permission to update permissions!");
    }
  },
  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request;
    isSignedIn(userId);
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    }
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    );
  },
  async removeFromCart(parent, args, ctx, info) {
    const { userId } = ctx.request;
    isSignedIn(userId);
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{id, user { id }}`
    );
    if (!cartItem) throw new Error("No Cart Item Found!");
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error("How you Get here?!");
    }
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id }
      },
      info
    );
  },
  async createOrder(parent, args, ctx, info) {
    const { userId } = ctx.request;
    isSignedIn(userId);
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id 
        name 
        email 
        cart { 
          id 
          quantity 
          item { 
            title 
            price 
            id 
            description 
            image
            largeImage
          }
        }
      }`
    );
    const amount = user.cart.reduce(
      (acc, cartItem) => acc + cartItem.item.price * cartItem.quantity,
      0
    );
    const charge = await stripe.charges.create({
      amount,
      currency: "USD",
      source: args.token
    });

    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: {
          connect: {
            id: userId
          }
        }
      };
      delete orderItem.id;
      return orderItem;
    });

    const order = await ctx.db.mutation.createOrder({
      data: {
        user: {
          connect: {
            id: userId
          }
        },
        items: { create: orderItems },
        charge: charge.id,
        total: charge.amount
      }
    });

    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds
      }
    });
    return order;
  }
};

module.exports = Mutations;
