import { useEffect, useState } from "react";

const useYoutubeSubscriber = () => {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [channelId, setChannelId] = useState("");
  const [loading, setLoading] = useState(true);

  const handleSubscribe = () => {
    if (channelId) {
      const channelUrl = `https://www.youtube.com/channel/${channelId}`;
      window.open(channelUrl, "_blank", "noopener,noreferrer");
    }
  };

  const getSubscriberCount = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/youtube/subscriber");

      if (!response.ok) {
        throw { message: "Failed to fetch subscriber count" };
      }

      const data = await response.json();
      if (data.subscriberCount !== undefined) {
        setSubscriberCount(data.subscriberCount);
        setChannelId(data.channelId || "");
      }
    } catch (error) {
      console.error("Error fetching subscriber count:", error);
      setSubscriberCount(0);
    } finally {
      setLoading(false);
    }
  };

  const formatSubscriberCount = (count) => {
    if (!count) return "0";

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  useEffect(() => {
    getSubscriberCount();
    const interval = setInterval(getSubscriberCount, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return {
    subscriberCount,
    loading,
    handleSubscribe,
    formatSubscriberCount,
  };
};

export default useYoutubeSubscriber;
