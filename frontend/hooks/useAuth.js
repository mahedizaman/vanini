import useAuthStore from "@/store/authStore";

const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const logout = useAuthStore((s) => s.logout);

  return { user, accessToken, isLoading, setUser, setAccessToken, logout };
};

export default useAuth;
