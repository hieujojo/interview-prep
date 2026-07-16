import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60 giây - dữ liệu coi là "mới" trong khoảng này, không tự refetch nền
      refetchOnWindowFocus: false, // tắt refetch khi user focus lại tab, tránh gọi API thừa
    },
  },
});