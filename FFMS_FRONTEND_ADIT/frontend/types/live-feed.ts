export interface Employee {
  id: string;
  name: string;
  role: string;
  territory: string;
  status: "online" | "offline";
  lastActive: string;
  batteryLevel: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  phone: string;
  avatar: string;
  email: string;
}
