import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "../redux/app/hook";

import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markAsRead,
} from "../redux/features/notifications/notificationSlice";

import {
  Bell,
} from "@phosphor-icons/react";

import { getAvatarColor } from "../utils/avatarColor";
import { avatarUrl } from "../utils/avatarUrl";

import { SearchBar } from "./SearchBar";
import { ActiveTimerChip } from "./ActiveTimerChip";

export const Topbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.login.user);

  const profile = useAppSelector((state) => state.profile.data);

  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notification
  );

  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Avatar
  const avatarBgColor = getAvatarColor(user?.full_name || "User");

  const profileImage = avatarUrl(profile?.profile_image, 96);

  // Profile Navigation
  const handleProfileClick = () => {
    const role = user?.role || "user";

    navigate(`/${role}/dashboard/profile`);
  };

  // Notification Date Formatter
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      date.toDateString() === yesterday.toDateString();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], timeOptions)}`;
    }

    if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], timeOptions)}`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...timeOptions,
    });
  };

  // Fetch Notifications
  useEffect(() => {
    dispatch(fetchNotifications());

    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Close Dropdown on Outside Click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark Notification as Read
  const handleNotificationClick = (
    id: number,
    is_read: boolean
  ) => {
    if (!is_read) {
      dispatch(markAsRead(id));
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white/90 px-6 backdrop-blur-md">

      {/* SEARCH */}
      <div className="flex w-[420px] max-w-full items-center gap-3">
        <SearchBar />
      </div>

      {/* ACTIVE TIMER */}
      <ActiveTimerChip />

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">

        {/* NOTIFICATIONS */}
        <div className="relative" ref={dropdownRef}>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#171B2E]"
            aria-label="Notifications"
          >
            <Bell size={21} weight="regular" />

            {unreadCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white px-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: avatarBgColor }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          {isOpen && (
            <div className="absolute right-0 mt-4 w-[360px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

              {/* HEADER */}
              <div className="flex items-center justify-between bg-[#171B2E] px-5 py-4">

                <h3 className="text-sm font-semibold text-white">
                  Notifications
                </h3>

                <button
                  className="text-xs font-semibold text-blue-300 transition hover:text-white"
                  onClick={() =>
                    dispatch(markAllNotificationsAsRead())
                  }
                >
                  Mark all as read
                </button>

              </div>

              {/* LIST */}
              <div className="max-h-[420px] overflow-y-auto overflow-x-hidden">

                {notifications.length > 0 ? (

                  notifications.map((n) => (

                    <div
                      key={n.id}
                      onClick={() =>
                        handleNotificationClick(n.id, n.is_read)
                      }
                      className={`flex cursor-pointer items-start gap-4 px-5 py-4 transition-all duration-200 ${
                        !n.is_read
                          ? "bg-blue-50/50 hover:bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >

                      <div className="flex flex-1 flex-col pr-2">

                        <p className="break-words text-sm font-semibold leading-snug text-[#171B2E]">
                          {n.title}
                        </p>

                        <p className="mt-1 break-words text-xs text-gray-500">
                          {n.message}
                        </p>

                        <p className="mt-2 text-[11px] text-gray-400">
                          {formatNotificationDate(n.created_at)}
                        </p>

                      </div>

                      {!n.is_read && (
                        <div className="flex items-center pt-1">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: avatarBgColor,
                            }}
                          />
                        </div>
                      )}

                    </div>

                  ))

                ) : (

                  <div className="py-12 text-center text-sm text-gray-400">
                    All caught up 🎉
                  </div>

                )}

              </div>
            </div>
          )}

        </div>

        {/* DIVIDER */}
        <div className="h-9 w-px bg-gray-200" />

        {/* USER PROFILE */}
        <button
          type="button"
          onClick={handleProfileClick}
          className="group flex cursor-pointer items-center gap-3 rounded-xl py-1 pl-1 pr-2 text-left transition-all duration-200 hover:bg-gray-50"
          title="View Profile"
        >

          {/* PROFILE IMAGE */}
          <div className="relative h-10 w-10 shrink-0">

            {profileImage ? (

              <img
                src={profileImage}
                alt={user?.full_name || "User"}
                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-gray-100 transition-all duration-200 group-hover:ring-[#278CFA]"
              />

            ) : (

              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white shadow-sm"
                style={{
                  backgroundColor: avatarBgColor,
                }}
              >
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>

            )}

            {/* ONLINE INDICATOR */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />

          </div>

          {/* USER DETAILS */}
          <div className="hidden text-left leading-tight sm:block">

            <p className="text-sm font-bold text-[#171B2E] transition-colors group-hover:text-[#278CFA]">
              {user?.full_name || "User"}
            </p>

            <p className="mt-1 text-[11px] font-medium capitalize text-gray-400">
              {user?.role || "member"}
            </p>

          </div>

        </button>

      </div>
    </header>
  );
};