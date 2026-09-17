export interface GroupedExpertisesApi {
  common: [
    {
      personnelId: string;
      status: string;
      modifyBy: null;
      modifyAt: null;
      id: string;
      expertise: {
        title: string;
        type: string;
        id: string;
      };
    }
  ];
  unCommon: [
    {
      title: string;
      type: string;
      id: string;
    }
  ];
}
