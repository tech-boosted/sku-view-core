export interface PlatformData {
  name: string;
  data: PropertyData[];
}

export interface PropertyData {
  property: string;
  data: number[];
}

export interface SkuData {
  skuName: string;
  platform: PlatformData[];
}

export interface UserInfoChannels {
  connected: boolean;
  profile_id: string;
}

export interface UserInfo {
  amazon_us?: UserInfoChannels;
  amazon_uk?: UserInfoChannels;
  amazon_ca?: UserInfoChannels;
  amazon_ge?: UserInfoChannels;
  amazon_fr?: UserInfoChannels;
  amazon_it?: UserInfoChannels;
  google?: UserInfoChannels;
}
