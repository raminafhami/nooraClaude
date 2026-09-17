enum StorageType {
  Letterhead = "letterhead",
  Certificate = "certificate",
}

enum StorageItemType {
  BankLetter = "bankLetter",
  Certificate = "certificate",
  Invoice = "invoice",
}

enum StoragePrintType {
  Issue = "issue",
  Reissue = "reissue",
  Ammendment = "ammendment",
}

interface StorageItem {
  itemNo: string;
  itemType: StorageItemType;
  print: StoragePrintType;
  type: StorageType;
  createBy: string;
  createAt: Date;
}

type StorageItems = StorageItem[];
