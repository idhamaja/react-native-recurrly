import images from "@/constants/images";
import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const posthog = usePostHog();

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [avatarInput, setAvatarInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Only capture and reset analytics after successful sign-out
      posthog.capture("user_signed_out");
      posthog.reset();
    } catch (error) {
      console.error("Sign-out failed:", error);
      Alert.alert("Sign-out failed", "Unable to sign out. Please try again.");
      // Don't reset analytics if sign-out failed
    }
  };

  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "User";
  const email = user?.emailAddresses?.[0]?.emailAddress;

  // initialize inputs when user loads
  useEffect(() => {
    if (isLoaded && user) {
      setNameInput(
        user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      );
      setEmailInput(user.emailAddresses?.[0]?.emailAddress || "");
    }
  }, [isLoaded, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    const nameChanged =
      nameInput.trim() !==
      (user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim());
    const emailChanged =
      emailInput.trim() !== (user.emailAddresses?.[0]?.emailAddress || "");
    const avatarChanged = avatarInput.trim() !== (user.imageUrl || "");

    try {
      setLoading(true);
      if (nameChanged) {
        const parts = nameInput.trim().split(/\s+/);
        const firstName = parts.shift() || "";
        const lastName = parts.join(" ") || "";
        await user.update({ firstName, lastName });
        posthog?.capture?.("profile_name_updated", { firstName, lastName });
      }

      if (avatarChanged) {
        try {
          await user.setProfileImage({
            file: {
              uri: avatarInput,
              name: "avatar.jpg",
              type: "image/jpeg",
            } as any,
          });
          posthog?.capture?.("profile_avatar_updated", {
            imageUrl: avatarInput,
          });
        } catch (err) {
          console.warn("Avatar update failed:", err);
        }
      }

      if (emailChanged) {
        await user.createEmailAddress({ email: emailInput });
        posthog?.capture?.("profile_email_added", { email: emailInput });
        Alert.alert(
          "Email added",
          "We've added the email. Check your inbox to verify and make it primary.",
        );
      }

      setShowModal(false);
      Alert.alert("Saved", "Profile updated.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-3xl font-sans-bold text-primary mb-6">
        Settings
      </Text>

      {/* User Profile Section */}
      <View className="auth-card mb-5">
        <View className="flex-row items-center gap-4 mb-4">
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="size-16 rounded-full"
          />
          <View className="flex-1">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-sans-bold text-primary">
                  {displayName}
                </Text>
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  {email}
                </Text>
              </View>
              <Pressable
                className="auth-button"
                onPress={() => setShowModal(true)}
              >
                <Text className="auth-button-text text-white">
                  Edit Profile
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Edit Profile Modal */}
          <Modal
            visible={showModal}
            animationType="slide"
            transparent
            onRequestClose={() => setShowModal(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/40 p-4">
              <View className="w-full max-w-md bg-card rounded-lg p-4">
                <Text className="text-lg font-sans-semibold text-primary mb-3">
                  Edit Profile
                </Text>

                <View className="flex-row items-center mb-3">
                  <Image
                    source={
                      avatarInput
                        ? { uri: avatarInput }
                        : user?.imageUrl
                          ? { uri: user.imageUrl }
                          : images.avatar
                    }
                    className="size-12 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <Text className="text-sm text-muted-foreground">
                      Avatar URL
                    </Text>
                    <TextInput
                      value={avatarInput}
                      onChangeText={setAvatarInput}
                      placeholder="https://...jpg"
                      className="auth-input"
                    />
                  </View>
                </View>

                <Text className="text-sm text-muted-foreground">Full name</Text>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Your full name"
                  className="auth-input mb-3"
                />

                <Text className="text-sm text-muted-foreground">Email</Text>
                <TextInput
                  value={emailInput}
                  onChangeText={setEmailInput}
                  placeholder="you@company.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="auth-input mb-4"
                />

                <View className="flex-row justify-end">
                  <Pressable
                    className="auth-button bg-muted mr-3"
                    onPress={() => setShowModal(false)}
                  >
                    <Text className="auth-button-text">Cancel</Text>
                  </Pressable>
                  <Pressable
                    className="auth-button"
                    onPress={handleSaveProfile}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="auth-button-text text-white">Save</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>

      {/* Account Section */}
      <View className="auth-card mb-5">
        <Text className="text-base font-sans-semibold text-primary mb-3">
          Account
        </Text>
        <View className="gap-2">
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Account ID
            </Text>
            <Text
              className="text-sm font-sans-medium text-primary"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user?.id?.substring(0, 20)}...
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Email
            </Text>
            <View className="flex-row items-center">
              <Text className="text-sm font-sans-medium text-primary mr-3">
                {email}
              </Text>
              <Pressable onPress={() => setShowModal(true)}>
                <Text className="text-sm font-sans-medium text-primary">
                  Change
                </Text>
              </Pressable>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Joined
            </Text>
            <Text className="text-sm font-sans-medium text-primary">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
        </View>
      </View>

      {/* Sign Out Button */}
      <Pressable className="auth-button bg-destructive" onPress={handleSignOut}>
        <Text className="auth-button-text text-white">Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;
