import TokenManager from "@/services/storage/TokenManager";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useOfflineData } from "../../../../hooks/useOfflineData";

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  const { data: user, isLoading, refreshData, isOffline } = useOfflineData();

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const navigateTo = (route: any) => {
    router.push(route);
  };

  const ProfileOption = ({
    icon,
    title,
    onPress,
    color,
    showBadge = false,
  }: any) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={20} color={color} style={styles.optionIcon} />
      <Text style={[styles.optionText, { color: isDark ? "#fff" : "#000" }]}>
        {title}
      </Text>
      <View style={styles.optionArrow}>
        {showBadge && (
          <View
            style={[styles.badge, { backgroundColor: theme.colors.danger }]}
          >
            <Text style={styles.badgeText}>1</Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
        />
      </View>
    </TouchableOpacity>
  );

  const confirmLogout = () => {
    Alert.alert(
      t("profile.logout_title", "Logout"),
      t("profile.logout_message", "Are you sure you want to logout?"),
      [
        {
          text: t("common.cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("common.yes", "Yes"),
          onPress: async () => {
            await TokenManager.clearTokens();
            await AsyncStorage.setItem("hasCompletedOnboarding", "false");
            dispatch({ type: "LOGOUT" }); // This will reset redux state
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const getAvatarPlaceholder = () => {
    return user?.gender?.toLowerCase() === "female"
      ? require("../../../../assets/images/female-avatar.png")
      : require("../../../../assets/images/male-avatar.png");
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#f8f9fa" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={14} color="#721c24" />
          <Text style={styles.offlineText}>
            {t("common.offline_mode", "You are offline")}
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() =>
              navigateTo("/(authenticated)/(tabs)/profile//edit-profile")
            }
            activeOpacity={0.9}
          >
            {isLoading ? (
              <View style={styles.loadingAvatar}>
                <ActivityIndicator
                  color={isDark ? "#fff" : theme.colors.primary}
                />
              </View>
            ) : (
              <Image
                source={
                  user?.profilePicture
                    ? { uri: user.profilePicture }
                    : getAvatarPlaceholder()
                }
                style={styles.avatar}
              />
            )}
          </TouchableOpacity>

          <Text
            style={[styles.profileName, { color: isDark ? "#fff" : "#000" }]}
          >
            {isLoading
              ? t("common.loading", "Loading...")
              : user?.names || t("profile.guest", "Guest")}
          </Text>

          <Text
            style={[
              styles.profileEmail,
              { color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" },
            ]}
          >
            {isLoading ? "" : user?.email || ""}
          </Text>

          <TouchableOpacity
            style={[
              styles.editProfileButton,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
            onPress={() =>
              navigateTo("/(authenticated)/(tabs)/profile//edit-profile")
            }
          >
            <Text
              style={[
                styles.editProfileText,
                { color: isDark ? "#fff" : "#000" },
              ]}
            >
              {t("profile.edit_profile", "Edit Profile")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Account Section */}
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionLabel,
                { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" },
              ]}
            >
              {t("profile.account", "ACCOUNT")}
            </Text>

            <View
              style={[
                styles.section,
                { backgroundColor: isDark ? "#111" : "#fff" },
              ]}
            >
              <ProfileOption
                icon="person-outline"
                title={t("profile.personal_info", "Personal Information")}
                onPress={() =>
                  navigateTo("/(authenticated)/(tabs)/profile//edit-profile")
                }
                color={theme.colors.primary}
              />

              <ProfileOption
                icon="lock-closed-outline"
                title={t("profile.change_password", "Change Password")}
                onPress={() =>
                  navigateTo("/(authenticated)/(tabs)/profile//change-password")
                }
                color={theme.colors.secondary}
              />
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionLabel,
                { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" },
              ]}
            >
              {t("profile.settings", "SETTINGS")}
            </Text>

            <View
              style={[
                styles.section,
                { backgroundColor: isDark ? "#111" : "#fff" },
              ]}
            >
              <ProfileOption
                icon="language-outline"
                title={t("profile.language", "Language")}
                onPress={() =>
                  navigateTo("/(authenticated)/(tabs)/profile//language")
                }
                color={theme.colors.info}
              />

              <ProfileOption
                icon="contrast-outline"
                title={t("profile.theme", "Theme")}
                onPress={() =>
                  navigateTo("/(authenticated)/(tabs)/profile//theme")
                }
                color={isDark ? "#8EBBFF" : "#5E81AC"}
              />

              <ProfileOption
                icon="help-circle-outline"
                title={t("profile.help", "Help & Support")}
                onPress={() =>
                  navigateTo("/(authenticated)/(tabs)/profile//help")
                }
                color={theme.colors.success}
              />

              <ProfileOption
                icon="information-circle-outline"
                title={t("profile.faq", "FAQ")}
                onPress={() =>
                  navigateTo("/(authenticated)/(tabs)/profile//faq")
                }
                color="#FF9800"
              />

              <ProfileOption
                icon="document-text-outline"
                title={t("profile.terms", "Terms & Conditions")}
                onPress={() =>
                  navigateTo("/(authenticated)/(tabs)/profile//terms")
                }
                color={theme.colors.info}
              />
            </View>
          </View>

          {/* Danger Zone Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: theme.colors.danger }]}>
              {t("profile.danger_zone", "DANGER ZONE")}
            </Text>

            <View
              style={[
                styles.section,
                { backgroundColor: isDark ? "#111" : "#fff" },
              ]}
            >
              <ProfileOption
                icon="shield-outline"
                title={t("profile.block_account", "Block Account")}
                onPress={() =>
                  navigateTo("/(authenticated)/(tabs)/profile//block-account")
                }
                color={theme.colors.danger}
              />

              <ProfileOption
                icon="log-out-outline"
                title={t("profile.logout", "Logout")}
                onPress={confirmLogout}
                color={theme.colors.danger}
              />
            </View>
          </View>

          <View style={styles.versionContainer}>
            <Text
              style={[
                styles.versionText,
                { color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" },
              ]}
            >
              {t("profile.version", "Version")} 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Increased padding at bottom for better scrolling
  },
  offlineBanner: {
    backgroundColor: "rgba(248, 215, 218, 0.7)",
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  offlineText: {
    color: "#721c24",
    marginLeft: 6,
    fontSize: 12,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  loadingAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 20,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: "500",
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    paddingLeft: 4,
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: 12,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  optionIcon: {
    marginRight: 14,
    width: 22,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
  },
  optionArrow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30, // Increased margin for better visibility
  },
  versionText: {
    fontSize: 12,
  },
});
