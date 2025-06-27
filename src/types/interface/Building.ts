interface Building {
  id?: number;
  name: string;
  address: string;
  numberOfFloors: number;
  city?: string;
  country?: string;
  constructionYear?: number;
  owner?: string;
  isDeleted?: boolean;
}
export { Building };
