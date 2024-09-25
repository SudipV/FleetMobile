import QueryProvider from "../providers/QueryProvider";
import { Stack } from "expo-router";
const Layout = () => {
  return (
    <QueryProvider>
      <Stack />
    </QueryProvider>
  );
};

export default Layout;
