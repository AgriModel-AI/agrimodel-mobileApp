import { useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { updatePostComments, updatePostLikes } from "@/redux/slices/postsSlice";
import { fetchNotifications } from "@/redux/slices/notificationSlice";
import showToast from '@/component/showToast';

const SOCKET_URL = process.env.EXPO_PUBLIC_BACKEND_URL

const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);
   
  const dispatch = useDispatch<any>();

  const { userDetails } = useSelector((state: any) => state.userDetails);

  useEffect(() => {
    const connectSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          console.log("No JWT token found");
          return;
        }

        const newSocket: Socket = io(SOCKET_URL, {
          transports: ["websocket"],
          auth: { token },
        });

        newSocket.on("connect", () => {
          console.log("Connected to WebSocket server");
        });

        newSocket.on("disconnect", () => {
          console.log("Disconnected from WebSocket server");
        });

        newSocket.on("new_notification", (data: { message: string }) => {
          // Alert.alert("New Notification", data.message);
          showToast(data.message, 'info');
          dispatch(fetchNotifications());
        });

        newSocket.on("new_post_like", (data: { data: any }) => {
        
            if(userDetails.userId !== data.data.userId) {
                dispatch(updatePostLikes(data.data))
            }
        });

        newSocket.on("new_post_comments", (data: { data: any }) => {
        
            if(userDetails.userId !== data.data.userId) {
                dispatch(updatePostComments(data))
            }
        });

        setSocket(newSocket);

        return () => {
          newSocket.disconnect();
        };
      } catch (error) {
        console.error("Socket connection error:", error);
      }
    };

    connectSocket();
  }, []);

  return socket;
};

export default useSocket;
