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
