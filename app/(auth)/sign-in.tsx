import { Link } from "expo-router";
import { Text, View } from "react-native";

const SignIn = () => {
  return (
    <View>
      <Text>signin</Text>
      <Link href="/(auth)/sign-up">Create Account</Link>
    </View>
  );
};

export default SignIn;
