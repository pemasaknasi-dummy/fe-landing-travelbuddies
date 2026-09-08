interface StatusTripConfig {
  label: string;
  badge: string;
  dot: string;
}

export const getStatusTripConfig = (status?: string): StatusTripConfig | null => {
  if (!status) {
    return {
      label: "Unknown",
      badge: "bg-gray-100 text-gray-600 ring-1 ring-gray-300",
      dot: "bg-gray-400",
    };
  }

  switch (status.toUpperCase()) {
    case "PENDING":
      return null
    // return {
    //   label: "Menunggu Kuota",
    //   badge: "bg-yellow-100 text-yellow-600 ring-1 ring-yellow-600",
    //   dot: "bg-yellow-400",
    // };

    case "CLOSED":
      return null
    case "DEPART":
    case "FULL":
      return {
        label: "Trip Dikonfirmasi Berangkat",
        badge: "bg-green-100 text-green-600 ring-1 ring-green-600",
        dot: "bg-green-600",
      };

    case "DONE":
      return {
        label: "Trip Selesai",
        badge: "bg-white text-black ring-1 ring-black",
        dot: "bg-black",
      };

    case "CANCEL":
    case "REFUND":
      return {
        label: "Trip Batal",
        badge: "bg-red-500 text-white ring-1 ring-red-600",
        dot: "bg-white",
      };

    default:
      return {
        label: status,
        badge: "bg-gray-500/20 text-gray-300 ring-1 ring-gray-400/40",
        dot: "bg-gray-400",
      };
  }
};
