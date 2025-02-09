import { savingsPluginActions } from "@/plugins/savings/plugin";
import { toast } from "sonner";

const useSavingsPlugin = () => {
  const installSavingsPlugin = async (modularAccountClient: any) => {
    // @ts-ignore
    const extendedAccount = modularAccountClient.extend(
      savingsPluginActions as unknown as any
    );
    console.log("extendedAccount:", extendedAccount);
    try {
      // @ts-ignore
      const result = await extendedAccount.installSavingsPlugin({
        args: [],
      });
      console.log("Plugin Installation Result:", result);
      toast("Plugin Installed");
      toast(`Hash: ${result.hash}`);
      return result;
    } catch (e) {
      toast.error("Plugin Installation Failed (check console)");
      console.error("Plugin Installation Failed");
      console.error(e);
    }
  };

  return {
    installSavingsPlugin,
  };
};

export default useSavingsPlugin;
