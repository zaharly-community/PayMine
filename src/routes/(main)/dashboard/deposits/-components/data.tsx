export type VerificationStatus = "Pending" | "Processing" | "Approved" | "Canceled" | "Waiting Correction" | "In Process";
export type DepositStatus = "Pending" | "Processing" | "Completed" | "Canceled";

export type PaymentMethod = "Flouci" | "D17" | "Kashy" | "Tunisie Telecom" | "Orange" | "Ooredoo";

export type Processor = {
  name: string;
  image: string;
};

export type DepositRow = {
  id: string;
  name: string;
  email: string;
  date: string;
  paymentMethod: PaymentMethod;
  paymentMethodImage: string;
  verificationStatus: VerificationStatus;
  amount: number;
  feePercent: number;
  feeAmount: number;
  depositStatus: DepositStatus;
  processedBy: Processor;
  indicatorStatus: DepositStatus;
};

export const deposits: DepositRow[] = [
  {
    "id": "DEP-02026001",
    "name": "Olivia Rhye",
    "email": "olivia.rhye@example.com",
    "date": "18 Sep 2026, 09:51 AM",
    "paymentMethod": "Flouci",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/7mMIDBQ-DsWB5GZluLfTwMXROjPTiJDS1LyQDPKRS8G20dW3LD8GGTU68FZ1hhbwM7-5jqe5QNMiDjQrIoDV",
    "verificationStatus": "Approved",
    "amount": 185.23,
    "feePercent": 1,
    "feeAmount": 1.85,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Koray Okumus",
      "image": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6dfc72b9-8c86-438a-aada-8d3530e13a68/d2c9cgs-69217879-a8d4-438a-b98d-baa29baf98d8.jpg/v1/fill/w_900,h_1126,q_75,strp/this_random_guy_by_inxonic_d2c9cgs-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZDJjOWNncy02OTIxNzg3OS1hOGQ0LTQzOGEtYjk4ZC1iYWEyOWJhZjk4ZDguanBnIiwiaGVpZ2h0IjoiPD0xMTI2Iiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS53YXRlcm1hcmsiXSwid21rIjp7InBhdGgiOiIvd20vNmRmYzcyYjktOGM4Ni00MzhhLWFhZGEtOGQzNTMwZTEzYTY4L2lueG9uaWMtNC5wbmciLCJvcGFjaXR5Ijo5NSwicHJvcG9ydGlvbnMiOjAuNDUsImdyYXZpdHkiOiJjZW50ZXIifX0.oLUUOQ0Apg_6Gq1gPPuVu9DXt6494FP4rbUTeN4h-wA"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026002",
    "name": "Phoenix Baker",
    "email": "phoenix.baker@example.com",
    "date": "18 Sep 2026, 09:39 AM",
    "paymentMethod": "D17",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY",
    "verificationStatus": "Approved",
    "amount": 42.45,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Nicolas Martin",
      "image": "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026003",
    "name": "Lana Steiner",
    "email": "lana.steiner@example.com",
    "date": "18 Sep 2026, 08:29 AM",
    "paymentMethod": "Kashy",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/pTtXnbOlZa8LXuvgdkvNb00J34wEPpDOHcEnBQiJYPV8zN5OQUBezMlosM0iO_KX5pLIbml45uvH-5MyUy1LQqI=w240-h480-rw",
    "verificationStatus": "Processing",
    "amount": 98.65,
    "feePercent": 1.5,
    "feeAmount": 1.48,
    "depositStatus": "Processing",
    "processedBy": {
      "name": "Sami Ben Salah",
      "image": "https://img.magnific.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?semt=ais_hybrid&w=740&q=80"
    },
    "indicatorStatus": "Processing"
  },
  {
    "id": "DEP-02026004",
    "name": "Demi Wilkinson",
    "email": "demi.wilkinson@example.com",
    "date": "18 Sep 2026, 06:21 AM",
    "paymentMethod": "Tunisie Telecom",
    "paymentMethodImage": "https://ik.imagekit.io/tp/20220202-tunisie-telecom-logo.png",
    "verificationStatus": "Approved",
    "amount": 33.79,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Youssef Trabelsi",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHy922UMR9X9MNgNutdRRnbRe0eklCXLAe_nagnpquGQ&s"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026005",
    "name": "Candice Wu",
    "email": "candice.wu@example.com",
    "date": "18 Sep 2026, 06:03 AM",
    "paymentMethod": "Flouci",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/7mMIDBQ-DsWB5GZluLfTwMXROjPTiJDS1LyQDPKRS8G20dW3LD8GGTU68FZ1hhbwM7-5jqe5QNMiDjQrIoDV",
    "verificationStatus": "Pending",
    "amount": 103.38,
    "feePercent": 1,
    "feeAmount": 1.03,
    "depositStatus": "Pending",
    "processedBy": {
      "name": "Koray Okumus",
      "image": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6dfc72b9-8c86-438a-aada-8d3530e13a68/d2c9cgs-69217879-a8d4-438a-b98d-baa29baf98d8.jpg/v1/fill/w_900,h_1126,q_75,strp/this_random_guy_by_inxonic_d2c9cgs-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZDJjOWNncy02OTIxNzg3OS1hOGQ0LTQzOGEtYjk4ZC1iYWEyOWJhZjk4ZDguanBnIiwiaGVpZ2h0IjoiPD0xMTI2Iiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS53YXRlcm1hcmsiLCJ3bWsiOnsicGF0aCI6Ii93bS82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZ2V0Iiwib3BhY2l0eSI6OTV9fX0.oLUUOQ0Apg_6Gq1gPPuVu9DXt6494FP4rbUTeN4h-wA"
    },
    "indicatorStatus": "Pending"
  },
  {
    "id": "DEP-02026006",
    "name": "Natali Craig",
    "email": "natali.craig@example.com",
    "date": "18 Sep 2026, 03:18 AM",
    "paymentMethod": "D17",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY",
    "verificationStatus": "Approved",
    "amount": 32.51,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Nicolas Martin",
      "image": "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026007",
    "name": "Drew Cano",
    "email": "drew.cano@example.com",
    "date": "18 Sep 2026, 02:57 AM",
    "paymentMethod": "Kashy",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/pTtXnbOlZa8LXuvgdkvNb00J34wEPpDOHcEnBQiJYPV8zN5OQUBezMlosM0iO_KX5pLIbml45uvH-5MyUy1LQqI=w240-h480-rw",
    "verificationStatus": "Waiting Correction",
    "amount": 65.05,
    "feePercent": 2,
    "feeAmount": 1.3,
    "depositStatus": "Pending",
    "processedBy": {
      "name": "Sami Ben Salah",
      "image": "https://img.magnific.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?semt=ais_hybrid&w=740&q=80"
    },
    "indicatorStatus": "Pending"
  },
  {
    "id": "DEP-02026008",
    "name": "Orlando Diggs",
    "email": "orlando.diggs@example.com",
    "date": "17 Sep 2026, 04:10 PM",
    "paymentMethod": "Flouci",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/7mMIDBQ-DsWB5GZluLfTwMXROjPTiJDS1LyQDPKRS8G20dW3LD8GGTU68FZ1hhbwM7-5jqe5QNMiDjQrIoDV",
    "verificationStatus": "Approved",
    "amount": 206.47,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Youssef Trabelsi",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHy922UMR9X9MNgNutdRRnbRe0eklCXLAe_nagnpquGQ&s"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026009",
    "name": "Andi Lane",
    "email": "andi.lane@example.com",
    "date": "17 Sep 2026, 02:38 PM",
    "paymentMethod": "D17",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY",
    "verificationStatus": "Approved",
    "amount": 52.67,
    "feePercent": 1,
    "feeAmount": 0.53,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Koray Okumus",
      "image": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6dfc72b9-8c86-438a-aada-8d3530e13a68/d2c9cgs-69217879-a8d4-438a-b98d-baa29baf98d8.jpg/v1/fill/w_900,h_1126,q_75,strp/this_random_guy_by_inxonic_d2c9cgs-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZDJjOWNncy02OTIxNzg3OS1hOGQ0LTQzOGEtYjk4ZC1iYWEyOWJhZjk4ZDguanBnIiwiaGVpZ2h0IjoiPD0xMTI2Iiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS53YXRlcm1hcmsiLCJ3bWsiOnsicGF0aCI6Ii93bS82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZ2V0Iiwib3BhY2l0eSI6OTV9fX0.oLUUOQ0Apg_6Gq1gPPuVu9DXt6494FP4rbUTeN4h-wA"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026010",
    "name": "Kate Morrison",
    "email": "kate.morrison@example.com",
    "date": "17 Sep 2026, 01:52 PM",
    "paymentMethod": "Tunisie Telecom",
    "paymentMethodImage": "https://ik.imagekit.io/tp/20220202-tunisie-telecom-logo.png",
    "verificationStatus": "Canceled",
    "amount": 43.54,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Canceled",
    "processedBy": {
      "name": "Nicolas Martin",
      "image": "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww"
    },
    "indicatorStatus": "Canceled"
  },
  {
    "id": "DEP-02026011",
    "name": "Alec Whitten",
    "email": "alec.whitten@example.com",
    "date": "17 Sep 2026, 12:26 PM",
    "paymentMethod": "Kashy",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/pTtXnbOlZa8LXuvgdkvNb00J34wEPpDOHcEnBQiJYPV8zN5OQUBezMlosM0iO_KX5pLIbml45uvH-5MyUy1LQqI=w240-h480-rw",
    "verificationStatus": "Approved",
    "amount": 234.53,
    "feePercent": 1,
    "feeAmount": 2.35,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Sami Ben Salah",
      "image": "https://img.magnific.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?semt=ais_hybrid&w=740&q=80"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026012",
    "name": "Ariana Decker",
    "email": "ariana.decker@example.com",
    "date": "17 Sep 2026, 11:48 AM",
    "paymentMethod": "Flouci",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/7mMIDBQ-DsWB5GZluLfTwMXROjPTiJDS1LyQDPKRS8G20dW3LD8GGTU68FZ1hhbwM7-5jqe5QNMiDjQrIoDV",
    "verificationStatus": "In Process",
    "amount": 48.17,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Processing",
    "processedBy": {
      "name": "Youssef Trabelsi",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHy922UMR9X9MNgNutdRRnbRe0eklCXLAe_nagnpquGQ&s"
    },
    "indicatorStatus": "Processing"
  },
  {
    "id": "DEP-02026013",
    "name": "Steven Tey",
    "email": "steven.tey@example.com",
    "date": "17 Sep 2026, 10:15 AM",
    "paymentMethod": "D17",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY",
    "verificationStatus": "Approved",
    "amount": 101.23,
    "feePercent": 1,
    "feeAmount": 1.01,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Koray Okumus",
      "image": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6dfc72b9-8c86-438a-aada-8d3530e13a68/d2c9cgs-69217879-a8d4-438a-b98d-baa29baf98d8.jpg/v1/fill/w_900,h_1126,q_75,strp/this_random_guy_by_inxonic_d2c9cgs-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZDJjOWNncy02OTIxNzg3OS1hOGQ0LTQzOGEtYjk4ZC1iYWEyOWJhZjk4ZDguanBnIiwiaGVpZ2h0IjoiPD0xMTI2Iiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS53YXRlcm1hcmsiLCJ3bWsiOnsicGF0aCI6Ii93bS82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZ2V0Iiwib3BhY2l0eSI6OTV9fX0.oLUUOQ0Apg_6Gq1gPPuVu9DXt6494FP4rbUTeN4h-wA"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026014",
    "name": "Lori Bryson",
    "email": "lori.bryson@example.com",
    "date": "17 Sep 2026, 08:44 AM",
    "paymentMethod": "Kashy",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/pTtXnbOlZa8LXuvgdkvNb00J34wEPpDOHcEnBQiJYPV8zN5OQUBezMlosM0iO_KX5pLIbml45uvH-5MyUy1LQqI=w240-h480-rw",
    "verificationStatus": "Approved",
    "amount": 138.13,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Nicolas Martin",
      "image": "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026015",
    "name": "Koray Okumus",
    "email": "koray.okumus@example.com",
    "date": "17 Sep 2026, 07:55 AM",
    "paymentMethod": "Flouci",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/7mMIDBQ-DsWB5GZluLfTwMXROjPTiJDS1LyQDPKRS8G20dW3LD8GGTU68FZ1hhbwM7-5jqe5QNMiDjQrIoDV",
    "verificationStatus": "Pending",
    "amount": 573.18,
    "feePercent": 1.5,
    "feeAmount": 8.6,
    "depositStatus": "Pending",
    "processedBy": {
      "name": "Sami Ben Salah",
      "image": "https://img.magnific.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?semt=ais_hybrid&w=740&q=80"
    },
    "indicatorStatus": "Pending"
  },
  {
    "id": "DEP-02026016",
    "name": "Josh Miller",
    "email": "josh.miller@example.com",
    "date": "16 Sep 2026, 11:30 PM",
    "paymentMethod": "Tunisie Telecom",
    "paymentMethodImage": "https://ik.imagekit.io/tp/20220202-tunisie-telecom-logo.png",
    "verificationStatus": "Approved",
    "amount": 174.07,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Youssef Trabelsi",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHy922UMR9X9MNgNutdRRnbRe0eklCXLAe_nagnpquGQ&s"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026017",
    "name": "Mollie Hall",
    "email": "mollie.hall@example.com",
    "date": "16 Sep 2026, 10:42 PM",
    "paymentMethod": "D17",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY",
    "verificationStatus": "Waiting Correction",
    "amount": 54.26,
    "feePercent": 1,
    "feeAmount": 0.54,
    "depositStatus": "Canceled",
    "processedBy": {
      "name": "Koray Okumus",
      "image": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6dfc72b9-8c86-438a-aada-8d3530e13a68/d2c9cgs-69217879-a8d4-438a-b98d-baa29baf98d8.jpg/v1/fill/w_900,h_1126,q_75,strp/this_random_guy_by_inxonic_d2c9cgs-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZDJjOWNncy02OTIxNzg3OS1hOGQ0LTQzOGEtYjk4ZC1iYWEyOWJhZjk4ZDguanBnIiwiaGVpZ2h0IjoiPD0xMTI2Iiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS53YXRlcm1hcmsiLCJ3bWsiOnsicGF0aCI6Ii93bS82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZ2V0Iiwib3BhY2l0eSI6OTV9fX0.oLUUOQ0Apg_6Gq1gPPuVu9DXt6494FP4rbUTeN4h-wA"
    },
    "indicatorStatus": "Canceled"
  },
  {
    "id": "DEP-02026018",
    "name": "Rene Wells",
    "email": "rene.wells@example.com",
    "date": "16 Sep 2026, 09:18 PM",
    "paymentMethod": "Kashy",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/pTtXnbOlZa8LXuvgdkvNb00J34wEPpDOHcEnBQiJYPV8zN5OQUBezMlosM0iO_KX5pLIbml45uvH-5MyUy1LQqI=w240-h480-rw",
    "verificationStatus": "Approved",
    "amount": 54.51,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Nicolas Martin",
      "image": "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026019",
    "name": "Rylee Howard",
    "email": "rylee.howard@example.com",
    "date": "16 Sep 2026, 07:26 PM",
    "paymentMethod": "Flouci",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/7mMIDBQ-DsWB5GZluLfTwMXROjPTiJDS1LyQDPKRS8G20dW3LD8GGTU68FZ1hhbwM7-5jqe5QNMiDjQrIoDV",
    "verificationStatus": "Approved",
    "amount": 177.88,
    "feePercent": 1,
    "feeAmount": 1.78,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Sami Ben Salah",
      "image": "https://img.magnific.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?semt=ais_hybrid&w=740&q=80"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026020",
    "name": "Sienna Hewitt",
    "email": "sienna.hewitt@example.com",
    "date": "16 Sep 2026, 06:15 PM",
    "paymentMethod": "D17",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY",
    "verificationStatus": "Canceled",
    "amount": 214.26,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Canceled",
    "processedBy": {
      "name": "Youssef Trabelsi",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHy922UMR9X9MNgNutdRRnbRe0eklCXLAe_nagnpquGQ&s"
    },
    "indicatorStatus": "Canceled"
  },
  {
    "id": "DEP-02026021",
    "name": "Noah Pierre",
    "email": "noah.pierre@example.com",
    "date": "16 Sep 2026, 05:06 PM",
    "paymentMethod": "Kashy",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/pTtXnbOlZa8LXuvgdkvNb00J34wEPpDOHcEnBQiJYPV8zN5OQUBezMlosM0iO_KX5pLIbml45uvH-5MyUy1LQqI=w240-h480-rw",
    "verificationStatus": "Approved",
    "amount": 763.99,
    "feePercent": 1,
    "feeAmount": 7.64,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Koray Okumus",
      "image": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6dfc72b9-8c86-438a-aada-8d3530e13a68/d2c9cgs-69217879-a8d4-438a-b98d-baa29baf98d8.jpg/v1/fill/w_900,h_1126,q_75,strp/this_random_guy_by_inxonic_d2c9cgs-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZDJjOWNncy02OTIxNzg3OS1hOGQ0LTQzOGEtYjk4ZC1iYWEyOWJhZjk4ZDguanBnIiwiaGVpZ2h0IjoiPD0xMTI2Iiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS53YXRlcm1hcmsiLCJ3bWsiOnsicGF0aCI6Ii93bS82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZ2V0Iiwib3BhY2l0eSI6OTV9fX0.oLUUOQ0Apg_6Gq1gPPuVu9DXt6494FP4rbUTeN4h-wA"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026022",
    "name": "Eve Lechner",
    "email": "eve.lechner@example.com",
    "date": "16 Sep 2026, 04:22 PM",
    "paymentMethod": "Tunisie Telecom",
    "paymentMethodImage": "https://ik.imagekit.io/tp/20220202-tunisie-telecom-logo.png",
    "verificationStatus": "Processing",
    "amount": 655.07,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Processing",
    "processedBy": {
      "name": "Nicolas Martin",
      "image": "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww"
    },
    "indicatorStatus": "Processing"
  },
  {
    "id": "DEP-02026023",
    "name": "Zahir McClure",
    "email": "zahir.mcclure@example.com",
    "date": "16 Sep 2026, 03:18 PM",
    "paymentMethod": "Flouci",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/7mMIDBQ-DsWB5GZluLfTwMXROjPTiJDS1LyQDPKRS8G20dW3LD8GGTU68FZ1hhbwM7-5jqe5QNMiDjQrIoDV",
    "verificationStatus": "Approved",
    "amount": 99.25,
    "feePercent": 1,
    "feeAmount": 0.99,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Sami Ben Salah",
      "image": "https://img.magnific.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?semt=ais_hybrid&w=740&q=80"
    },
    "indicatorStatus": "Completed"
  },
  {
    "id": "DEP-02026024",
    "name": "Mia Romberg",
    "email": "mia.romberg@example.com",
    "date": "16 Sep 2026, 02:41 PM",
    "paymentMethod": "D17",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY",
    "verificationStatus": "Pending",
    "amount": 125.5,
    "feePercent": 0,
    "feeAmount": 0,
    "depositStatus": "Pending",
    "processedBy": {
      "name": "Youssef Trabelsi",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHy922UMR9X9MNgNutdRRnbRe0eklCXLAe_nagnpquGQ&s"
    },
    "indicatorStatus": "Pending"
  },
  {
    "id": "DEP-02026025",
    "name": "Nico Arendt",
    "email": "nico.arendt@example.com",
    "date": "16 Sep 2026, 01:56 PM",
    "paymentMethod": "Kashy",
    "paymentMethodImage": "https://play-lh.googleusercontent.com/pTtXnbOlZa8LXuvgdkvNb00J34wEPpDOHcEnBQiJYPV8zN5OQUBezMlosM0iO_KX5pLIbml45uvH-5MyUy1LQqI=w240-h480-rw",
    "verificationStatus": "Approved",
    "amount": 89.99,
    "feePercent": 1,
    "feeAmount": 0.9,
    "depositStatus": "Completed",
    "processedBy": {
      "name": "Koray Okumus",
      "image": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6dfc72b9-8c86-438a-aada-8d3530e13a68/d2c9cgs-69217879-a8d4-438a-b98d-baa29baf98d8.jpg/v1/fill/w_900,h_1126,q_75,strp/this_random_guy_by_inxonic_d2c9cgs-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZDJjOWNncy02OTIxNzg3OS1hOGQ0LTQzOGEtYjk4ZC1iYWEyOWJhZjk4ZDguanBnIiwiaGVpZ2h0IjoiPD0xMTI2Iiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS53YXRlcm1hcmsiLCJ3bWsiOnsicGF0aCI6Ii93bS82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZ2V0Iiwib3BhY2l0eSI6OTV9fX0.oLUUOQ0Apg_6Gq1gPPuVu9DXt6494FP4rbUTeN4h-wA"
    },
    "indicatorStatus": "Completed"
  }
];

export const filters = {
  paymentMethod: ["All", "Flouci", "D17", "Tunisie Telecom", "Kashy"] as const,
  verificationStatus: ["All", "Pending", "Processing", "Approved", "Canceled", "Waiting Correction", "In Process"] as const,
  depositStatus: ["All", "Pending", "Processing", "Completed", "Canceled"] as const,
};
