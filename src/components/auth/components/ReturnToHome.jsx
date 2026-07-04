"use client";
import { setShowLoginModal } from "@/redux/slices/auth";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

const ReturnToHome = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleNavigation = () => {
    router.push("/");
    dispatch(setShowLoginModal(true));
  };

  return (
    <button
      onClick={handleNavigation}
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mx-auto mt-6 inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1"
      aria-label="Return to home page"
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      Return to home
    </button>
  );
};

export default ReturnToHome;
