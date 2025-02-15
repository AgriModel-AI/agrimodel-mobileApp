import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export default function App() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "1009844529285-jvvmsnp43gr2ul9goavu2cstd20v21pv.apps.googleusercontent.com",
    iosClientId:
      "1009844529285-9sku1c4i0njsn8qkvugkj97h58tbkfg8.apps.googleusercontent.com",
    webClientId:
      "1009844529285-62qgufemnag4qr0huutrvf2dtmcd3t8d.apps.googleusercontent.com",
  });

  useEffect(() => {
    handleEffect();
  }, [response]);

  async function handleEffect() {
    const user = await getLocalUser();
    console.log("user", user);
    if (!user) {
      if (response?.type === "success" && response.authentication?.accessToken) {
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      setUserInfo(user);
      console.log("loaded locally");
    }
  }

  const getLocalUser = async (): Promise<UserInfo | null> => {
    const data = await AsyncStorage.getItem("@user");
    return data ? JSON.parse(data) : null;
  };

  const getUserInfo = async (token: string) => {
    try {
      const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user: UserInfo = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  return (
    <View style={styles.container}>
      {!userInfo ? (
        <Button
          title="Sign in with Google"
          disabled={!request}
          onPress={() => {
            promptAsync();
          }}
        />
      ) : (
        <View style={styles.card}>
          {userInfo?.picture && (
            <Image source={{ uri: userInfo.picture }} style={styles.image} />
          )}
          <Text style={styles.text}>Email: {userInfo.email}</Text>
          <Text style={styles.text}>
            Verified: {userInfo.verified_email ? "yes" : "no"}
          </Text>
          <Text style={styles.text}>Name: {userInfo.name}</Text>
        </View>
      )}
      <Button
        title="Remove Local Store"
        onPress={async () => await AsyncStorage.removeItem("@user")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
