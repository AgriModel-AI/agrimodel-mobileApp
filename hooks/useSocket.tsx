import { fetchNotifications } from "@/redux/slices/notificationSlice";
import { updatePostComments, updatePostLikes } from "@/redux/slices/postsSlice";
import { fetchUserDetails } from "@/redux/slices/userDetailsSlice";
import TokenManager from "@/services/storage/TokenManager";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const dispatch = useDispatch<any>();
  const { userDetails, hasFetched } = useSelector((state: any) => state.userDetails);

  useEffect(() => {
    // Fetch userDetails if not already fetched
    if (!hasFetched) {
      dispatch(fetchUserDetails());
      return; // Wait until userDetails is available before continuing
    }

    if (!userDetails || !userDetails.userId == null) return;

    const connectSocket = async () => {
      try {
        const token = TokenManager.getAccessToken();
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

        newSocket.on("new_notification", () => {
          dispatch(fetchNotifications());
        });

        newSocket.on("new_post_like", (data: { data: any }) => {
          if (userDetails.userId !== data.data.userId) {
            dispatch(updatePostLikes(data.data));
          }
        });

        newSocket.on("new_post_comments", (data: { data: any }) => {
          if (userDetails.userId !== data.data.userId) {
            dispatch(updatePostComments(data));
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
  }, [dispatch, hasFetched, userDetails]);

  return socket;
};

export default useSocket;
