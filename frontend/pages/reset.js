import ResetPassword from "../components/Reset";

const Reset = ({ query }) => <ResetPassword resetToken={query.resetToken} />;
export default Reset;
