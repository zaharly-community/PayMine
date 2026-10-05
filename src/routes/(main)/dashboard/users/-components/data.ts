export type UserStatus = "Active" | "Pending" | "Disabled";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinedDate: string;
  package: "Starter" | "Growth" | "Scale";
  balance: number;
  status: UserStatus;
};

export const users: UserRow[] = [
  { id: "USR-10428", name: "Omar Ben Salah", email: "omar@atlas.demo", avatarUrl: "https://i.pravatar.cc/96?img=12", joinedDate: "24 Sep 2026", package: "Scale", balance: 18420.5, status: "Active" },
  { id: "USR-10391", name: "Nadia Trabelsi", email: "nadia@ipaycash.demo", avatarUrl: "https://i.pravatar.cc/96?img=47", joinedDate: "18 Sep 2026", package: "Growth", balance: 7845.2, status: "Active" },
  { id: "USR-10357", name: "Yassine Kallel", email: "yassine@atlas.demo", avatarUrl: "https://i.pravatar.cc/96?img=68", joinedDate: "11 Sep 2026", package: "Growth", balance: 4230, status: "Active" },
  { id: "USR-10286", name: "Meriem Jaziri", email: "meriem@northline.demo", avatarUrl: "https://i.pravatar.cc/96?img=32", joinedDate: "29 Aug 2026", package: "Starter", balance: 1285.75, status: "Pending" },
  { id: "USR-10194", name: "Sami Ben Amor", email: "sami@delta.demo", avatarUrl: "https://i.pravatar.cc/96?img=15", joinedDate: "14 Aug 2026", package: "Growth", balance: 0, status: "Disabled" },
  { id: "USR-10081", name: "Amel Mansouri", email: "amel@atlas.demo", avatarUrl: "https://i.pravatar.cc/96?img=44", joinedDate: "06 Aug 2026", package: "Starter", balance: 2940.3, status: "Active" },
  { id: "USR-10044", name: "Karim Gharbi", email: "karim@delta.demo", avatarUrl: "https://i.pravatar.cc/96?img=13", joinedDate: "28 Jul 2026", package: "Scale", balance: 12680, status: "Active" },
];
