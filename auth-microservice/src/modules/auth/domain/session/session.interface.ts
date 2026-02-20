export interface ISession {
  userAgent: string;
  device: string;
  location: {
    ip: string;
    city: string;
    country: string;
  };
}
