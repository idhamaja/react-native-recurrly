import { Link } from "expo-router";
import { Text, View } from "react-native";

const SignIn = () => {
  return (
    <View>
      <Text>signin</Text>
      <Link href="/(auth)/sign-up">Create Account</Link>
      <Link href="/" className="mt-4 px-4 py-2 rounded bg-primary">
        <Text className="text-white">Kembali ke Beranda</Text>
      </Link>
    </View>
  );
};

export default SignIn;
