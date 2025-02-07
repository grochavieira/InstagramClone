import React, { useContext, useEffect, useRef, useState } from "react";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineCamera,
  AiFillCamera,
} from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
// import { IoMdPaperPlane, IoIosPaperPlane } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { Link, useHistory, useLocation } from "react-router-dom";

import { ISocketNotificationProps } from "../../interfaces/ISocket";
import INotification from "../../interfaces/INotification";
import SearchInput from "../SearchInput";
import ThemeSwitcher from "../ThemeSwitcher";
import { useSocket } from "../../contexts/SocketProvider";
import AuthContext from "../../contexts/AuthProvider";
import api from "../../services/api";
import "./styles.scss";

const HeaderDesktop = () => {
  const { user, signOut } = useContext<any>(AuthContext);
  const socket = useSocket();
  const history = useHistory();
  const { pathname } = useLocation();
  const navbarRef: any = useRef(null);

  const [showNavbar, setShowNavbar] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>(
    [] as INotification[]
  );
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    async function getNotifications() {
      try {
        const { data } = await api.get("/notifications");
        setNotifications(data);
        let counter = 0;
        for (const notification of data) {
          if (!notification.wasRead) {
            counter++;
          }
        }
        setUnreadNotifications(counter);
      } catch (err) {
        console.log(err);
      }
    }

    getNotifications();
  }, []);

  useEffect(() => {
    if (socket == null) return;
    socket.on("notification", ({ notification }: ISocketNotificationProps) => {
      if (user.username === notification.username) {
        setNotifications([...notifications, notification]);
        setUnreadNotifications(unreadNotifications + 1);
      }
    });
    if (pathname === "/activity") setUnreadNotifications(0);
  }, [notifications, pathname, socket, unreadNotifications, user.username]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleClick = (e: Event) => {
    if (navbarRef.current.contains(e.target)) {
      setShowNavbar(true);
      return;
    }

    setShowNavbar(false);
  };

  function handleLogout() {
    signOut();
    history.push("/home");
  }

  async function handleNotifications() {
    try {
      notifications.forEach(async (notification: INotification) => {
        if (!notification.wasRead) {
          await api.put(`/notifications/${notification._id}`);
        }
      });
      setUnreadNotifications(0);
      history.push("/activity");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <nav className="header-desktop">
      <div className="header-desktop__logo">
        <p className="header-desktop__logo__text">Instagram</p>
      </div>

      <SearchInput />

      <div className="header-desktop__navigation-bar">
        <ul>
          <li>
            <Link to="/home">
              {pathname === "/home" ? <AiFillHome /> : <AiOutlineHome />}{" "}
            </Link>
          </li>
          <li>
            <Link to="/post-content">
              {pathname === "/post-content" ? (
                <AiFillCamera />
              ) : (
                <AiOutlineCamera />
              )}
            </Link>
          </li>
          {/* <li>
            <Link to="/message">
              {pathname === "/message" ? (
                <IoIosPaperPlane />
              ) : (
                <IoMdPaperPlane />
              )}
            </Link>
          </li> */}
          <li
            onClick={handleNotifications}
            className="header-desktop__navigation-bar__notifications"
          >
            {pathname === "/activity" ? <BsHeartFill /> : <BsHeart />}

            {unreadNotifications > 0 ? (
              <span className="header-desktop__navigation-bar__notifications__number">
                {unreadNotifications}
              </span>
            ) : (
              ""
            )}
          </li>
          <li ref={navbarRef}>
            <img
              src={user.profilePhoto !== null ? user.profilePhoto.url : ""}
              alt="user"
            />
            <div className={showNavbar ? "navbar" : "navbar disabled"}>
              <div
                onClick={() => history.push(`/profile/${user.username}`)}
                className="navbar__item"
              >
                <FaUserCircle /> Perfil
              </div>
              <div className="navbar__item">
                <ThemeSwitcher /> Trocar de Tema
              </div>
              <div onClick={handleLogout} className="navbar__item">
                <FiLogOut />
                Sair
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default HeaderDesktop;
