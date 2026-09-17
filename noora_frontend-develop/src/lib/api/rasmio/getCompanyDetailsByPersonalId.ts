import apiClient from "../client";

interface GetCompanyDetailsByPersonalIdProps {
  personId: string;
  projection?: string;
}

export interface GetCompanyDetailsByPersonalIdResponse {
  statusCode: number;
  message: string;
  result: Result;
}

export interface Result {
  news: News[];
  id: number;
  registrationNo: string;
  title: string;
  registrationTypeId: number;
  registrationDate: Date;
  capital: null;
  address: string;
  postalCode: string;
  picture: null;
  taxNumber: string;
  lat: number;
  lng: number;
  website: null;
  tel: string;
  fax: null;
  mobile: null;
  email: string;
  status: string;
  edareKol: string;
  vahedSabti: string;
  lastUpdate: Date;
  registrationType: RegistrationType;
  companyPerson: CompanyPerson[];
  companyNews: any[];
  hasKeys: string;
  productSuppliers: null;
  comments: null;
  pictureUrl: string;
  networkLinks: any[];
  samtInfo: any[];
  sajars: any[];
  imports: null;
  knowledgeBased: null;
  persianRegistrationDate: string;
}

export interface CompanyPerson {
  id: number;
  companyId: number;
  personId: number;
  positionId: number;
  startDate: Date;
  endDate: Date | null;
  byNewsId: number;
  duration: null | string;
  byNews: null;
  company: null;
  person: Person;
  position: Position;
}

export interface Person {
  id: number;
  title: string;
  gender: null;
  tagline: any;
  importance: number;
  picture: null;
  address: null;
  postalCode: null;
  lat: null;
  lng: null;
  website: null;
  tel: null;
  fax: null;
  mobile: null;
  privateMobile: null | string;
  email: null;
  relatedNews: null;
  companyPerson: any[];
  newsPerson: any[];
  pictureUrl: string;
  networkLinks: null;
}

export interface Position {
  id: number;
  title: string;
  firstRole: string;
  secondRole: any;
  worth: number;
}

export interface News {
  id: number;
  title: string;
  description: string;
  companyId: number;
  capitalTo: null;
  newspaperDate: Date;
  newsLetterDate: Date;
  newspaperNumber: string;
  newspaperCityType: string;
  pageNumber: number | null;
  indicatorNumber: string;
  companyPerson: any[];
  newsPerson: any[];
}

export interface RegistrationType {
  id: number;
  title: string;
  wordUsedToShow: string;
  company: null;
}

export default async function getCompanyDetailsByPersonalId({
  personId,
  projection,
}: GetCompanyDetailsByPersonalIdProps): Promise<
  GetCompanyDetailsByPersonalIdResponse | undefined
> {
  let response;
  let link = `rasmio/person/${personId}${
    projection ? `?projection=${projection}` : ""
  }`;

  response = await apiClient.get({
    url: link,
  });

  return response as GetCompanyDetailsByPersonalIdResponse;
}
