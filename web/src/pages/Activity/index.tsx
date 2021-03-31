import React, { useContext, useEffect, useState } from "react";

import ActivityCard from "../../components/ActivityCard";
import Loading from "../../components/Loading";
import { BsHeartFill } from "react-icons/bs";
import { Notification } from "../../interfaces/Notification";
import { SocketNotificationProps } from "../../interfaces/Socket";
import AuthContext from "../../contexts/AuthProvider";
import { useSocket } from "../../contexts/SocketProvider";
import api from "../../services/api";
import "./styles.scss";

const Activity = () => {
  const { user } = useContext<any>(AuthContext);
  const socket = useSocket();

  const [notifications, setNotifications] = useState<Notification[] | any>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getNotifications() {
      setIsLoading(true);
      try {
        const { data } = await api.get("/notifications");
        console.log(data);
        setNotifications(data.reverse());
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    }

    getNotifications();
  }, []);

  useEffect(() => {
    if (socket == null) return;
    socket.on("notification", ({ notification }: SocketNotificationProps) => {
      if (user.username === notification.username) {
        console.log({ notification });
        setNotifications([notification, ...notifications]);
      }
    });
  }, [notifications, socket, user.username]);

  return (
    <>
      {isLoading && <Loading />}
      <div className="activity">
        <div className="activity__container">
          {notifications.length > 0 ? (
            notifications
              .slice(0, 10)
              .map((notification: Notification) => (
                <ActivityCard key={notification._id} activity={notification} />
              ))
          ) : (
            <div className="activity__container__empty">
              <span>
                <BsHeartFill />
              </span>
              <strong>Sem atividade no momento...</strong>
              <p>
                Quando alguém comenta ou curte suas postagens elas aparecem
                aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Activity;
