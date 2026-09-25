import React, { useEffect, useState } from "react";

import TopBar from "./components/TopBar.jsx";
import TopTabs from "./components/TopTabs.jsx";
import Toast from "./components/Toast.jsx";
import ChatBot from "./components/ChatBot.jsx";

import Home from "./pages/Home.jsx";
import Post from "./pages/Post.jsx";
import RiskAlerts from "./pages/RiskAlerts.jsx";
import Profile from "./pages/Profile.jsx";

import api from "./lib/api";


export default function App() {
  const [page, setPage] = useState("home");
  const [focusLocation, setFocusLocation] = useState(null);

  // Test connection with LandSafe backend
  useEffect(() => {
    async function testBackendConnection() {
      try {
        const response = await api.get("/");

        console.log(
          "✅ LandSafe backend connected:",
          response.data
        );
      } catch (error) {
        console.error(
          "❌ LandSafe backend connection failed:",
          error.response?.data || error.message
        );
      }
    }

    testBackendConnection();
  }, []);

  function goToMap(location) {
    setFocusLocation(location);
    setPage("home");
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="sticky top-0 z-30">
        <TopBar
          page={page}
          onOpenAlerts={() => setPage("alerts")}
        />

        <TopTabs
          page={page}
          setPage={setPage}
        />
      </div>

      <main className="mx-auto w-full max-w-5xl px-4 pb-10 pt-4 sm:px-6">

        {page === "home" && (
          <Home
            onOpenAlerts={() => setPage("alerts")}
            focusLocation={focusLocation}
            onFocusHandled={() => setFocusLocation(null)}
          />
        )}

        {page === "post" && (
          <Post />
        )}

        {page === "alerts" && (
          <RiskAlerts
            onViewOnMap={goToMap}
          />
        )}

        {page === "profile" && (
          <Profile />
        )}

      </main>

      <Toast
        onView={() => setPage("alerts")}
      />

      <ChatBot
        onNavigate={setPage}
        onViewOnMap={goToMap}
      />
    </div>
  );
}