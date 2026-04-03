import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Onboarding = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text>Onboarding</Text>
    </SafeAreaView>
  );
};

export default Onboarding;
