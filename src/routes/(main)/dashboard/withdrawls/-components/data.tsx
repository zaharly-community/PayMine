export type WithdrawlStatus = "Pending" | "Completed" | "Waiting Correction";

export type WithdrawlMethod = "Flouci" | "D17" | "Kashy" | "Bank Transfer";

export type WithdrawlProcessor = {
  name: string;
  image: string;
};

export type WithdrawlRow = {
  id: string;
  name: string;
  email: string;
  date: string;
  withdrawlMethod: WithdrawlMethod;
  withdrawlMethodImage: string;
  amount: number;
  commissionPercent: number;
  commissionAmount: number;
  status: WithdrawlStatus;
  processedBy: WithdrawlProcessor;
};

const processors: WithdrawlProcessor[] = [
  {
    name: "Koray Okumus",
    image:
      "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6dfc72b9-8c86-438a-aada-8d3530e13a68/d2c9cgs-69217879-a8d4-438a-b98d-baa29baf98d8.jpg/v1/fill/w_900,h_1126,q_75,strp/this_random_guy_by_inxonic_d2c9cgs-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5OTkyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZDJjOWNncy02OTIxNzg3OS1hOGQ0LTQzOGEtYjk4ZC1iYWEyOWJhZjk4ZDguanBnIiwiaGVpZ2h0IjoiPD0xMTI2Iiwid2lkdGgiOiI8PTkwMCJ9XV0sInVybCI6WyJ1cm46c2VydmljZTppbWFnZS53aXRlcnBtYXJrIl19.oLUUOQ0Apg_6Gq1gPPuVu9DXt6494FP4rbUTeN4h-wA",
  },
  {
    name: "Nicolas Martin",
    image:
      "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww",
  },
  {
    name: "Sami Ben Salah",
    image:
      "https://img.magnific.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?semt=ais_hybrid&w=740&q=80",
  },
  {
    name: "Youssef Trabelsi",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHy922UMR9X9MNgNutdRRnbRe0eklCXLAe_nagnpquGQ&s",
  },
];

const methodImages: Record<WithdrawlMethod, string> = {
  Flouci:
    "https://play-lh.googleusercontent.com/7mMIDBQ-DsWB5GZluLfTwMXROjPTiJDS1LyQDPKRS8G20dW3LD8GGTU68FZ1hhbwM7-5jqe5QNMiDjQrIoDV",
  D17:
    "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY",
  Kashy:
    "https://play-lh.googleusercontent.com/pTtXnbOlZa8LXuvgdkvNb00J34wEPpDOHcEnBQiJYPV8zN5OQUBezMlosM0iO_KX5pLIbml45uvH-5MyUy1LQqI=w240-h480-rw",
  "Bank Transfer":
    "https://cdn-icons-png.flaticon.com/512/2830/2830284.png",
};

const players = [
  "Olivia Rhye",
  "Phoenix Baker",
  "Lana Steiner",
  "Demi Wilkinson",
  "Candice Wu",
  "Natali Craig",
  "Drew Cano",
  "Orlando Diggs",
  "Andi Lane",
  "Kate Morrison",
  "Alec Whitten",
  "Ariana Decker",
  "Steven Tey",
  "Lori Bryson",
  "Koray Okumus",
  "Josh Miller",
  "Mollie Hall",
  "Rene Wells",
  "Rylee Howard",
  "Sienna Hewitt",
  "Noah Pierre",
  "Eve Lechner",
  "Zahir McClure",
  "Mia Romberg",
  "Nico Arendt",
] as const;

const dates = [
  "18 Sep 2026, 10:12 AM",
  "18 Sep 2026, 09:47 AM",
  "18 Sep 2026, 08:38 AM",
  "18 Sep 2026, 07:52 AM",
  "18 Sep 2026, 07:15 AM",
  "18 Sep 2026, 06:41 AM",
  "18 Sep 2026, 05:28 AM",
  "18 Sep 2026, 04:55 AM",
  "18 Sep 2026, 03:47 AM",
  "18 Sep 2026, 02:36 AM",
  "18 Sep 2026, 01:58 AM",
  "17 Sep 2026, 11:44 PM",
  "17 Sep 2026, 10:57 PM",
  "17 Sep 2026, 09:36 PM",
  "17 Sep 2026, 08:42 PM",
  "17 Sep 2026, 07:25 PM",
  "17 Sep 2026, 06:18 PM",
  "17 Sep 2026, 05:06 PM",
  "17 Sep 2026, 04:22 PM",
  "17 Sep 2026, 03:14 PM",
  "17 Sep 2026, 02:09 PM",
  "17 Sep 2026, 01:03 PM",
  "17 Sep 2026, 11:48 AM",
  "17 Sep 2026, 10:32 AM",
  "17 Sep 2026, 09:17 AM",
] as const;

const methods: WithdrawlMethod[] = [
  "Flouci",
  "D17",
  "Kashy",
  "Bank Transfer",
];

const amounts = [
  185.23, 42.45, 298.65, 533.79, 103.38, 432.51, 165.05, 206.47, 352.67,
  143.54, 734.53, 248.17, 301.23, 138.13, 573.18, 274.07, 154.26, 354.51,
  177.88, 414.26, 763.99, 455.07, 299.25, 425.5, 189.99,
];

const statuses: WithdrawlStatus[] = [
  "Completed",
  "Pending",
  "Pending",
  "Completed",
  "Waiting Correction",
  "Completed",
  "Pending",
  "Completed",
  "Completed",
  "Waiting Correction",
  "Completed",
  "Pending",
  "Completed",
  "Completed",
  "Pending",
  "Completed",
  "Waiting Correction",
  "Completed",
  "Pending",
  "Completed",
  "Completed",
  "Pending",
  "Completed",
  "Waiting Correction",
  "Completed",
];

const commissionPercents = [
  1, 0.5, 1.5, 1, 0, 1, 2, 0.75, 1, 1.5, 0.5, 1, 1.25, 0, 1.5, 1, 2, 0.5, 1, 1.5,
  0, 1, 0.75, 1.25, 0,
];

export const withdrawls: WithdrawlRow[] = players.map((name, index) => {
  const amount = amounts[index] ?? 100;
  const commissionPercent = commissionPercents[index] ?? 1;

  return {
    id: `WDL-02026${String(index + 1).padStart(3, "0")}`,
    name,
    email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
    date: dates[index] ?? dates[0],
    withdrawlMethod: methods[index % methods.length] ?? "Flouci",
    withdrawlMethodImage: methodImages[methods[index % methods.length] ?? "Flouci"],
    amount,
    commissionPercent,
    commissionAmount: Number(((amount * commissionPercent) / 100).toFixed(2)),
    status: statuses[index] ?? "Pending",
    processedBy: processors[index % processors.length] ?? processors[0],
  };
});

export const filters = {
  withdrawlMethod: ["All", ...methods] as const,
  status: ["All", "Pending", "Completed", "Waiting Correction"] as const,
};
